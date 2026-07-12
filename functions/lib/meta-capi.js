const META_GRAPH = 'https://graph.facebook.com/v21.0';
const DEFAULT_PIXEL_ID = '1317738110513512';
const LEAD_VALUE = 950;
const LEAD_CURRENCY = 'USD';

async function sha256(value) {
  if (!value) return '';
  var normalized = String(value).trim().toLowerCase();
  if (!normalized) return '';
  var digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest))
    .map(function (b) { return b.toString(16).padStart(2, '0'); })
    .join('');
}

function normalizePhoneForMeta(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) digits = '1' + digits;
  return digits;
}

export function metaCapiConfigured(env) {
  return !!(env.META_CAPI_ACCESS_TOKEN && (env.META_PIXEL_ID || DEFAULT_PIXEL_ID));
}

export async function sendLeadEvent(env, request, lead, meta) {
  if (!metaCapiConfigured(env)) {
    return { sent: false, reason: 'META_CAPI_ACCESS_TOKEN not configured' };
  }

  var pixelId = env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  var eventId = meta.eventId || lead.submissionId;
  var eventTime = Math.floor(Date.now() / 1000);

  var userData = {
    em: [await sha256(lead.email)].filter(Boolean),
    ph: [await sha256(normalizePhoneForMeta(lead.phone))].filter(Boolean),
    client_ip_address: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '',
    client_user_agent: request.headers.get('User-Agent') || ''
  };

  if (meta.fbp) userData.fbp = meta.fbp;
  if (meta.fbc) userData.fbc = meta.fbc;

  var payload = {
    data: [{
      event_name: 'Lead',
      event_time: eventTime,
      event_id: eventId,
      action_source: 'website',
      event_source_url: lead.pageUrl || 'https://www.paradisespas.com/',
      user_data: userData,
      custom_data: {
        value: LEAD_VALUE,
        currency: LEAD_CURRENCY,
        content_name: lead.productName || lead.source,
        content_category: lead.campaign || lead.productCategory || ''
      }
    }],
    access_token: env.META_CAPI_ACCESS_TOKEN
  };

  if (env.META_TEST_EVENT_CODE) {
    payload.test_event_code = env.META_TEST_EVENT_CODE;
  }

  var res = await fetch(META_GRAPH + '/' + pixelId + '/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  var body = await res.json().catch(function () { return {}; });
  return {
    sent: res.ok && body.events_received > 0,
    status: res.status,
    events_received: body.events_received || 0,
    fbtrace_id: body.fbtrace_id || '',
    event_id: eventId
  };
}
