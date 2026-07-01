export async function sendFailureAlert(env, lead, ghlError) {
  var to = env.ALERT_EMAIL;
  if (!to) return { sent: false, reason: 'ALERT_EMAIL not configured' };

  var subject = '[Paradise Spas] Lead saved — GHL failed — ACTION NEEDED';
  var body = [
    'A website lead was saved to the Lead Vault Google Sheet but did NOT reach GoHighLevel.',
    '',
    'Submission ID: ' + lead.submissionId,
    'Name: ' + lead.fullName,
    'Email: ' + lead.email,
    'Phone: ' + lead.phone,
    'Source: ' + lead.source,
    'Fair attendance: ' + (lead.fairAttendance || 'n/a'),
    'Page: ' + (lead.pageUrl || 'n/a'),
    '',
    'GHL error:',
    ghlError,
    '',
    'Open the Google Sheet tab "Missed Leads" and re-import this contact into GHL manually.',
    'See dashboard/LEAD_INSURANCE_OWNER_SETUP.md'
  ].join('\n');

  if (env.RESEND_API_KEY) {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.ALERT_FROM || 'Paradise Spas <leads@paradisespas.com>',
        to: [to],
        subject: subject,
        text: body
      })
    });
    return { sent: res.ok, status: res.status };
  }

  var mailRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'leads@paradisespas.com', name: 'Paradise Spas Lead Vault' },
      subject: subject,
      content: [{ type: 'text/plain', value: body }]
    })
  });
  return { sent: mailRes.ok, status: mailRes.status, provider: 'mailchannels' };
}
