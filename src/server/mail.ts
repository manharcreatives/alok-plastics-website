/* Notifications. Preferred path: the Google Apps Script web app (SCRIPT_URL + SCRIPT_SECRET) which sends the email through
   Gmail, adds a row to a Google Sheet and, for career applications, saves the resume in Google Drive.
   Fallback: Resend (RESEND_API_KEY, MAIL_TO, MAIL_FROM). With neither configured nothing is emailed; everything is still
   saved in the database and shown in /admin. */

export type NotifyType = 'enquiry' | 'order' | 'career';

export type Notify = {
  subject: string;
  text: string;
  replyTo?: string;
  /** Which Sheet tab the row goes to (Apps Script only). */
  type?: NotifyType;
  /** Values for the Sheet row, after the timestamp (Apps Script only). */
  row?: (string | number)[];
  /** A resume to store in Drive (Apps Script only). */
  resume?: { name: string; mime: string; data: Buffer };
};

export type NotifyResult = { ok: boolean; resumeLink?: string };

async function viaScript(o: Notify): Promise<NotifyResult> {
  const url = process.env.SCRIPT_URL;
  const secret = process.env.SCRIPT_SECRET;
  if (!url || !secret) return { ok: false };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      signal: AbortSignal.timeout(o.resume ? 45_000 : 15_000),
      body: JSON.stringify({
        secret, type: o.type ?? 'enquiry', subject: o.subject.replace(/[\r\n]+/g, ' '), text: o.text, replyTo: o.replyTo ?? '', row: o.row ?? [],
        ...(o.resume ? { resumeName: o.resume.name, resumeMime: o.resume.mime, resumeBase64: o.resume.data.toString('base64') } : {}),
      }),
    });
    const j = (await res.json().catch(() => null)) as { success?: boolean; resumeLink?: string; error?: string } | null;
    if (!j?.success) console.error('[alok-script]', j?.error ?? res.status);
    return { ok: Boolean(j?.success), resumeLink: j?.resumeLink || undefined };
  } catch (e) {
    console.error('[alok-script]', e);
    return { ok: false };
  }
}

async function viaResend(o: Notify): Promise<boolean> {
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
        subject: o.subject.replace(/[\r\n]+/g, ' '),
        text: o.text,
        ...(o.replyTo ? { reply_to: o.replyTo } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notify(o: Notify): Promise<NotifyResult> {
  if (process.env.SCRIPT_URL && process.env.SCRIPT_SECRET) {
    const r = await viaScript(o);
    if (r.ok) return r;
  }
  return { ok: await viaResend(o) };
}

/** Email only (plus the Sheet row when `type`/`row` are given). Returns whether anything accepted it. */
export async function sendMail(o: Notify): Promise<boolean> {
  return (await notify(o)).ok;
}
