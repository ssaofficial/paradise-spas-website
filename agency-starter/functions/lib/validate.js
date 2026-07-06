const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_MIN = 10;

export function splitName(fullName) {
  var parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function normalizePhone(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
  return digits;
}

export function validateLeadPayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body.' };
  }

  if (body.website_url) {
    return { ok: false, error: 'Spam detected.' };
  }

  var testEmail = String(body.email || '').trim().toLowerCase();
  if (testEmail.indexOf('@example.com') !== -1 || testEmail.indexOf('sheet-fixed-test') !== -1) {
    return { ok: false, error: 'Test submissions are not accepted.' };
  }

  var clientSubmissionId = String(body.submission_id || body.submissionId || body.meta_event_id || body.metaEventId || '').trim();
  var submissionId = /^[0-9a-f-]{36}$/i.test(clientSubmissionId) ? clientSubmissionId : crypto.randomUUID();

  var fullName = String(body.full_name || body.fullName || '').trim();
  var email = String(body.email || '').trim().toLowerCase();
  var phone = normalizePhone(body.phone);
  var source = String(body.source || 'website-form').trim();
  var message = String(body.message || '').trim();
  var company = String(body.company || '').trim();
  var serviceInterest = String(body.service_interest || body.serviceInterest || '').trim();
  var utmSource = String(body.utm_source || body.utmSource || '').trim();
  var utmCampaign = String(body.utm_campaign || body.utmCampaign || '').trim();
  var utmContent = String(body.utm_content || body.utmContent || '').trim();
  var fbclid = String(body.fbclid || '').trim();

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: 'Please enter your full name.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email.' };
  }
  if (phone.length < PHONE_DIGITS_MIN) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }

  var names = splitName(fullName);

  return {
    ok: true,
    data: {
      submissionId: submissionId,
      fullName: fullName,
      firstName: names.firstName,
      lastName: names.lastName,
      email: email,
      phone: phone,
      source: source,
      message: message,
      company: company,
      serviceInterest: serviceInterest,
      pageUrl: String(body.page_url || body.pageUrl || '').trim(),
      utmSource: utmSource,
      utmCampaign: utmCampaign,
      utmContent: utmContent,
      fbclid: fbclid,
      consent: body.consent !== false && body.consent !== 'false'
    }
  };
}

export async function verifyTurnstile(token, env, request) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true, skipped: true };
  if (!token) return { ok: false, error: 'Please complete the security check.' };

  var form = new URLSearchParams();
  form.set('secret', env.TURNSTILE_SECRET_KEY);
  form.set('response', token);
  form.set('remoteip', request.headers.get('CF-Connecting-IP') || '');

  var res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  var data = await res.json();
  if (!data.success) {
    return { ok: false, error: 'Security check failed. Please try again.' };
  }
  return { ok: true };
}
