const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

function pemToArrayBuffer(pem) {
  var b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  var binary = atob(b64);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64UrlEncode(input) {
  var str = typeof input === 'string' ? input : String.fromCharCode.apply(null, new Uint8Array(input));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGoogleAccessToken(env) {
  var email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  var privateKey = (env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !privateKey) {
    throw new Error('Google Sheets credentials are not configured.');
  }

  var now = Math.floor(Date.now() / 1000);
  var header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  var claim = base64UrlEncode(JSON.stringify({
    iss: email,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  var unsigned = header + '.' + claim;

  var key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  var signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );
  var jwt = unsigned + '.' + base64UrlEncode(signature);

  var tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  var tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error('Google token error: ' + (tokenData.error_description || tokenRes.status));
  }
  return tokenData.access_token;
}

function leadRow(lead, ghlStatus, ghlContactId, ghlError) {
  return [
    lead.submissionId,
    new Date().toISOString(),
    lead.source,
    lead.fullName,
    lead.email,
    lead.phone,
    lead.fairAttendance || lead.financingInterest || '',
    lead.pageUrl || '',
    ghlStatus || 'PENDING',
    ghlContactId || '',
    ghlError || ''
  ];
}

async function sheetsRequest(env, path, options) {
  options = options || {};
  var token = await getGoogleAccessToken(env);
  var sheetId = env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEETS_ID is not configured.');

  var res = await fetch(SHEETS_BASE + '/' + sheetId + path, Object.assign({}, options, {
    headers: Object.assign({
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }, options.headers || {})
  }));
  var text = await res.text();
  var data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error('Sheets API ' + res.status + ': ' + (data.error && data.error.message ? data.error.message : text));
  }
  return data;
}

export async function appendLeadVault(env, lead, ghlStatus, ghlContactId, ghlError) {
  return sheetsRequest(env, '/values/' + encodeURIComponent('All Leads!A:K') + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS', {
    method: 'POST',
    body: JSON.stringify({ values: [leadRow(lead, ghlStatus, ghlContactId, ghlError)] })
  });
}

export async function updateLeadVaultRow(env, a1Range, lead, ghlStatus, ghlContactId, ghlError) {
  return sheetsRequest(env, '/values/' + encodeURIComponent(a1Range) + '?valueInputOption=USER_ENTERED', {
    method: 'PUT',
    body: JSON.stringify({ values: [leadRow(lead, ghlStatus, ghlContactId, ghlError)] })
  });
}

export async function appendMissedLead(env, lead, ghlError) {
  return sheetsRequest(env, '/values/' + encodeURIComponent('Missed Leads!A:I') + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS', {
    method: 'POST',
    body: JSON.stringify({
      values: [[
        lead.submissionId,
        new Date().toISOString(),
        lead.fullName,
        lead.email,
        lead.phone,
        lead.fairAttendance || lead.financingInterest || '',
        lead.pageUrl || '',
        ghlError || 'Unknown GHL error',
        ''
      ]]
    })
  });
}

export function sheetsConfigured(env) {
  return !!(env.GOOGLE_SHEETS_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
}

var DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeEmailForDedupe(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhoneForDedupe(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
  return digits.slice(-10);
}

export async function findRecentDuplicate(env, email, phone, windowMs) {
  windowMs = windowMs || DUPLICATE_WINDOW_MS;
  var targetEmail = normalizeEmailForDedupe(email);
  var targetPhone = normalizePhoneForDedupe(phone);
  if (!targetEmail && !targetPhone) return null;

  var data = await sheetsRequest(env, '/values/' + encodeURIComponent("'All Leads'!A:K"));
  var rows = data.values || [];
  var cutoff = Date.now() - windowMs;
  var pendingCutoff = Date.now() - (30 * 60 * 1000);
  var sentMatch = null;
  var recentFailedMatch = null;

  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    if (!row || !row.length) continue;
    if (i === 0 && String(row[0] || '').toLowerCase() === 'submission_id') continue;

    var submittedAt = Date.parse(row[1] || '');
    if (!submittedAt || submittedAt < cutoff) continue;

    var rowEmail = normalizeEmailForDedupe(row[4] || '');
    var rowPhone = normalizePhoneForDedupe(row[5] || '');
    var matches = (targetEmail && rowEmail && rowEmail === targetEmail) ||
      (targetPhone && rowPhone && rowPhone === targetPhone);
    if (!matches) continue;

    var status = String(row[8] || '').toUpperCase();
    if (status === 'SENT' || status === 'DUPLICATE') {
      sentMatch = { submittedAt: row[1], email: rowEmail, phone: rowPhone, status: status };
      break;
    }
    if (status === 'PENDING' && submittedAt >= pendingCutoff) {
      sentMatch = { submittedAt: row[1], email: rowEmail, phone: rowPhone, status: status };
      break;
    }
    if (status === 'FAILED' && !recentFailedMatch) {
      recentFailedMatch = { submittedAt: row[1], email: rowEmail, phone: rowPhone, status: status };
    }
  }

  return sentMatch || recentFailedMatch;
}
