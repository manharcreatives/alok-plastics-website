import { randomBytes } from 'node:crypto';
import sharp, { type Metadata, type Sharp } from 'sharp';
import { MACHINE_LABELS, MATERIAL_LABELS, productGroups, products as built } from '@/content/products';
import type { Availability, MachineId, MaterialId, Product, ProductStatus } from '@/content/types';
import { putFile } from './files';
import { getProductEdits, type ProductEntry } from './content';

/* Product manager data layer. Built-in catalogue = src/content/products.ts; the owner's edits are stored as
   small overrides (kv "products") that the website overlays at runtime. Only whitelisted keys are ever written. */

export const FIELDS = {
  name: ['Product name', 120, false],
  summary: ['Short summary', 300, true],
  description: ['Long description', 3000, true],
  sku: ['SKU / drawing number', 120, false],
  hsn: ['HSN code', 120, false],
  moq: ['Minimum order quantity', 120, false],
  packing: ['Packing', 120, false],
  fitment: ['Fitment (machines or models it fits)', 300, false],
  seoTitle: ['SEO title', 70, false],
  seoDescription: ['SEO meta description', 170, true],
} as const satisfies Record<string, readonly [string, number, boolean]>;
export type TextKey = keyof typeof FIELDS;

export const AVAILABILITY: Record<Availability, string> = { 'on-request': 'On request', 'in-stock': 'In stock', 'out-of-stock': 'Out of stock' };
export const STATUS: Record<ProductStatus, string> = { active: 'Active', inactive: 'Inactive', archived: 'Archived' };
export { MACHINE_LABELS, MATERIAL_LABELS, productGroups };

export const PRICE_MAX = 9_999_999;
export const STOCK_MAX = 100_000;
export const KEYWORDS_MAX = 20;
export const KEYWORD_LEN = 40;
export const BRAND_MAX = 60;
export const ALT_MAX = 140;
export const MAX_IMAGES = 8;
export const MAX_UPLOAD = 8 * 1024 * 1024;

export type Edit = ProductEntry & {
  images?: { id: string; url: string; alt: string }[];
  updatedAt?: string;
  createdAt?: string;
  custom?: boolean;
  group?: string;
  machines?: string[];
};

export type Row = {
  slug: string;
  base: Product;
  custom: boolean;
  edit: Edit;
  name: string;
  groupId: string | null;
  price: number | null;
  availability: Availability;
  stock: number | null;
  keywords: string[];
  brand: string;
  featured: boolean;
  status: ProductStatus;
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const isSlug = (s: string): boolean => SLUG_RE.test(s);

export function slugify(name: string): string {
  const t = name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return t === '' ? 'product' : t.slice(0, 60);
}

export const commerceDefaults = (b: Product) => ({
  price: b.price ?? null,
  availability: (b.availability ?? 'on-request') as Availability,
  stock: b.stock ?? null,
  keywords: b.keywords ?? [],
  brand: b.brand ?? '',
  featured: Boolean(b.featured),
  status: (b.status ?? 'active') as ProductStatus,
});

export function effective(base: Product, edit: Edit): Row {
  const d = commerceDefaults(base);
  const pick = <K extends keyof typeof d>(k: K): (typeof d)[K] => (k in edit ? (edit[k] as (typeof d)[K]) : d[k]);
  return {
    slug: base.slug, base, custom: Boolean(edit.custom), edit,
    name: typeof edit.name === 'string' && edit.name ? edit.name : base.name,
    groupId: typeof edit.group === 'string' ? edit.group : base.group,
    price: pick('price'), availability: pick('availability'), stock: pick('stock'),
    keywords: pick('keywords'), brand: pick('brand'), featured: pick('featured'), status: pick('status'),
  };
}

/** Built-in catalogue plus products the owner created in the panel, each with effective values. */
export async function catalogueRows(): Promise<Row[]> {
  const edits = (await getProductEdits()) as Record<string, Edit>;
  const rows: Row[] = built.filter((p) => p.published).map((p) => effective(p, edits[p.slug] ?? {}));
  const known = new Set(rows.map((r) => r.slug));
  for (const [slug, e] of Object.entries(edits)) {
    if (known.has(slug) || !e.custom || !isSlug(slug)) continue;
    const base: Product = { slug, name: String(e.name ?? slug), group: (e.group as Product['group']) ?? null, machine: [], images: [], published: true, custom: true };
    rows.push(effective(base, e));
  }
  return rows;
}

export async function getRow(slug: string): Promise<Row | null> {
  return (await catalogueRows()).find((r) => r.slug === slug) ?? null;
}

export const isEdited = (e: Edit): boolean =>
  Object.keys(FIELDS).some((k) => (e[k] ?? '') !== '') ||
  ['price', 'availability', 'stock', 'keywords', 'brand', 'featured', 'status', 'group', 'machines', 'custom', 'material'].some((k) => k in e) ||
  (e.images?.length ?? 0) > 0;

/* ── Parsing / validation ───────────────────────────────────────────────── */

export function parsePrice(raw: string): [number | null, string | null] {
  const v = raw.replace(/[,\s₹]/g, '');
  if (v === '') return [null, null];
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(v) || Number(v) > PRICE_MAX) return [null, `Price must be a number from 0 to ${PRICE_MAX.toLocaleString('en-IN')} (rupees, up to 2 decimals).`];
  return [Math.round(Number(v) * 100) / 100, null];
}

export function parseStock(raw: string): [number | null, string | null] {
  const v = raw.trim();
  if (v === '') return [null, null];
  if (!/^\d{1,6}$/.test(v) || Number(v) > STOCK_MAX) return [null, `Stock must be a whole number from 0 to ${STOCK_MAX.toLocaleString('en-IN')}.`];
  return [Number(v), null];
}

