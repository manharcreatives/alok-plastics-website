import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { query, now } from './db';

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'",
};

export function respond(status: number, data: Record<string, unknown>): NextResponse {
  return NextResponse.json(data, { status, headers: SECURITY_HEADERS });
}

/** Same-site check: the browser's Origin (or Referer) host must be this site's host, or localhost in dev. */
export function sameSite(req: NextRequest): boolean {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const src = req.headers.get('origin') ?? req.headers.get('referer') ?? '';
  if (!src) return false;
  try {
    const u = new URL(src);
    return u.host === host || u.hostname === 'localhost';
  } catch {
    return false;
  }
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  return fwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
}

export const ipHash = (ip: string): string => createHash('sha256').update(ip || 'unknown').digest('hex');

/** Strip tags and control characters; collapse whitespace unless multiline. Output is plain text. */
export function clean(v: unknown, max = 200, multiline = false): string {
  let s = String(v ?? '').replace(/<[^>]*>/g, '');
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (!multiline) s = s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
}

/** Indian mobile -> "91XXXXXXXXXX", or null. */
export function phone91(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? `91${d}` : null;
}

/** Sliding-window limiter stored in Postgres. Returns false when the caller is over the limit. */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const t = now();
  await query('delete from rate_limits where hit_at < $1', [t - 86400]);
  const rows = await query<{ n: string }>('select count(*) as n from rate_limits where key = $1 and hit_at > $2', [key, t - windowSec]);
  if (Number(rows[0]?.n ?? 0) >= max) return false;
  await query('insert into rate_limits (key, hit_at) values ($1, $2)', [key, t]);
  return true;
}

/** Request body as a flat object. The site's forms post multipart / urlencoded FormData; the cart and auth calls post JSON. */
export async function readBody(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const type = req.headers.get('content-type') ?? '';
    if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of (await req.formData()).entries()) if (typeof v === 'string' && !(k in out)) out[k] = v;
      return out;
    }
    const j: unknown = await req.json();
    return j && typeof j === 'object' && !Array.isArray(j) ? (j as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
