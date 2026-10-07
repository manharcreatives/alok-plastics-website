/**
 * Shapes for the public JSON that /admin/ writes into `public/data/`.
 *
 * These files are user-editable through a web form, so they are untrusted input:
 * every field is validated again here before a component is allowed to render it
 * (docs/admin-panel.md §"Public JSON contract", rule 2). Two deliberate choices:
 *
 *   1. Scalars use `.catch(null)` rather than failing the file. One junk GSTIN must
 *      not cost the visitor their phone number and email, which is most of the point
 *      of the panel. A structural failure (wrong schemaVersion, `roles` not an array)
 *      still rejects the whole file — there is nothing sensible to render from half
 *      a product list.
 *   2. Nothing here is rendered as HTML. `description` and `hoursNote` are plain text
 *      and must reach the DOM as text nodes (docs/admin-panel.md:45).
 *
 * Mirrors the writers in `public/admin/lib/content.php` — change one, change both.
 */

import { z } from 'zod';

/** The files the panel owns today. Wave 1 adds `products`, Wave 2 adds `career-content`. */
export const RUNTIME_FILES = ['settings', 'careers', 'product-overrides', 'products'] as const;

export type RuntimeFile = (typeof RUNTIME_FILES)[number];

/**
 * A trimmed non-empty string, or null.
 *
 * Anything that is not a string — a number, an object, an array — becomes null rather
 * than failing the file, because the panel is a web form and this is the last line
 * of defence before a string reaches the DOM.
 */
const text = z
  .union([z.string(), z.null()])
  .catch(null)
  .transform(v => {
    const trimmed = (v ?? '').trim();
    return trimmed === '' ? null : trimmed;
  });

const schemaVersion = z.literal(1);

/* ── settings.json ──────────────────────────────────────────────────────── */

export const HOURS_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type HoursKey = (typeof HOURS_KEYS)[number];

export type HoursDay = { closed: boolean; open: string; close: string };

const EMPTY_DAY: HoursDay = { closed: false, open: '', close: '' };

const hoursDay = z
  .object({
    closed: z.boolean().catch(EMPTY_DAY.closed),
    open: z.string().catch(EMPTY_DAY.open),
    close: z.string().catch(EMPTY_DAY.close),
  })
  .catch(EMPTY_DAY);

/** Every day is always present, so consumers never branch on whether a key exists. */
const EMPTY_HOURS = Object.fromEntries(
  HOURS_KEYS.map(k => [k, EMPTY_DAY]),
) as Record<HoursKey, HoursDay>;

const hoursShape = Object.fromEntries(
  HOURS_KEYS.map(k => [k, hoursDay]),
) as Record<HoursKey, typeof hoursDay>;

export const settingsSchema = z.object({
  schemaVersion,
  updatedAt: z.string().catch(''),
  contact: z
    .object({
      phone: text,
      whatsapp: text,
      email: text,
      mapsUrl: text,
      gstin: text,
    })
    .catch({ phone: null, whatsapp: null, email: null, mapsUrl: null, gstin: null }),
  social: z
    .object({
      instagram: text,
      linkedin: text,
      facebook: text,
      youtube: text,
    })
    .catch({ instagram: null, linkedin: null, facebook: null, youtube: null }),
  replyTime: text,
  hours: z.object(hoursShape).catch(EMPTY_HOURS),
  hoursNote: text,
  banner: z
    .object({
      enabled: z.boolean().catch(false),
      text: z.string().catch(''),
      href: text,
    })
    .catch({ enabled: false, text: '', href: null }),
});

export type RuntimeSettings = z.output<typeof settingsSchema>;

/* ── careers.json ───────────────────────────────────────────────────────── */

/**
 * Mirrors ALOK_TEAMS in content.php. An unknown team id is kept rather than dropped:
 * a role the owner added should still be visible even if this file has not caught up.
 */
const roleSchema = z.object({
  id: z.string().min(1).catch('role'),
  title: z.string().catch(''),
  team: z.string().catch(''),
  type: z.string().catch(''),
  location: z.string().catch(''),
  description: z.string().catch(''),
  active: z.boolean().catch(true),
});

export const careersSchema = z.object({
  schemaVersion,
  updatedAt: z.string().catch(''),
  roles: z.array(roleSchema).max(200).catch([]),
});

export type RuntimeRole = z.output<typeof roleSchema>;
export type RuntimeCareers = z.output<typeof careersSchema>;

/* ── product-overrides.json ─────────────────────────────────────────────── */

/** The same slug rule the panel enforces on write (AlokContent::hiddenProducts). */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const slug = z.string().regex(SLUG_RE);

export const productOverridesSchema = z.object({
  schemaVersion,
  updatedAt: z.string().catch(''),
  hidden: z.array(slug).max(500).catch([]),
});

export type RuntimeProductOverrides = z.output<typeof productOverridesSchema>;

