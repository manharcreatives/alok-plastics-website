'use client';

/**
 * Narrow read hooks over the runtime bundle, plus the merge rules that apply the
 * panel's values to the build-time ones.
 *
 * The merge rule is one line and everything else follows from it (D3):
 *
 *   A runtime value replaces a build-time value only when it is a non-empty string.
 *   Null, empty, whitespace, or a file that never arrived — the build-time value stays.
 *
 * The panel ships nothing pre-filled (docs/admin-panel.md:18) and the site must stay
 * complete until the owner fills it in, so "the panel is empty" and "the panel wrote
 * nothing useful" have to be indistinguishable to a visitor. There is no code path
 * that removes content.
 */

import { useMemo } from 'react';
import { site } from '@/content/site';
import { publishedProducts } from '@/content/products';
import { isListable } from '@/lib/catalog-search';
import type { CareerRole, ContactInfo, Product, SiteConfig } from '@/content/types';
import { useRuntime } from './RuntimeProvider';
import type { RuntimeProductOverride, RuntimeProducts, RuntimeRole, RuntimeSettings } from '@/lib/runtime-schema';

/* ── merge helpers ──────────────────────────────────────────────────────── */

/** The only place a runtime value is allowed to win. */
function pick(runtime: string | null | undefined, build: string | null): string | null {
  return runtime ? runtime : build;
}

/**
 * Contact details with the panel's values laid over the build-time ones.
 *
 * Address, city, state, pincode, country and geo stay build-time: they are in the
 * JSON-LD, the sitemap and the printed footer, and a half-entered address from a web
 * form is worse than the address that is already correct.
 */
export function useRuntimeContact(): ContactInfo {
  const { settings } = useRuntime();
  const r = settings?.contact;

  return useMemo(() => ({
    ...site.contact,
    phone: pick(r?.phone, site.contact.phone),
    whatsapp: pick(r?.whatsapp, site.contact.whatsapp),
    email: pick(r?.email, site.contact.email),
    mapsUrl: pick(r?.mapsUrl, site.contact.mapsUrl),
    gstin: pick(r?.gstin, site.contact.gstin),
  }), [r?.phone, r?.whatsapp, r?.email, r?.mapsUrl, r?.gstin]);
}

/** Social links with the panel's values laid over the build-time ones. */
export function useRuntimeSocial(): SiteConfig['social'] {
  const { settings } = useRuntime();
  const r = settings?.social;

  return useMemo(() => ({
    instagram: pick(r?.instagram, site.social.instagram),
    linkedin: pick(r?.linkedin, site.social.linkedin),
    facebook: pick(r?.facebook, site.social.facebook),
    youtube: pick(r?.youtube, site.social.youtube),
  }), [r?.instagram, r?.linkedin, r?.facebook, r?.youtube]);
}

/** The whole validated settings file, or null. For components that need more than contact. */
export function useRuntimeSettings(): RuntimeSettings | null {
  return useRuntime().settings;
}

/* ── careers ────────────────────────────────────────────────────────────── */

const ROLE_TYPES: Record<string, CareerRole['type']> = {
  'full-time': 'full-time',
  'part-time': 'part-time',
  contract: 'contract',
  internship: 'internship',
};

/**
 * Open roles from the panel, mapped onto the shape the careers page already renders.
 *
 * Empty means "no open roles" — which is also what the build-time config says today,
 * so the page keeps its existing empty state until the owner adds a role. `active:false`
 * is the owner's "hide this one" switch and is filtered out here rather than at the
 * call site, so no screen can accidentally show a paused role.
 */
export function useRuntimeRoles(): CareerRole[] {
  const { careers } = useRuntime();

  return useMemo(() => (careers?.roles ?? [])
    .filter((r: RuntimeRole) => r.active && r.title.trim() !== '')
    .map((r, i) => ({
      id: r.id || `role-${i}`,
      title: r.title.trim(),
      team: r.team.trim(),
      location: r.location.trim(),
      type: ROLE_TYPES[r.type] ?? 'full-time',
      published: true,
      description: r.description.trim(),
    })) as (CareerRole & { description: string })[],
  [careers]);
}

