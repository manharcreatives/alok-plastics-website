/**
 * Product groups: the five ranges Alok Plastics supplies, as one calm, scannable grid.
 * Each card is a single link to its range page. Parts named on a card come from the live
 * catalogue (admin edits apply); a range with no parts yet says so and invites a quote.
 *
 * Card behaviour: clean white by default. On hover, keyboard focus (focus-visible) or a first
 * tap on touch screens, a circular wipe grows from the arrow corner and reveals the range
 * photograph under a burgundy-night shade, with light text. The drawn gradient + blueprint
 * grid under the photo is the placeholder. A second tap on touch follows the link. Reduced
 * motion: the reveal is instant (no wipe). The section also has an optional quiet photo behind
 * the cards (/images/backgrounds/products-section.webp).
 */

'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import ProductText from '@/components/runtime/ProductText';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';
import SectionHeader from '@/components/ui/SectionHeader';
import PhotoBg from '@/components/ui/PhotoBg';
import { productGroups, productsByGroup } from '@/content/products';
import { useHiddenProductSlugs } from '@/components/runtime/useRuntime';

/* Range photo per group id (files are generated later; the drawn gradient shows until then). */
const GROUP_PHOTO: Record<string, string> = {
  '01': '/images/categories/water-cooler.webp',
  '02': '/images/categories/deep-freezer-display-counter.webp',
  '03': '/images/categories/commercial-kitchen.webp',
  '04': '/images/categories/caster-wheel.webp',
  '05': '/images/categories/on-demand-custom.webp',
};

const CSS = FOLD_SECTION_CSS + `
  .pg-sec { --pad-top: calc(var(--section-y) * 1.1); background: var(--surface-alt); padding-bottom: calc(var(--section-y) * 1.1); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
  .pg-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, var(--ink) 30%, var(--ink) 70%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0%, var(--ink) 30%, var(--ink) 70%, transparent 100%); }
  .pg-in { position: relative; z-index: 1; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .pg-grid { list-style: none; margin: var(--space-xl) 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
  .pg-grid > li { display: flex; min-width: 0; }
  .pgc { position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; padding: var(--space-lg); background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); text-decoration: none; color: inherit; overflow: hidden; isolation: isolate;
    transition: transform 320ms var(--ease-expo-out), border-color 320ms var(--ease-expo-out), box-shadow 320ms var(--ease-expo-out); }
  .pgc::before { content: ""; position: absolute; left: -1px; top: 24px; width: 2px; height: 32px; background: var(--burgundy); border-radius: 0 2px 2px 0; z-index: 2; }
  .pgc:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }

  /* the reveal layer: drawn gradient + grid placeholder, photo, shade. Wiped in from the arrow corner. */
  .pgc-rev { position: absolute; inset: 0; z-index: -1; pointer-events: none; clip-path: circle(0% at calc(100% - 24px) calc(100% - 24px)); transition: clip-path 640ms var(--ease-expo-out); }
  .pgc-art { position: absolute; inset: 0;
    background: radial-gradient(ellipse 90% 70% at 85% 100%, color-mix(in srgb, var(--burgundy-bright) 55%, transparent) 0%, transparent 70%), linear-gradient(165deg, var(--burgundy-deep) 0%, var(--burgundy-night) 100%); }
  .pgc-art::after { content: ""; position: absolute; inset: 0; opacity: .5;
    background-image: linear-gradient(color-mix(in srgb, var(--rose-pale) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--rose-pale) 12%, transparent) 1px, transparent 1px);
    background-size: 24px 24px; -webkit-mask-image: linear-gradient(200deg, var(--ink) 0%, transparent 70%); mask-image: linear-gradient(200deg, var(--ink) 0%, transparent 70%); }
  .pgc-shade { position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--burgundy-night) 55%, transparent) 0%, color-mix(in srgb, var(--burgundy-night) 88%, transparent) 100%); }

  .pgc-n { font-family: var(--font-mono, monospace); font-size: var(--fs-label); letter-spacing: 0.12em; color: var(--grey-metal-text); margin-bottom: var(--space-md); transition: color 320ms var(--ease-expo-out); }
  .pgc-t { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h3); line-height: var(--lh-h3); font-weight: 650; letter-spacing: var(--tr-h3); color: var(--ink); margin: 0 0 var(--space-xs); text-wrap: balance; transition: color 320ms var(--ease-expo-out); }
  .pgc-d { font-size: 0.9375rem; line-height: 1.55; color: var(--body); margin: 0 0 var(--space-md); max-width: 44ch; transition: color 320ms var(--ease-expo-out); }
  .pgc-parts { margin: 0 0 var(--space-md); padding-top: var(--space-sm); border-top: 1px solid var(--grey-cloud); font-size: 0.875rem; line-height: 1.6; color: var(--muted); transition: color 320ms var(--ease-expo-out), border-color 320ms var(--ease-expo-out); }
  .pgc-parts span + span::before { content: " \\00B7  "; color: var(--grey-metal); }
  .pgc-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); font-size: 0.875rem; font-weight: 600; color: var(--burgundy); transition: color 320ms var(--ease-expo-out); }
  .pgc-count { font-weight: 500; color: var(--muted); transition: color 320ms var(--ease-expo-out); }
  .pgc-go { display: inline-flex; align-items: center; gap: 6px; }
  .pgc-go svg { transition: transform 200ms var(--ease-expo-out); }

  /* revealed state: hover (real hover devices), keyboard focus, or the tap-toggle (data-open) */
  .pgc[data-open='true'], .pgc:focus-visible { border-color: var(--burgundy-night); box-shadow: 0 16px 32px -16px color-mix(in srgb, var(--ink) 45%, transparent); }
  .pgc[data-open='true'] .pgc-rev, .pgc:focus-visible .pgc-rev { clip-path: circle(150% at calc(100% - 24px) calc(100% - 24px)); }
  .pgc[data-open='true'] .pgc-n, .pgc:focus-visible .pgc-n { color: var(--rose-pale); }
  .pgc[data-open='true'] .pgc-t, .pgc:focus-visible .pgc-t { color: var(--surface); }
  .pgc[data-open='true'] .pgc-d, .pgc:focus-visible .pgc-d { color: var(--pink-soft); }
  .pgc[data-open='true'] .pgc-parts, .pgc:focus-visible .pgc-parts { color: var(--rose-pale); border-color: color-mix(in srgb, var(--surface) 22%, transparent); }
  .pgc[data-open='true'] .pgc-foot, .pgc:focus-visible .pgc-foot { color: var(--surface); }
  .pgc[data-open='true'] .pgc-count, .pgc:focus-visible .pgc-count { color: var(--rose-pale); }
  .pgc[data-open='true'] .pgc-go svg, .pgc:focus-visible .pgc-go svg { transform: translate(2px, -2px); }
  @media (hover: hover) {
    .pgc:hover { transform: translateY(-2px); border-color: var(--burgundy-night); box-shadow: 0 16px 32px -16px color-mix(in srgb, var(--ink) 45%, transparent); }
    .pgc:hover .pgc-rev { clip-path: circle(150% at calc(100% - 24px) calc(100% - 24px)); }
    .pgc:hover .pgc-n { color: var(--rose-pale); }
    .pgc:hover .pgc-t { color: var(--surface); }
    .pgc:hover .pgc-d { color: var(--pink-soft); }
    .pgc:hover .pgc-parts { color: var(--rose-pale); border-color: color-mix(in srgb, var(--surface) 22%, transparent); }
    .pgc:hover .pgc-foot { color: var(--surface); }
    .pgc:hover .pgc-count { color: var(--rose-pale); }
    .pgc:hover .pgc-go svg { transform: translate(2px, -2px); }
  }
  @media (min-width: 640px) { .pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1024px) {
    .pg-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .pg-grid > li { grid-column: span 2; }
    .pg-grid > li:nth-child(n+4) { grid-column: span 3; }
  }
  @media (max-width: 639px) { .pgc { padding: var(--space-md); } }
  @media (prefers-reduced-motion: reduce) {
    .pgc, .pgc-rev, .pgc-n, .pgc-t, .pgc-d, .pgc-parts, .pgc-foot, .pgc-count, .pgc-go svg { transition: none; }
    .pgc:hover { transform: none; }
  }
`;

