function parsePostingUrl(url) {
  const text = String(url || '').trim();
  const ashby = text.match(/^https:\/\/jobs\.ashbyhq\.com\/([a-z0-9_-]+)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:\/apply)?\/?(?:[?#].*)?$/i);
  const greenhouse = text.match(/^https:\/\/(?:job-boards|boards)\.greenhouse\.io\/([a-z0-9_-]+)\/jobs\/(\d+)\/?(?:[?#].*)?$/i);
  const match = ashby || greenhouse;
  if (!match) return null;
  const ats = ashby ? 'ashby' : 'greenhouse';
  const board = match[1];
  const id = match[2].toLowerCase();
  return { ats, board, id, boardKey: ats + ':' + board, key: ats + ':' + board + ':' + id };
}

function atsRequest(url, options = {}) {
  const response = UrlFetchApp.fetch(url, {
    ...options, muteHttpExceptions: true, followRedirects: false
  });
  const body = response.getContentText();
  let json = null;
  try { json = JSON.parse(body); } catch (_) {}
  return { status: response.getResponseCode(), json };
}

function atsBoardUrl(ref) {
  const board = encodeURIComponent(ref.board);
  return ref.ats === 'ashby'
    ? 'https://api.ashbyhq.com/posting-api/job-board/' + board
    : 'https://boards-api.greenhouse.io/v1/boards/' + board + '/jobs';
}

function normalizeBoard(ref, response) {
  const data = response.json;
  if (response.status !== 200 || !Array.isArray(data?.jobs)) {
    throw new Error('Board HTTP ' + response.status + ' or invalid jobs response');
  }
  if (data.errors?.length || data.next || data.nextPage || data.meta?.next ||
      (ref.ats === 'greenhouse' && data.meta?.total !== data.jobs.length) ||
      (ref.ats === 'ashby' && String(data.apiVersion) !== '1')) {
    throw new Error('Incomplete or unrecognized board snapshot');
  }

  const postings = new Map();
  for (const job of data.jobs) {
    if (!job || typeof job.title !== 'string' || !job.title.trim()) {
      throw new Error('Invalid posting in board response');
    }
    let id;
    let url;
    if (ref.ats === 'ashby') {
      const jobRef = parsePostingUrl(job.jobUrl);
      const applyRef = parsePostingUrl(job.applyUrl);
      if (!jobRef || !applyRef || jobRef.key !== applyRef.key ||
          jobRef.boardKey !== ref.boardKey || typeof job.isListed !== 'boolean') {
        throw new Error('Invalid Ashby posting identity');
      }
      id = jobRef.id;
      url = job.applyUrl;
    } else {
      id = String(job.id ?? '');
      if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) {
        throw new Error('Invalid Greenhouse posting identity');
      }
      url = job.absolute_url || 'https://job-boards.greenhouse.io/' + ref.board + '/jobs/' + id;
    }
    if (postings.has(id)) throw new Error('Duplicate posting identity');
    postings.set(id, {
      ats: ref.ats, board: ref.board, id, key: ref.boardKey + ':' + id,
      title: job.title, url,
      location: ref.ats === 'ashby' ? job.location || '' : job.location?.name || '',
      listed: ref.ats === 'ashby' ? job.isListed : true
    });
  }
  return postings;
}

function fetchAtsBoard(ref, request = atsRequest) {
  return normalizeBoard(ref, request(atsBoardUrl(ref)));
}

function lookupAtsBoard(ref, cache, request = atsRequest) {
  if (!cache.has(ref.boardKey)) {
    try {
      cache.set(ref.boardKey, { postings: fetchAtsBoard(ref, request) });
    } catch (error) {
      cache.set(ref.boardKey, { error: error.message });
    }
  }
  return cache.get(ref.boardKey);
}

function classifyPosting(ref, cache, request = atsRequest) {
  if (!ref) return { status: 'Unsupported', reason: 'Unsupported ATS URL' };
  const snapshot = lookupAtsBoard(ref, cache, request);
  if (snapshot.error) return { status: 'Unknown', reason: snapshot.error };
  if (snapshot.postings.has(ref.id)) return { status: 'Open', reason: 'Published on ATS board' };

  try {
    if (ref.ats === 'greenhouse') {
      const result = request(atsBoardUrl(ref) + '/' + ref.id);
      if (result.status === 200 && String(result.json?.id) === ref.id) {
        return { status: 'Open', reason: 'Individual posting exists' };
      }
      if (result.status === 404 && String(result.json?.error || '').toLowerCase() === 'job not found') {
        return { status: 'Closed', reason: 'Absent from complete board; ATS confirms job not found' };
      }
      return { status: 'Unknown', reason: 'Unconfirmed Greenhouse response: HTTP ' + result.status };
    }

    const result = request('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobPosting', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        operationName: 'ApiJobPosting',
        variables: { o: ref.board, j: ref.id },
        query: 'query ApiJobPosting($o: String!, $j: String!) { jobPosting(organizationHostedJobsPageName: $o, jobPostingId: $j) { id title } }'
      })
    });
    if (result.status !== 200 || !result.json?.data || result.json.errors?.length) {
      return { status: 'Unknown', reason: 'Unconfirmed Ashby individual lookup: HTTP ' + result.status };
    }
    const posting = result.json.data.jobPosting;
    if (String(posting?.id || '').toLowerCase() === ref.id) {
      return { status: 'Open', reason: 'Individual Ashby posting exists (possibly unlisted)' };
    }
    if (posting === null) {
      const page = request('https://jobs.ashbyhq.com/' + encodeURIComponent(ref.board) + '/' + ref.id);
      if (page.status === 404 || page.status === 410) {
        return { status: 'Closed', reason: 'Absent from complete board; null individual lookup and HTTP ' + page.status };
      }
    }
    return { status: 'Unknown', reason: 'Ashby absence not independently confirmed' };
  } catch (error) {
    return { status: 'Unknown', reason: error.message };
  }
}