/* ── products.json ──────────────────────────────────────────────────────── */

const MATERIAL_IDS = ['nylon', 'hdpe', 'ppcp', 'brass', 'ss', 'cast-iron'] as const;

/** Trimmed, length-capped plain text, or null. Over-long values are dropped, not truncated. */
const capped = (max: number) =>
  z
    .union([z.string(), z.null()])
    .catch(null)
    .transform(v => {
      const t = (v ?? '').trim();
      return t === '' || t.length > max ? null : t;
    });

const GROUP_IDS = ['01', '02', '03', '04', '05'] as const;
const MACHINE_IDS = ['water-cooler', 'display-counter', 'deep-freezer', 'gas-stove', 'commercial-kitchen'] as const;

const machineList = z
  .array(z.unknown())
  .max(10)
  .catch([])
  .transform(list => {
    const out: (typeof MACHINE_IDS)[number][] = [];
    for (const m of list) {
      const id = MACHINE_IDS.find(x => x === m);
      if (id && !out.includes(id)) out.push(id);
    }
    return out;
  });

const AVAILABILITY_IDS = ['in-stock', 'out-of-stock', 'on-request'] as const;
const STATUS_IDS = ['active', 'inactive', 'archived'] as const;

/** A finite number inside [0, max], or null. Strings are not coerced: the panel writes real numbers. */
const boundedNumber = (max: number, integer = false) =>
  z
    .union([z.number(), z.null()])
    .catch(null)
    .transform(v => (v === null || !Number.isFinite(v) || v < 0 || v > max || (integer && !Number.isInteger(v)) ? null : v));

/** Up to 20 trimmed keywords of at most 40 chars; anything else in the array is skipped. */
const keywordList = z
  .array(z.unknown())
  .max(50)
  .catch([])
  .transform(list => {
    const out: string[] = [];
    for (const k of list) {
      if (typeof k !== 'string') continue;
      const t = k.trim();
      if (t !== '' && t.length <= 40 && !out.includes(t)) out.push(t);
      if (out.length >= 20) break;
    }
    return out;
  });

const MEDIA_PREFIX = '/api/media.php?id=';
const mediaId = z.string().regex(/^[a-z0-9_-]{1,64}$/);

/** One gallery image. Only same-origin media served by the panel is ever accepted. */
const productImage = z
  .object({
    id: mediaId,
    url: z.string().max(120),
    alt: z.string().catch('').transform(v => v.trim().slice(0, 200)),
  })
  .refine(i => i.url === `${MEDIA_PREFIX}${i.id}`);

export type RuntimeProductImage = z.output<typeof productImage>;

const productOverride = z.object({
  name: capped(160),
  summary: capped(400),
  description: capped(4000),
  material: z.enum(MATERIAL_IDS).nullable().catch(null),
  sku: capped(80),
  hsn: capped(80),
  moq: capped(80),
  packing: capped(120),
  seoTitle: capped(120),
  seoDescription: capped(320),
  fitment: capped(300),
  group: z.enum(GROUP_IDS).nullable().catch(null),
  machines: machineList,
  custom: z.boolean().catch(false),
  price: boundedNumber(9_999_999),
  availability: z.enum(AVAILABILITY_IDS).nullable().catch(null),
  stock: boundedNumber(100_000, true),
  keywords: keywordList,
  brand: capped(60),
  featured: z.boolean().nullable().catch(null),
  status: z.enum(STATUS_IDS).nullable().catch(null),
  images: z
    .array(z.unknown())
    .max(24)
    .catch([])
    .transform(list =>
      list.flatMap(i => {
        const r = productImage.safeParse(i);
        return r.success ? [r.data] : [];
      }),
    ),
});

export type RuntimeProductOverride = z.output<typeof productOverride>;

/**
 * slug → override, as a Map so a slug like "constructor" can never hit the prototype.
 * A bad slug or an unparseable entry is skipped; the rest of the file still applies.
 */
export const productsSchema = z.object({
  schemaVersion,
  updatedAt: z.string().catch(''),
  products: z
    .record(z.string(), z.unknown())
    .catch({})
    .transform(rec => {
      const out = new Map<string, RuntimeProductOverride>();
      for (const [k, v] of Object.entries(rec)) {
        if (!SLUG_RE.test(k)) continue;
        const r = productOverride.safeParse(v);
        if (r.success) out.set(k, r.data);
      }
      return out;
    }),
});

export type RuntimeProducts = z.output<typeof productsSchema>;

/* ── parse helper ───────────────────────────────────────────────────────── */

/**
 * Validate one parsed file. Returns null for anything unusable so the caller can fall
 * back to the build-time value — a broken file must never be able to blank out content
 * that is already in the HTML.
 */
export function parseRuntime<S extends z.ZodType>(schema: S, json: unknown): z.output<S> | null {
  const result = schema.safeParse(json);
  return result.success ? result.data : null;
}
