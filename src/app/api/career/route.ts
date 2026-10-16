import { randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { clean, clientIp, phone91, rateLimit, respond, sameSite } from '@/server/http';
import { applications } from '@/server/collection';
import { putFile } from '@/server/files';
import { sendMail } from '@/server/mail';

/* Career application: details + resume (PDF / DOC / DOCX up to 3 MB, or a LinkedIn link). */

const RESUME_MAX = 3 * 1024 * 1024;
const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function safeUrl(v: string): string {
  let s = v.trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    return new URL(s).href.length <= 400 ? new URL(s).href : '';
  } catch {
    return '';
  }
}

/** Magic-byte check so a renamed file cannot pass as a resume. */
function looksLike(ext: string, head: Buffer): boolean {
  if (ext === 'pdf') return head.subarray(0, 4).toString('latin1') === '%PDF';
  if (ext === 'docx') return head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
  if (ext === 'doc') return head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0;
  return false;
}

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return respond(403, { ok: false, error: 'Forbidden.' });
  try {
    const form = await req.formData();
    const get = (k: string): string => {
      const v = form.get(k);
      return typeof v === 'string' ? v : '';
    };
    if (get('_honey')) return respond(200, { ok: true });
    const ip = clientIp(req);
    if (!(await rateLimit(`career:${ip}`, 5, 3600))) return respond(429, { ok: false, error: 'Too many submissions. Please try again later.' });

    const name = clean(get('name'), 80);
    const phone = phone91(clean(get('phone'), 30));
    const email = clean(get('email'), 120);
    const position = clean(get('position'), 120);
    const message = clean(get('message'), 2000, true);
    const rawLink = get('resumeUrl');
    const link = safeUrl(rawLink);

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = 'Enter your full name.';
    if (phone === null) errors.phone = 'Enter a valid 10-digit mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (position === '') errors.position = 'Select the position you are applying for.';
    if (rawLink.trim() !== '' && link === '') errors.resumeUrl = 'Enter a valid link.';

    let stored: { id: string; original: string; size: number; ext: string; data: Buffer } | null = null;
    const file = form.get('resume');
    if (file instanceof File && file.size > 0) {
      const ext = (file.name.split('.').pop() ?? '').toLowerCase();
      const data = Buffer.from(await file.arrayBuffer());
      if (data.length > RESUME_MAX) errors.resume = 'The resume must be under 3 MB.';
      else if (!(ext in MIME)) errors.resume = 'The resume must be a PDF, DOC or DOCX file.';
      else if (!looksLike(ext, data)) errors.resume = `That file does not look like a valid ${ext.toUpperCase()}.`;
      else stored = { id: `${randomBytes(12).toString('hex')}.${ext}`, original: clean(file.name, 120), size: data.length, ext, data };
    }
    if (!errors.resume && !errors.resumeUrl && !stored && link === '') errors.resume = 'Attach your resume or share a link to it.';
    if (Object.keys(errors).length > 0 || phone === null) return respond(422, { ok: false, errors });

    if (stored) await putFile(stored.id, 'resume', stored.original, MIME[stored.ext]!, stored.data);
    const app = await applications().insert({
      name, phone: `+${phone}`, email, position,
      resume_link: link, resume_file: stored?.id ?? '', resume_name: stored?.original ?? '', resume_size: stored?.size ?? 0,
      message, status: 'new', notes: [], ip,
    });
    const body =
      `New career application received via the Alok Plastics website.\n\nName:      ${name}\nPhone:     +${phone}\nEmail:     ${email}\nPosition:  ${position}\n` +
      (link ? `Resume link: ${link}\n` : '') +
      (stored ? `Resume file: ${stored.original} (kept in the admin panel under Applications)\n` : '') +
      (message ? `\nMessage:\n${message}\n` : '') +
      `\nSubmitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })} IST\n`;
    const mailed = await sendMail({ subject: `Career application: ${name} — ${position}`, text: body, replyTo: email });
    await applications().update(app.id, { mail_ok: mailed ? 1 : 0 });
    return respond(200, { ok: true, message: 'Thank you. Your application has been received.' });
  } catch (e) {
    console.error('[alok-career]', e);
    return respond(500, { ok: false, error: 'We could not submit your application. Please try again.' });
  }
}
