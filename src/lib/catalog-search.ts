/**
 * Catalogue search, filter, sort, facet and URL-state logic (pure, client-safe, no React).
 *
 * Callers pass products that are already override-merged and status-filtered
 * (see useCatalogProducts). Nothing here invents a price, stock level or machine fit:
 * a product without a price sorts last and never matches a price filter.
 */
import {
  MACHINE_LABELS,
  MATERIAL_LABELS,
  getGroup,
  knownMachines,
  productGroups,
  productPath,
  products as buildProducts,
} from '@/content/products';
import type { Availability, MachineId, MaterialId, Product } from '@/content/types';

export type { Availability };
export type SortKey = 'relevance' | 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';

export interface CatalogQuery {
  q: string;
  groups: string[];
  materials: string[];
  machines: string[];
  availability: Availability[];
  priceMin?: number;
  priceMax?: number;
  sort: SortKey;
  page: number;
  pageSize: number;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  facets: {
    groups: { id: string; name: string; count: number }[];
    materials: { id: string; label: string; count: number }[];
    machines: { id: string; label: string; count: number }[];
    availability: { id: Availability; count: number }[];
    priceRange: [number, number] | null;
  };
  didYouMean: string | null;
}

export const DEFAULT_PAGE_SIZE = 24;

export const DEFAULT_QUERY: CatalogQuery = {
  q: '',
  groups: [],
  materials: [],
  machines: [],
  availability: [],
  sort: 'relevance',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const AVAILABILITIES: Availability[] = ['in-stock', 'out-of-stock', 'on-request'];
const SORT_KEYS: SortKey[] = ['relevance', 'featured', 'newest', 'price-asc', 'price-desc', 'name'];
const MAX_PRICE = 9_999_999;
const MAX_PAGE = 1000;

/* ── product helpers ────────────────────────────────────────────────────── */

/** Published and not inactive/archived. Caller still removes the hidden list. */
export function isListable(p: Product): boolean {
  return p.published && (p.status === undefined || p.status === 'active');
}

/**
 * Explicit admin availability wins, except that a stock of 0 always means out of stock.
 * With no availability and no stock number there is nothing to claim: "On request".
 */
export function availabilityOf(p: Product): Availability {
  if (typeof p.stock === 'number' && p.stock <= 0) return 'out-of-stock';
  if (p.availability) return p.availability;
  if (typeof p.stock === 'number') return 'in-stock';
  return 'on-request';
}

/** The most that can be ordered, or null when no limit is known. */
export function maxOrderQty(p: Product): number | null {
  return typeof p.stock === 'number' && p.stock >= 0 ? p.stock : null;
}

/** "₹1,250" (Indian grouping, paise only when present). */
export function formatPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

const hasPrice = (p: Product): p is Product & { price: number } =>
  typeof p.price === 'number' && Number.isFinite(p.price);

/* ── text normalisation + matching ──────────────────────────────────────── */

/** Lower-case, diacritics stripped, everything non-alphanumeric becomes a space. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const STOP = new Set(['for', 'the', 'and', 'of', 'a', 'an', 'in', 'to', 'with']);

function tokenize(q: string): string[] {
  const all = normalize(q).split(' ').filter(Boolean);
  const content = all.filter(t => !STOP.has(t));
  return content.length > 0 ? content : all;
}

/** Optimal-string-alignment distance (insert, delete, substitute, transpose), capped. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[n];
}

/** Typo budget by token length. Short tokens get none, so "fan" never turns into "fin". */
function typoBudget(len: number): number {
  if (len < 4) return 0;
  return len >= 8 ? 2 : 1;
}

const M_EXACT = 1;
const M_PREFIX = 0.75;
const M_SUBSTR = 0.45;
const M_FUZZY = 0.4;

/** How well one query token matches a list of words: 0 for no match, else a factor <= 1. */
function matchWords(token: string, words: string[], fuzzy: boolean): number {
  let best = 0;
  const budget = fuzzy ? typoBudget(token.length) : 0;
  for (const w of words) {
    if (w === token) return M_EXACT;
    if (best < M_PREFIX && w.startsWith(token)) best = M_PREFIX;
    else if (best < M_SUBSTR && token.length >= 3 && w.includes(token)) best = M_SUBSTR;
    else if (best < M_FUZZY && budget > 0 && w[0] === token[0]) {
      if (
        editDistance(token, w, budget) <= budget ||
        (w.length > token.length && editDistance(token, w.slice(0, token.length), budget) <= budget)
      ) best = M_FUZZY;
    }
  }
  return best;
}

/* ── index ──────────────────────────────────────────────────────────────── */

interface FieldDef {
  weight: number;
  words: string[];
  fuzzy: boolean;
}

interface Entry {
  product: Product;
  order: number;
  name: string;
  sku: string;
  fields: FieldDef[];
}

interface Index {
  entries: Entry[];
  vocab: Map<string, number>;
}

const BUILD_ORDER = new Map(buildProducts.map((p, i) => [p.slug, i]));

const W_NAME = 10;
const W_SKU = 6;
const W_GROUP = 4;
const W_BRAND = 3.5;
const W_KEYWORD = 3;
const W_LABEL = 2;
const W_TEXT = 1;

const words = (s: string | undefined | null): string[] => (s ? normalize(s).split(' ').filter(Boolean) : []);

function buildIndex(list: Product[]): Index {
  const vocab = new Map<string, number>();
  const addVocab = (ws: string[]) => {
    for (const w of ws) if (w.length >= 3) vocab.set(w, (vocab.get(w) ?? 0) + 1);
  };

  const entries = list.map((product, i): Entry => {
    const group = product.group ? getGroup(product.group)?.name : undefined;
    const labels = [
      product.material ? MATERIAL_LABELS[product.material] : '',
      ...knownMachines(product).map(m => MACHINE_LABELS[m]),
    ].join(' ');
    const nameW = words(product.name);
    const groupW = words(group);
    const brandW = words(product.brand);
    const keyW = (product.keywords ?? []).flatMap(words);
    const labelW = words(labels);
    addVocab(nameW);
    addVocab(groupW);
    addVocab(brandW);
    addVocab(keyW);
    addVocab(labelW);
    const sku = normalize(product.sku ?? '');
    const text = [product.summary, product.description, ...(product.variants ?? []).map(v => `${v.label} ${v.note ?? ''}`)].join(' ');
    return {
      product,
      order: BUILD_ORDER.get(product.slug) ?? 1_000_000 + i,
      name: normalize(product.name),
      sku,
      fields: [
        { weight: W_NAME, words: nameW, fuzzy: true },
        { weight: W_SKU, words: sku ? [...sku.split(' '), sku.replace(/ /g, '')] : [], fuzzy: false },
        { weight: W_GROUP, words: groupW, fuzzy: true },
        { weight: W_BRAND, words: brandW, fuzzy: true },
        { weight: W_KEYWORD, words: keyW, fuzzy: true },
        { weight: W_LABEL, words: labelW, fuzzy: true },
        { weight: W_TEXT, words: words(text), fuzzy: false },
      ],
    };
  });
  return { entries, vocab };
}

const indexCache = new WeakMap<Product[], Index>();
function indexOf(list: Product[]): Index {
  let ix = indexCache.get(list);
  if (!ix) {
    ix = buildIndex(list);
    indexCache.set(list, ix);
  }
  return ix;
}

interface Scored {
  entry: Entry;
  score: number;
  matched: number;
  /** every token matched at least as a substring (no typo-only matches) */
  strong: boolean;
}

function scoreEntry(e: Entry, tokens: string[], qNorm: string): Scored | null {
  let score = 0;
  let matched = 0;
  let strong = true;
  for (const t of tokens) {
    let best = 0;
    let bestFactor = 0;
    for (const f of e.fields) {
      const factor = matchWords(t, f.words, f.fuzzy);
      if (factor > 0 && f.weight * factor > best) {
        best = f.weight * factor;
        bestFactor = factor;
      }
    }
    if (best > 0) {
      matched++;
      score += best;
      if (bestFactor < M_SUBSTR) strong = false;
    } else {
      strong = false;
    }
  }
  if (matched === 0) return null;
  if (matched === tokens.length) score += 1000;
  if (qNorm) {
    if (e.name === qNorm) score += 100;
    else if (e.name.startsWith(qNorm)) score += 30;
    else if (e.name.includes(qNorm)) score += 15;
    if (e.sku && e.sku === qNorm) score += 60;
  }
  return { entry: e, score, matched, strong: strong && matched === tokens.length };
}

/** Closest vocabulary word for a token with no direct hit, or null. */
function nearestWord(token: string, vocab: Map<string, number>): string | null {
  if (token.length < 4) return null;
  const budget = Math.max(typoBudget(token.length), token.length >= 6 ? 2 : 1);
  let best: { w: string; d: number; n: number } | null = null;
  for (const [w, n] of vocab) {
    if (w === token || w.startsWith(token) || w.includes(token)) return null;
    if (w[0] !== token[0] && token.length <= 5) continue;
    let d = editDistance(token, w, budget);
    if (w.length > token.length) d = Math.min(d, editDistance(token, w.slice(0, token.length), budget) + 1);
    if (d > budget) continue;
    if (!best || d < best.d || (d === best.d && (n > best.n || (n === best.n && w < best.w)))) best = { w, d, n };
  }
  return best ? best.w : null;
}

function didYouMeanFor(ix: Index, tokens: string[], qNorm: string): string | null {
  const fixed = tokens.map(t => nearestWord(t, ix.vocab) ?? t);
  const out = fixed.join(' ');
  return out === qNorm || out === tokens.join(' ') ? null : out;
}

/* ── filters ────────────────────────────────────────────────────────────── */

type FacetKey = 'group' | 'material' | 'machine' | 'availability' | 'price';

function passes(p: Product, q: CatalogQuery, skip?: FacetKey): boolean {
  if (skip !== 'group' && q.groups.length > 0 && !(p.group && q.groups.includes(p.group))) return false;
  if (skip !== 'material' && q.materials.length > 0 && !(p.material && q.materials.includes(p.material))) return false;
  if (skip !== 'machine' && q.machines.length > 0 && !knownMachines(p).some(m => q.machines.includes(m))) return false;
  if (skip !== 'availability' && q.availability.length > 0 && !q.availability.includes(availabilityOf(p))) return false;
  if (skip !== 'price' && (q.priceMin !== undefined || q.priceMax !== undefined)) {
    if (!hasPrice(p)) return false;
    if (q.priceMin !== undefined && p.price < q.priceMin) return false;
    if (q.priceMax !== undefined && p.price > q.priceMax) return false;
  }
  return true;
}

/* ── search ─────────────────────────────────────────────────────────────── */

const byName = (a: Entry, b: Entry) =>
  a.name.localeCompare(b.name, 'en', { numeric: true }) || a.order - b.order;

const featuredFirst = (a: Entry, b: Entry) =>
  Number(!!b.product.featured) - Number(!!a.product.featured) || a.order - b.order;

export function searchCatalog(list: Product[], q: CatalogQuery): CatalogResult {
  const ix = indexOf(list);
  const tokens = tokenize(q.q);
  const qNorm = normalize(q.q);
  const searching = tokens.length > 0;

  const scores = new Map<Entry, Scored>();
  let universe: Entry[];
  let didYouMean: string | null = null;
  if (searching) {
    universe = [];
    for (const e of ix.entries) {
      const s = scoreEntry(e, tokens, qNorm);
      if (s) {
        scores.set(e, s);
        universe.push(e);
      }
    }
    const good = universe.some(e => scores.get(e)!.strong);
    if (!good) didYouMean = didYouMeanFor(ix, tokens, qNorm);
  } else {
    universe = ix.entries;
  }

  const facetCount = <T extends string>(skip: FacetKey, keys: (p: Product) => T[]) => {
    const counts = new Map<T, number>();
    for (const e of universe) {
      if (!passes(e.product, q, skip)) continue;
      for (const k of keys(e.product)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return counts;
  };

  const gCounts = facetCount('group', p => (p.group ? [p.group] : []));
  const mCounts = facetCount('material', p => (p.material ? [p.material] : []));
  const mcCounts = facetCount('machine', p => knownMachines(p));
  const aCounts = facetCount('availability', p => [availabilityOf(p)]);

  const presentIn = (pick: (p: Product) => string[]) => {
    const set = new Set<string>();
    for (const e of universe) for (const k of pick(e.product)) set.add(k);
    return set;
  };
  const gSeen = presentIn(p => (p.group ? [p.group] : []));
  const mSeen = presentIn(p => (p.material ? [p.material] : []));
  const mcSeen = presentIn(p => knownMachines(p));

  let lo = Infinity;
  let hi = -Infinity;
  for (const e of universe) {
    if (!passes(e.product, q, 'price') || !hasPrice(e.product)) continue;
    lo = Math.min(lo, e.product.price);
    hi = Math.max(hi, e.product.price);
  }

  const facets: CatalogResult['facets'] = {
    groups: productGroups
      .filter(g => gSeen.has(g.id))
      .map(g => ({ id: g.id, name: g.name, count: gCounts.get(g.id) ?? 0 })),
    materials: (Object.keys(MATERIAL_LABELS) as MaterialId[])
      .filter(m => mSeen.has(m))
      .map(m => ({ id: m, label: MATERIAL_LABELS[m], count: mCounts.get(m) ?? 0 })),
    machines: (Object.keys(MACHINE_LABELS) as MachineId[])
      .filter(m => mcSeen.has(m))
      .map(m => ({ id: m, label: MACHINE_LABELS[m], count: mcCounts.get(m) ?? 0 })),
    availability: AVAILABILITIES.filter(a => (aCounts.get(a) ?? 0) > 0 || q.availability.includes(a)).map(a => ({
      id: a,
      count: aCounts.get(a) ?? 0,
    })),
    priceRange: lo <= hi ? [lo, hi] : null,
  };

  const filtered = universe.filter(e => passes(e.product, q));

  const priced = (dir: 1 | -1) => (a: Entry, b: Entry) => {
    const pa = hasPrice(a.product);
    const pb = hasPrice(b.product);
    if (pa !== pb) return pa ? -1 : 1;
    if (!pa) return a.order - b.order;
    return dir * ((a.product.price as number) - (b.product.price as number)) || a.order - b.order;
  };

  let sorted: Entry[];
  switch (q.sort) {
    case 'newest':
      sorted = [...filtered].sort((a, b) => b.order - a.order);
      break;
    case 'price-asc':
      sorted = [...filtered].sort(priced(1));
      break;
    case 'price-desc':
      sorted = [...filtered].sort(priced(-1));
      break;
    case 'name':
      sorted = [...filtered].sort(byName);
      break;
    case 'featured':
      sorted = [...filtered].sort(featuredFirst);
      break;
    default:
      sorted = searching
        ? [...filtered].sort((a, b) => scores.get(b)!.score - scores.get(a)!.score || featuredFirst(a, b))
        : [...filtered].sort(featuredFirst);
  }

  const pageSize = Math.max(1, Math.floor(q.pageSize) || DEFAULT_PAGE_SIZE);
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(q.page) || 1), pageCount);

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize).map(e => e.product),
    total,
    page,
    pageCount,
    facets,
    didYouMean,
  };
}