export function parseKeywords(raw: string): [string[], string | null] {
  const out: string[] = [];
  for (const part of raw.split(/[,;\n\r]+/)) {
    // eslint-disable-next-line no-control-regex
    const kw = part.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (kw === '') continue;
    if (kw.length > KEYWORD_LEN) return [[], `Each keyword can be at most ${KEYWORD_LEN} characters ("${kw.slice(0, 20)}..." is ${kw.length}).`];
    if (!out.includes(kw)) out.push(kw);
  }
  if (out.length > KEYWORDS_MAX) return [[], `Use at most ${KEYWORDS_MAX} keywords (now ${out.length}).`];
  return [out, null];
}

type Commerce = { price: number | null; stock: number | null; availability: Availability; status: ProductStatus; keywords: string[]; brand: string; featured: boolean };

export function validateCommerce(get: (k: string) => string, only?: string[]): { values: Partial<Commerce>; errors: Record<string, string> } {
  const want = (k: string): boolean => !only || only.includes(k);
  const values: Partial<Commerce> = {};
  const errors: Record<string, string> = {};
  if (want('price')) { const [v, m] = parsePrice(get('price')); values.price = v; if (m) errors.price = m; }
  if (want('stock')) { const [v, m] = parseStock(get('stock')); values.stock = v; if (m) errors.stock = m; }
  if (want('availability')) { const a = get('availability'); if (a in AVAILABILITY) values.availability = a as Availability; else errors.availability = 'Choose In stock, Out of stock or On request.'; }
  if (want('status')) { const a = get('status'); if (a in STATUS) values.status = a as ProductStatus; else errors.status = 'Choose Active, Inactive or Archived.'; }
  if (want('keywords')) { const [v, m] = parseKeywords(get('keywords')); values.keywords = v; if (m) errors.keywords = m; }
  if (want('brand')) {
    // eslint-disable-next-line no-control-regex
    const b = get('brand').replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
    if (b.length > BRAND_MAX) errors.brand = `Brand can be at most ${BRAND_MAX} characters (now ${b.length}).`;
    values.brand = b;
  }
  if (want('featured')) values.featured = get('featured') !== '';
  return { values, errors };
}

/** Keep only what differs from the built-in default so an unedited product stays out of products.json. */
export function storeCommerce(entry: Edit, values: Partial<Commerce>, def: ReturnType<typeof commerceDefaults>): Edit {
  const out: Edit = { ...entry };
  for (const k of ['price', 'availability', 'stock', 'keywords', 'brand', 'featured', 'status'] as const) {
    if (!(k in values)) continue;
    const val = values[k];
    const same = k === 'price' || k === 'stock'
      ? val === null || (def[k] !== null && Number(val) === Number(def[k]))
      : JSON.stringify(val) === JSON.stringify(def[k]);
    if (same) delete out[k]; else (out as Record<string, unknown>)[k] = val;
  }
  return out;
}

export function validateText(get: (k: string) => string, def: Partial<Record<TextKey, string>>): { clean: Partial<Record<TextKey, string>>; errors: Record<string, string> } {
  const clean: Partial<Record<TextKey, string>> = {};
  const errors: Record<string, string> = {};
  for (const [k, [label, max, multi]] of Object.entries(FIELDS) as [TextKey, readonly [string, number, boolean]][]) {
    let v = get(k).replace(/\r\n?/g, '\n');
    // eslint-disable-next-line no-control-regex
    v = v.replace(multi ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g : /[\x00-\x1F\x7F]/g, '').trim();
    if (!multi) v = v.replace(/\s+/g, ' ');
    if (v.length > max) errors[k] = `${label} can be at most ${max} characters (now ${v.length}).`;
    if (v !== '' && v !== (def[k] ?? '')) clean[k] = v;
  }
  return { clean, errors };
}

export const cleanAlt = (v: unknown): string => String(v ?? '').replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim(); // eslint-disable-line no-control-regex

/* ── Images ─────────────────────────────────────────────────────────────── */

/** Validate, auto-rotate, shrink to 2400 px and re-encode (metadata stripped). Returns the stored id or an error. */
export async function storeUpload(file: File): Promise<{ id: string } | { error: string }> {
  const label = (file.name || 'image').replace(/[^\p{L}\p{N}._ -]/gu, '').slice(0, 40) || 'image';
  if (file.size > MAX_UPLOAD) return { error: `${label}: the file is larger than 8 MB.` };
  let img: Sharp;
  let meta: Metadata;
  const input = Buffer.from(await file.arrayBuffer());
  try {
    img = sharp(input, { limitInputPixels: 40_000_000 }).rotate();
    meta = await img.metadata();
  } catch {
    return { error: `${label}: the file could not be read as an image.` };
  }
  if (!['jpeg', 'png', 'webp'].includes(meta.format ?? '')) return { error: `${label}: only JPEG, PNG or WebP images are accepted.` };
  const resized = img.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true });
  let data: Buffer;
  let mime: string;
  if (meta.format === 'png') { data = await resized.png({ compressionLevel: 6 }).toBuffer(); mime = 'image/png'; }
  else if (meta.format === 'webp') { data = await resized.webp({ quality: 85 }).toBuffer(); mime = 'image/webp'; }
  else { data = await resized.flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toBuffer(); mime = 'image/jpeg'; }
  const id = randomBytes(8).toString('hex');
  await putFile(id, 'product', label, mime, data);
  return { id };
}

export const imageUrl = (id: string): string => `/api/media.php?id=${id}`;

export type { MachineId, MaterialId };
