import { test, expect } from '@playwright/test';
import {
  DEFAULT_QUERY,
  availabilityOf,
  formatPrice,
  isListable,
  maxOrderQty,
  queryFromParams,
  queryToParams,
  searchCatalog,
  suggest,
  type CatalogQuery,
} from '../src/lib/catalog-search';
import type { Product } from '../src/content/types';

/* Pure logic, no browser. Synthetic catalogue: slugs are not in the build data, so order = array order. */
const mk = (slug: string, name: string, extra: Partial<Product> = {}): Product => ({
  slug: `t-${slug}`, // prefixed so it can never collide with a real build-time slug
  name,
  group: '01',
  machine: 'TODO',
  images: [],
  published: true,
  ...extra,
});

const CATALOG: Product[] = [
  mk('plastic-chair', 'Plastic Chair', { price: 900, material: 'hdpe', group: '02', keywords: ['seat'], featured: true, availability: 'in-stock', stock: 5 }),
  mk('plastic-stool', 'Plastic Stool', { price: 400, material: 'hdpe', group: '02', availability: 'out-of-stock' }),
  mk('steel-chair', 'Steel Chair', { price: 1500, material: 'ss', group: '03', machine: ['water-cooler'] }),
  mk('door-bush', 'Door Bush', { material: 'nylon', sku: 'DB-100', machine: ['display-counter'], summary: 'A sliding bush for plastic channels' }),
  mk('wheel', 'Caster Wheel', { price: 250, brand: 'Rollo', group: '03', machine: ['deep-freezer', 'display-counter'] }),
  mk('gasket', 'Door Gasket', { group: '04', price: 120, stock: 0 }),
  mk('hidden-one', 'Plastic Secret', { status: 'inactive' }),
  mk('draft', 'Plastic Draft', { published: false }),
];
const LISTABLE = CATALOG.filter(isListable);

const Q = (o: Partial<CatalogQuery> = {}): CatalogQuery => ({ ...DEFAULT_QUERY, ...o });
const slugs = (r: { items: Product[] }) => r.items.map(p => p.slug.replace(/^t-/, ''));

test('status filtering: inactive and unpublished are not listable', () => {
  expect(isListable(CATALOG[6])).toBe(false);
  expect(isListable(CATALOG[7])).toBe(false);
  expect(isListable(mk('x', 'X', { status: 'active' }))).toBe(true);
  expect(isListable(mk('y', 'Y', { status: 'archived' }))).toBe(false);
  expect(LISTABLE).toHaveLength(6);
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'secret' })))).toEqual([]);
});

test('ranking: exact name first, both-token matches before one-token matches', () => {
  const r = slugs(searchCatalog(LISTABLE, Q({ q: 'plastic chair' })));
  expect(r[0]).toBe('plastic-chair');
  expect(r.indexOf('steel-chair')).toBeGreaterThan(0);
  expect(r.indexOf('plastic-stool')).toBeGreaterThan(0);
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'door bush' })))[0]).toBe('door-bush');
});

test('ranking: name beats sku beats summary text', () => {
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'plastic' })))[0]).toMatch(/^plastic-/);
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'plastic' }))).at(-1)).toBe('door-bush');
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'db-100' })))[0]).toBe('door-bush');
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'channels' })))).toEqual(['door-bush']);
});

test('typo tolerance and didYouMean', () => {
  const r = searchCatalog(LISTABLE, Q({ q: 'plastc' }));
  expect(slugs(r)).toContain('plastic-chair');
  expect(r.didYouMean).toBe('plastic');
  expect(searchCatalog(LISTABLE, Q({ q: 'plastic' })).didYouMean).toBeNull();
  expect(searchCatalog(LISTABLE, Q({ q: 'zzzzzz' })).total).toBe(0);
});

test('short queries do not return junk', () => {
  expect(searchCatalog(LISTABLE, Q({ q: 'xq' })).total).toBe(0);
  expect(searchCatalog(LISTABLE, Q({ q: 'whel' })).total).toBeGreaterThan(0);
  expect(searchCatalog(LISTABLE, Q({ q: 'dor' })).total).toBe(0); // 3 letters: no typo budget
  expect(searchCatalog(LISTABLE, Q({ q: 'doo' })).total).toBeGreaterThan(0); // but prefixes work
});

test('prefix, case and diacritic insensitive', () => {
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'plas' })))).toContain('plastic-stool');
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'PLÁSTIC  Chair' })))[0]).toBe('plastic-chair');
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'seat' })))[0]).toBe('plastic-chair');
  expect(slugs(searchCatalog(LISTABLE, Q({ q: 'rollo' })))[0]).toBe('wheel');
});

