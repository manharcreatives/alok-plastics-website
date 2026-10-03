/**
 * Central SEO / GEO helpers (§18).
 *
 * Every value comes from src/content/*.ts. Fields that are null/undefined there
 * (phone, email, geo, social profiles, images, SKU) are OMITTED — never faked.
 * Deliberately absent: aggregateRating, review, offers/prices, awards, certifications.
 */
import type { Product, ProductGroup } from '@/content/types';
import { site } from '@/content/site';
import { MATERIAL_LABELS, productPath, productGroups } from '@/content/products';

type Json = Record<string, unknown>;

export const SITE_URL = site.domain.replace(/\/+$/, '');
export const LOGO_PATH = '/brand/alok-logo-primary.png';
export const OG_IMAGE_PATH = '/og-image.png';

/** Prefix a site path with the production origin. Absolute URLs pass through. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const HOME_TITLE = 'Alok Plastics, Chandigarh | Plastic Spare Parts Manufacturer for Coolers & Freezers';
export const HOME_DESCRIPTION =
  'Chandigarh manufacturer since 1998. Moulded plastic & steel spare parts for water coolers, display counters & deep freezers: float valves, F-bushes, gaskets, nylon & HDPE. OEM & B2B wholesale enquiries welcome.';

const ctx = { '@context': 'https://schema.org' } as const;

const ID = {
  org: `${SITE_URL}/#organization`,
  local: `${SITE_URL}/#localbusiness`,
  website: `${SITE_URL}/#website`,
} as const;

function postalAddress(): Json {
  const c = site.contact;
  return {
    '@type': 'PostalAddress',
    streetAddress: c.address,
    addressLocality: c.city,
    addressRegion: c.state,
    postalCode: c.pincode,
    addressCountry: 'IN',
  };
}

function sameAs(): string[] {
  return Object.values(site.social).filter((v): v is string => typeof v === 'string' && v.length > 0);
}

function contactPoint(): Json | null {
  const { phone, email } = site.contact;
  if (!phone && !email) return null;
  return {
    '@type': 'ContactPoint',
    contactType: 'sales',
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
  };
}

/** Plain-sentence entity statement (§18 GEO) — reused on home meta + llms.txt. */
export const ENTITY_STATEMENT =
  `${site.name} is a ${site.contact.city}-based plastic parts manufacturer, established in ${site.foundingYear}, ` +
  'of moulded plastic and steel spare parts for water coolers, display counters and deep freezers, ' +
  'including float valves, F-bushes, connecting bushes, ventilation jalli, door locks, gaskets and push cocks in nylon, HDPE, PPCP and brass.';

export function organizationJsonLd(): Json {
  const sa = sameAs();
  const cp = contactPoint();
  return {
    ...ctx,
    '@type': 'Organization',
    '@id': ID.org,
    name: site.name,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absoluteUrl(LOGO_PATH) },
    image: absoluteUrl(OG_IMAGE_PATH),
    description: ENTITY_STATEMENT,
    slogan: site.tagline.english,
    foundingDate: String(site.foundingYear),
    address: postalAddress(),
    // Roles exactly as stated by the client; `employee` (not `founder`) until confirmed.
    employee: site.owners.map(o => ({ '@type': 'Person', name: o.name, jobTitle: o.title })),
    knowsAbout: [
      ...productGroups.map(g => g.name),
      'Float Valve', 'F-Bush', 'Connecting Bush', 'Ventilation Jalli',
      'Adjustable Leg Insert', 'Waste Pipe', 'Door Lock', 'Hinge', 'Gasket', 'Push Cock',
      'Nylon Parts', 'HDPE Parts', 'PPCP Parts', 'Brass Parts',
      'Water Cooler Spare Parts', 'Deep Freezer Spare Parts', 'Display Counter Parts',
      'OEM Plastic Parts', 'Moulded Plastic Components', 'B2B Spare Parts Supplier India',
    ],
    ...(cp ? { contactPoint: cp } : {}),
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
    ...(sa.length ? { sameAs: sa } : {}),
  };
}

