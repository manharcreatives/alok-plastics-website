import { redirect } from 'next/navigation';
import type { Note } from './collection';
import { now } from './db';

export const PER_PAGE = 25;

/** Query-string page helpers shared by the admin list screens. */
export function pageOf(raw: string | undefined): number {
  return Math.max(1, Number.parseInt(raw ?? '1', 10) || 1);
}

export const pageCount = (total: number): number => Math.max(1, Math.ceil(total / PER_PAGE));

/** Escape %, _ and \ so user input is matched literally inside ILIKE. */
export const likeTerm = (q: string): string => `%${q.replace(/[%_\\]/g, '\\$&')}%`;

export function makeNote(by: string, raw: unknown): Note | null {
  // eslint-disable-next-line no-control-regex
  const text = String(raw ?? '').replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  if (text === '' || text.length > 1000) return null;
  return { at: now(), by, text };
}

/** Redirect back to a screen with a one-line message the page shows once (kind: ok | err). */
export function flash(path: string, kind: 'ok' | 'err', msg: string, hash = ''): never {
  const sep = path.includes('?') ? '&' : '?';
  redirect(`${path}${sep}${kind}=${encodeURIComponent(msg.slice(0, 300))}${hash ? `#${hash}` : ''}`);
}

export const num = (v: unknown): number | null => {
  const s = String(v ?? '').trim();
  return s !== '' && Number.isFinite(Number(s)) ? Number(s) : null;
};

export const rupees = (n: number | null | undefined): string => (n === null || n === undefined ? '-' : `Rs. ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
