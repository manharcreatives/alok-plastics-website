/**
 * S4 · ProductGroups — §13
 * bg: --surface-alt
 * Bento grid (12 col): row 1 = 01 (7) + 02 (5); row 2 = 03 (5) + 04 (7). Equal-height rows.
 * Glare (cursor-tracked) on 01+02, desktop fine-pointer only.
 * Expand in place: click card → inline expand with full part list + CTAs.
 * Two-path block beneath bento (catalogue vs. custom).
 *
 * No product photos yet: each card leads with a drawing-sheet panel of scaled part pictograms.
 * COPY: all group taglines flagged for client approval.
 */

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CaretUp } from '@phosphor-icons/react/dist/csr/CaretUp';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';
import Pictogram, { pictogramPaths, type PictogramName } from '@/components/brand/Pictogram';
import SectionHeader from '@/components/ui/SectionHeader';
import Tag from '@/components/ui/Tag';
import { productGroups, productsByGroup, productPath } from '@/content/products';
import type { Product } from '@/content/types';

/* ── Glare effect — cursor-tracked radial highlight ─────────── */
function useGlare(ref: React.RefObject<HTMLDivElement | null>) {
  const glareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return;

    const glare = document.createElement('div');
    glare.setAttribute('aria-hidden', 'true');
    glare.style.cssText = `
      position:absolute; inset:0; pointer-events:none; border-radius:inherit;
      background: radial-gradient(circle 120px at 50% 50%, rgba(255,255,255,.12) 0%, transparent 70%);
      opacity:0; mix-blend-mode:soft-light; transition: opacity 0.2s;
      will-change: background;
    `;
    el.style.overflow = 'hidden';
    el.appendChild(glare);
    glareRef.current = glare;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      glare.style.background = `radial-gradient(circle 140px at ${x}% ${y}%, rgba(255,255,255,.12) 0%, transparent 70%)`;
      glare.style.opacity = '1';
    };
    const handleLeave = () => { glare.style.opacity = '0'; };

    el.addEventListener('mousemove', handleMove, { passive: true });
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      glare.remove();
    };
  }, [ref]);
}

const hasPictogram = (slug: string): slug is PictogramName => slug in pictogramPaths;

/* ── Pictogram panel — honest placeholder until product photos exist ──
   Large part pictograms on a drawing-sheet grid, with a dimension rule underneath
   and crop marks on the corners. Strokes warm to burgundy when the card is hovered. */
function PictogramPanel({ slugs }: { slugs: PictogramName[] }) {
  const n = slugs.length;
  const px = n <= 1 ? 208 : n === 2 ? 168 : n === 3 ? 136 : 112;
  return (
    <div aria-hidden="true" className="pg-panel">
      <div className="pg-panel-grid" />
      <span className="pg-crop pg-crop--tl" /><span className="pg-crop pg-crop--br" />
      <div className="pg-panel-row">
        {slugs.map(slug => (
          <Pictogram
            key={slug}
            name={slug}
            size={48}
            strokeWidth={48 / px * 1.5}
            className="pg-picto"
            style={{ ['--px' as string]: px }}
          />
        ))}
      </div>
      <span className="pg-dim"><i /><b /><b /></span>
    </div>
  );
}

function PartIcon({ slug, px }: { slug: string; px: number }) {
  if (hasPictogram(slug)) {
    return (
      <Pictogram
        name={slug}
        size={24}
        style={{ flexShrink: 0, width: px, height: px, color: 'var(--muted)' }}
      />
    );
  }
  /* No pictogram drawn for this part yet — neutral marker keeps rows aligned */
  return <span aria-hidden="true" className="pg-part-dot" style={{ ['--px' as string]: px }} />;
}

