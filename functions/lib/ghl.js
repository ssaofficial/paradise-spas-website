const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const DEFAULT_LOCATION = 'NpZCArkZIoHhOIl8Qjd1';
const CUSTOM_FIELD_CACHE_MS = 5 * 60 * 1000;
var customFieldCache = {};

function ghlHeaders(token) {
  return {
    Authorization: 'Bearer ' + token,
    Version: GHL_VERSION,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
}

function uniqueTags(tags) {
  var seen = {};
  return tags.filter(function (tag) {
    if (!tag || seen[tag]) return false;
    seen[tag] = true;
    return true;
  });
}

function normalizeContactTags(contact) {
  if (!contact || !contact.tags) return [];
  return contact.tags.map(function (tag) {
    if (typeof tag === 'string') return tag;
    return tag.name || tag.tag || '';
  }).filter(Boolean);
}

function normalizeCustomFieldKey(key) {
  key = String(key || '').trim();
  return key.indexOf('contact.') === 0 ? key.slice('contact.'.length) : key;
}

function isMetaAttribution(lead) {
  var source = String(lead.utmSource || '').trim().toLowerCase();
  var medium = String(lead.utmMedium || '').trim().toLowerCase();
  return !!(
    lead.fbclid ||
    lead.fbc ||
    source === 'facebook' ||
    source === 'fb' ||
    source === 'meta' ||
    source === 'instagram' ||
    source === 'ig' ||
    source === 'threads' ||
    (
      (source.indexOf('facebook') !== -1 || source.indexOf('instagram') !== -1 || source.indexOf('meta') !== -1) &&
      (!medium || medium.indexOf('paid') !== -1 || medium === 'cpc' || medium === 'ppc' || medium === 'social')
    )
  );
}

function sourceTagForLead(lead) {
  var source = lead.source || '';
  if (source === 'meta-lead' || source === 'metalead' || source === 'src-meta') return 'src-meta';
  if (source === 'inbound-call' || source === 'inboundcall' || source === 'src-inbound-call') return 'src-inbound-call';
  return isMetaAttribution(lead) ? 'src-meta' : 'src-organic';
}

function locationTagForLead(lead) {
  var source = lead.source || '';
  var pageUrl = lead.pageUrl || '';

  if (
    source === 'statefair-inventory-gate' ||
    source === 'statefair-in-person-visit' ||
    pageUrl.indexOf('/inventorystatefair') !== -1 ||
    pageUrl.indexOf('/statefair') !== -1
  ) {
    return 'loc-statefair';
  }

  if (
    source === 'fair-inventory-gate' ||
    source === 'fair-in-person-visit' ||
    source === 'fair-reserve' ||
    source === 'fair-hot-tub-blowout-sale' ||
    source === 'fair-hot-tub-blowout-sale-clean' ||
    source === 'fair-sauna-blowout-sale' ||
    source === 'fair-soak-reserve' ||
    pageUrl.indexOf('/active-inventory/') !== -1 ||
    pageUrl.indexOf('/inventoryredrivervalleyfair') !== -1 ||
    pageUrl.indexOf('/redrivervalleyfair') !== -1 ||
    pageUrl.indexOf('/redrivervalleyavailableinventoryonly') !== -1
  ) {
    return 'loc-rrvf';
  }

  if (
    source === 'minot-lead' ||
    source === 'inventory-gate' ||
    pageUrl.indexOf('/inventory') !== -1
  ) {
    return 'loc-minot';
  }

  return '';
}

function offerTagsForLead(lead) {
  var source = lead.source || '';
  if (
    source === 'fair-inventory-gate' ||
    source === 'statefair-inventory-gate' ||
    source === 'minot-lead' ||
    source === 'inventory-gate'
  ) {
    return ['offer-inventory-unlock'];
  }
  return [];
}

function tagsForLead(lead) {
  var tags = [sourceTagForLead(lead)];
  var locationTag = locationTagForLead(lead);
  if (locationTag) tags.push(locationTag);
  tags = tags.concat(offerTagsForLead(lead));
  if (lead.modelInterestTag && lead.productName) {
    tags.push(lead.modelInterestTag);
  }
  if (lead.inventoryStatusTag) {
    tags.push(lead.inventoryStatusTag);
  }
  if (lead.leadSource === 'Paradise Spas Active Inventory' || (lead.pageUrl || '').indexOf('/active-inventory/') !== -1) {
    tags.push('Source - Active Inventory Product Page');
  }
  if (lead.campaign === 'Red River Valley Fair Inventory') {
    tags.push('Campaign - Red River Valley Fair');
  }
  if (lead.formIntent === 'Fair Price Request') {
    tags.push('Intent - Fair Price Request');
  }
  return uniqueTags(tags);
}

function buildContactPayload(lead, locationId, forCreate) {
  var payload = {
    firstName: lead.firstName,
    lastName: lead.lastName || '.',
    email: lead.email,
    phone: '+1' + lead.phone,
    source: lead.leadSource || ('Paradise Spas Website — ' + lead.source),
    tags: tagsForLead(lead)
  };

  if (forCreate) {
    payload.locationId = locationId;
  }

  var customFields = [];
  if (lead.fairAttendance) {
    customFields.push({ key: 'fair_attendance', field_value: lead.fairAttendance });
  }
  if (lead.fairVisitDay) {
    customFields.push({ key: 'fair_visit_day', field_value: lead.fairVisitDay });
  }
  if (lead.fairVisitDate) {
    customFields.push({ key: 'fair_visit_date', field_value: lead.fairVisitDate });
  }
  if (lead.fairVisitTime) {
    customFields.push({ key: 'fair_visit_time', field_value: lead.fairVisitTime });
  }
  if (lead.financingInterest) {
    customFields.push({ key: 'financing_interest', field_value: lead.financingInterest });
  }
  if (lead.message) {
    customFields.push({ key: 'contact_message', field_value: lead.message });
  }
  if (lead.productName) {
    customFields.push({ key: 'product_interested_in', field_value: lead.productName });
  }
  if (lead.productSlug) {
    customFields.push({ key: 'product_slug', field_value: lead.productSlug });
  }
  if (lead.productId) {
    customFields.push({ key: 'product_id', field_value: lead.productId });
  }
  if (lead.productCategory) {
    customFields.push({ key: 'product_category', field_value: lead.productCategory });
  }
  if (lead.productPageUrl) {
    customFields.push({ key: 'product_page_url', field_value: lead.productPageUrl });
  }
  if (lead.inventoryStatus) {
    customFields.push({ key: 'inventory_status', field_value: lead.inventoryStatus });
  }
  if (lead.inventoryStatus && typeof lead.availableQuantity === 'number') {
    customFields.push({ key: 'available_quantity', field_value: String(lead.availableQuantity) });
  }
  if (lead.inventoryStatusTag) {
    customFields.push({ key: 'inventory_status_tag', field_value: lead.inventoryStatusTag });
  }
  if (lead.leadSource) {
    customFields.push({ key: 'lead_source', field_value: lead.leadSource });
  }
  if (lead.campaign) {
    customFields.push({ key: 'campaign', field_value: lead.campaign });
  }
  if (lead.modelInterestTag) {
    customFields.push({ key: 'model_interest_tag', field_value: lead.modelInterestTag });
  }
  if (lead.formIntent) {
    customFields.push({ key: 'form_intent', field_value: lead.formIntent });
  }
  if (lead.timestamp) {
    customFields.push({ key: 'submission_timestamp', field_value: lead.timestamp });
  }
  if (lead.estimatedRetailPrice) {
    customFields.push({ key: 'estimated_retail_price', field_value: lead.estimatedRetailPrice });
  }
  if (lead.ourPrice) {
    customFields.push({ key: 'our_price', field_value: lead.ourPrice });
  }
  if (lead.monthlyPayment) {
    customFields.push({ key: 'monthly_payment', field_value: lead.monthlyPayment });
  }
  if (lead.pageUrl) {
    customFields.push({ key: 'lead_source_page', field_value: lead.pageUrl });
  }
  if (lead.landingPageUrl) {
    customFields.push({ key: 'landing_page_url', field_value: lead.landingPageUrl });
  }
  if (lead.referrerUrl) {
    customFields.push({ key: 'referrer_url', field_value: lead.referrerUrl });
  }
  if (lead.trafficChannel) {
    customFields.push({ key: 'traffic_channel', field_value: lead.trafficChannel });
  }
  if (lead.utmSource) {
    customFields.push({ key: 'utm_source', field_value: lead.utmSource });
  }
  if (lead.utmMedium) {
    customFields.push({ key: 'utm_medium', field_value: lead.utmMedium });
  }
  if (lead.utmCampaign) {
    customFields.push({ key: 'utm_campaign', field_value: lead.utmCampaign });
  }
  if (lead.utmContent) {
    customFields.push({ key: 'utm_content', field_value: lead.utmContent });
  }
  if (lead.utmTerm) {
    customFields.push({ key: 'utm_term', field_value: lead.utmTerm });
  }
  if (lead.fbclid) {
    customFields.push({ key: 'fbclid', field_value: lead.fbclid });
  }
  if (lead.fbp) {
    customFields.push({ key: 'fbp', field_value: lead.fbp });
  }
  if (lead.fbc) {
    customFields.push({ key: 'fbc', field_value: lead.fbc });
  }
  if (lead.gclid) {
    customFields.push({ key: 'gclid', field_value: lead.gclid });
  }
  if (lead.msclkid) {
    customFields.push({ key: 'msclkid', field_value: lead.msclkid });
  }
  if (customFields.length) payload.customFields = customFields;

  return payload;
}

async function customFieldIdsForLocation(locationId, token) {
  var cached = customFieldCache[locationId];
  if (cached && cached.expiresAt > Date.now()) return cached.ids;

  var result = await ghlFetch('/locations/' + locationId + '/customFields', {
    method: 'GET'
  }, token);

  if (!result.ok) {
    throw new Error('GHL custom fields lookup failed: ' + result.status);
  }

  var ids = {};
  var fields = result.data.customFields || result.data.fields || [];
  fields.forEach(function (field) {
    var id = field.id || '';
    var key = normalizeCustomFieldKey(field.fieldKey || field.key || '');
    if (id && key) ids[key] = id;
  });

  customFieldCache[locationId] = {
    expiresAt: Date.now() + CUSTOM_FIELD_CACHE_MS,
    ids: ids
  };
  return ids;
}

async function resolveCustomFields(payload, locationId, token) {
  if (!payload.customFields || !payload.customFields.length) return payload;

  var ids = await customFieldIdsForLocation(locationId, token);
  var resolved = payload.customFields.map(function (field) {
    var key = normalizeCustomFieldKey(field.key);
    var id = ids[key];
    if (!id) return null;
    return {
      id: id,
      key: key,
      field_value: field.field_value
    };
  }).filter(Boolean);

  if (resolved.length) {
    payload.customFields = resolved;
  } else {
    delete payload.customFields;
  }

  return payload;
}

async function ghlFetch(path, options, token) {
  var res = await fetch(GHL_BASE + path, Object.assign({}, options, {
    headers: ghlHeaders(token)
  }));
  var text = await res.text();
  var data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data: data, text: text };
}

