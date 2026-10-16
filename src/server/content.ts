import { randomBytes } from 'node:crypto';
import { kvGet, kvSet } from './kv';

/* Public JSON the admin publishes (served by /data/<name>.json). Same shapes as src/lib/runtime-schema.ts. */

export const HOURS_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const TEAMS: Record<string, string> = {
  'product-development': 'Product Development',
  sales: 'Sales',
  'social-media-marketing': 'Social Media & Marketing',
  'tech-developers': 'Tech Developers',
};
export const ROLE_TYPES: Record<string, string> = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', internship: 'Internship' };

export type Role = { id: string; title: string; team: string; type: string; location: string; description: string; active: boolean; createdAt?: string; updatedAt?: string };

const stamp = (): string => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

/** Save one of the public JSON documents, stamping the schema version and update time. */
export async function savePublic(name: string, data: Record<string, unknown>): Promise<void> {
  await kvSet(name, { schemaVersion: 1, updatedAt: stamp(), ...data });
}

export async function getRoles(): Promise<Role[]> {
  const j = await kvGet<{ roles?: Role[] }>('careers');
  return Array.isArray(j?.roles) ? j.roles : [];
}

export const saveRoles = (roles: Role[]): Promise<void> => savePublic('careers', { roles });

const text = (v: unknown, max: number): string =>
  // eslint-disable-next-line no-control-regex
  String(v ?? '').replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, max + 1);

export function validateRole(form: FormData): { role: Omit<Role, 'id'>; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = text(form.get('title'), 80);
  const team = String(form.get('team') ?? '');
  const type = String(form.get('type') ?? '');
  const location = text(form.get('location'), 80);
  const description = text(form.get('description'), 2000);
  if (title.length < 3 || title.length > 80) errors.title = 'Role title is required (3-80 characters).';
  if (!(team in TEAMS)) errors.team = 'Choose a team.';
  if (!(type in ROLE_TYPES)) errors.type = 'Choose an employment type.';
  if (location === '' || location.length > 80) errors.location = 'Location is required (up to 80 characters).';
  if (description.length > 2000) errors.description = 'Keep the description under 2000 characters.';
  return { role: { title, team, type, location, description: description.slice(0, 2000), active: form.get('active') === 'on' }, errors };
}

export function newRoleId(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return `${slug || 'role'}-${randomBytes(2).toString('hex')}`;
}

/* ── Product visibility + edits ─────────────────────────────────────────── */

export type ProductEntry = Record<string, unknown>;

export async function getHidden(): Promise<string[]> {
  const j = await kvGet<{ hidden?: unknown[] }>('product-overrides');
  return (Array.isArray(j?.hidden) ? j.hidden : []).filter((s): s is string => typeof s === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s));
}

export async function saveHidden(slugs: string[]): Promise<void> {
  await savePublic('product-overrides', { hidden: [...new Set(slugs)].sort() });
}

export async function getProductEdits(): Promise<Record<string, ProductEntry>> {
  const j = await kvGet<{ products?: Record<string, ProductEntry> }>('products');
  return j?.products && typeof j.products === 'object' ? j.products : {};
}

export async function saveProductEdits(products: Record<string, ProductEntry>): Promise<void> {
  const sorted = Object.fromEntries(Object.entries(products).sort(([a], [b]) => a.localeCompare(b)));
  await savePublic('products', { products: sorted });
}
