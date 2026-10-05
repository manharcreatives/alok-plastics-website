/**
 * Product groups: the five ranges Alok Plastics supplies, as one calm, scannable grid.
 * Each card is a single link to its range page. Parts named on a card come from the live
 * catalogue (admin edits apply); a range with no parts yet says so and invites a quote.
 */

'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import ProductText from '@/components/runtime/ProductText';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';
import SectionHeader from '@/components/ui/SectionHeader';
import { productGroups, productsByGroup } from '@/content/products';
import { useHiddenProductSlugs } from '@/components/runtime/useRuntime';

const CSS = FOLD_SECTION_CSS + `
  .pg-sec { --pad-top: calc(var(--section-y) * 1.1); background: var(--surface-alt); padding-bottom: calc(var(--section-y) * 1.1); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
  .pg-grid { list-style: none; margin: var(--space-xl) 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
  .pg-grid > li { display: flex; min-width: 0; }
  .pgc { position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; padding: var(--space-lg); background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); text-decoration: none; color: inherit;
    transition: transform 240ms var(--ease-expo-out), border-color 240ms var(--ease-expo-out), box-shadow 240ms var(--ease-expo-out); }
  .pgc::before { content: ""; position: absolute; left: -1px; top: 24px; width: 2px; height: 32px; background: var(--burgundy); border-radius: 0 2px 2px 0; }
  .pgc:hover, .pgc:focus-visible { transform: translateY(-2px); border-color: var(--burgundy); box-shadow: 0 12px 24px -16px color-mix(in srgb, var(--ink) 28%, transparent); }
  .pgc:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
  .pgc-n { font-family: var(--font-mono, monospace); font-size: var(--fs-label); letter-spacing: 0.12em; color: var(--grey-metal-text); margin-bottom: var(--space-md); }
  .pgc-t { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h3); line-height: var(--lh-h3); font-weight: 650; letter-spacing: var(--tr-h3); color: var(--ink); margin: 0 0 var(--space-xs); text-wrap: balance; }
  .pgc-d { font-size: 0.9375rem; line-height: 1.55; color: var(--body); margin: 0 0 var(--space-md); max-width: 44ch; }
  .pgc-parts { margin: 0 0 var(--space-md); padding-top: var(--space-sm); border-top: 1px solid var(--grey-cloud); font-size: 0.875rem; line-height: 1.6; color: var(--muted); }
  .pgc-parts span + span::before { content: " \\00B7  "; color: var(--grey-metal); }
  .pgc-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); font-size: 0.875rem; font-weight: 600; color: var(--burgundy); }
  .pgc-count { font-weight: 500; color: var(--muted); }
  .pgc-go { display: inline-flex; align-items: center; gap: 6px; }
  .pgc-go svg { transition: transform 200ms var(--ease-expo-out); }
  .pgc:hover .pgc-go svg, .pgc:focus-visible .pgc-go svg { transform: translate(2px, -2px); }
  @media (min-width: 640px) { .pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1024px) {
    .pg-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .pg-grid > li { grid-column: span 2; }
    .pg-grid > li:nth-child(n+4) { grid-column: span 3; }
  }
  @media (max-width: 639px) { .pgc { padding: var(--space-md); } }
  @media (prefers-reduced-motion: reduce) { .pgc, .pgc-go svg { transition: none; } .pgc:hover, .pgc:focus-visible { transform: none; } }
`;

export default function ProductGroups() {
  const hidden = useHiddenProductSlugs();

  return (
    <section aria-labelledby="pg-heading" className="fold-sec fold-sec--diag pg-sec">
      <style>{CSS}</style>
      <FoldEdge variant="diag" />
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
        <SectionHeader
          label="Products"
          heading="Browse by category"
          headingId="pg-heading"
          lead="Moulded plastic and steel parts for water coolers, display counters and deep freezers, plus parts made to your sample."
          link={{ href: '/products/', label: 'All products' }}
        />

        <ul className="pg-grid">
          {productGroups.map(group => {
            const items = productsByGroup(group.id).filter(p => !hidden.has(p.slug));
            const named = items.slice(0, 3);
            const made = group.id === '05';
            return (
              <li key={group.id}>
                <Link href={`/products/${group.slug}/`} className="pgc" aria-label={`${group.name}: ${made ? 'made to order' : items.length > 0 ? `${items.length} parts` : 'request a quote'}`}>
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
