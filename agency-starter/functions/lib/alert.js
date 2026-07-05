export async function sendFailureAlert(env, lead, ghlError) {
  var to = env.ALERT_EMAIL;
  if (!to) return { sent: false, reason: 'ALERT_EMAIL not configured' };

  var client = env.CLIENT_NAME || 'Website';
  var subject = '[' + client + '] Lead saved — GHL failed — ACTION NEEDED';
  var body = [
    'A website lead was saved to the Lead Vault Google Sheet but did NOT reach GoHighLevel.',
    '',
    'Submission ID: ' + lead.submissionId,
    'Name: ' + lead.fullName,
    'Email: ' + lead.email,
    'Phone: ' + lead.phone,
    'Source: ' + lead.source,
    'Message: ' + (lead.message || 'n/a'),
    'Page: ' + (lead.pageUrl || 'n/a'),
    '',
    'GHL error:',
    ghlError,
    '',
    'Open the Google Sheet tab "Missed Leads" and re-import this contact into GHL manually.'
  ].join('\n');

  if (env.RESEND_API_KEY) {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.ALERT_FROM || ('Leads <leads@' + (env.ALLOWED_ORIGIN || 'example.com').replace(/^https?:\/\//, '') + '>'),
        to: [to],
        subject: subject,
        text: body
      })
    });
    return { sent: res.ok, status: res.status };
  }

  return { sent: false, reason: 'RESEND_API_KEY not configured' };
}
