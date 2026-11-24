const AVAILABILITY_SHARED = ['Company', 'Role', 'Fit', 'Notes', 'Apply URL', 'Salary Min', 'Salary Max', 'Last Checked', 'Date Applied'];
const AVAILABILITY_LISTING = [...AVAILABILITY_SHARED, 'Automated Preparation', 'Priority'];
const AVAILABILITY_HISTORY = [...AVAILABILITY_SHARED, 'Status', 'Next Action'];

function previewJobAvailability() {
  return runJobAvailability(true);
}

function checkJobAvailability() {
  return runJobAvailability(false);
}

function availabilityTable(sheet, expected) {
  if (!sheet) throw new Error('Missing availability tracker tab');
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  if (headers.length !== expected.length || new Set(headers).size !== headers.length ||
      expected.some(header => !headers.includes(header))) {
    throw new Error('Unexpected headers in ' + sheet.getName());
  }
  const columns = Object.fromEntries(headers.map((header, i) => [header, i]));
  const rows = values.map((cells, i) => ({
    number: i + 2,
    data: Object.fromEntries(headers.map((header, j) => [header, cells[j]]))
  })).filter(row => row.data['Apply URL']);
  return { sheet, headers, columns, rows };
}

function availabilityTables(ss) {
  return {
    listings: availabilityTable(ss.getSheetByName('Listings'), AVAILABILITY_LISTING),
    applications: availabilityTable(ss.getSheetByName('Applications'), AVAILABILITY_HISTORY),
    history: availabilityTable(ss.getSheetByName('Job History'), AVAILABILITY_HISTORY)
  };
}

function availabilityKey(url) {
  return parsePostingUrl(url)?.key || String(url || '').trim();
}

function availabilityMatches(table, key) {
  return table.rows.filter(row => availabilityKey(row.data['Apply URL']) === key);
}

function availabilitySame(a, b, fields) {
  return fields.every(field => {
    const x = a[field];
    const y = b[field];
    if (x instanceof Date && y instanceof Date) return Math.abs(x.getTime() - y.getTime()) < 1000;
    return x === y;
  });
}

function availabilitySource(tables, original) {
  const key = availabilityKey(original['Apply URL']);
  const matches = availabilityMatches(tables.listings, key);
  if (matches.length !== 1 || availabilityMatches(tables.applications, key).length ||
      matches[0].data['Date Applied'] || original['Date Applied'] ||
      !availabilitySame(matches[0].data, original, AVAILABILITY_SHARED)) {
    return null;
  }
  return matches[0];
}

function availabilityLiteral(value) {
  return typeof value === 'string' && /^[=']/.test(value) ? "'" + value : value;
}

function availabilityArchiveMatches(row, original) {
  return row.data.Status === 'Closed' && row.data['Next Action'] === 'Closed' &&
    row.data['Last Checked'] instanceof Date && !row.data['Date Applied'] &&
    availabilitySame(row.data, original, AVAILABILITY_SHARED.filter(field => field !== 'Last Checked'));
}

function applyAvailabilityResult(ss, original, result, checkedAt) {
  if (result.status !== 'Open' && result.status !== 'Closed') return 'unchanged';
  let tables = availabilityTables(ss);
  let source = availabilitySource(tables, original);
  if (!source) return 'conflict';
  const key = availabilityKey(original['Apply URL']);
  let archived = availabilityMatches(tables.history, key);

  if (result.status === 'Open') {
    if (archived.length) return 'conflict';
    tables.listings.sheet.getRange(source.number, tables.listings.columns['Last Checked'] + 1)
      .setValue(checkedAt);
    return 'checked';
  }

  if (archived.length > 1 || (archived.length === 1 && !availabilityArchiveMatches(archived[0], original))) {
    return 'conflict';
  }
  if (!archived.length) {
    const record = { ...source.data, Status: 'Closed', 'Next Action': 'Closed', 'Last Checked': checkedAt };
    tables.history.sheet.appendRow(tables.history.headers.map(header => availabilityLiteral(record[header])));
    SpreadsheetApp.flush();
  }

  tables = availabilityTables(ss);
  source = availabilitySource(tables, original);
  archived = availabilityMatches(tables.history, key);
  if (!source || archived.length !== 1 || !availabilityArchiveMatches(archived[0], original)) {
    return 'conflict';
  }
  tables.listings.sheet.deleteRow(source.number);
  SpreadsheetApp.flush();
  return 'archived';
}

function runJobAvailability(dryRun) {
  const started = Date.now();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    console.warn('Availability skipped: another script operation is running');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tables = availabilityTables(ss);
    const cache = new Map();
    const stats = { Open: 0, Closed: 0, Unknown: 0, Unsupported: 0, skipped: 0, conflicts: 0, archived: 0, checked: 0, remaining: 0 };
    const rows = tables.listings.rows;
    console.info('Availability ' + (dryRun ? 'DRY RUN' : 'LIVE') + ': ' + rows.length + ' listings');

    for (const [i, row] of rows.entries()) {
      if (Date.now() - started > 240000) {
        stats.remaining = rows.length - i;
        break;
      }
      const original = row.data;
      const key = availabilityKey(original['Apply URL']);
      if (!availabilitySource(tables, original)) {
        stats.skipped++;
        console.warn('Skipped duplicate, applied or changed listing: ' + key);
        continue;
      }
      const history = availabilityMatches(tables.history, key);
      if (history.length && (history.length !== 1 || !availabilityArchiveMatches(history[0], original))) {
        stats.conflicts++;
        console.warn('Existing history conflict: ' + key);
        continue;
      }

      const result = classifyPosting(parsePostingUrl(original['Apply URL']), cache);
      stats[result.status]++;
      console.info(result.status + ' | ' + original.Company + ' | ' + original.Role + ' | ' + key + ' | ' + result.reason);
      if (history.length && result.status !== 'Closed') {
        stats.conflicts++;
        console.warn('Interrupted archive requires review: ' + key);
        continue;
      }
      if (!dryRun) {
        try {
          const outcome = applyAvailabilityResult(ss, original, result, new Date());
          if (outcome === 'conflict') {
            stats.conflicts++;
            console.warn('Tracker changed or archive conflict: ' + key);
          } else if (outcome !== 'unchanged') {
            stats[outcome]++;
          }
        } catch (error) {
          stats.conflicts++;
          console.warn('Tracker update failed for ' + key + ': ' + error.message);
        }
      }
    }
    console.info('Availability summary: ' + JSON.stringify({ ...stats, boards: cache.size, seconds: (Date.now() - started) / 1000 }));
    return stats;
  } finally {
    lock.releaseLock();
  }
}
