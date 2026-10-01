/**
 * PartsSchedule (file kept as ValuesRibbon.tsx so app/page.tsx needs no change)
 *
 * Replaces the slogan marquee. This is an engineering-drawing "parts schedule":
 * a title block on the left (who / where / what it is made in / what it fits)
 * followed by one cell per real part — its own pictogram, name, material tag and,
 * where the catalogue confirms it, the machines it fits.
 *
 * Every word comes from the content files (products.ts, site.ts). Parts whose
 * material the catalogue has not confirmed are left out rather than guessed, and a
 * machine row stays empty when the machine fit is still TODO(client).
 *
 * Motion: cells wipe in once on a 45° diagonal (clip-path, 80ms stagger) and a
 * single soft light sweep crosses the sheet every 9s while it is on screen.
 * Reduced motion: everything static and fully visible.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Pictogram from '@/components/brand/Pictogram';
import type { PictogramName } from '@/components/brand/Pictogram';
import { productGroups, publishedProducts } from '@/content/products';
import { site } from '@/content/site';
import type { MachineId, MaterialId } from '@/content/types';

const MATERIAL_LABEL: Partial<Record<MaterialId, string>> = {
  nylon: 'Nylon',
  hdpe: 'HDPE',
  ppcp: 'PPCP',
  brass: 'Brass',
};

const MACHINES: { id: MachineId; label: string }[] = [
  { id: 'water-cooler', label: 'Water cooler' },
  { id: 'display-counter', label: 'Display counter' },
  { id: 'deep-freezer', label: 'Deep freezer' },
];

const CSS = `
.ps { position: relative; background: var(--surface); border-bottom: 1px solid var(--grey-warm);
  padding: var(--space-xl) 0; overflow: hidden; }
.ps__sheet { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  margin: 0 auto; padding: 0 var(--grid-page-padding); }
.ps__frame { position: relative; display: grid; grid-template-columns: 272px minmax(0, 1fr);
  border: 1px solid var(--grey-warm); background: var(--canvas); isolation: isolate; overflow: hidden; }

/* title block */
.ps__title { position: relative; display: flex; flex-direction: column; justify-content: space-between;
  gap: var(--space-md); padding: var(--space-md); border-right: 1px solid var(--grey-warm);
  background: var(--surface); }
.ps__kicker { display: flex; align-items: center; gap: 8px; margin: 0;
  font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .16em; color: var(--grey-metal); }
.ps__kicker::before { content: ''; width: 16px; height: 2px; background: var(--burgundy); flex-shrink: 0; }
.ps__name { margin: var(--space-xs) 0 0; color: var(--ink);
  font: 650 1.375rem/1.15 var(--font-archivo, sans-serif); font-variation-settings: "wdth" 125; letter-spacing: -0.02em; }
.ps__fields { display: grid; gap: 0; margin: 0; }
.ps__field { display: grid; grid-template-columns: 72px 1fr; align-items: baseline; gap: var(--space-xs);
  padding: var(--space-xs) 0; border-top: 1px solid var(--grey-cloud); }
.ps__field dt { margin: 0; font-size: .6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .16em; color: var(--grey-metal); }
.ps__field dd { margin: 0; font-size: .8125rem; line-height: 1.4; color: var(--ink); font-weight: 500; }
.ps__keys { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.ps__key { display: inline-flex; align-items: center; gap: 4px; color: var(--body); }
.ps__key svg { width: 18px; height: 18px; color: var(--grey-metal); }

/* cells */
.ps__scroller { position: relative; display: flex; }
.ps__row { flex: 1; display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); margin: 0; padding: 0; list-style: none;
  position: relative; }
/* ruler ticks along the top edge of the sheet — every 8px, a longer one every 40px */
.ps__scroller::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; z-index: 2; pointer-events: none;
  background:
    repeating-linear-gradient(90deg, var(--grey-metal) 0 1px, transparent 1px 40px) top / 100% 6px no-repeat,
    repeating-linear-gradient(90deg, var(--grey-warm) 0 1px, transparent 1px 8px) top / 100% 3px no-repeat; opacity: .6; }