/* ── products ───────────────────────────────────────────────────────────── */

/**
 * Slugs the owner has hidden. Empty set means nothing is hidden, which is also the
 * build-time state, so callers need no special case.
 */
export function useHiddenProductSlugs(): ReadonlySet<string> {
  const { 'product-overrides': overrides, products } = useRuntime();
  return useMemo(() => {
    const out = new Set(overrides?.hidden ?? []);
    /* Inactive and archived products are off the public lists exactly like hidden ones. */
    products?.products.forEach((o, slug) => {
      if (o.status === 'inactive' || o.status === 'archived') out.add(slug);
    });
    return out;
  }, [overrides, products]);
}

/**
 * Product edits from `products.json`. Same rule as everywhere: a non-empty runtime value
 * replaces the build-time one, anything else leaves it alone. Images are replaced as a
 * list (the owner's order and alt text), and only when at least one valid image exists.
 * Runtime images have no known pixel size, so w/h are 0 and renderers omit the attributes.
 */
export function applyProductOverride(p: Product, o: RuntimeProductOverride | undefined | null): Product {
  if (!o) return p;
  return {
    ...p,
    name: o.name ?? p.name,
    summary: o.summary ?? p.summary,
    description: o.description ?? p.description,
    material: o.material ?? p.material,
    sku: o.sku ?? p.sku,
    hsn: o.hsn ?? p.hsn,
    moq: o.moq ?? p.moq,
    packing: o.packing ?? p.packing,
    price: o.price ?? p.price,
    availability: o.availability ?? p.availability,
    stock: o.stock ?? p.stock,
    keywords: o.keywords.length > 0 ? o.keywords : p.keywords,
    brand: o.brand ?? p.brand,
    fitment: o.fitment ?? p.fitment,
    group: o.group ?? p.group,
    machine: o.machines.length > 0 ? o.machines : p.machine,
    featured: o.featured ?? p.featured,
    status: o.status ?? p.status,
    images: o.images.length > 0
      ? o.images.map(i => ({ src: i.url, alt: i.alt || o.name || p.name, w: 0, h: 0 }))
      : p.images,
  };
}

/** Products created in the admin panel (they have no static page), built from products.json. */
export function customProductsFrom(map: RuntimeProducts['products'] | null): Product[] {
  const out: Product[] = [];
  map?.forEach((o, slug) => {
    if (!o.custom || !o.name || !o.group) return;
    out.push(applyProductOverride({ slug, name: o.name, group: o.group, machine: 'TODO', images: [], published: true, custom: true }, o));
  });
  return out;
}

export function useRuntimeCustomProducts(): Product[] {
  const map = useRuntimeProductMap();
  return useMemo(() => customProductsFrom(map), [map]);
}

/** The raw override for one slug, or undefined. */
export function useProductOverride(slug: string): RuntimeProductOverride | undefined {
  return useRuntime().products?.products.get(slug);
}

/** A product with the owner's edits applied. Returns the same object when there are none. */
export function useRuntimeProduct(p: Product): Product {
  const o = useProductOverride(p.slug);
  return useMemo(() => applyProductOverride(p, o), [p, o]);
}

/** The whole override map (null until the file arrives), for lists that merge many products. */
export function useRuntimeProductMap(): RuntimeProducts['products'] | null {
  return useRuntime().products?.products ?? null;
}

/** Merge edits onto a list of products. Same array back when nothing is edited. */
export function useRuntimeProducts(list: Product[]): Product[] {
  const map = useRuntimeProductMap();
  return useMemo(
    () => (map && map.size > 0 ? list.map(p => applyProductOverride(p, map.get(p.slug))) : list),
    [list, map],
  );
}

/**
 * The public catalogue: build-time published products with the owner's edits applied,
 * minus anything inactive/archived or on the hidden list. Build-time order is kept, so
 * the list is stable between renders and between visitors.
 */
