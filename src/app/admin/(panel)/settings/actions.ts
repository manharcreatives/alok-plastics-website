'use server';

import { audit, hashPassword, requireAdmin, verifyAdminPassword } from '@/server/admin-auth';
import { flash } from '@/server/admin-util';
import { HOURS_KEYS, savePublic } from '@/server/content';
import { query } from '@/server/db';

const txt = (form: FormData, k: string, max: number): string =>
  // eslint-disable-next-line no-control-regex
  String(form.get(k) ?? '').replace(/<[^>]*>/g, '').replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

const url = (v: string): string | null => {
  if (v === '') return '';
  const s = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try { return new URL(s).href; } catch { return null; }
};

export async function saveSettings(form: FormData): Promise<void> {
  const user = await requireAdmin();
  const errors: string[] = [];
  const link = (k: string, label: string): string => {
    const v = url(txt(form, k, 300));
    if (v === null) { errors.push(`${label} is not a valid link.`); return ''; }
    return v;
  };
  const email = txt(form, 'email', 120);
  if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Enter a valid email address.');
  const time = (k: string): string => {
    const v = txt(form, k, 5);
    if (v !== '' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) errors.push('Opening hours must look like 09:30.');
    return v;
  };
  const hours = Object.fromEntries(HOURS_KEYS.map((d) => [d, { closed: form.get(`${d}_closed`) === 'on', open: time(`${d}_open`), close: time(`${d}_close`) }]));
  const settings = {
    contact: {
      phone: txt(form, 'phone', 40) || null,
      whatsapp: txt(form, 'whatsapp', 40) || null,
      email: email || null,
      mapsUrl: link('mapsUrl', 'Maps link') || null,
      gstin: txt(form, 'gstin', 20).toUpperCase() || null,
    },
    social: {
      instagram: link('instagram', 'Instagram link') || null,
      linkedin: link('linkedin', 'LinkedIn link') || null,
      facebook: link('facebook', 'Facebook link') || null,
      youtube: link('youtube', 'YouTube link') || null,
    },
    replyTime: txt(form, 'replyTime', 120) || null,
    hours,
    hoursNote: txt(form, 'hoursNote', 200) || null,
    banner: { enabled: form.get('banner_on') === 'on', text: txt(form, 'banner_text', 200), href: link('banner_href', 'Banner link') || null },
  };
  if (settings.banner.enabled && settings.banner.text === '') errors.push('Add the banner text, or switch the banner off.');
  if (errors.length > 0) flash('/admin/settings/', 'err', [...new Set(errors)].join(' '));
  await savePublic('settings', settings);
  await audit(user.username, 'settings_edit', 'settings', 'site contact, hours and banner');
  flash('/admin/settings/', 'ok', 'Saved. The website picks it up on the next page load.');
}

export async function changePassword(form: FormData): Promise<void> {
  const user = await requireAdmin();
  const current = String(form.get('current') ?? '');
  const next = String(form.get('next') ?? '');
  const again = String(form.get('again') ?? '');
  if (!(await verifyAdminPassword(user.username, current))) flash('/admin/settings/', 'err', 'Your current password is not right.', 'password');
  if (next.length < 10) flash('/admin/settings/', 'err', 'The new password must be at least 10 characters.', 'password');
  if (next !== again) flash('/admin/settings/', 'err', 'The two new passwords do not match.', 'password');
  await query('update admin_users set hash = $2 where username = $1', [user.username, hashPassword(next)]);
  await query('delete from admin_sessions where username = $1 and token_hash <> $2', [user.username, await currentTokenHash()]);
  await audit(user.username, 'password_change');
  flash('/admin/settings/', 'ok', 'Password changed. Other devices were signed out.', 'password');
}

async function currentTokenHash(): Promise<string> {
  const { cookies } = await import('next/headers');
  const { createHash } = await import('node:crypto');
  const t = (await cookies()).get('alok_admin')?.value ?? '';
  return createHash('sha256').update(t).digest('hex');
}
