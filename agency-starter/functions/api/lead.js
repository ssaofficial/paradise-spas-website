import { corsHeaders, jsonResponse } from '../lib/cors.js';
import { validateLeadPayload, verifyTurnstile } from '../lib/validate.js';
import { appendLeadVault, appendMissedLead, sheetsConfigured, updateLeadVaultRow } from '../lib/sheets.js';
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
      error: 'Lead capture is not configured yet. Please call us directly.'
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

  var vaultRange = '';
  try {
    var pendingAppend = await appendLeadVault(env, lead, 'PENDING', '', '');
    vaultRange = pendingAppend.updates && pendingAppend.updates.updatedRange
      ? pendingAppend.updates.updatedRange
      : '';
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: 'We could not save your request. Please try again or call us.'
    }, 500, env, request);
  }

  var ghlResult = { ok: false, error: 'GHL not configured' };
  if (ghlConfigured(env)) {
    ghlResult = await upsertContact(env, lead);
  }

  var ghlStatus = ghlResult.ok ? 'SENT' : 'FAILED';
  var ghlContactId = ghlResult.contactId || '';
  var ghlError = ghlResult.error || '';

  if (vaultRange) {
    try {
      await updateLeadVaultRow(env, vaultRange, lead, ghlStatus, ghlContactId, ghlError);
    } catch (err) { /* PENDING row still in sheet */ }
  }

  if (!ghlResult.ok) {
    try {
      await appendMissedLead(env, lead, ghlError);
    } catch (err) { /* ignore */ }
    try {
      await sendFailureAlert(env, lead, ghlError);
    } catch (err) { /* ignore */ }
  }

  var metaResult = { sent: false };
  try {
    metaResult = await sendLeadEvent(env, request, lead, {
      eventId: body.meta_event_id || body.metaEventId || lead.submissionId,
      fbp: body.fbp || '',
      fbc: body.fbc || ''
    });
  } catch (err) { /* CAPI must not block lead capture */ }

  return jsonResponse({
    ok: true,
    submission_id: lead.submissionId,
    ghl_ok: ghlResult.ok,
    ghl_contact_id: ghlContactId || undefined,
    meta_capi: metaResult.sent === true,
    meta_event_id: metaResult.event_id || body.meta_event_id || lead.submissionId,
    message: ghlResult.ok
      ? 'Thank you — we received your request.'
      : 'Thank you — your info is saved. Our team will follow up shortly.'
  }, 200, env, request);
}
