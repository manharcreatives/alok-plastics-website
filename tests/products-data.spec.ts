import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MACHINE_LABELS,
  MATERIAL_LABELS,
  productGroups,
  productPhoto,
  products,
  productsByGroup,
  publishedProducts,
} from '../src/content/products';
import { extraPictos, isExtraPicto } from '../src/components/products/art/extraPictos';

/* Pure data checks on the catalogue (no browser). */

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const manifest = JSON.parse(readFileSync(join(__dirname, '..', 'docs', 'images', 'manifest.products.json'), 'utf8')) as {
  slot: string; path: string; aspect: string; size: string; prompt: string; sourceRef: string; alt: string;
}[];

test('slugs are unique and URL-safe, every published product sits in one of the five groups', () => {
  const slugs = products.map(p => p.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  const groupIds = new Set<string>(productGroups.map(g => g.id));
  expect(productGroups.map(g => g.id)).toEqual(['01', '02', '03', '04', '05']);
  for (const p of products) {
    expect(p.slug, p.slug).toMatch(SLUG_RE);
    expect(p.name.length, p.slug).toBeLessThanOrEqual(120); // enquiry schema limit
    if (p.published) expect(groupIds.has(p.group as string), `${p.slug} group`).toBe(true);
  }
});

test('commercial kitchen group is populated; groups 04 and 05 stay empty until the client supplies products', () => {
  expect(productsByGroup('03').length).toBeGreaterThanOrEqual(20);
  expect(productsByGroup('04')).toHaveLength(0);
  expect(productsByGroup('05')).toHaveLength(0);
  const g03 = productGroups.find(g => g.id === '03')!;
  for (const s of g03.anchorParts) expect(productsByGroup('03').some(p => p.slug === s), `anchor ${s}`).toBe(true);
});

test('material and machine ids all have labels; variant prices are real numbers', () => {
  for (const p of products) {
    if (p.material) expect(MATERIAL_LABELS[p.material], `${p.slug} material`).toBeTruthy();
    if (Array.isArray(p.machine)) for (const m of p.machine) expect(MACHINE_LABELS[m], `${p.slug} machine`).toBeTruthy();
    for (const v of p.variants ?? []) {
      expect(v.label.trim(), p.slug).not.toBe('');
      if (v.price !== undefined) expect(Number.isFinite(v.price) && v.price > 0, `${p.slug} ${v.label}`).toBe(true);
    }
    if (p.catalogPrice) expect(p.catalogPrice.amount).toBeGreaterThan(0);
  }
});

test('no build-time product shows the old catalogue crops, and every published product has a pictogram placeholder', () => {
  for (const p of products) expect(p.images, p.slug).toEqual([]);
  for (const p of publishedProducts) expect(isExtraPicto(p.slug) || ['f-bush', 'connecting-bush', 'door-lock', 'hinge', 'float-valve', 'push-cock', 'waste-pipe', 'ventilation-jalli', 'adjustable-leg-insert', 'gasket'].includes(p.slug), `${p.slug} pictogram`).toBe(true);
  for (const e of Object.values(extraPictos)) expect(e.box[2] > 0 && e.box[3] > 0).toBe(true);
});

test('photo convention and image manifest: one 1:1 1200x1200 entry per product', () => {
  expect(productPhoto({ slug: 'f-bush' })).toBe('/images/products/f-bush.webp');
  expect(productPhoto({ slug: 'x', custom: true })).toBeNull();
  expect(manifest.map(m => m.path).sort()).toEqual(products.map(p => `/images/products/${p.slug}.webp`).sort());
  for (const m of manifest) {
    expect(m.aspect).toBe('1:1');
    expect(m.size).toBe('1200x1200');
    expect(m.sourceRef.length).toBeGreaterThan(5);
    expect(m.prompt).toMatch(/No text, no logos, no brand names, no watermark/);
  }
});
