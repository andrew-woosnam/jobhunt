const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const code = ['AtsBoards.js', 'Availability.js'].map(name =>
  fs.readFileSync(path.join(__dirname, '..', 'apps-script', name), 'utf8')
).join('\n');

const tests = function () {
  const gh = parsePostingUrl('https://job-boards.greenhouse.io/example/jobs/123?source=test');
  const gh2 = parsePostingUrl('https://boards.greenhouse.io/example/jobs/456');
  const id = '12345678-1234-1234-1234-123456789abc';
  const ashUrl = 'https://jobs.ashbyhq.com/example/' + id;
  const ash = parsePostingUrl(ashUrl + '/apply');
  assert.equal(gh.key, 'greenhouse:example:123');
  assert.equal(gh.boardKey, gh2.boardKey);
  assert.equal(ash.id, id);
  assert.equal(parsePostingUrl('https://example.com/jobs/123'), null);
  assert.equal(parsePostingUrl(ashUrl + '/invalid'), null);

  const response = (jobs, total = jobs.length) => ({ status: 200, json: { jobs, meta: { total } } });
  const published = { id: 123, title: 'Engineer', location: { name: 'Remote' } };
  const ashBoard = jobs => ({ status: 200, json: { apiVersion: '1', jobs } });
  const ashPosting = { title: 'Engineer', jobUrl: ashUrl, applyUrl: ashUrl + '/apply', isListed: false };

  let count = 0;
  const cache = new Map();
  const request = url => {
    count++;
    return url.endsWith('/456') ? { status: 404, json: { error: 'Job not found' } } : response([published]);
  };
  assert.equal(classifyPosting(gh, cache, request).status, 'Open');
  assert.equal(classifyPosting(gh2, cache, request).status, 'Closed');
  assert.equal(count, 2);
  assert.equal(cache.size, 1);
  assert.equal(classifyPosting(gh, new Map(), () => response([], 1)).status, 'Unknown');
  assert.equal(classifyPosting(gh, new Map(), () => response([published, published])).status, 'Unknown');
  assert.equal(classifyPosting(gh, new Map(), () => ({ status: 429 })).status, 'Unknown');
  assert.equal(classifyPosting(gh, new Map(), () => { throw new Error('network'); }).status, 'Unknown');
  const isolated = new Map();
  assert.equal(classifyPosting(gh, isolated, () => ({ status: 503 })).status, 'Unknown');
  assert.equal(classifyPosting(ash, isolated, () => ashBoard([ashPosting])).status, 'Open');
  assert.equal(classifyPosting(null, new Map(), () => { throw new Error('unexpected request'); }).status, 'Unsupported');

  const missing = individual => url => url.endsWith('/jobs') ? response([]) : individual;
  assert.equal(classifyPosting(gh, new Map(), missing({ status: 404, json: null })).status, 'Unknown');
  assert.equal(classifyPosting(gh, new Map(), missing({ status: 200, json: { id: 123 } })).status, 'Open');
  assert.equal(classifyPosting(gh, new Map(), missing({ status: 302 })).status, 'Unknown');

  const ashMissing = (lookup, page = { status: 200 }) => url =>
    url.includes('posting-api') ? ashBoard([]) : url.includes('graphql') ? lookup : page;
  const nullPosting = { status: 200, json: { data: { jobPosting: null } } };
  assert.equal(classifyPosting(ash, new Map(), ashMissing({ status: 200, json: { data: { jobPosting: { id } } } })).status, 'Open');
  assert.equal(classifyPosting(ash, new Map(), ashMissing(nullPosting, { status: 302 })).status, 'Unknown');
  assert.equal(classifyPosting(ash, new Map(), ashMissing(nullPosting)).status, 'Unknown');
  assert.equal(classifyPosting(ash, new Map(), ashMissing(nullPosting, { status: 404 })).status, 'Closed');
  assert.equal(classifyPosting(ash, new Map(), ashMissing({ status: 200, json: { errors: [{ message: 'error' }], data: { jobPosting: null } } }, { status: 404 })).status, 'Unknown');

  const listingHeaders = ['Company', 'Role', 'Fit', 'Automated Preparation', 'Priority', 'Notes', 'Apply URL', 'Salary Min', 'Salary Max', 'Last Checked', 'Date Applied'];
  const historyHeaders = ['Company', 'Role', 'Fit', 'Status', 'Next Action', 'Notes', 'Apply URL', 'Salary Min', 'Salary Max', 'Last Checked', 'Date Applied'];
  const row = ['Example', 'Engineer', 'Strong', 'Complete', 1, '=literal', 'https://boards.greenhouse.io/example/jobs/123', 100, 200, '', ''];
  const date = new Date('2026-01-01T12:00:00Z');
  const later = new Date('2026-01-02T12:00:00Z');
  const sheet = (name, headers, rows = []) => ({
    values: [headers.slice(), ...rows.map(r => r.slice())],
    getName() { return name; },
    getDataRange() { return { getValues: () => this.values.map(r => r.slice()) }; },
    appendRow(r) { this.values.push(r.map(v => typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v)); },
    deleteRow(n) { this.values.splice(n - 1, 1); },
    getRange(r, c) { return { setValue: v => { this.values[r - 1][c - 1] = v; } }; }
  });
  const fixture = () => {
    const sheets = { Listings: sheet('Listings', listingHeaders, [row]), Applications: sheet('Applications', historyHeaders), 'Job History': sheet('Job History', historyHeaders) };
    return { sheets, getSheetByName: name => sheets[name] };
  };
  const original = ss => availabilityTables(ss).listings.rows[0].data;
  const closed = { status: 'Closed' };
  let ss = fixture();
  let job = original(ss);
  assert.equal(applyAvailabilityResult(ss, job, { status: 'Unknown' }, date), 'unchanged');
  assert.equal(applyAvailabilityResult(ss, job, { status: 'Open' }, date), 'checked');
  assert.equal(ss.sheets.Listings.values[1][9], date);
  job = original(ss);
  assert.equal(applyAvailabilityResult(ss, job, closed, later), 'archived');
  assert.equal(ss.sheets.Listings.values.length, 1);
  assert.deepEqual(ss.sheets['Job History'].values[1], ['Example', 'Engineer', 'Strong', 'Closed', 'Closed', '=literal', row[6], 100, 200, later, '']);
  assert.equal(applyAvailabilityResult(ss, job, closed, later), 'conflict');
  assert.equal(ss.sheets['Job History'].values.length, 2);

  ss = fixture();
  job = original(ss);
  ss.sheets.Listings.deleteRow = () => { throw new Error('interrupted'); };
  assert.throws(() => applyAvailabilityResult(ss, job, closed, date), /interrupted/);
  assert.equal(ss.sheets['Job History'].values.length, 2);
  ss.sheets.Listings.deleteRow = function (n) { this.values.splice(n - 1, 1); };
  assert.equal(applyAvailabilityResult(ss, job, closed, later), 'archived');
  assert.equal(ss.sheets['Job History'].values.length, 2);
  assert.equal(ss.sheets['Job History'].values[1][9], date);

  ss = fixture();
  job = original(ss);
  ss.sheets.Applications.appendRow(['Example', 'Engineer', 'Strong', 'Applied', '', '', row[6], '', '', '', date]);
  assert.equal(applyAvailabilityResult(ss, job, closed, date), 'conflict');
  assert.equal(ss.sheets['Job History'].values.length, 1);
  ss = fixture();
  job = original(ss);
  ss.sheets.Listings.values[1][5] = 'manual edit';
  assert.equal(applyAvailabilityResult(ss, job, closed, date), 'conflict');
  ss = fixture();
  job = original(ss);
  ss.sheets.Listings.values.push(row.slice());
  assert.equal(applyAvailabilityResult(ss, job, closed, date), 'conflict');

  console.log('Availability fixtures passed');
};

new Function('assert', 'SpreadsheetApp', 'console', code + '\n(' + tests.toString() + ')();')(
  assert, { flush() {} }, console
);