/* ── Group card ──────────────────────────────────────────────── */
function GroupCard({
  group,
  products,
  isExpanded,
  onToggle,
  useGlare: enableGlare,
  span,
  alt,
}: {
  group: typeof productGroups[0];
  products: Product[];
  isExpanded: boolean;
  onToggle: () => void;
  useGlare: boolean;
  span: number;
  alt: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGlare(cardRef);

  const panelSlugs = (group.anchorParts ?? []).filter(hasPictogram).slice(0, 4);
  const materials = Array.from(new Set(products.map(p => p.material).filter(Boolean))) as NonNullable<Product['material']>[];
  const visible = isExpanded ? products : products.slice(0, 4);

  return (
    <div
      ref={enableGlare ? cardRef : undefined}
      id={`products-${group.id}`}
      className={`pg-card${alt ? ' pg-card--alt' : ''}`}
      style={{ ['--span' as string]: span }}
    >
      <div className="pg-in">
        <div className="pg-card-body">
          <div className="pg-card-head">
            <span aria-hidden="true" className="pg-card-bar" />
            <span className="pg-card-count">{products.length} {products.length === 1 ? 'part' : 'parts'}</span>
          </div>
          <h3 className="pg-card-title">{group.name}</h3>
          {/* COPY: drafted, needs client approval */}
          <p className="pg-card-desc">{group.description}</p>

          {panelSlugs.length > 0 && <PictogramPanel slugs={panelSlugs} />}

          {materials.length > 0 && (
            <div className="pg-tags">
              {materials.map(m => (
                <Tag key={m} material={m as Parameters<typeof Tag>[0]['material']} />
              ))}
            </div>
          )}

          <ul
            className="pg-parts"
            {...(isExpanded ? { role: 'region', 'aria-label': `${group.name} parts` } : {})}
          >
            {visible.map(product => (
              <li key={product.slug}>
                <Link href={productPath(product)} className="pg-part">
                  <PartIcon slug={product.slug} px={20} />
                  <span className="pg-part-name">{product.name}</span>
                  {isExpanded && product.material && (
                    <Tag material={product.material as Parameters<typeof Tag>[0]['material']} />
                  )}
                  <ArrowUpRight className="pg-part-go" size={16} weight="light" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {isExpanded && (
            <div className="pg-cta-row">
              <Link href={`/products/${group.slug}`} className="btn btn--secondary btn--sm">
                View group <ArrowUpRight size={16} weight="light" aria-hidden="true" />
              </Link>
              <Link href="/enquiry" className="btn btn--primary btn--sm">
                Get a quote
              </Link>
            </div>
          )}
        </div>

        <div className="pg-card-foot">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-controls={`products-${group.id}`}
            className="pg-foot-btn"
          >
            {isExpanded ? 'Collapse' : products.length === 1 ? 'View part' : `All ${products.length} parts`}
            {isExpanded
              ? <CaretUp size={14} weight="light" aria-hidden="true" />
              : <CaretDown size={14} weight="light" aria-hidden="true" />}
          </button>
          <Link href={`/products/${group.slug}`} className="pg-foot-link">
            View parts <ArrowUpRight size={16} weight="light" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const CSS = FOLD_SECTION_CSS + `
  .pg-sec { --pad-top: calc(var(--section-y) * 1.1); background: var(--surface-alt); padding-bottom: calc(var(--section-y) * 1.3); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
  .pg-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); margin-top: var(--space-xl); align-items: stretch; }
  .pg-card {
    --cut: 40px; position: relative; display: flex; min-width: 0; padding: 1px;
    background: var(--grey-warm);
    clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%);
    transition: background .4s ease;
  }
  .pg-card--alt { clip-path: polygon(0 0, 100% 0, 100% 100%, var(--cut) 100%, 0 calc(100% - var(--cut))); }
  .pg-card:hover, .pg-card:focus-within { background: var(--burgundy); }
  .pg-in {
    position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden;
    background: var(--surface); box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
    clip-path: polygon(0 0, calc(100% - var(--cut) + 1px) 0, 100% calc(var(--cut) - 1px), 100% 100%, 0 100%);
  }
  .pg-card--alt .pg-in { clip-path: polygon(0 0, 100% 0, 100% 100%, calc(var(--cut) - 1px) 100%, 0 calc(100% - var(--cut) + 1px)); }
  .pg-in::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--burgundy); transform: scaleX(0); transform-origin: left; transition: transform .7s cubic-bezier(.76,0,.24,1); z-index: 2; }
  .pg-card:hover .pg-in::before, .pg-card:focus-within .pg-in::before { transform: scaleX(1); }
  .pg-card-body { flex: 1; display: flex; flex-direction: column; padding: var(--space-lg) var(--space-lg) var(--space-md); min-width: 0; }
  .pg-card-head { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); }
  .pg-card-count { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; color: var(--grey-metal); }
  .pg-card-bar { width: 24px; height: 2px; background: var(--burgundy); display: inline-block; }
  .pg-card-title { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.375rem, 2.4vw, 1.875rem); line-height: 1.12; font-weight: 650; letter-spacing: -0.02em; color: var(--ink); margin-bottom: var(--space-xs); max-width: 18ch; }
  .pg-card-desc { font-size: 0.9375rem; color: var(--body); line-height: 1.55; margin-bottom: var(--space-md); max-width: 52ch; }
  .pg-panel { position: relative; height: 248px; flex-shrink: 0; background: var(--surface-alt); border: 1px solid var(--grey-cloud); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-md); }
  .pg-panel-grid {
    position: absolute; inset: 0; opacity: 0.7;
    background-image:
      repeating-linear-gradient(var(--grey-cloud) 0, var(--grey-cloud) 1px, transparent 1px, transparent 8px),
      repeating-linear-gradient(90deg, var(--grey-cloud) 0, var(--grey-cloud) 1px, transparent 1px, transparent 8px);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 45%, white 20%, transparent 100%);
            mask-image: radial-gradient(ellipse 80% 80% at 50% 45%, white 20%, transparent 100%);
  }
  .pg-panel-row { position: relative; width: 100%; display: flex; align-items: center; justify-content: space-evenly; gap: var(--space-xs); padding: 0 var(--space-sm) var(--space-sm); }
  .pg-picto { width: calc(var(--px) * 1px); height: calc(var(--px) * 1px); color: var(--grey-metal); transition: color .4s ease, transform .7s cubic-bezier(.16,1,.3,1); }
  .pg-card:hover .pg-picto { color: var(--burgundy); transform: translate(2px, -2px) scale(1.04); }
  .pg-card:hover .pg-picto:nth-child(2) { transition-delay: 60ms; }
  .pg-card:hover .pg-picto:nth-child(3) { transition-delay: 120ms; }
  .pg-crop { position: absolute; width: 12px; height: 12px; border-color: var(--grey-metal); border-style: solid; opacity: .5; }
  .pg-crop--tl { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
  .pg-crop--br { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
  .pg-dim { position: absolute; left: 16px; right: 16px; bottom: 16px; height: 8px; }
  .pg-dim i { position: absolute; left: 0; right: 0; top: 3px; height: 1px; background: var(--grey-metal); opacity: .4; }
  .pg-dim b { position: absolute; top: 0; width: 1px; height: 8px; background: var(--grey-metal); opacity: .5; }
  .pg-dim b:first-of-type { left: 0; } .pg-dim b:last-of-type { right: 0; }
  .pg-tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-xs); }
  .pg-parts { list-style: none; margin: 0; padding: 0; }
  .pg-part { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) 0; border-bottom: 1px solid var(--grey-cloud); font-size: 0.9375rem; color: var(--body); min-width: 0; text-decoration: none; transition: color .2s ease, padding-left .2s ease; }
  .pg-parts li:last-child .pg-part { border-bottom: none; }
  .pg-part:hover, .pg-part:focus-visible { color: var(--burgundy); padding-left: 4px; }
  .pg-part:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
  .pg-part-name { flex: 1; min-width: 0; }
  .pg-part-go { flex-shrink: 0; opacity: 0; transform: translate(-4px, 4px); transition: opacity .2s ease, transform .2s ease; }
  .pg-part:hover .pg-part-go, .pg-part:focus-visible .pg-part-go { opacity: 1; transform: translate(0, 0); }
  @media (hover: none) { .pg-part-go { opacity: .5; transform: none; } }
  .pg-part-dot { display: inline-block; flex-shrink: 0; position: relative; }
  .pg-part-dot::after { content: ""; position: absolute; left: 7px; top: 7px; width: 6px; height: 6px; background: var(--grey-warm); transform: rotate(45deg); }
  .pg-cta-row { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-md); }
  .pg-card-foot { border-top: 1px solid var(--grey-cloud); padding: var(--space-xs) var(--space-lg); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); background: var(--canvas); }
  .pg-card--alt .pg-card-foot { padding-left: calc(var(--space-lg) + var(--cut)); }
  .pg-foot-btn, .pg-foot-link { display: inline-flex; align-items: center; gap: var(--space-xs); background: none; border: none; cursor: pointer; font-size: 0.8125rem; color: var(--burgundy); font-weight: 600; padding: var(--space-xs) 0; text-decoration: none; }
  .pg-foot-link svg { transition: transform .2s ease; }
  .pg-foot-link:hover svg { transform: translate(2px, -2px); }
  .pg-foot-btn:focus-visible, .pg-foot-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
  .pg-paths { display: grid; grid-template-columns: minmax(0, 1fr); margin-top: var(--space-xl); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); overflow: hidden; }
  .pg-path { padding: var(--space-lg); display: flex; flex-direction: column; align-items: flex-start; }
  .pg-path--a { background: var(--surface); border-bottom: 1px solid var(--grey-warm); }
  .pg-path--b { background: var(--burgundy); }
  .pg-path-kicker { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; margin-bottom: var(--space-sm); }
  .pg-path-text { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 650; line-height: 1.2; margin-bottom: var(--space-md); flex: 1; }
  .pg-path .btn svg { margin-left: var(--space-xs); transition: transform .2s ease; }
  .pg-path .btn:hover svg { transform: translate(2px, -2px); }

  @media (min-width: 640px) { .pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 639px) { .pg-picto { width: calc(var(--px) * 0.6px); height: calc(var(--px) * 0.6px); } .pg-card { --cut: 24px; } .pg-card-body { padding: var(--space-md); } .pg-card-foot { padding: var(--space-xs) var(--space-md); } .pg-card--alt .pg-card-foot { padding-left: calc(var(--space-md) + var(--cut)); } .pg-panel { height: 184px; } }
  @media (min-width: 1024px) {
    .pg-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--space-md); }
    .pg-card { grid-column: span var(--span); }
    .pg-card--alt { margin-top: var(--space-lg); }
    .pg-paths { grid-template-columns: 1fr 1fr; }
    .pg-path--a { border-bottom: none; border-right: 1px solid var(--grey-warm); clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%); }
    .pg-path--b { clip-path: polygon(24px 0, 100% 0, 100% 100%, 0 100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .pg-in::before, .pg-picto, .pg-part, .pg-part-go { transition: none; }
  }
`;

export default function ProductGroups() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpandedId(prev => {
      const next = prev === id ? null : id;
      if (next) {
        window.history.replaceState(null, '', `#products-${id}`);
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return next;
    });
  }, []);

  return (
    <section aria-label="Products" className="fold-sec pg-sec">
      <style>{CSS}</style>
      <FoldEdge />
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        <SectionHeader
          label="Products"
          heading="Parts for water coolers, display counters and deep freezers."
          lead="Moulded plastic and steel parts for every door, valve and vent — from a single component to a production line's worth."
          link={{ href: '/products', label: 'All products' }}
        />

        {/* TODO(client): machine filter (§13.S4) — hide until `machine` data is filled on all products */}
        {/* When data is complete, add segmented control: All · Water Coolers · Display Counters · Deep Freezers */}

        {/* Bento grid — §13.S4: 12 col, row 1 = 7+5, row 2 = 5+7 */}
        <div className="pg-grid">
          {productGroups.map((group, i) => (
            <GroupCard
              key={group.id}
              group={group}
              products={productsByGroup(group.id)}
              isExpanded={expandedId === group.id}
              onToggle={() => toggle(group.id)}
              useGlare={i < 2}
              span={[7, 5, 5, 7][i] ?? 6}
              alt={i % 2 === 1}
            />
          ))}
        </div>

        {/* Two-path block — §13.S4 (igus pattern) */}
        <div className="pg-paths">
          <div className="pg-path pg-path--a">
            <p className="pg-path-kicker" style={{ color: 'var(--muted)' }}>I need a catalogue part</p>
            <p className="pg-path-text" style={{ color: 'var(--ink)' }}>Browse by group, material or machine.</p>
            <Link href="/products" className="btn btn--secondary btn--md">Browse Products</Link>
          </div>
          <div className="pg-path pg-path--b">
            <p className="pg-path-kicker" style={{ color: 'var(--rose-pale)' }}>I need a custom part</p>
            {/* COPY: drafted */}
            <p className="pg-path-text" style={{ color: 'white' }}>Share a sample, drawing or photo — we&apos;ll develop and supply it.</p>
            <Link href="/enquiry" className="btn btn--on-burgundy btn--md">Enquire <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