function buildContactNote(lead) {
  if (!lead.productName) return '';
  return [
    'Requested current Red River Valley Fair pricing for ' + lead.productName + ' from the Active Inventory product page.',
    '',
    'Product: ' + lead.productName,
    'Product page: ' + (lead.productPageUrl || lead.pageUrl || ''),
    'Inventory status: ' + (lead.inventoryStatus || 'n/a'),
    'Available quantity: ' + (typeof lead.availableQuantity === 'number' ? String(lead.availableQuantity) : 'n/a'),
    'Submitted: ' + (lead.timestamp || new Date().toISOString()),
    'Form intent: ' + (lead.formIntent || 'Fair Price Request'),
    'Campaign source: ' + (lead.campaign || 'Red River Valley Fair Inventory'),
    'Lead source: ' + (lead.leadSource || lead.source || '')
  ].join('\n');
}

async function appendContactNote(contactId, lead, token) {
  var note = buildContactNote(lead);
  if (!contactId || !note) return { ok: false, skipped: true };
  return ghlFetch('/contacts/' + contactId + '/notes', {
    method: 'POST',
    body: JSON.stringify({ body: note })
  }, token);
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

function shouldRetry(status) {
  return status === 408 || status === 429 || status >= 500;
}

async function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

export function ghlConfigured(env) {
  return !!env.GHL_API_TOKEN;
}

export async function upsertContact(env, lead) {
  var token = env.GHL_API_TOKEN;
  if (!token) {
    return { ok: false, error: 'GHL_API_TOKEN is not configured.', retryable: false };
  }

  var locationId = env.GHL_LOCATION_ID || DEFAULT_LOCATION;
  var delays = [0, 1000, 3000, 9000];
  var lastError = 'Unknown GHL error';

  for (var attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt]) await sleep(delays[attempt]);

    try {
      var existing = await findContactByEmail(lead.email, locationId, token);
      var result;
      var payload;

      if (existing && existing.id) {
        payload = buildContactPayload(lead, locationId, false);
        payload = await resolveCustomFields(payload, locationId, token);
        payload.tags = uniqueTags(normalizeContactTags(existing).concat(payload.tags));
        result = await ghlFetch('/contacts/' + existing.id, {
          method: 'PUT',
          body: JSON.stringify(payload)
        }, token);
      } else {
        payload = buildContactPayload(lead, locationId, true);
        payload = await resolveCustomFields(payload, locationId, token);
        result = await ghlFetch('/contacts/', {
          method: 'POST',
          body: JSON.stringify(payload)
        }, token);
      }

      if (result.ok) {
        var contact = result.data.contact || result.data;
        var contactId = contact.id || (existing && existing.id) || '';
        var noteResult = { ok: false, skipped: true };
        try {
          noteResult = await appendContactNote(contactId, lead, token);
        } catch (noteErr) {
          noteResult = { ok: false, error: noteErr.message || String(noteErr) };
        }
        return {
          ok: true,
          contactId: contactId,
          noteOk: noteResult.ok === true,
          noteError: noteResult.ok ? '' : (noteResult.error || ''),
          retryable: false
        };
      }

      lastError = 'GHL ' + result.status + ': ' + (result.data.message || result.text || 'request failed');
      if (!shouldRetry(result.status) || attempt === delays.length - 1) {
        return { ok: false, error: lastError, retryable: shouldRetry(result.status) };
      }
    } catch (err) {
      lastError = err.message || String(err);
      if (attempt === delays.length - 1) {
        return { ok: false, error: lastError, retryable: true };
      }
    }
  }

  return { ok: false, error: lastError, retryable: true };
}
