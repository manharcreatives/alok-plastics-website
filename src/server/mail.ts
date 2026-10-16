/** Transactional email through Resend's HTTP API (no SDK). Returns false when not configured or on failure. */
export async function sendMail(opts: { subject: string; text: string; replyTo?: string; cc?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.MAIL_TO;
  const from = process.env.MAIL_FROM;
  if (!key || !to || !from) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: opts.subject.replace(/[\r\n]+/g, ' '),
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        ...(opts.cc ? { cc: [opts.cc] } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