/* ── suggest ────────────────────────────────────────────────────────────── */

export function suggest(
  list: Product[],
  q: string,
  limit = 8,
): { label: string; kind: 'product' | 'group' | 'material'; href: string }[] {
  const tokens = tokenize(q);
  if (tokens.length === 0 || limit <= 0) return [];
  const qNorm = normalize(q);
  const ix = indexOf(list);

  const out: { label: string; kind: 'product' | 'group' | 'material'; href: string }[] = [];

  const scored = ix.entries
    .map(e => scoreEntry(e, tokens, qNorm))
    .filter((s): s is Scored => s !== null && s.matched === tokens.length)
    .sort((a, b) => b.score - a.score || a.entry.order - b.entry.order);

  for (const s of scored.slice(0, limit)) {
    out.push({ label: s.entry.product.name, kind: 'product', href: productPath(s.entry.product) });
  }

  const starts = (label: string) => {
    const lw = words(label);
    return tokens.every(t => lw.some(w => w.startsWith(t)));
  };

  const room = Math.max(0, limit - out.length);
  const extras: typeof out = [];
  const groupsPresent = new Set(list.map(p => p.group));
  for (const g of productGroups) {
    if (groupsPresent.has(g.id) && starts(g.name)) extras.push({ label: g.name, kind: 'group', href: `/products/${g.slug}/` });
  }
  const materialsPresent = new Set(list.map(p => p.material));
  for (const m of Object.keys(MATERIAL_LABELS) as MaterialId[]) {
    if (materialsPresent.has(m) && starts(MATERIAL_LABELS[m])) {
      extras.push({ label: MATERIAL_LABELS[m], kind: 'material', href: `/products/?${queryToParams({ ...DEFAULT_QUERY, materials: [m] }).toString()}` });
    }
  }
  // Groups and materials are cheap to scan, so they win a slot over the weakest product hits.
  if (extras.length > 0 && room < extras.length) out.length = Math.max(0, limit - extras.length);
  return [...out, ...extras].slice(0, limit);
}

