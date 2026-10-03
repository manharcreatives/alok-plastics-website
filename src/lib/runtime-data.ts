/**
 * Fetch layer for the public JSON that /admin/ writes (docs/admin-panel.md §"Public JSON contract").
 *
 * One request per file, once per page load, cached in module scope — components must
 * never each hit `/data/*.json`. The panel serves these with `Cache-Control: no-cache`,
 * so a reload always shows the owner's latest save; the cache here is per page load,
 * not per session.
 *
 * Every failure mode returns null rather than throwing: a 404 before the owner has ever
 * saved, a static host answering 200 with an HTML shell, a truncated file, an offline
 * phone. The caller's job is to keep the build-time value in that case, which is why
 * nothing here throws and nothing here invents a default.
 */

import { z } from 'zod';
import {
  careersSchema,
  productOverridesSchema,
  productsSchema,
  type RuntimeProducts,
  settingsSchema,
  type RuntimeCareers,
  type RuntimeProductOverrides,
  type RuntimeSettings,
  parseRuntime,
} from './runtime-schema';

/** Fetch one runtime file and validate it. Returns null for anything unusable. */
async function loadRuntimeFile<S extends z.ZodType>(
  file: string,
  schema: S,
): Promise<z.output<S> | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/data/${file}.json`, { cache: 'no-cache' });
    /* A static host may answer 200 with an HTML shell — only JSON counts. */
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null;
    return parseRuntime(schema, await res.json());
  } catch {
    return null;
  }
}

/** Validated `settings.json` — contact, social, reply time, hours, banner. */
export function fetchRuntimeSettings(): Promise<RuntimeSettings | null> {
  return loadRuntimeFile('settings', settingsSchema);
}

/** Validated `careers.json` — the open roles the owner published. */
export function fetchRuntimeCareers(): Promise<RuntimeCareers | null> {
  return loadRuntimeFile('careers', careersSchema);
}

/** Validated `product-overrides.json` — the product slugs the owner hid. */
export function fetchRuntimeProductOverrides(): Promise<RuntimeProductOverrides | null> {
  return loadRuntimeFile('product-overrides', productOverridesSchema);
}

/** Validated `products.json` — per-product text and image overrides. */
export function fetchRuntimeProducts(): Promise<RuntimeProducts | null> {
  return loadRuntimeFile('products', productsSchema);
}

/** The validated result of every file the panel owns. A file that failed is null. */
export interface RuntimeData {
  settings: RuntimeSettings | null;
  careers: RuntimeCareers | null;
  'product-overrides': RuntimeProductOverrides | null;
  products: RuntimeProducts | null;
}

/** Nothing loaded yet — the same state the build-time content already describes. */
export const EMPTY_RUNTIME: RuntimeData = {
  settings: null,
  careers: null,
  'product-overrides': null,
  products: null,
};

let cache: Promise<RuntimeData> | null = null;

/**
 * All four files in one round of requests, cached for the life of the page.
 *
 * Resolves even when every file fails; the result is then indistinguishable from "the
 * owner has not saved anything yet", which is exactly what the build-time content says.
 */
export function fetchRuntimeData(): Promise<RuntimeData> {
  if (!cache) {
    cache = Promise.all([
      fetchRuntimeSettings(),
      fetchRuntimeCareers(),
      fetchRuntimeProductOverrides(),
      fetchRuntimeProducts(),
    ]).then(([settings, careers, productOverrides, products]) => ({
      settings,
      careers,
      'product-overrides': productOverrides,
      products,
    }));
  }
  return cache;
}

/**
 * Digits-only WhatsApp number from a runtime string, or null if it doesn't look like one.
 * `wa.me` needs the country code and nothing else, so that is the only accepted form.
 */
export function cleanWhatsapp(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const d = v.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 15 ? d : null;
}