export function useCatalogProducts(): Product[] {
  const merged = useRuntimeProducts(publishedProducts);
  const customs = useRuntimeCustomProducts();
  const hidden = useHiddenProductSlugs();
  return useMemo(
    () => [...merged, ...customs].filter(p => p.group !== null && isListable(p) && !hidden.has(p.slug)),
    [merged, customs, hidden],
  );
}

/** One group's parts: the static list until products.json arrives, then the live catalogue (moves, additions, removals). */
export function useGroupProducts(groupId: string, items: Product[]): Product[] {
  const { products } = useRuntime();
  const catalog = useCatalogProducts();
  return useMemo(
    () => (products && products.products.size > 0 ? catalog.filter(p => p.group === groupId) : items),
    [products, catalog, groupId, items],
  );
}

/* ── announcement banner ────────────────────────────────────────────────── */

/** The banner, or null when it is switched off or has no text. Never renders a stub. */
export function useRuntimeBanner(): { text: string; href: string | null } | null {
  const { settings } = useRuntime();
  const banner = settings?.banner;

  return useMemo(() => {
    const text = banner?.text.trim() ?? '';
    if (!banner?.enabled || !text) return null;
    return { text, href: banner.href || null };
  }, [banner?.enabled, banner?.text, banner?.href]);
}

/* ── opening hours ──────────────────────────────────────────────────────── */

const DAY_LABELS: [keyof NonNullable<RuntimeSettings['hours']>, string][] = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

export interface HoursRow {
  /** 'Monday – Friday' for a run of identical days, 'Saturday' for a single one. */
  label: string;
  /** '9:00 am – 6:00 pm', or 'Closed'. */
  value: string;
}

export interface RuntimeHours {
  rows: HoursRow[];
  note: string | null;
}

/** '09:00' → '9:00 am'. A 24-hour clock reads like a machine wrote it. */
function formatClock(hhmm: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2];
  if (h > 23) return null;
  const suffix = h < 12 ? 'am' : 'pm';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${min} ${suffix}`;
}

/**
 * Opening hours from the panel, grouped the way a visitor reads them.
 *
 * Consecutive days with identical hours collapse into one row, because "Monday to
 * Friday, 9:00 am to 6:00 pm" is an answer and seven separate rows is a data dump.
 * A day the owner has not filled in is left out entirely rather than shown as
 * "Closed" — we do not know that it is closed (docs/admin-panel.md:51).
 *
 * Returns null when there is nothing to show, so the contact page keeps its own
 * wording instead of rendering an empty schedule.
 */
export function useRuntimeHours(): RuntimeHours | null {
  const { settings } = useRuntime();
  const hours = settings?.hours;
  const note = settings?.hoursNote?.trim() || null;

  return useMemo(() => {
    if (!hours) return note ? { rows: [], note } : null;

    const rows: HoursRow[] = [];
    let runStart = -1;
    let runLabel = '';

    const flush = (end: number) => {
      if (runStart === -1) return;
      rows.push({
        label: runStart === end ? DAY_LABELS[runStart][1] : `${DAY_LABELS[runStart][1]} – ${DAY_LABELS[end][1]}`,
        value: runLabel,
      });
      runStart = -1;
      runLabel = '';
    };

    DAY_LABELS.forEach(([key], i) => {
      const day = hours[key];
      if (!day) return;

      let value: string | null = null;
      if (day.closed) {
        value = 'Closed';
      } else if (day.open && day.close) {
        const from = formatClock(day.open);
        const to = formatClock(day.close);
        /* An owner who typed closing before opening gets nothing rather than a lie. */
        if (from && to && day.open < day.close) value = `${from} – ${to}`;
      }
      if (!value) return;

      if (value === runLabel) return; // same hours, extend the run
      flush(i - 1);
      runStart = i;
      runLabel = value;
    });
    flush(DAY_LABELS.length - 1);

    return rows.length > 0 || note ? { rows, note } : null;
  }, [hours, note]);
}
