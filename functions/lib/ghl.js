const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const DEFAULT_LOCATION = 'NpZCArkZIoHhOIl8Qjd1';

function ghlHeaders(token) {
  return {
    Authorization: 'Bearer ' + token,
    Version: GHL_VERSION,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
}

function tagsForSource(source) {
  var tags = ['website-form', 'lead-api'];
  if (source === 'fair-inventory-gate') tags.push('fair-inventory-unlock');
  if (source === 'inventory-gate') tags.push('inventory-unlock');
  if (source === 'contact-page') tags.push('contact-page');
  if (source === 'financing-page') tags.push('financing-page');
  if (source === 'fair-reserve') tags.push('fair-reserve');
  if (source === 'product-page') tags.push('product-page');
  if (source.indexOf('product') !== -1 || source === 'pricing_modal' || source === 'product_detail') {
    tags.push('pricing-request');
  }
  return tags;
}

function buildContactPayload(lead, locationId) {
  var payload = {
    locationId: locationId,
    firstName: lead.firstName,
    lastName: lead.lastName || '.',
    email: lead.email,
    phone: '+1' + lead.phone,
    source: 'Paradise Spas Website — ' + lead.source,
    tags: tagsForSource(lead.source)
  };

  var customFields = [];
  if (lead.fairAttendance) {
    customFields.push({ key: 'fair_attendance', field_value: lead.fairAttendance });
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
  if (lead.productCategory) {
    customFields.push({ key: 'product_category', field_value: lead.productCategory });
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

  var locationId = env.GHL_LOCATION_ID || DEFAULT_LOCATION;
  var payload = buildContactPayload(lead, locationId);
  var delays = [0, 1000, 3000, 9000];
  var lastError = 'Unknown GHL error';

  for (var attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt]) await sleep(delays[attempt]);

    try {
      var existing = await findContactByEmail(lead.email, locationId, token);
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