test('filters and facets exclude their own filter', () => {
  expect(searchCatalog(LISTABLE, Q()).total).toBe(6);
  const g = searchCatalog(LISTABLE, Q({ groups: ['02'] }));
  expect(slugs(g).sort()).toEqual(['plastic-chair', 'plastic-stool']);
  // the group facet ignores the group filter, so other groups keep their counts
  expect(g.facets.groups.map(x => [x.id, x.count])).toEqual([['01', 1], ['02', 2], ['03', 2], ['04', 1]]);
  // other facets respect it
  expect(g.facets.materials.find(x => x.id === 'hdpe')?.count).toBe(2);
  expect(g.facets.materials.find(x => x.id === 'ss')?.count).toBe(0);

  const m = searchCatalog(LISTABLE, Q({ machines: ['display-counter'] }));
  expect(slugs(m).sort()).toEqual(['door-bush', 'wheel']);

  const a = searchCatalog(LISTABLE, Q({ availability: ['on-request'] }));
  expect(slugs(a)).not.toContain('plastic-chair');
  expect(slugs(a)).toContain('door-bush');
  expect(availabilityOf(CATALOG[0])).toBe('in-stock');
  expect(availabilityOf(CATALOG[1])).toBe('out-of-stock');
  expect(availabilityOf(CATALOG[5])).toBe('out-of-stock');
  expect(availabilityOf(CATALOG[3])).toBe('on-request');

  const price = searchCatalog(LISTABLE, Q({ priceMin: 200, priceMax: 1000 }));
  expect(slugs(price).sort()).toEqual(['plastic-chair', 'plastic-stool', 'wheel']);
  expect(price.facets.priceRange).toEqual([120, 1500]); // ignores its own filter
});

test('sorts, with unpriced products always last', () => {
  expect(slugs(searchCatalog(LISTABLE, Q({ sort: 'price-asc' })))).toEqual(['gasket', 'wheel', 'plastic-stool', 'plastic-chair', 'steel-chair', 'door-bush']);
  expect(slugs(searchCatalog(LISTABLE, Q({ sort: 'price-desc' })))).toEqual(['steel-chair', 'plastic-chair', 'plastic-stool', 'wheel', 'gasket', 'door-bush']);
  expect(slugs(searchCatalog(LISTABLE, Q({ sort: 'name' })))).toEqual(['wheel', 'door-bush', 'gasket', 'plastic-chair', 'plastic-stool', 'steel-chair'].sort((x, y) => LISTABLE.find(p => p.slug === `t-${x}`)!.name.localeCompare(LISTABLE.find(p => p.slug === `t-${y}`)!.name)));
  expect(slugs(searchCatalog(LISTABLE, Q({ sort: 'featured' })))[0]).toBe('plastic-chair');
  expect(slugs(searchCatalog(LISTABLE, Q({ sort: 'newest' })))[0]).toBe('gasket');
  // relevance with no query falls back to featured
  expect(slugs(searchCatalog(LISTABLE, Q({ sort: 'relevance' })))[0]).toBe('plastic-chair');
});

test('pagination clamps and reports counts', () => {
  const r = searchCatalog(LISTABLE, Q({ pageSize: 4, page: 2 }));
  expect(r.items).toHaveLength(2);
  expect(r.pageCount).toBe(2);
  expect(searchCatalog(LISTABLE, Q({ pageSize: 4, page: 99 })).page).toBe(2);
  const empty = searchCatalog(LISTABLE, Q({ q: 'zzzzzz' }));
  expect(empty.pageCount).toBe(1);
  expect(empty.page).toBe(1);
});

test('params round-trip and junk is ignored', () => {
  const q = Q({ q: 'door', groups: ['01', '04'], materials: ['nylon'], machines: ['deep-freezer'], availability: ['in-stock'], priceMin: 10, priceMax: 500, sort: 'price-asc', page: 3 });
  expect(queryFromParams(queryToParams(q))).toEqual(q);
  expect(queryToParams(DEFAULT_QUERY).toString()).toBe('');
  const junk = queryFromParams(new URLSearchParams('g=99,01&m=wood&mc=x&a=nope&min=abc&max=-4&sort=zzz&page=-7&q=%20%20hi%20'));
  expect(junk).toEqual(Q({ q: 'hi', groups: ['01'] }));
  expect(queryFromParams(new URLSearchParams('page=999999')).page).toBeLessThanOrEqual(1000);
  expect(queryFromParams(new URLSearchParams('min=900&max=100'))).toMatchObject({ priceMin: 100, priceMax: 900 });
});

test('suggest returns typed hrefs; formatting helpers', () => {
  const s = suggest(LISTABLE, 'plast');
  expect(s.length).toBeGreaterThan(0);
  expect(s[0].kind).toBe('product');
  expect(s[0].href).toMatch(/^\/products\/[a-z-]+\/[a-z-]+\/$/);
  expect(suggest(LISTABLE, 'water').some(x => x.kind === 'group')).toBe(true);
  expect(suggest(LISTABLE, 'hdp').some(x => x.kind === 'material')).toBe(true);
  expect(suggest(LISTABLE, '')).toEqual([]);
  expect(formatPrice(1250)).toBe('₹1,250');
  expect(maxOrderQty(CATALOG[0])).toBe(5);
  expect(maxOrderQty(CATALOG[3])).toBeNull();
});