export default function ProductGroups() {
  const hidden = useHiddenProductSlugs();
  const [open, setOpen] = useState<string | null>(null);

  /* Touch: the first tap reveals the card, the second follows the link. Mouse/keyboard are untouched. */
  const onCardClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (typeof window === 'undefined' || !window.matchMedia('(hover: none)').matches) return;
    if (open !== id) {
      e.preventDefault();
      setOpen(id);
    }
  };

  return (
    <section aria-labelledby="pg-heading" className="fold-sec fold-sec--diag pg-sec">
      <style>{CSS}</style>
      <FoldEdge variant="diag" />
      <div aria-hidden="true" className="pg-bg">
        <PhotoBg src="/images/backgrounds/products-section.webp" opacity={0.22} />
      </div>
      <div className="pg-in">
        <SectionHeader
          label="Products"
          heading="Find the part by the machine it goes into."
          headingId="pg-heading"
          lead="Moulded plastic and steel parts for water coolers, display counters and deep freezers, plus parts made to your sample."
          link={{ href: '/products/', label: 'All products' }}
        />

        <ul className="pg-grid">
          {productGroups.map(group => {
            const items = productsByGroup(group.id).filter(p => !hidden.has(p.slug));
            const named = items.slice(0, 3);
            const made = group.id === '05';
            const photo = GROUP_PHOTO[group.id];
            return (
              <li key={group.id}>
                <Link
                  href={`/products/${group.slug}/`}
                  className="pgc"
                  data-open={open === group.id ? 'true' : undefined}
                  onClick={e => onCardClick(e, group.id)}
                  onBlur={() => setOpen(o => (o === group.id ? null : o))}
                  aria-label={`${group.name}: ${made ? 'made to order' : items.length > 0 ? `${items.length} parts` : 'request a quote'}`}
                >
                  <span className="pgc-rev" aria-hidden="true">
                    <span className="pgc-art" />
                    {photo && <PhotoBg src={photo} />}
                    <span className="pgc-shade" />
                  </span>
                  <span className="pgc-n" aria-hidden="true">{group.id}</span>
                  <h3 className="pgc-t">{group.name}</h3>
                  <p className="pgc-d">{group.tagline}</p>
                  {named.length > 0 && (
                    <p className="pgc-parts">
                      {named.map(p => <span key={p.slug}><ProductText slug={p.slug} field="name" fallback={p.name} /></span>)}
                    </p>
                  )}
                  <span className="pgc-foot">
                    <span className="pgc-count">{made ? 'Made to order' : items.length > 0 ? `${items.length} ${items.length === 1 ? 'part' : 'parts'}` : 'Ask for a quote'}</span>
                    <span className="pgc-go">View range <ArrowUpRight size={16} weight="light" aria-hidden="true" /></span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
