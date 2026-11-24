const FORM_HEADERS = [
  'Apply URL', 'Status', 'Checked At', 'Field Count', 'Error'
];

const QUESTION_HEADERS = [
  'Apply URL', 'Company', 'Role', 'Field ID',
  'Question', 'Type', 'Required', 'Instructions',
  'Options', 'Draft Answer'
];

function retrieveApplicationQuestions() {
  const started = Date.now();
  const batchSize = 8;
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(1000)) {
    console.warn('Skipped: another retrieval is running');
    return;
  }

  try {
    console.info('Starting application question retrieval');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const jobs = ss.getSheetByName('Jobs').getDataRange().getValues();
    const forms = getOrCreateSheet(ss, 'Application Forms', FORM_HEADERS);
    const questions = getOrCreateSheet(ss, 'Application Questions', QUESTION_HEADERS);

    const headers = jobs.shift();
    const col = Object.fromEntries(headers.map((h, i) => [h, i]));

    const processed = new Set(
      forms.getDataRange().getValues().slice(1).map(r => r[0])
    );

    const existingQuestions = new Set(
      questions.getDataRange().getValues().slice(1)
        .map(r => JSON.stringify([r[0], r[3]]))
    );

    const inactive = new Set();
    for (const name of ['Applications', 'Job History']) {
      const sheet = ss.getSheetByName(name);
      if (!sheet) continue;
      const rows = sheet.getDataRange().getValues();
      const urlCol = rows.shift().indexOf('Apply URL');
      if (urlCol < 0) throw new Error(`Missing Apply URL in ${name}`);
      for (const row of rows) {
        if (row[urlCol]) inactive.add(String(row[urlCol]).trim());
      }
    }

    const eligible = jobs.filter(job =>
      job[col['Apply URL']] &&
      !inactive.has(String(job[col['Apply URL']]).trim()) &&
      (col['Status'] === undefined || job[col['Status']] === 'To Apply')
    );

    const pending = eligible.filter(job =>
      !processed.has(String(job[col['Apply URL']]).trim())
    );

    console.info(
      `Jobs: ${jobs.length} total, ${eligible.length} eligible, ${pending.length} pending`
    );

    if (!pending.length) {
      console.info('No pending application forms');
      return;
    }

    const batch = pending.slice(0, batchSize);

    const stats = {
      retrieved: 0,
      failed: 0,
      unsupported: 0,
      newFields: 0
    };

    console.info(`Processing batch of ${batch.length}`);

    for (const [i, job] of batch.entries()) {
      const url = String(job[col['Apply URL']]).trim();
      const company = job[col['Company']];
      const role = job[col['Role']];
      const jobStarted = Date.now();

      if (processed.has(url)) continue;

      console.info(`[${i + 1}/${batch.length}] ${company} — ${role}`);

      try {
        const fields = retrieveForm(url);

        if (fields === null) {
          forms.appendRow([url, 'Unsupported ATS', new Date(), '', '']);
          stats.unsupported++;
          console.warn(`Unsupported ATS: ${url}`);
          processed.add(url);
          continue;
        }

        const rows = [];
        const keys = [];

        for (const field of fields) {
          const key = JSON.stringify([url, field.id]);
          if (existingQuestions.has(key) || keys.includes(key)) continue;

          rows.push([
            url,
            safeText(company),
            safeText(role),
            safeText(field.id),
            safeText(field.title),
            safeText(field.type),
            field.required,
            safeText(field.description),
            JSON.stringify(field.options || []),
            ''
          ]);

          keys.push(key);
        }

        if (rows.length) {
          questions.getRange(
            questions.getLastRow() + 1,
            1,
            rows.length,
            QUESTION_HEADERS.length
          ).setValues(rows);

          keys.forEach(key => existingQuestions.add(key));
        }

        forms.appendRow([
          url, 'Retrieved', new Date(), fields.length, ''
        ]);

        stats.retrieved++;
        stats.newFields += rows.length;

        console.info(
          `Retrieved ${fields.length} fields (${rows.length} new) in ${elapsed(jobStarted)}`
        );
      } catch (error) {
        forms.appendRow([
          url, 'Failed', new Date(), '', safeText(error.message)
        ]);

        stats.failed++;
        console.warn(`${error.message} in ${elapsed(jobStarted)}: ${url}`);
      }

      processed.add(url);
    }

    console.info(`Run completed in ${elapsed(started)}`);
    console.info(
      `Retrieved: ${stats.retrieved} | Failed: ${stats.failed} | Unsupported: ${stats.unsupported}`
    );
    console.info(
      `New fields: ${stats.newFields} | Remaining pending: ${
        pending.filter(job =>
          !processed.has(String(job[col['Apply URL']]).trim())
        ).length
      }`
    );
  } catch (error) {
    console.error(error.stack || error.message);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function elapsed(started) {
  return `${((Date.now() - started) / 1000).toFixed(1)}s`;
}

function retrieveForm(url) {
  const ashby = url.match(
    /^https:\/\/jobs\.ashbyhq\.com\/([^/?#]+)\/([a-f0-9-]{36})(?:[/?#]|$)/i
  );

  if (ashby) return retrieveAshby(ashby[1], ashby[2]);

  const greenhouse = url.match(
    /^https:\/\/(?:job-boards|boards)\.greenhouse\.io\/([^/?#]+)\/jobs\/(\d+)(?:[/?#]|$)/i
  );

  if (greenhouse) {
    return retrieveGreenhouse(greenhouse[1], greenhouse[2]);
  }

  return null;
}

function retrieveAshby(org, id) {
  const query = `
    query ApiJobPosting($o: String!, $j: String!) {
      jobPosting(
        organizationHostedJobsPageName: $o,
        jobPostingId: $j
      ) {
        id
        title
        applicationForm {
          id
          sections {
            title
            descriptionHtml
            isHidden
            fieldEntries {
              id
              field
              isRequired
              descriptionHtml
              isHidden
            }
          }
        }
      }
    }
  `;

  const response = fetchJson(
    'https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobPosting',
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        operationName: 'ApiJobPosting',
        variables: { o: org, j: id },
        query
      })
    }
  );

  if (response.errors?.length) {
    throw new Error('Ashby GraphQL error');
  }

  const sections = response.data?.jobPosting?.applicationForm?.sections;

  if (!Array.isArray(sections)) {
    throw new Error('Missing Ashby application form');
  }

  return sections
    .filter(s => !s.isHidden)
    .flatMap(s => s.fieldEntries)
    .filter(e => !e.isHidden && !e.field.isDeactivated)
    .map(e => ({
      id: e.id,
      title: e.field.title,
      type: e.field.type,
      required: e.isRequired,
      description: e.descriptionHtml || '',
      options: (e.field.selectableValues || [])
        .filter(v => !v.isArchived)
    }));
}

function retrieveGreenhouse(board, id) {
  const response = fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs/${id}?questions=true`
  );

  if (!Array.isArray(response.questions)) {
    throw new Error('Missing Greenhouse application form');
  }

  return response.questions.map(q => ({
    id: q.fields.map(f => f.name).join('|'),
    title: q.label,
    type: q.fields.map(f => f.type).join('|'),
    required: q.required,
    description: q.description || '',
    options: q.fields.flatMap(f => f.values || [])
  }));
}

function fetchJson(url, options = {}) {
  const response = UrlFetchApp.fetch(url, {
    ...options,
    muteHttpExceptions: true
  });

  const status = response.getResponseCode();

  if (status < 200 || status >= 300) {
    throw new Error(`HTTP ${status}`);
  }

  return JSON.parse(response.getContentText());
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function safeText(value) {
  const text = String(value ?? '');
  return text.startsWith('=') ? "'" + text : text;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Job Hunt')
    .addItem('Retrieve application questions', 'retrieveApplicationQuestions')
    .addToUi();
}