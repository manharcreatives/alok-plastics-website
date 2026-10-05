/**
 * Two ways in, side by side: find a catalogue part, or have one developed from a sample,
 * drawing or photo. Both are equal-weight cards on a quiet engineering-paper ground so the
 * block is the first thing the eye lands on after the product groups.
 */

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilRuler } from '@phosphor-icons/react/dist/ssr/PencilRuler';

const CSS = `
.np { position: relative; background: var(--canvas); padding: var(--section-y) var(--grid-page-padding); overflow: hidden; }
.np::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: linear-gradient(var(--grey-cloud) 1px, transparent 1px), linear-gradient(90deg, var(--grey-cloud) 1px, transparent 1px);
  background-size: 40px 40px; -webkit-mask-image: linear-gradient(180deg, transparent 0%, var(--ink) 35%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0%, var(--ink) 35%, transparent 100%); }
.np-in { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
.np-head { max-width: 40rem; margin-bottom: var(--space-xl); }
.np-k { display: block; margin-bottom: var(--space-sm); font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--grey-metal-text); }
.np-h { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); font-weight: 650; color: var(--ink); margin: 0 0 var(--space-sm); text-wrap: balance; }
.np-sub { font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--body); margin: 0; max-width: 46ch; }
.np-cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
.np-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; min-width: 0; padding: var(--space-lg); border-radius: var(--radius-card); border: 1px solid var(--grey-warm); background: var(--surface); }
.np-card--b { background: var(--burgundy); border-color: var(--burgundy); color: var(--surface); }
.np-ico { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: var(--space-md); border-radius: var(--radius-card); border: 1px solid var(--grey-warm); color: var(--burgundy); background: var(--canvas); }
.np-card--b .np-ico { border-color: color-mix(in srgb, var(--surface) 30%, transparent); background: transparent; color: var(--rose-pale); }
.np-label { margin: 0 0 var(--space-xs); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 700; color: var(--burgundy); }
.np-card--b .np-label { color: var(--rose-pale); }
.np-t { margin: 0 0 var(--space-lg); font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-lead-lg); line-height: var(--lh-lead-lg); letter-spacing: var(--tr-lead-lg); font-weight: 650; color: var(--ink); max-width: 24ch; text-wrap: balance; }
.np-card--b .np-t { color: var(--surface); }
.np-cta { margin-top: auto; }
.np-cta svg { margin-left: var(--space-xs); transition: transform 200ms var(--ease-expo-out); }
.np-cta:hover svg { transform: translate(2px, -2px); }
@media (min-width: 768px) { .np-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .np-card { min-height: 320px; } }
@media (max-width: 639px) { .np-card { padding: var(--space-md); } }
@media (prefers-reduced-motion: reduce) { .np-cta svg { transition: none; } }
`;

export default function NeedPartBlock() {
  return (
    <section aria-labelledby="need-part-h" className="np">
      <style>{CSS}</style>
      <div className="np-in">
        <div className="np-head">
          <span className="np-k">Two ways to start</span>
          <h2 id="need-part-h" className="np-h">Need the right spare part?</h2>
          <p className="np-sub">Find from our catalogue or tell us what you need.</p>
        </div>
        <div className="np-cards">
          <div className="np-card">
            <span className="np-ico" aria-hidden="true"><MagnifyingGlass size={24} weight="light" /></span>
            <p className="np-label">From the catalogue</p>
            <p className="np-t">Browse by group, material or machine.</p>
            <Link href="/products/" className="btn btn--secondary np-cta" style={{ minHeight: 48, padding: '0 var(--space-md)', fontSize: '1rem' }}>
              View Catalogue <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </Link>
          </div>
          <div className="np-card np-card--b">
            <span className="np-ico" aria-hidden="true"><PencilRuler size={24} weight="light" /></span>
            <p className="np-label">Custom development</p>
            <p className="np-t">Share a sample, drawing or photo and we&rsquo;ll develop and supply it.</p>
            <Link href="/enquiry/" className="btn btn--on-burgundy np-cta" style={{ minHeight: 48, padding: '0 var(--space-md)', fontSize: '1rem' }}>
              Get Custom Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
