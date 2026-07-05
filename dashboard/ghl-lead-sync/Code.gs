/**
 * Paradise Spas — GHL lead sync to Google Sheets
 * For Looker Studio (Increase ROAS)
 *
 * Setup: see ../03-ghl-sheets-sync.md
 */

var CONFIG = {
  LOCATION_ID: 'NpZCArkZIoHhOIl8Qjd1',
  FORM_ID: 'iz3wpzwCI9GQhR3wlwbV',
  FORM_NAME: 'WEBSITE FORM',
  GHL_API_BASE: 'https://services.leadconnectorhq.com',
  LEAD_LOG_SHEET: 'lead_log',
  DAILY_SUMMARY_SHEET: 'daily_summary',
  SYNC_DAYS_BACK: 30
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Paradise Spas Sync')
    .addItem('Run sync now', 'syncGhlLeadsToSheet')
    .addItem('Install hourly trigger', 'installHourlyTrigger')
    .addToUi();
}

function installHourlyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'syncGhlLeadsToSheet') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger('syncGhlLeadsToSheet')
    .timeBased()
    .everyHours(1)
    .create();
  SpreadsheetApp.getActiveSpreadsheet().toast('Hourly GHL sync trigger installed.');
}

function syncGhlLeadsToSheet() {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GHL_API_KEY');
  if (!apiKey) {
    throw new Error('Missing GHL_API_KEY in Script properties. See 03-ghl-sheets-sync.md');
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var leadLog = getOrCreateSheet_(ss, CONFIG.LEAD_LOG_SHEET, [
    'contact_id', 'created_at', 'date', 'first_name', 'last_name', 'email', 'phone', 'source', 'tags'
  ]);
  var dailySummary = getOrCreateSheet_(ss, CONFIG.DAILY_SUMMARY_SHEET, [
    'date', 'form_leads', 'synced_at'
  ]);

  var existingIds = readExistingContactIds_(leadLog);
  var since = new Date();
  since.setDate(since.getDate() - CONFIG.SYNC_DAYS_BACK);

  var contacts = fetchRecentContacts_(apiKey, since);
  var newRows = [];
  var dailyCounts = {};

  contacts.forEach(function (contact) {
    if (!contact || !contact.id) return;
    if (existingIds[contact.id]) return;
    if (!isWebsiteFormLead_(contact)) return;

    var createdAt = contact.dateAdded || contact.createdAt || '';
    var dateKey = toDateKey_(createdAt);
    if (!dateKey) return;

    newRows.push([
      contact.id,
      createdAt,
      dateKey,
      contact.firstName || '',
      contact.lastName || '',
      contact.email || '',
      contact.phone || '',
      contact.source || '',
      (contact.tags || []).join(', ')
    ]);

    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    existingIds[contact.id] = true;
  });

  if (newRows.length) {
    leadLog.getRange(leadLog.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }

  rebuildDailySummary_(dailySummary, leadLog);
  ss.toast('GHL sync complete. New leads: ' + newRows.length);
}

function fetchRecentContacts_(apiKey, sinceDate) {
  var all = [];
  var page = 1;
  var pageLimit = 100;
  var sinceIso = sinceDate.toISOString();

  while (page <= 20) {
    var payload = {
      locationId: CONFIG.LOCATION_ID,
      page: page,
      pageLimit: pageLimit,
      filters: [
        {
          field: 'dateAdded',
          operator: 'range',
          value: { gte: sinceIso }
        }
      ]
    };

    var response = UrlFetchApp.fetch(CONFIG.GHL_API_BASE + '/contacts/search', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        Version: '2021-07-28',
        Accept: 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText() || '{}');

    if (code >= 400) {
      throw new Error('GHL API error ' + code + ': ' + response.getContentText());
    }

    var batch = body.contacts || [];
    all = all.concat(batch);

    if (batch.length < pageLimit) break;
    page += 1;
  }

  return all;
}

function isWebsiteFormLead_(contact) {
  var source = String(contact.source || '').toLowerCase();
  var tags = (contact.tags || []).map(function (t) { return String(t).toLowerCase(); });
  var tagString = tags.join(' ');

  if (tags.indexOf('website-form') !== -1) return true;
  if (tags.indexOf('website-lead') !== -1) return true;
  if (source.indexOf('website form') !== -1) return true;
  if (source.indexOf(CONFIG.FORM_NAME.toLowerCase()) !== -1) return true;
  if (source.indexOf('website') !== -1 && source.indexOf('form') !== -1) return true;

  return false;
}

function rebuildDailySummary_(dailySummarySheet, leadLogSheet) {
  var lastRow = leadLogSheet.getLastRow();
  if (lastRow < 2) return;

  var data = leadLogSheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var counts = {};
  data.forEach(function (row) {
    var dateKey = row[2];
    if (!dateKey) return;
    counts[dateKey] = (counts[dateKey] || 0) + 1;
  });

  var dates = Object.keys(counts).sort();
  var now = new Date().toISOString();
  var rows = dates.map(function (d) {
    return [d, counts[d], now];
  });

  dailySummarySheet.getRange(2, 1, Math.max(dailySummarySheet.getMaxRows() - 1, 1), 3).clearContent();
  if (rows.length) {
    dailySummarySheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

function readExistingContactIds_(sheet) {
  var map = {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return map;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  ids.forEach(function (row) {
    if (row[0]) map[row[0]] = true;
  });
  return map;
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function toDateKey_(isoOrDate) {
  if (!isoOrDate) return '';
  var d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone() || 'America/Chicago', 'yyyy-MM-dd');
}
