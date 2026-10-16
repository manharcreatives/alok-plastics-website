import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { query, now } from './db';

/* Admin sign-in. Passwords: scrypt. Sessions: random token in an httpOnly cookie, stored as a sha256 hash in Neon.
   Idle timeout 30 min, hard limit 12 h, 5 failed sign-ins per IP / username lock for 15 min. */

export const COOKIE = 'alok_admin';
const IDLE = 30 * 60;
const MAX_AGE = 12 * 3600;
const MAX_FAILS = 5;
const LOCK_WINDOW = 15 * 60;

export type AdminUser = { username: string; name: string };

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

export async function verifyAdminPassword(username: string, password: string): Promise<boolean> {
  const r = (await query<{ hash: string }>('select hash from admin_users where username = $1', [username]))[0];
  return r ? verifyPassword(password, r.hash) : false;
}

export async function requestIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || h.get('x-real-ip') || '';
}

async function recentFails(key: string): Promise<number> {
  const rows = await query<{ n: string }>('select count(*) as n from rate_limits where key = $1 and hit_at > $2', [key, now() - LOCK_WINDOW]);
  return Number(rows[0]?.n ?? 0);
}

export async function audit(actor: string, action: string, target = '', detail = ''): Promise<void> {
  try {
    await query('insert into audit_log (at, actor, action, target, detail, ip) values ($1,$2,$3,$4,$5,$6)', [now(), actor, action, target, detail, await requestIp()]);
  } catch (e) {
    console.error('[alok-admin] audit failed', e);
  }
}

/** Returns an error message, or null after setting the session cookie. */
export async function signIn(usernameRaw: string, password: string): Promise<string | null> {
  const username = usernameRaw.trim().toLowerCase().slice(0, 60);
  const ip = await requestIp();
  const ipKey = `login-fail:ip:${sha(ip)}`;
  const userKey = `login-fail:user:${username}`;
  if ((await recentFails(ipKey)) >= MAX_FAILS || (await recentFails(userKey)) >= MAX_FAILS) {
    return 'Too many failed attempts. Try again in 15 minutes.';
  }
  const rows = await query<{ username: string; name: string; hash: string }>('select username, name, hash from admin_users where username = $1', [username]);
  const user = rows[0];
  // Hash a dummy when the user is unknown so timing does not reveal which usernames exist.
  const ok = user ? verifyPassword(password, user.hash) : (verifyPassword(password, 'scrypt$00$00'), false);
  if (!user || !ok) {
    const t = now();
    await query('insert into rate_limits (key, hit_at) values ($1,$3), ($2,$3)', [ipKey, userKey, t]);
    await audit(username, 'login_failed');
    return 'Wrong username or password.';
  }
  const token = randomBytes(32).toString('hex');
  const t = now();
  await query('delete from admin_sessions where last_seen < $1 or created_at < $2', [t - IDLE, t - MAX_AGE]);
  await query('insert into admin_sessions (token_hash, username, created_at, last_seen) values ($1,$2,$3,$3)', [sha(token), user.username, t]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: MAX_AGE,
  });
  await audit(user.username, 'login');
  return null;
}

/** Current admin, or null. Refreshes the idle timer. */
export async function currentAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const t = now();
  const rows = await query<{ username: string; name: string }>(
    `update admin_sessions s set last_seen = $2
       from admin_users u
      where s.token_hash = $1 and u.username = s.username and s.last_seen > $3 and s.created_at > $4
      returning u.username, u.name`,
    [sha(token), t, t - IDLE, t - MAX_AGE],
  );
  return rows[0] ?? null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) redirect('/admin/login/');
  return user;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await query('delete from admin_sessions where token_hash = $1', [sha(token)]);
  jar.delete({ name: COOKIE, path: '/admin' });
}
