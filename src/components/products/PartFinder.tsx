'use client';
/**
 * Catalogue discovery — one query state shared by two places:
 *   <FinderHeroBar/>  the primary action inside the /products hero stage (combobox search + machine chips)
 *   <FinderResults/>  the marketplace result sheet under the hero (toolbar, filters, grid, load more)
 * wrapped by <FinderProvider>. Server-rendered group sections are passed to FinderResults as children
 * and stay in the DOM (hidden) while a search/filter is active, so they remain crawlable and are the
 * no-JS fallback. State is mirrored to the URL (queryFromParams / queryToParams) with the History API,
 * so links are shareable and Back works without a reload.
 */
import {
  createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
  type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import { ClockCounterClockwise } from '@phosphor-icons/react/dist/csr/ClockCounterClockwise';
import { MACHINE_LABELS, MATERIAL_LABELS, getGroup, productGroups, productsByGroup, knownMachines } from '@/content/products';
import type { MachineId, MaterialId } from '@/content/types';
import { useCatalogProducts } from '@/components/runtime/useRuntime';
import {
  DEFAULT_QUERY, formatPrice, queryFromParams, queryToParams, searchCatalog, suggest,
  type Availability, type CatalogQuery, type CatalogResult, type SortKey,
} from '@/lib/catalog-search';
import PartCard from './PartCard';
import './products.css';

const PAGE = 24;
const RECENT_KEY = 'alok:recent-searches:v1';
const AVAIL_LABEL: Record<Availability, string> = {
  'in-stock': 'In stock',
  'out-of-stock': 'Out of stock',
  'on-request': 'Availability on request',
};
const SORT_LABEL: Record<SortKey, string> = {
  relevance: 'Relevance',
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  name: 'Name: A to Z',
};

function hasFilters(q: CatalogQuery) {
  return !!(q.q.trim() || q.groups.length || q.materials.length || q.machines.length || q.availability.length
    || q.priceMin !== undefined || q.priceMax !== undefined);
}

function readRecent(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, 5) : [];
  } catch { return []; }
}
function writeRecent(list: string[]) {
  try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

interface Ctx {
  products: ReturnType<typeof useCatalogProducts>;
  text: string; setText: (v: string) => void;
  query: CatalogQuery; update: (patch: Partial<CatalogQuery>, mode?: 'push' | 'replace') => void;
  applyParams: (p: URLSearchParams) => void;
  commit: (q: string) => void;
  recent: string[]; clearRecent: () => void;
  browse: boolean; setBrowse: (b: boolean) => void;
  active: boolean; reset: () => void;
  result: CatalogResult; loadMore: () => void;
  machines: MachineId[];
}
const FinderCtx = createContext<Ctx | null>(null);
function useFinder() {
  const c = useContext(FinderCtx);
  if (!c) throw new Error('Finder components must sit inside <FinderProvider>');
  return c;
}

export function FinderProvider({ children }: { children: ReactNode }) {
  const products = useCatalogProducts();
  const [query, setQuery] = useState<CatalogQuery>(DEFAULT_QUERY);
  const [text, setTextState] = useState('');
  const [browse, setBrowseState] = useState(false);
  const [pages, setPages] = useState(1);
  const [recent, setRecent] = useState<string[]>([]);
  const queryRef = useRef(query);
  const browseRef = useRef(browse);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const writeUrl = useCallback((q: CatalogQuery, b: boolean, mode: 'push' | 'replace') => {
    const params = queryToParams({ ...q, page: 1, pageSize: DEFAULT_QUERY.pageSize });
    if (b) params.set('view', 'all');
    const qs = params.toString();
    const url = window.location.pathname + (qs ? `?${qs}` : '');
    if (url === window.location.pathname + window.location.search) return;
    try { window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url); } catch { /* ignore */ }
  }, []);

  const apply = useCallback((q: CatalogQuery, b: boolean, mode: 'push' | 'replace' | 'none') => {
    queryRef.current = q; browseRef.current = b;
    setQuery(q); setBrowseState(b); setPages(1);
    if (mode !== 'none') writeUrl(q, b, mode);
  }, [writeUrl]);

  const update = useCallback((patch: Partial<CatalogQuery>, mode: 'push' | 'replace' = 'replace') => {
    apply({ ...queryRef.current, ...patch, page: 1 }, browseRef.current, mode);
  }, [apply]);

  const fromParams = useCallback((p: URLSearchParams, mode: 'push' | 'replace' | 'none') => {
    const q = queryFromParams(p);
    setTextState(q.q);
    apply(q, p.get('view') === 'all', mode);
  }, [apply]);

  // Read the URL after mount (first render must match the server HTML) and on Back/Forward.
  useEffect(() => {
    const read = () => fromParams(new URLSearchParams(window.location.search), 'none');
    const t = setTimeout(() => { read(); setRecent(readRecent()); }, 0);
    window.addEventListener('popstate', read);
    return () => { clearTimeout(t); window.removeEventListener('popstate', read); };
  }, [fromParams]);

  // Typing: debounce 150ms, then drive results + URL (replace, so Back is not flooded).
  const setText = useCallback((v: string) => {
    setTextState(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ q: v.trim() ? v : '' }, 'replace'), 150);
  }, [update]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const commit = useCallback((raw: string) => {
    const v = raw.trim();
    if (timer.current) clearTimeout(timer.current);
    setTextState(v);
    update({ q: v }, 'push');
    if (v) {
      const next = [v, ...readRecent().filter(r => r.toLowerCase() !== v.toLowerCase())].slice(0, 5);
      writeRecent(next); setRecent(next);
    }
  }, [update]);

  const clearRecent = useCallback(() => { writeRecent([]); setRecent([]); }, []);
  const setBrowse = useCallback((b: boolean) => apply(queryRef.current, b, 'push'), [apply]);
  const applyParams = useCallback((p: URLSearchParams) => fromParams(p, 'push'), [fromParams]);
  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setTextState('');
    apply(DEFAULT_QUERY, false, 'push');
  }, [apply]);
  const loadMore = useCallback(() => setPages(n => n + 1), []);

  const effective = useMemo<CatalogQuery>(() => ({
    ...query,
    sort: query.sort === 'relevance' && !query.q.trim() ? 'featured' : query.sort,
    page: 1,
    pageSize: PAGE * pages,
  }), [query, pages]);
  const result = useMemo(() => searchCatalog(products, effective), [products, effective]);
  const machines = useMemo(() => {
    const s = new Set<MachineId>();
    products.forEach(p => knownMachines(p).forEach(m => s.add(m)));
    return Array.from(s);
  }, [products]);
  const active = browse || hasFilters(query);

  const value: Ctx = {
    products, text, setText, query, update, applyParams, commit, recent, clearRecent,
    browse, setBrowse, active, reset, result, loadMore, machines,
  };
  return <FinderCtx.Provider value={value}>{children}</FinderCtx.Provider>;
}

