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
  var fairAttendance = String(body.fair_attendance || body.fairAttendance || '').trim();
  var fairVisitDay = String(body.fair_visit_day || body.fairVisitDay || '').trim();
  var fairVisitDate = String(body.fair_visit_date || body.fairVisitDate || '').trim();
  var fairVisitTime = String(body.fair_visit_time || body.fairVisitTime || '').trim();
  var financingInterest = String(body.financing_interest || body.financingInterest || '').trim();
  var message = String(body.message || '').trim();
  var productName = String(body.product_name || body.productName || '').trim();
  var productCategory = String(body.product_category || body.productCategory || '').trim();
  var estimatedRetailPrice = String(body.estimated_retail_price || body.estimatedRetailPrice || '').trim();
  var ourPrice = String(body.our_price || body.ourPrice || '').trim();
  var monthlyPayment = String(body.monthly_payment || body.monthlyPayment || '').trim();
  var trafficChannel = String(body.traffic_channel || body.trafficChannel || '').trim().toLowerCase();
  var allowedChannels = { organic: true, paid: true, direct: true, referral: true, internal: true };
  if (trafficChannel && !allowedChannels[trafficChannel]) {
    trafficChannel = '';
  }

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: 'Please enter your full name.' };
  }
  var phoneOnlySource = source === 'fair-soak-reserve';
  if (!phoneOnlySource && !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email.' };
  }
  if (phone.length < PHONE_DIGITS_MIN) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }
  if (phoneOnlySource && !EMAIL_RE.test(email)) {
    email = 'fair+' + phone + '@lead.paradisespas.com';
  }

  if (source === 'fair-in-person-visit' && (!fairVisitDay || !fairVisitTime)) {
    return { ok: false, error: 'Please choose your fair visit day and time.' };
  }

  if (source === 'fair-inventory-gate' && !fairAttendance) {
    return { ok: false, error: 'Please answer the fair question.' };
  }

  if ((source === 'inventory-gate' || source === 'minot-lead') && !financingInterest) {
    return { ok: false, error: 'Please answer the financing question.' };
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
      fairAttendance: fairAttendance || fairVisitDay,
      fairVisitDay: fairVisitDay,
      fairVisitDate: fairVisitDate,
      fairVisitTime: fairVisitTime,
      financingInterest: financingInterest,
      message: message,
      productName: productName,
      productCategory: productCategory,
      estimatedRetailPrice: estimatedRetailPrice,
      ourPrice: ourPrice,
      monthlyPayment: monthlyPayment,
      pageUrl: String(body.page_url || body.pageUrl || '').trim(),
      trafficChannel: trafficChannel,
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
