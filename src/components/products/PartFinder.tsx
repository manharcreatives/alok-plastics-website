'use client';
/**
 * PartFinder — client-side Fuse search + machine/material filters.
 * Server-rendered group sections are passed as children and stay in the DOM
 * (hidden) while a search/filter is active, so they remain crawlable.
 */
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { MACHINE_LABELS, MATERIAL_LABELS } from '@/content/products';
import type { MachineId, MaterialId } from '@/content/types';
import {
  availableMachines,
  availableMaterials,
  isFiltering,
  searchParts,
} from '@/lib/products-search';
import { PartGrid } from './PartCard';
import './products.css';

export default function PartFinder({ children }: { children: ReactNode }) {
  const uid = useId();
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

  const status = active
    ? `${results.length} ${results.length === 1 ? 'part' : 'parts'} found`
    : '';

  return (
    <>
      <section aria-labelledby={`${uid}-h`} className="pw" style={{ paddingTop: 'var(--space-lg)' }}>
        <form className="p-finder" role="search" onSubmit={e => e.preventDefault()}>
          <h2 id={`${uid}-h`} className="p-h2" style={{ fontSize: '1.25rem' }}>Part finder</h2>
          <div className="p-filters">
            <div>
              <label className="p-label" htmlFor={`${uid}-q`}>Search by part name, material or size</label>
              <input
                id={`${uid}-q`}
                className="p-input"
                type="search"
                value={q}
                onChange={e => setQ(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. float valve, nylon, 2 inch"
              />
            </div>
            {availableMaterials.length > 0 && (
              <div>
                <label className="p-label" htmlFor={`${uid}-m`}>Material</label>
                <select
                  id={`${uid}-m`}
                  className="p-select"
                  value={material}
                  onChange={e => setMaterial(e.target.value as MaterialId | 'all')}
                >
                  <option value="all">All materials</option>
                  {availableMaterials.map(m => <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>)}
                </select>
              </div>
            )}
          </div>
          {availableMachines.length > 0 && (
            <fieldset className="p-chips">
              <legend className="p-label">Fits machine</legend>
              <button type="button" className="p-chip" aria-pressed={machine === 'all'} onClick={() => setMachine('all')}>All</button>
              {availableMachines.map(m => (
                <button key={m} type="button" className="p-chip" aria-pressed={machine === m} onClick={() => setMachine(machine === m ? 'all' : m)}>
                  {MACHINE_LABELS[m]}
                </button>
              ))}
            </fieldset>
          )}
          <p className="p-note">Machine filters list only parts whose machine fit is confirmed. Not sure which part you need? Send us a photo on WhatsApp.</p>
          <div className="p-status" role="status" aria-live="polite" aria-atomic="true">
            {status}
            {active && <button type="button" className="p-reset" onClick={reset}>Clear search and filters</button>}
          </div>
        </form>
      </section>

      {active && (
        <section aria-label="Search results" className="pw" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
          {results.length > 0 ? (
            <PartGrid items={results} level={3} />
          ) : (
            <div className="p-empty">
              <p><strong>No matching part in the catalogue.</strong></p>
              <p>Try a shorter name, or tell us what the part does and we will identify it.</p>
              <div className="p-btns">
                <Link className="p-btn p-btn--primary" href={`/enquiry/`}>Describe your part</Link>
              </div>
            </div>
          )}
        </section>
      )}

      <div hidden={active}>{children}</div>
    </>
  );
}