/* ───────────── search combobox ───────────── */

interface Option { key: string; label: string; kind: 'product' | 'group' | 'material' | 'recent'; href?: string }
const KIND_LABEL: Record<Option['kind'], string> = { product: 'Product', group: 'Category', material: 'Material', recent: 'Recent' };

function SearchBox({ id }: { id: string }) {
  const { text, setText, query, products, commit, recent, clearRecent, applyParams } = useFinder();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState({ key: '', idx: -1 });
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${id}-list`;

  const options = useMemo<Option[]>(() => {
    if (!text.trim()) return recent.map(r => ({ key: `r:${r}`, label: r, kind: 'recent' as const }));
    if (!query.q.trim()) return [];
    return suggest(products, query.q, 8).map((s, i) => ({ key: `${s.kind}:${s.href}:${i}`, label: s.label, kind: s.kind, href: s.href }));
  }, [text, query.q, products, recent]);

  const expanded = open && options.length > 0;
  const optKey = options.map(o => o.key).join('|');
  const idx = sel.key === optKey ? sel.idx : -1;
  const setIdx = (v: number | ((i: number) => number)) => setSel(prev => {
    const cur = prev.key === optKey ? prev.idx : -1;
    return { key: optKey, idx: typeof v === 'function' ? v(cur) : v };
  });

  const choose = (o: Option) => {
    setOpen(false);
    if (o.kind === 'recent') { commit(o.label); return; }
    const href = o.href ?? '';
    if (href.startsWith('/products/?') || href.startsWith('?')) {
      applyParams(new URLSearchParams(href.slice(href.indexOf('?') + 1)));
    } else if (o.kind === 'material' || !href) {
      commit(o.label);
    } else {
      router.push(href);
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      if (options.length) setIdx(i => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (options.length) setIdx(i => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (expanded && idx >= 0) choose(options[idx]); else { setOpen(false); commit(text); }
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false); setIdx(-1); }
    }
  };

  return (
    <div className="pf__box" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}>
      <div className="pf__field">
        <span className="pf__icon" aria-hidden="true"><MagnifyingGlass size={22} weight="light" /></span>
        <input
          ref={inputRef}
          id={id}
          name="q"
          className="pf__input"
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && idx >= 0 ? `${id}-o${idx}` : undefined}
          value={text}
          onChange={e => { setText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="Part name, SKU, material or machine"
          aria-label="Search the catalogue by part name, SKU, material or machine"
        />
        {text && (
          <button type="button" className="pf__clear" onClick={() => { setText(''); commit(''); inputRef.current?.focus(); }} aria-label="Clear search">
            <X size={20} weight="light" aria-hidden="true" />
          </button>
        )}
      </div>
      <ul id={listId} role="listbox" aria-label="Suggestions" className="pf__list" hidden={!expanded}>
        {expanded && options.map((o, i) => (
          <li
            key={o.key}
            id={`${id}-o${i}`}
            role="option"
            aria-selected={i === idx}
            className="pf__opt"
            onMouseDown={e => e.preventDefault()}
            onClick={() => choose(o)}
            onMouseEnter={() => setIdx(i)}
          >
            {o.kind === 'recent' && <ClockCounterClockwise size={18} weight="light" aria-hidden="true" />}
            <span className="pf__opt-label">{o.label}</span>
            <span className="pf__opt-kind">{KIND_LABEL[o.kind]}</span>
          </li>
        ))}
        {expanded && options[0]?.kind === 'recent' && (
          <li role="presentation" className="pf__opt-foot">
            <button type="button" className="pf__opt-clear" onMouseDown={e => e.preventDefault()} onClick={clearRecent}>Clear recent searches</button>
          </li>
        )}
      </ul>
    </div>
  );
}

/** The primary action inside the hero stage. */
export function FinderHeroBar() {
  const uid = useId();
  const { query, update, commit, text, machines, products, setBrowse, browse } = useFinder();
  return (
    <form className="pf" role="search" action="/products/" method="get" onSubmit={e => { e.preventDefault(); commit(text); }}>
      <SearchBox id={`${uid}-q`} />
      {machines.length > 0 && (
        <fieldset className="pf__chips" aria-label="Fits machine">
          <legend className="pf__label">Fits machine</legend>
          {machines.map(m => {
            const on = query.machines.includes(m);
            return (
              <button key={m} type="button" className="pf__chip" aria-pressed={on}
                onClick={() => update({ machines: on ? query.machines.filter(x => x !== m) : [...query.machines, m] }, 'push')}>
                {MACHINE_LABELS[m]}
              </button>
            );
          })}
        </fieldset>
      )}
      {!browse && products.length > 0 && (
        <button type="button" className="pf__all" onClick={() => setBrowse(true)}>
          Browse all {products.length} products <ArrowUpRight size={18} weight="light" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}

/* ───────────── filters ───────────── */

function CheckGroup({ title, items, selected, onToggle }: {
  title: string; items: { id: string; label: string; count: number }[]; selected: string[]; onToggle: (id: string) => void;
}) {
  if (items.length === 0 && selected.length === 0) return null;
  return (
    <fieldset className="cf__group">
      <legend className="cf__title">{title}</legend>
      {items.map(it => (
        <label key={it.id} className="cf__row">
          <input type="checkbox" checked={selected.includes(it.id)} onChange={() => onToggle(it.id)} />
          <span className="cf__label">{it.label}</span>
          <span className="cf__count">{it.count}</span>
        </label>
      ))}
    </fieldset>
  );
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter(x => x !== id) : [...list, id];
}

function FilterPanel() {
  const { query, update, result, reset } = useFinder();
  const f = result.facets;
  const range = f.priceRange && f.priceRange[0] < f.priceRange[1] ? f.priceRange : null;
  const lo = range ? Math.floor(range[0]) : 0;
  const hi = range ? Math.ceil(range[1]) : 0;
  const minV = Math.min(Math.max(query.priceMin ?? lo, lo), hi);
  const maxV = Math.max(Math.min(query.priceMax ?? hi, hi), lo);
  return (
    <div className="cf">
      <CheckGroup title="Category" items={f.groups.map(g => ({ id: g.id, label: g.name, count: g.count }))} selected={query.groups} onToggle={id => update({ groups: toggle(query.groups, id) }, 'push')} />
      <CheckGroup title="Material" items={f.materials} selected={query.materials} onToggle={id => update({ materials: toggle(query.materials, id) }, 'push')} />
      <CheckGroup title="Fits machine" items={f.machines} selected={query.machines} onToggle={id => update({ machines: toggle(query.machines, id) }, 'push')} />
      <CheckGroup
        title="Availability"
        items={f.availability.map(a => ({ id: a.id, label: AVAIL_LABEL[a.id], count: a.count }))}
        selected={query.availability}
        onToggle={id => update({ availability: toggle(query.availability, id) as Availability[] }, 'push')}
      />
      {range && (
        <fieldset className="cf__group">
          <legend className="cf__title">Price</legend>
          <p className="cf__range-out">{formatPrice(minV)} to {formatPrice(maxV)}</p>
          <label className="cf__slider">
            <span className="cf__slider-l">Minimum price</span>
            <input type="range" min={lo} max={hi} step={1} value={minV}
              onChange={e => { const v = Math.min(Number(e.target.value), maxV); update({ priceMin: v <= lo ? undefined : v }); }} />
          </label>
          <label className="cf__slider">
            <span className="cf__slider-l">Maximum price</span>
            <input type="range" min={lo} max={hi} step={1} value={maxV}
              onChange={e => { const v = Math.max(Number(e.target.value), minV); update({ priceMax: v >= hi ? undefined : v }); }} />
          </label>
        </fieldset>
      )}
      <button type="button" className="pr__reset cf__clear" onClick={reset}>Clear all</button>
    </div>
  );
}

function Chips() {
  const { query, update } = useFinder();
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (query.q.trim()) chips.push({ key: 'q', label: `“${query.q.trim()}”`, remove: () => update({ q: '' }, 'push') });
  query.groups.forEach(id => chips.push({ key: `g${id}`, label: getGroup(id)?.name ?? id, remove: () => update({ groups: query.groups.filter(x => x !== id) }, 'push') }));
  query.materials.forEach(id => chips.push({ key: `m${id}`, label: MATERIAL_LABELS[id as MaterialId] ?? id, remove: () => update({ materials: query.materials.filter(x => x !== id) }, 'push') }));
  query.machines.forEach(id => chips.push({ key: `x${id}`, label: MACHINE_LABELS[id as MachineId] ?? id, remove: () => update({ machines: query.machines.filter(x => x !== id) }, 'push') }));
  query.availability.forEach(id => chips.push({ key: `a${id}`, label: AVAIL_LABEL[id], remove: () => update({ availability: query.availability.filter(x => x !== id) }, 'push') }));
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    chips.push({
      key: 'p',
      label: `${query.priceMin !== undefined ? formatPrice(query.priceMin) : 'Any'} to ${query.priceMax !== undefined ? formatPrice(query.priceMax) : 'any'}`,
      remove: () => update({ priceMin: undefined, priceMax: undefined }, 'push'),
    });
  }
  if (chips.length === 0) return null;
  return (
    <ul className="cc" aria-label="Active filters">
      {chips.map(c => (
        <li key={c.key}>
          <button type="button" className="cc__chip" onClick={c.remove} aria-label={`Remove filter: ${c.label}`}>
            {c.label} <X size={16} weight="light" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ───────────── mobile filter sheet (focus-trapped bottom drawer) ───────────── */

function FilterSheet({ open, onClose, total }: { open: boolean; onClose: () => void; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')).filter(n => !n.hasAttribute('disabled'));
      if (nodes.length === 0) return;
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="cs" role="presentation">
      <div className="cs__scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="cs__sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="cs__head">
          <h2 id={titleId} className="cs__title">Filters</h2>
          <button type="button" className="cs__x" onClick={onClose} aria-label="Close filters" data-autofocus>
            <X size={22} weight="light" aria-hidden="true" />
          </button>
        </div>
        <div className="cs__body"><FilterPanel /></div>
        <div className="cs__foot">
          <button type="button" className="p-btn p-btn--primary cs__apply" onClick={onClose}>
            {total === 0 ? 'No results' : `Show ${total} ${total === 1 ? 'result' : 'results'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── results ───────────── */

function EmptyState() {
  const { query, result, setText, commit, reset } = useFinder();
  const term = query.q.trim();
  const groups = productGroups.filter(g => productsByGroup(g.id).length > 0);
  return (
    <div className="p-empty" role="status">
      <p><strong>{term ? `No products found for “${term}”` : 'No products match those filters'}</strong></p>
      {result.didYouMean && (
        <p>Did you mean{' '}
          <button type="button" className="p-link cs__dym" onClick={() => { setText(result.didYouMean ?? ''); commit(result.didYouMean ?? ''); }}>{result.didYouMean}</button>?
        </p>
      )}
      <ul className="p-empty__tips">
        <li>Check the spelling, or try a shorter word such as “bush” or “valve”.</li>
        <li>Search by material (nylon, HDPE) or by the machine it fits.</li>
        <li>Remove a filter to widen the search.</li>
      </ul>
      <p className="p-fine">Browse a category</p>
      <ul className="p-empty__cats">
        {groups.map(g => <li key={g.id}><Link className="pf__chip" href={`/products/${g.slug}/`}>{g.name}</Link></li>)}
      </ul>
      <div className="p-btns">
        <button type="button" className="p-btn p-btn--ghost" onClick={reset}>Clear search and filters</button>
        <Link className="p-btn p-btn--primary" href="/enquiry/">Send an enquiry <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

export function FinderResults({ children }: { children: ReactNode }) {
  const uid = useId();
  const { result, active, query, update, loadMore, reset } = useFinder();
  const ref = useRef<HTMLElement | null>(null);
  const wasActive = useRef(false);
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);

  // First time results appear, bring the sheet into view.
  useEffect(() => {
    if (active && !wasActive.current && ref.current) {
      const top = ref.current.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.6) {
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        ref.current.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      }
    }
    wasActive.current = active;
  }, [active]);

  const shown = result.items.length;
  const hasQ = query.q.trim().length > 0;
  const sort: SortKey = query.sort === 'relevance' && !hasQ ? 'featured' : query.sort;
  const sorts: SortKey[] = [...(hasQ ? ['relevance' as const] : []), 'featured', 'newest', 'price-asc', 'price-desc', 'name'];
  const status = result.total === 0 ? 'No products found' : `Showing 1-${shown} of ${result.total}`;
  const activeCount = query.groups.length + query.materials.length + query.machines.length + query.availability.length
    + (query.priceMin !== undefined || query.priceMax !== undefined ? 1 : 0);

  return (
    <>
      {active && (
        <section ref={ref} aria-label="Search results" className="pr" style={{ scrollMarginTop: 'var(--space-md)' }}>
          <div className="pw">
            <div className="pr__bar"><SearchBox id={`${uid}-q2`} /></div>
            <div className="ct">
              <button type="button" className="ct__filters" onClick={() => setSheet(true)} aria-haspopup="dialog">
                <SlidersHorizontal size={20} weight="light" aria-hidden="true" /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
              <p className="ct__status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
              <label className="ct__sort">
                <span className="ct__sort-l">Sort by</span>
                <select className="pr__select" value={sort} onChange={e => update({ sort: e.target.value as SortKey }, 'replace')}>
                  {sorts.map(s => <option key={s} value={s}>{SORT_LABEL[s]}</option>)}
                </select>
              </label>
            </div>
            <Chips />
            <div className="cat">
              <aside className="cat__side" aria-label="Filters"><FilterPanel /></aside>
              <div className="cat__main">
                {result.total > 0 ? (
                  <>
                    <h2 className="p-sr">Products</h2>
                    <ul className="p-grid">
                      {result.items.map(p => <li key={p.slug}><PartCard product={p} level={3} /></li>)}
                    </ul>
                    {shown < result.total && (
                      <div className="cat__more">
                        <p className="p-fine">Showing {shown} of {result.total}</p>
                        <button type="button" className="p-btn p-btn--ghost" onClick={loadMore}>Load more products</button>
                      </div>
                    )}
                  </>
                ) : <EmptyState />}
                <p className="cat__note">Price, stock, delivery and payment are confirmed by Alok Plastics on WhatsApp.</p>
                <button type="button" className="pr__reset cat__reset" onClick={reset}>Clear search and filters</button>
              </div>
            </div>
          </div>
          <FilterSheet open={sheet} onClose={closeSheet} total={result.total} />
        </section>
      )}
      <div hidden={active}>{children}</div>
    </>
  );
}