.ps__cell { position: relative; display: flex; flex-direction: column; min-height: 100%;
  border-right: 1px solid var(--grey-warm); }
.ps__cell:last-child { border-right: 0; }
.ps__link { display: flex; flex: 1; flex-direction: column; gap: var(--space-sm); padding: var(--space-lg) var(--space-sm) var(--space-sm);
  color: inherit; text-decoration: none; transition: background-color .2s; }
.ps__link:hover, .ps__link:focus-visible { background: var(--blush); }
.ps__link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: -2px; }
/* register mark at each cell's top-left junction */
.ps__cell::before { content: ''; position: absolute; top: 8px; right: 8px; width: 9px; height: 9px;
  background:
    linear-gradient(var(--grey-warm), var(--grey-warm)) center / 1px 100% no-repeat,
    linear-gradient(var(--grey-warm), var(--grey-warm)) center / 100% 1px no-repeat; }
.ps__picto { width: 64px; height: 64px; color: var(--ink); transition: color .2s, transform .4s cubic-bezier(.16,1,.3,1); }
.ps__link:hover .ps__picto, .ps__link:focus-visible .ps__picto { color: var(--burgundy); transform: translate3d(2px, -2px, 0); }
.ps__part { margin: 0; color: var(--ink); font: 600 .9375rem/1.25 var(--font-archivo, sans-serif); }
.ps__tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: auto; min-height: 20px; align-content: flex-end; }
.ps__tag { display: inline-block; padding: 4px 6px; border: 1px solid var(--grey-metal); border-radius: var(--radius-card);
  color: var(--grey-metal); font-size: .6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; line-height: 1;
  transition: background-color .2s, color .2s, border-color .2s; }
.ps__link:hover .ps__tag, .ps__link:focus-visible .ps__tag { background: var(--burgundy); border-color: var(--burgundy); color: var(--surface); }
.ps__fits { display: flex; align-items: center; gap: 8px; height: 40px; box-sizing: border-box; padding-top: var(--space-xs);
  border-top: 1px solid var(--grey-cloud); color: var(--grey-metal); }
.ps__fits svg { width: 18px; height: 18px; }

/* one slow light sweep across the cells (wide layout only) */
.ps__sweep { position: absolute; inset: 0; z-index: 3; pointer-events: none; overflow: hidden; }
.ps__sweep::before { content: ''; position: absolute; top: -10%; bottom: -10%; left: 0; width: 18%;
  background: linear-gradient(100deg, transparent, color-mix(in srgb, var(--surface) 70%, transparent), transparent);
  transform: translate3d(-120%, 0, 0) skewX(-24deg); }
.ps[data-live='true'] .ps__sweep::before { animation: ps-sweep 9s cubic-bezier(.16,1,.3,1) 1.2s infinite; }
@keyframes ps-sweep { 0% { transform: translate3d(-120%, 0, 0) skewX(-24deg); }
  22%, 100% { transform: translate3d(620%, 0, 0) skewX(-24deg); } }

/* entrance — diagonal wipe per cell, only when JS has armed it */
.ps[data-armed='true'] .ps__cell { clip-path: polygon(0 100%, 0 100%, 0 100%); }
.ps[data-armed='true'][data-in='true'] .ps__cell { clip-path: polygon(-100% 100%, 200% -100%, 200% 200%);
  transition: clip-path .9s cubic-bezier(.16,1,.3,1); transition-delay: calc(var(--i) * 80ms); }

