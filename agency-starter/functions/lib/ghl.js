const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function ghlHeaders(token) {
  return {
    Authorization: 'Bearer ' + token,
    Version: GHL_VERSION,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
}

/**
 * Map data-lead-source codes → GHL tags.
 * Add a branch for every source in LEAD-SOURCES.md.
 */
function tagsForSource(source) {
  var tags = ['website-form', 'lead-api'];

  if (source === 'contact-page') tags.push('contact-page');
  if (source === 'quote-modal') tags.push('quote-request');
  if (source === 'book-call') tags.push('book-call');
  if (source === 'lp-facebook' || source === 'lp-meta') tags.push('lp-facebook');
  if (source === 'application') tags.push('application');
  if (source === 'newsletter') tags.push('newsletter');
  if (source.indexOf('lp-') === 0 && tags.indexOf('lp-facebook') === -1) tags.push(source);

  return tags;
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

function contactSourceLabel(env, source) {
  var name = env.CLIENT_NAME || 'Website';
  return name + ' — ' + source;
}

function buildContactPayload(lead, locationId, env, forCreate) {
  var payload = {
    firstName: lead.firstName,
    lastName: lead.lastName || '.',
    email: lead.email,
    phone: '+1' + lead.phone,
    source: contactSourceLabel(env, lead.source),
    tags: tagsForSource(lead.source)
  };

  if (forCreate) {
    payload.locationId = locationId;
  }

  var customFields = [];
  if (lead.message) {
    customFields.push({ key: 'contact_message', field_value: lead.message });
  }
  if (lead.company) {
    customFields.push({ key: 'company_name', field_value: lead.company });
  }
  if (lead.serviceInterest) {
    customFields.push({ key: 'service_interest', field_value: lead.serviceInterest });
  }
  if (lead.pageUrl) {
    customFields.push({ key: 'lead_source_page', field_value: lead.pageUrl });
  }
  if (lead.utmSource) {
    customFields.push({ key: 'utm_source', field_value: lead.utmSource });
  }
  if (lead.utmCampaign) {
    customFields.push({ key: 'utm_campaign', field_value: lead.utmCampaign });
  }
  if (lead.utmContent) {
    customFields.push({ key: 'utm_content', field_value: lead.utmContent });
  }
  if (lead.fbclid) {
    customFields.push({ key: 'fbclid', field_value: lead.fbclid });
  }
  if (customFields.length) payload.customFields = customFields;

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

  var locationId = env.GHL_LOCATION_ID;
  if (!locationId) {
    return { ok: false, error: 'GHL_LOCATION_ID is not configured.', retryable: false };
  }

  var delays = [0, 1000, 3000, 9000];
  var lastError = 'Unknown GHL error';

  for (var attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt]) await sleep(delays[attempt]);

    try {
      var existing = await findContactByEmail(lead.email, locationId, token);
      var result;
      var payload;

      if (existing && existing.id) {
        payload = buildContactPayload(lead, locationId, env, false);
        payload.tags = uniqueTags(normalizeContactTags(existing).concat(payload.tags));
        result = await ghlFetch('/contacts/' + existing.id, {
          method: 'PUT',
          body: JSON.stringify(payload)
        }, token);
      } else {
        payload = buildContactPayload(lead, locationId, env, true);
        result = await ghlFetch('/contacts/', {
          method: 'POST',
          body: JSON.stringify(payload)
        }, token);
      }

      if (result.ok) {
        var contact = result.data.contact || result.data;
        return {
          ok: true,
          contactId: contact.id || (existing && existing.id) || '',
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
