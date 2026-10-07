/**
 * S2b · AboutIntro — a short, curiosity-led teaser for the full /about/ page.
 *
 * Composition: an editorial split. Left = label, a question-raising headline and a quiet
 * descriptor; right = two plain lines about what we make and how, ruled fact rows (Process,
 * Parts for, Business Type) and "Read our story". The proof numbers now live in StatsBand
 * (after the CEO quote), so nothing here counts or animates except the heading rise.
 *
 * Facts come from src/content/site.ts (client-supplied). The "Works" (location) row of the
 * manufacturer snapshot is intentionally not shown on Home.
 */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Highlight from '@/components/ui/Highlight';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { useMaskRise } from '@/hooks/useMotion';
import { manufacturerSnapshot } from '@/content/site';
import { METAL_TEXT_CSS } from './FoldEdge';

/* Teaser copy. Facts only: est. 1998, Chandigarh, automatic moulding machines, the catalogue ranges. */
const ABOUT_TITLE = 'Behind every machine, there is a mould.';
const ABOUT_LINES = [
  'Since 1998 we have been moulding plastic parts in Chandigarh for the machines you see every day: float valves, door bushes, hinges, gaskets and more for water coolers, display counters and deep freezers.',
  'Automatic moulding machines keep dimensions consistent from batch to batch. If the part you need is not in the catalogue, we develop it from your sample or drawing.',
] as const;

/* Home shows the facts that describe the work, not the address. */
const FACT_ROWS = [
  ...manufacturerSnapshot.rows.filter(r => r.label !== 'Works'),
  { label: 'Parts for', value: 'Water coolers, display counters, deep freezers and more' },
];

const CSS = METAL_TEXT_CSS + `
  .ap { position: relative; background: var(--canvas); padding-top: calc(var(--section-y) * 1.35); padding-bottom: calc(var(--section-y) * 1.1); overflow: hidden; }
  .ap-grid-bg {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
    background-image:
      repeating-linear-gradient(var(--grey-metal) 0, var(--grey-metal) 1px, transparent 1px, transparent 8px),
      repeating-linear-gradient(90deg, var(--grey-metal) 0, var(--grey-metal) 1px, transparent 1px, transparent 8px);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, white 0%, transparent 75%);
            mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, white 0%, transparent 75%);
  }
  .ap-wrap { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; padding: 0 var(--grid-page-padding); }
  .ap-top { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); align-items: start; }
  .ap-micro { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-md); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo), sans-serif; line-height: var(--lh-label); }
  .ap-h {
    font-family: var(--font-archivo); font-variation-settings: "wdth" 125;
    font-size: var(--fs-h1); font-weight: 650; line-height: var(--lh-h1); letter-spacing: var(--tr-h1);
    color: var(--ink); max-width: 14ch; margin: 0; text-wrap: balance;
  }
  .ap-desc { margin: var(--space-md) 0 0; font-size: var(--fs-lead); line-height: 1.5; color: var(--muted); max-width: 28ch; }
  .ap-copy { margin: 0 0 var(--space-md); display: grid; gap: var(--space-sm); }
  .ap-copy p { margin: 0; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--body); max-width: 60ch; text-wrap: pretty; }
  .ap-facts { margin: 0; border-top: 1px solid var(--ink); }
  .ap-fact { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px var(--space-md); padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
  .ap-fact dt { font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); line-height: var(--lh-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--grey-metal-text); }
  .ap-fact dd { margin: 0; font-size: var(--fs-body); line-height: 1.5; color: var(--ink); text-wrap: pretty; }
  .ap-link {
    display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-md);
    min-height: 44px; padding: var(--space-xs) 0; font-weight: 600; font-size: 0.9375rem; color: var(--burgundy);
    border-bottom: 2px solid var(--burgundy); text-decoration: none;
  }
  .ap-link svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
  .ap-link:hover { color: var(--burgundy-bright); border-color: var(--burgundy-bright); }
  .ap-link:hover svg { transform: translate(2px, -2px); }
  .ap-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }

  @media (min-width: 640px) { .ap-fact { grid-template-columns: 9.5rem minmax(0, 1fr); align-items: baseline; padding: var(--space-md) 0; } }
  @media (min-width: 1024px) {
    .ap-top { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
  }
  @media (max-width: 639px) { .ap { padding-top: calc(var(--section-y) * 1.1); } }
  @media (prefers-reduced-motion: reduce) { .ap-link svg { transition: none; } }
`;

export default function AboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  return (
    <section ref={sectionRef} aria-labelledby="about-intro-heading" className="ap">
      <style>{CSS}</style>
      <div aria-hidden="true" className="ap-grid-bg" />
      <div className="ap-wrap">
        <div className="ap-top">
          <div>
            <p className="ap-micro">About Alok Plastics</p>
            <h2 id="about-intro-heading" ref={headingRef} className="ap-h">{ABOUT_TITLE}</h2>
            <p className="ap-desc"><Highlight keywords={['Plastic Components']}>{manufacturerSnapshot.descriptor}</Highlight></p>
          </div>
          <div className="ap-body">
            <div className="ap-copy">
              {ABOUT_LINES.map(l => <p key={l}>{l}</p>)}
            </div>
            <dl className="ap-facts">
              {FACT_ROWS.map(r => (
                <div key={r.label} className="ap-fact"><dt>{r.label}</dt><dd>{r.value}</dd></div>
              ))}
            </dl>
            <Link href="/about/" className="ap-link">
              Read our full story <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