/* ── URL state ──────────────────────────────────────────────────────────── */

const listParam = (v: string | null, allowed: (s: string) => boolean): string[] => {
  if (!v) return [];
  const seen: string[] = [];
  for (const raw of v.split(',')) {
    const s = raw.trim();
    if (s && allowed(s) && !seen.includes(s)) seen.push(s);
  }
  return seen;
};

const priceParam = (v: string | null): number | undefined => {
  if (v === null || v.trim() === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= MAX_PRICE ? n : undefined;
};

const GROUP_IDS = new Set<string>(productGroups.map(g => g.id));
const MATERIAL_IDS = new Set<string>(Object.keys(MATERIAL_LABELS));
const MACHINE_IDS = new Set<string>(Object.keys(MACHINE_LABELS));

export function queryFromParams(p: URLSearchParams): CatalogQuery {
  let priceMin = priceParam(p.get('min'));
  let priceMax = priceParam(p.get('max'));
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) [priceMin, priceMax] = [priceMax, priceMin];
  const sort = p.get('sort');
  const page = Math.floor(Number(p.get('page')));
  const q: CatalogQuery = {
    ...DEFAULT_QUERY,
    q: (p.get('q') ?? '').replace(/\s+/g, ' ').trim().slice(0, 100),
    groups: listParam(p.get('g'), s => GROUP_IDS.has(s)),
    materials: listParam(p.get('m'), s => MATERIAL_IDS.has(s)),
    machines: listParam(p.get('mc'), s => MACHINE_IDS.has(s)),
    availability: listParam(p.get('a'), s => (AVAILABILITIES as string[]).includes(s)) as Availability[],
    sort: sort && (SORT_KEYS as string[]).includes(sort) ? (sort as SortKey) : DEFAULT_QUERY.sort,
    page: Number.isFinite(page) ? Math.min(Math.max(page, 1), MAX_PAGE) : 1,
  };
  if (priceMin !== undefined) q.priceMin = priceMin;
  if (priceMax !== undefined) q.priceMax = priceMax;
  return q;
}

/** Defaults are omitted so a clean catalogue URL stays clean. pageSize is not part of the URL. */
export function queryToParams(q: CatalogQuery): URLSearchParams {
  const p = new URLSearchParams();
  const text = q.q.trim();
  if (text) p.set('q', text);
  if (q.groups.length) p.set('g', q.groups.join(','));
  if (q.materials.length) p.set('m', q.materials.join(','));
  if (q.machines.length) p.set('mc', q.machines.join(','));
  if (q.availability.length) p.set('a', q.availability.join(','));
  if (q.priceMin !== undefined) p.set('min', String(q.priceMin));
  if (q.priceMax !== undefined) p.set('max', String(q.priceMax));
  if (q.sort !== DEFAULT_QUERY.sort) p.set('sort', q.sort);
  if (q.page > 1) p.set('page', String(Math.floor(q.page)));
  return p;
}
