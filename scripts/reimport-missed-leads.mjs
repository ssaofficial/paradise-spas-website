#!/usr/bin/env node
/**
 * Re-import Missed Leads tab rows into GHL without firing Meta events.
 *
 * Usage:
 *   GHL_API_TOKEN=pit-... GHL_LOCATION_ID=NpZCArkZIoHhOIl8Qjd1 \
 *     node scripts/reimport-missed-leads.mjs path/to/Missed\ Leads.csv
 *
 * CSV columns (from Lead Vault): submission_id, submitted_at, full_name, email,
 * phone, fair_attendance, page_url, ghl_error, reimported
 *
 * Does NOT call /api/lead — direct GHL upsert only (no Meta, no new vault row).
 */

import fs from 'node:fs';
import { parse } from 'node:path';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function splitName(fullName) {
  var parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '.' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function parseCsv(text) {
  var lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  var headers = lines[0].split(',').map(function (h) { return h.trim().replace(/^"|"$/g, ''); });
  return lines.slice(1).map(function (line) {
    var cols = line.match(/("([^"]|"")*"|[^,]*)/g) || [];
    cols = cols.filter(function (_, i, arr) { return i < arr.length - 1 || cols[i]; });
    var row = {};
    headers.forEach(function (header, i) {
      var val = (cols[i] || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');
      row[header] = val;
    });
    return row;
  });
}

function buildPayload(lead, locationId, forCreate) {
  var names = splitName(lead.full_name);
  var payload = {
    firstName: names.firstName,
    lastName: names.lastName || '.',
    email: String(lead.email || '').trim().toLowerCase(),
    phone: '+1' + String(lead.phone || '').replace(/\D/g, '').slice(-10),
    source: 'Paradise Spas Website — fair-inventory-gate (reimport)',
    tags: ['website-form', 'lead-api', 'fair-inventory-unlock', 'missed-lead-reimport']
  };
  if (forCreate) payload.locationId = locationId;
  if (lead.fair_attendance) {
    payload.customFields = [{ key: 'fair_attendance', field_value: lead.fair_attendance }];
  }
  return payload;
}

async function ghlFetch(path, options, token) {
  var res = await fetch(GHL_BASE + path, Object.assign({}, options, {
    headers: {
      Authorization: 'Bearer ' + token,
      Version: GHL_VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }));
  var text = await res.text();
  var data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data: data, text: text };
}

async function findContactByEmail(email, locationId, token) {
  var result = await ghlFetch('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      locationId: locationId,
      page: 1,
      pageLimit: 1,
      filters: [{ field: 'email', operator: 'eq', value: email }]
    })
  }, token);
  if (!result.ok) return null;
  var contacts = result.data.contacts || [];
  return contacts.length ? contacts[0] : null;
}

async function upsertLead(row, token, locationId) {
  var email = String(row.email || '').trim().toLowerCase();
  if (!email || email.indexOf('@example.com') !== -1) {
    return { ok: false, skipped: true, reason: 'test or missing email' };
  }
  var existing = await findContactByEmail(email, locationId, token);
  var payload = buildPayload(row, locationId, !existing);
  var result;
  if (existing && existing.id) {
    result = await ghlFetch('/contacts/' + existing.id, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, token);
  } else {
    result = await ghlFetch('/contacts/', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  }
  if (!result.ok) {
    return { ok: false, error: 'GHL ' + result.status + ': ' + (result.data.message || result.text) };
  }
  var contact = result.data.contact || result.data;
  return { ok: true, contactId: contact.id || (existing && existing.id) || '' };
}

async function main() {
  var csvPath = process.argv[2];
  var token = process.env.GHL_API_TOKEN;
  var locationId = process.env.GHL_LOCATION_ID || 'NpZCArkZIoHhOIl8Qjd1';
  if (!token) {
    console.error('Set GHL_API_TOKEN');
    process.exit(1);
  }
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error('Usage: node scripts/reimport-missed-leads.mjs "Missed Leads.csv"');
    process.exit(1);
  }

  var rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  var ok = 0;
  var fail = 0;
  var skip = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (row.reimported && String(row.reimported).toLowerCase() === 'yes') {
      skip += 1;
      continue;
    }
    var result = await upsertLead(row, token, locationId);
    if (result.skipped) {
      console.log('SKIP', row.email, result.reason);
      skip += 1;
    } else if (result.ok) {
      console.log('OK  ', row.email, result.contactId);
      ok += 1;
    } else {
      console.log('FAIL', row.email, result.error);
      fail += 1;
    }
    await new Promise(function (r) { setTimeout(r, 400); });
  }

  console.log('\nDone. OK:', ok, 'Failed:', fail, 'Skipped:', skip);
  process.exit(fail ? 1 : 0);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
