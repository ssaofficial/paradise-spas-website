import { corsHeaders, jsonResponse } from '../lib/cors.js';
import { validateLeadPayload, verifyTurnstile } from '../lib/validate.js';
import { appendLeadVault, appendMissedLead, findRecentDuplicate, sheetsConfigured, updateLeadVaultRow } from '../lib/sheets.js';
import { upsertContact, ghlConfigured } from '../lib/ghl.js';
import { sendFailureAlert } from '../lib/alert.js';
import { sendLeadEvent } from '../lib/meta-capi.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(context.env, context.request)
  });
}

export async function onRequestPost(context) {
  var env = context.env;
  var request = context.request;

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, env, request);
  }

  if (!sheetsConfigured(env)) {
    return jsonResponse({
      ok: false,
      error: 'Lead vault is not configured yet. Please call 701-714-5879.'
    }, 503, env, request);
  }

  var body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Invalid JSON.' }, 400, env, request);
  }

  var validated = validateLeadPayload(body);
  if (!validated.ok) {
    return jsonResponse({ ok: false, error: validated.error }, 400, env, request);
  }
  var lead = validated.data;

  var turnstile = await verifyTurnstile(body.turnstile_token || body.turnstileToken, env, request);
  if (!turnstile.ok) {
    return jsonResponse({ ok: false, error: turnstile.error }, 400, env, request);
  }

  var duplicateMatch = null;
  var duplicateScan = 'miss';
  try {
    duplicateMatch = await findRecentDuplicate(env, lead.email, lead.phone);
    duplicateScan = duplicateMatch ? 'hit' : 'miss';
  } catch (err) {
    duplicateScan = 'error';
    console.error('findRecentDuplicate failed:', err.message || err);
  }

  var isSentDuplicate = duplicateMatch &&
    (duplicateMatch.status === 'SENT' || duplicateMatch.status === 'DUPLICATE');
  var isFailedRetry = duplicateMatch && duplicateMatch.status === 'FAILED';
  var isDuplicate = isSentDuplicate;
  var vaultRange = '';
  try {
    var pendingAppend = await appendLeadVault(
      env,
      lead,
      isDuplicate ? 'DUPLICATE' : (isFailedRetry ? 'RETRY' : 'PENDING'),
      '',
      isSentDuplicate ? 'Duplicate email/phone within 24h' : (isFailedRetry ? 'Retry after prior GHL failure' : '')
    );
    vaultRange = pendingAppend.updates && pendingAppend.updates.updatedRange
      ? pendingAppend.updates.updatedRange
      : '';
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: 'We could not save your request. Please call 701-714-5879.'
    }, 500, env, request);
  }

  var ghlResult = { ok: false, error: 'GHL not configured' };
  if (isSentDuplicate) {
    ghlResult = { ok: false, error: 'Skipped — duplicate submission within 24h', retryable: false };
  } else if (ghlConfigured(env)) {
    ghlResult = await upsertContact(env, lead);
  }

  var ghlStatus = isSentDuplicate
    ? 'DUPLICATE'
    : (isFailedRetry && !ghlResult.ok ? 'FAILED' : (ghlResult.ok ? 'SENT' : 'FAILED'));
  var ghlContactId = ghlResult.contactId || '';
  var ghlError = ghlResult.error || '';

  if (vaultRange) {
    try {
      await updateLeadVaultRow(env, vaultRange, lead, ghlStatus, ghlContactId, ghlError);
    } catch (err) { /* PENDING row still in sheet */ }
  }

  if (!ghlResult.ok && !isSentDuplicate) {
    try {
      await appendMissedLead(env, lead, ghlError);
    } catch (err) { /* ignore */ }
    try {
      await sendFailureAlert(env, lead, ghlError);
    } catch (err) { /* ignore */ }
  }

  var shouldFireMeta = !isSentDuplicate && !isFailedRetry && ghlResult.ok;
  var metaResult = { sent: false };
  if (shouldFireMeta) {
    try {
      metaResult = await sendLeadEvent(env, request, lead, {
        eventId: body.meta_event_id || body.metaEventId || lead.submissionId,
        fbp: body.fbp || '',
        fbc: body.fbc || ''
      });
    } catch (err) { /* CAPI must not block lead capture */ }
  }

  return jsonResponse({
    ok: true,
    submission_id: lead.submissionId,
    duplicate: !!isSentDuplicate,
    ghl_retry: !!isFailedRetry,
    duplicate_scan: duplicateScan,
    ghl_ok: ghlResult.ok,
    fire_meta: shouldFireMeta,
    ghl_contact_id: ghlContactId || undefined,
    meta_capi: metaResult.sent === true,
    meta_event_id: shouldFireMeta
      ? (metaResult.event_id || body.meta_event_id || lead.submissionId)
      : undefined,
    message: isSentDuplicate
      ? 'We already have your info — unlocking inventory now.'
      : (ghlResult.ok
        ? (isFailedRetry ? 'Thank you — we updated your info and unlocked inventory.' : 'Thank you — unlocking inventory now.')
        : 'Thank you — your info is saved. Our team will follow up shortly.')
  }, 200, env, request);
}
