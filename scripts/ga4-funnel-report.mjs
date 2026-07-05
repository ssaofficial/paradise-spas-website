#!/usr/bin/env node
/**
 * Paradise Spas — GA4 funnel report (read-only).
 *
 * Setup: dashboard/GA4_API_SETUP.md
 *
 * Usage:
 *   GA4_CREDENTIALS_PATH=~/secrets/paradise-ga4.json \
 *     node scripts/ga4-funnel-report.mjs
 *
 *   node scripts/ga4-funnel-report.mjs --from 2026-06-29 --to 2026-07-02
 *   node scripts/ga4-funnel-report.mjs --all-pages
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '543642271';
const SCOPES = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_BASE = 'https://analyticsdata.googleapis.com/v1beta';

const FUNNEL_PREFIXES = [
  '/redrivervalleyfair',
  '/inventoryredrivervalleyfair',
  '/hot-tub-offer',
  '/inventory',
  '/thank-you'
];

const TRACKED_EVENTS = ['generate_lead', 'pricing_click', 'click_call', 'fair_inventory_unlock'];

function parseArgs(argv) {
  var out = { from: '28daysAgo', to: 'today', allPages: false };
  for (var i = 2; i < argv.length; i++) {
    if (argv[i] === '--from' && argv[i + 1]) { out.from = argv[++i]; continue; }
    if (argv[i] === '--to' && argv[i + 1]) { out.to = argv[++i]; continue; }
    if (argv[i] === '--all-pages') { out.allPages = true; continue; }
  }
  return out;
}

function expandHome(p) {
  if (p && p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function loadCredentials() {
  var credPath = expandHome(process.env.GA4_CREDENTIALS_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || '');
  if (!credPath) {
    throw new Error('Set GA4_CREDENTIALS_PATH to your service account JSON file.');
  }
  if (!fs.existsSync(credPath)) {
    throw new Error('Credentials file not found: ' + credPath);
  }
  return JSON.parse(fs.readFileSync(credPath, 'utf8'));
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

async function getAccessToken(credentials) {
  var now = Math.floor(Date.now() / 1000);
  var header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  var claim = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: SCOPES,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  var unsigned = header + '.' + claim;
  var signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), credentials.private_key);
  var jwt = unsigned + '.' + signature.toString('base64url');

  var res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  var data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error('Google token error: ' + (data.error_description || data.error || res.status));
  }
  return data.access_token;
}

async function runReport(token, body) {
  var res = await fetch(GA4_BASE + '/properties/' + PROPERTY_ID + ':runReport', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  var data = await res.json();
  if (!res.ok) {
    throw new Error('GA4 API error ' + res.status + ': ' + JSON.stringify(data));
  }
  return data;
}

function metricValue(row, index) {
  return parseInt((row.metricValues || [])[index]?.value || '0', 10);
}

function printTable(title, headers, rows) {
  console.log('\n' + title);
  console.log('='.repeat(title.length));
  if (!rows.length) {
    console.log('(no data)');
    return;
  }
  var widths = headers.map(function (h, i) {
    return Math.max(h.length, ...rows.map(function (r) { return String(r[i] || '').length; }));
  });
  console.log(headers.map(function (h, i) { return h.padEnd(widths[i]); }).join('  '));
  console.log(widths.map(function (w) { return '-'.repeat(w); }).join('  '));
  rows.forEach(function (row) {
    console.log(row.map(function (cell, i) { return String(cell || '').padEnd(widths[i]); }).join('  '));
  });
}

function isFunnelPath(pagePath) {
  return FUNNEL_PREFIXES.some(function (prefix) {
    return pagePath === prefix || pagePath.startsWith(prefix + '/') || pagePath.startsWith(prefix);
  });
}

async function main() {
  var args = parseArgs(process.argv);
  var credentials = loadCredentials();
  var token = await getAccessToken(credentials);

  console.log('Paradise Spas GA4 report');
  console.log('Property ID: ' + PROPERTY_ID);
  console.log('Date range: ' + args.from + ' → ' + args.to);

  var pageReport = await runReport(token, {
    dateRanges: [{ startDate: args.from, endDate: args.to }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'screenPageViews' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: args.allPages ? 200 : 100
  });

  var pageRows = (pageReport.rows || []).map(function (row) {
    var pagePath = row.dimensionValues[0].value;
    return [
      pagePath,
      metricValue(row, 0),
      metricValue(row, 1),
      metricValue(row, 2)
    ];
  });

  var funnelRows = pageRows.filter(function (row) { return isFunnelPath(row[0]); });
  printTable('Fair funnel pages (sessions)', ['Page path', 'Sessions', 'Users', 'Views'], funnelRows);

  if (args.allPages) {
    printTable('All pages (top 200 by sessions)', ['Page path', 'Sessions', 'Users', 'Views'], pageRows);
  }

  var eventReport = await runReport(token, {
    dateRanges: [{ startDate: args.from, endDate: args.to }],
    dimensions: [{ name: 'pagePath' }, { name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: TRACKED_EVENTS }
      }
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 250
  });

  var eventRows = (eventReport.rows || []).map(function (row) {
    return [
      row.dimensionValues[0].value,
      row.dimensionValues[1].value,
      metricValue(row, 0)
    ];
  });

  var funnelEvents = eventRows.filter(function (row) { return isFunnelPath(row[0]); });
  printTable('Funnel events by page', ['Page path', 'Event', 'Count'], funnelEvents);

  var totals = {};
  eventRows.forEach(function (row) {
    totals[row[1]] = (totals[row[1]] || 0) + row[2];
  });
  printTable('Site-wide event totals', ['Event', 'Count'], Object.keys(totals).sort().map(function (k) {
    return [k, totals[k]];
  }));
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