export function localBusinessJsonLd(): Json {
  const c = site.contact;
  const sa = sameAs();
  return {
    ...ctx,
    '@type': 'LocalBusiness',
    '@id': ID.local,
    name: site.name,
    url: SITE_URL,
    description: ENTITY_STATEMENT,
    image: absoluteUrl(LOGO_PATH),
    address: postalAddress(),
    parentOrganization: { '@id': ID.org },
    areaServed: { '@type': 'Country', name: 'India' }, // client: "Pan Bharat delivery network"
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(c.mapsUrl ? { hasMap: c.mapsUrl } : {}),
    ...(c.geo ? { geo: { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng } } : {}),
    ...(sa.length ? { sameAs: sa } : {}),
    // openingHours / priceRange intentionally omitted until the client supplies them.
  };
}

/** WebSite entity. No SearchAction: /products/ does not read a ?q= parameter yet. */
export function websiteJsonLd(): Json {
  return {
    ...ctx,
    '@type': 'WebSite',
    '@id': ID.website,
    name: site.name,
    url: SITE_URL,
    inLanguage: 'en-IN',
    publisher: { '@id': ID.org },
  };
}

export type CrumbInput = { label: string; href?: string };

/** `items` = trail AFTER Home; last item is the current page (name only, per Google guidance). */
export function breadcrumbJsonLd(items: CrumbInput[]): Json {
  const trail: CrumbInput[] = [{ label: 'Home', href: '/' }, ...items];
  return {
    ...ctx,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
}

/** Product schema: no offers, ratings or reviews at build time (offers are added at runtime only when the owner sets a price). Unknown fields omitted. */
export function productJsonLd(p: Product, g: ProductGroup): Json {
  const images = p.images.map(i => absoluteUrl(i.src));
  return {
    ...ctx,
    '@type': 'Product',
    name: p.name,
    ...(p.summary ? { description: p.summary } : {}),
    ...(p.material ? { material: MATERIAL_LABELS[p.material] } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(images.length ? { image: images } : {}),
    category: g.name,
    url: absoluteUrl(productPath(p)),
    brand: { '@type': 'Brand', name: site.name },
    manufacturer: { '@id': ID.org },
  };
}

export type FaqItem = { q: string; a: string };

export function faqJsonLd(items: FaqItem[]): Json {
  return {
    ...ctx,
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

/** Collapse whitespace and cut at a word boundary with an ellipsis. */
export function clip(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1).trimEnd() + '…';
}

/**
 * Meta description: `base` + optional `suffix`, ≤ max chars. If both do not fit, drop the suffix and
 * keep whole sentences of `base`; only as a last resort cut at a word boundary.
 */
export function describe(base: string, suffix: string, max = 155): string {
  const b = base.replace(/\s+/g, ' ').trim();
  const full = suffix ? `${b} ${suffix}` : b;
  if (full.length <= max) return full;
  const sentences = b.match(/[^.!?]+[.!?]+(?:\s|$)/g)?.map(x => x.trim()) ?? [];
  let out = '';
  for (const sent of sentences) {
    const next = out ? `${out} ${sent}` : sent;
    if (next.length > max) break;
    out = next;
  }
  return out.length >= 60 ? out : clip(b, max);
}

/** Title for a part page: longest candidate that fits 60 chars with no template suffix. */
export function partTitle(p: Product, g: ProductGroup): string {
  const mat = p.material ? ` ${MATERIAL_LABELS[p.material]}` : '';
  const candidates = [
    `${p.name}${mat} Manufacturer | Alok Plastics, Chandigarh`,
    `${p.name} | ${g.name} | Alok Plastics, Chandigarh`,
    `${p.name} | ${g.name} | Alok Plastics`,
    `${p.name} Spare Part | Alok Plastics, Chandigarh`,
    `${p.name} Spare Part | Alok Plastics`,
  ];
  return candidates.find(c => c.length <= 60) ?? candidates[candidates.length - 1];
}

/**
 * schema.org Offer for a product. Only call this when the owner has set a price (runtime
 * products.json); build-time Product JSON-LD never carries an offer. On-request availability
 * is left out rather than guessed.
 */
export function productOffer(opts: {
  price: number;
  url: string;
  availability?: 'in-stock' | 'out-of-stock' | 'on-request';
  discontinued?: boolean;
}): Json {
  const avail = opts.discontinued
    ? 'https://schema.org/Discontinued'
    : opts.availability === 'in-stock'
      ? 'https://schema.org/InStock'
      : opts.availability === 'out-of-stock'
        ? 'https://schema.org/OutOfStock'
        : null;
  return {
    '@type': 'Offer',
    price: opts.price.toFixed(2),
    priceCurrency: 'INR',
    url: opts.url,
    ...(avail ? { availability: avail } : {}),
    seller: { '@id': ID.org },
  };
}
