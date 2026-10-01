'use client';
/**
 * Part finder — one search state shared by two places:
 *   <FinderHeroBar/>  the primary action inside the /products hero stage (search + machine chips)
 *   <FinderResults/>  the catalogue-sheet result list under the hero (sticky refine bar, material filter)
 * wrapped by <FinderProvider>. Server-rendered group sections are passed to FinderResults as children
 * and stay in the DOM (hidden) while a search is active, so they remain crawlable.
 */
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { MACHINE_LABELS, MATERIAL_LABELS, getGroup, knownMachines, productPath } from '@/content/products';
import type { MachineId, MaterialId, Product } from '@/content/types';
import Tag from '@/components/ui/Tag';
import { availableMachines, availableMaterials, isFiltering, searchParts } from '@/lib/products-search';
import { PartArt } from './PartCard';
import './products.css';

interface Ctx {
  q: string; setQ: (v: string) => void;
  machine: MachineId | 'all'; setMachine: (m: MachineId | 'all') => void;
  material: MaterialId | 'all'; setMaterial: (m: MaterialId | 'all') => void;
  results: Product[]; active: boolean; reset: () => void; term: string;
}
const FinderCtx = createContext<Ctx | null>(null);
function useFinder() {
  const c = useContext(FinderCtx);
  if (!c) throw new Error('Finder components must sit inside <FinderProvider>');
  return c;
}

export function FinderProvider({ children }: { children: ReactNode }) {
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [machine, setMachine] = useState<MachineId | 'all'>('all');
  const [material, setMaterial] = useState<MaterialId | 'all'>('all');

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  const query = { q: dq, machine, material };
  const active = isFiltering(query);
  const results = useMemo(() => searchParts({ q: dq, machine, material }), [dq, machine, material]);
  const reset = () => { setQ(''); setDq(''); setMachine('all'); setMaterial('all'); };

  return (
    <FinderCtx.Provider value={{ q, setQ, machine, setMachine, material, setMaterial, results, active, reset, term: dq.trim() }}>
      {children}
    </FinderCtx.Provider>
  );
}

function SearchField({ id, autoFocus }: { id: string; autoFocus?: boolean }) {
  const { q, setQ } = useFinder();
  return (
    <div className="pf__field">
      <span className="pf__icon" aria-hidden="true"><MagnifyingGlass size={22} weight="light" /></span>
      <input
        id={id}
        className="pf__input"
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder="Part name, material or size"
        aria-label="Search the catalogue by part name, material or size"
      />
      {q && (
        <button type="button" className="pf__clear" onClick={() => setQ('')} aria-label="Clear search">
          <X size={20} weight="light" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** The primary action inside the hero stage. */
export function FinderHeroBar() {
  const uid = useId();
  const { machine, setMachine } = useFinder();
  return (
    <form className="pf" role="search" onSubmit={e => e.preventDefault()}>
      <SearchField id={`${uid}-q`} />
      {availableMachines.length > 0 && (
        <fieldset className="pf__chips" aria-label="Fits machine">
          <legend className="pf__label">Fits machine</legend>
          {availableMachines.map(m => (
            <button key={m} type="button" className="pf__chip" aria-pressed={machine === m} onClick={() => setMachine(machine === m ? 'all' : m)}>
              {MACHINE_LABELS[m]}
            </button>
          ))}
        </fieldset>
      )}
    </form>
  );
}

function ResultRow({ p }: { p: Product }) {
  const g = p.group ? getGroup(p.group) : undefined;
  const machines = knownMachines(p);
  return (
    <li>
      <Link className="pr__row" href={productPath(p)}>
        <span className="pr__thumb" aria-hidden="true"><PartArt product={p} /></span>
        <span>
          <span className="pr__name">{p.name}</span>
          {g && <span className="pr__group" style={{ display: 'block' }}>{g.name}</span>}
          {(p.material || machines.length > 0) && (
            <span className="pr__tags">
              {p.material && <Tag material={p.material} />}
              {machines.map(m => <Tag key={m} variant="muted">{MACHINE_LABELS[m]}</Tag>)}
            </span>
          )}
        </span>
        <span className="pr__go" aria-hidden="true"><ArrowUpRight size={22} weight="light" /></span>
      </Link>
    </li>
  );
}

export function FinderResults({ children }: { children: ReactNode }) {
  const uid = useId();
  const { results, active, reset, material, setMaterial, term } = useFinder();
  const ref = useRef<HTMLElement | null>(null);
  const wasActive = useRef(false);

  // First time a search starts, bring the result sheet into view (hero input stays mirrored in the bar).
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

  const status = active ? `${results.length} ${results.length === 1 ? 'part' : 'parts'} found` : '';

  return (
    <>
      {active && (
        <section ref={ref} aria-label="Search results" className="pr" style={{ scrollMarginTop: 'var(--space-xl)' }}>
          <div className="pw">
            <div className="pr__bar">
              <SearchField id={`${uid}-q2`} />
              {availableMaterials.length > 0 && (
                <>
                  <label htmlFor={`${uid}-m`} className="p-fine">Material</label>
                  <select id={`${uid}-m`} className="pr__select" value={material} onChange={e => setMaterial(e.target.value as MaterialId | 'all')}>
                    <option value="all">All materials</option>
                    {availableMaterials.map(m => <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>)}
                  </select>
                </>
              )}
              <span className="pr__status" role="status" aria-live="polite" aria-atomic="true">{status}</span>
              <button type="button" className="pr__reset" onClick={reset}>Clear search and filters</button>
            </div>
            {results.length > 0 ? (
              <ul className="pr__list">{results.map(p => <ResultRow key={p.slug} p={p} />)}</ul>
            ) : (
              <div className="p-empty">
                <p><strong>{term ? `No part in the catalogue matches “${term}”.` : 'No part in the catalogue matches those filters.'}</strong></p>
                <p>This catalogue lists the parts we have published so far. If yours is not here, describe it in the enquiry form — what it does, what machine it is for — and we will identify it.</p>
                <div className="p-btns">
                  <Link className="p-btn p-btn--primary" href="/enquiry/">Get a Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <div hidden={active}>{children}</div>
    </>
  );
}