/* narrow: the schedule becomes a swipeable strip under the title block */
@media (max-width: 1199px) {
  .ps__frame { grid-template-columns: 1fr; }
  .ps__title { border-right: 0; border-bottom: 1px solid var(--grey-warm); }
  .ps__scroller { overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity;
    scrollbar-width: thin; scrollbar-color: var(--grey-warm) transparent; }
  .ps__row { display: flex; width: max-content; }
  .ps__sweep { display: none; }
  .ps__scroller { display: block; }
  .ps__row { flex: none; }
  .ps__cell { width: 164px; flex: 0 0 auto; scroll-snap-align: start; }
}
@media (max-width: 767px) {
  .ps { padding: var(--space-lg) 0; }
  .ps__sheet { padding: 0 var(--space-sm); }
  .ps__field { grid-template-columns: 64px 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .ps[data-armed='true'] .ps__cell { clip-path: none !important; transition: none !important; }
  .ps__sweep { display: none; }
  .ps__picto, .ps__link, .ps__tag { transition: none; }
}
`;

export default function ValuesRibbon() {
  const rootRef = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return; /* static, fully visible */
    const io = new IntersectionObserver(
      ([entry]) => {
        setArmed(true); /* armed on the first observation: below-fold cells start hidden, in-view ones just show */
        setLive(entry.isIntersecting);
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Parts with a catalogue-confirmed material in the four moulding/brass families */
  const parts = publishedProducts
    .filter(p => p.material && MATERIAL_LABEL[p.material])
    .map(p => {
      const group = productGroups.find(g => g.id === p.group);
      const materials = [p.material as MaterialId];
      if (p.variants?.some(v => /nylon/i.test(v.label)) && !materials.includes('nylon')) materials.push('nylon');
      return {
        slug: p.slug,
        name: p.name,
        href: group ? `/products/${group.slug}/${p.slug}` : '/products',
        materials,
        machines: Array.isArray(p.machine) ? p.machine : [],
      };
    });


  return (
    <section
      ref={rootRef}
      className="ps"
      data-armed={armed ? 'true' : undefined}
      data-in={inView ? 'true' : undefined}
      data-live={live ? 'true' : undefined}
      aria-label="Parts schedule"
    >
      <style>{CSS}</style>
      <div className="ps__sheet">
        <div className="ps__frame">
          {/* Title block */}
          <div className="ps__title">
            <div>
              <p className="ps__kicker">Parts schedule</p>
              <p className="ps__name">Spare parts, made in {site.contact.city}</p>
            </div>
            <dl className="ps__fields">
              <div className="ps__field">
                <dt>Since</dt>
                <dd>{site.foundingYear}</dd>
              </div>
              <div className="ps__field">
                <dt>Material</dt>
                <dd>{Object.values(MATERIAL_LABEL).join(' · ')}</dd>
              </div>
              <div className="ps__field">
                <dt>Fits</dt>
                <dd>
                  <span className="ps__keys">
                    {MACHINES.map(m => (
                      <span key={m.id} className="ps__key">
                        <Pictogram name={m.id as PictogramName} size={24} aria-hidden="true" />
                        {m.label}
                      </span>
                    ))}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* One cell per part */}
          <div className="ps__scroller" data-lenis-prevent-touch>
            <ul className="ps__row" style={{ ['--n' as string]: parts.length }}>
              {parts.map((p, i) => (
                <li key={p.slug} className="ps__cell" style={{ ['--i' as string]: i }}>
                  <Link href={p.href} className="ps__link">
                    <Pictogram name={p.slug as PictogramName} size={48} className="ps__picto" aria-hidden="true" />
                    <h3 className="ps__part">{p.name}</h3>
                    <div className="ps__tags">
                      {p.materials.map(m => (
                        <span key={m} className="ps__tag">{MATERIAL_LABEL[m]}</span>
                      ))}
                    </div>
                    <div className="ps__fits">
                      {p.machines.map(id => (
                        <Pictogram key={id} name={id as PictogramName} size={24} title={MACHINES.find(m => m.id === id)?.label} />
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="ps__sweep" aria-hidden="true" />
          </div>

        </div>
      </div>
    </section>
  );
}
