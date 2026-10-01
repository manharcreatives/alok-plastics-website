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
import Pictogram, { pictogramPaths, type PictogramName } from '@/components/brand/Pictogram';
import SectionHeader from '@/components/ui/SectionHeader';
import Tag from '@/components/ui/Tag';
import { productGroups, productsByGroup } from '@/content/products';
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

/* Text-presentation arrow glyphs (U+FE0E prevents the blue emoji box) */
const ARROW_UP_RIGHT = '↗︎';
const ARROW_UP = '↑︎';
const ARROW_DOWN = '↓︎';

const hasPictogram = (slug: string): slug is PictogramName => slug in pictogramPaths;

/* ── Pictogram panel — honest placeholder until product photos exist ── */
function PictogramPanel({ slugs }: { slugs: PictogramName[] }) {
  const n = slugs.length;
  const px = n <= 1 ? 96 : n === 2 ? 80 : 64;
  return (
    <div aria-hidden="true" className="pg-panel">
      <div className="pg-panel-grid" />
      <div className="pg-panel-row">
        {slugs.map(slug => (
          <Pictogram
            key={slug}
            name={slug}
            size={48}
            strokeWidth={48 / px * 1.5}
            style={{ width: px, height: px, color: 'var(--muted)' }}
          />
        ))}
      </div>
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
  return <span aria-hidden="true" className="pg-part-dot" style={{ width: px, height: px }} />;
}

/* ── Group card ──────────────────────────────────────────────── */
function GroupCard({
  group,
  products,
  isExpanded,
  onToggle,
  useGlare: enableGlare,
  span,
}: {
  group: typeof productGroups[0];
  products: Product[];
  isExpanded: boolean;
  onToggle: () => void;
  useGlare: boolean;
  span: number;
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
      className="pg-card"
      style={{ ['--span' as string]: span }}
    >
      {enableGlare && (['tl', 'tr', 'bl', 'br'] as const).map(pos => {
        const t = pos.startsWith('t'), l = pos.endsWith('l');
        return (
          <span key={pos} aria-hidden="true" style={{
            position: 'absolute',
            [t ? 'top' : 'bottom']: 8, [l ? 'left' : 'right']: 8,
            width: 10, height: 10,
            borderTop: t ? '1px solid var(--grey-metal)' : 'none',
            borderBottom: !t ? '1px solid var(--grey-metal)' : 'none',
            borderLeft: l ? '1px solid var(--grey-metal)' : 'none',
            borderRight: !l ? '1px solid var(--grey-metal)' : 'none',
            opacity: 0.3, zIndex: 1,
          }} />
        );
      })}

      <div className="pg-card-body">
        <div className="pg-card-head">
          <span className="pg-card-id">{group.id}</span>
          <span aria-hidden="true" className="pg-card-bar" />
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
            <li key={product.slug} className="pg-part">
              <PartIcon slug={product.slug} px={20} />
              <span className="pg-part-name">{product.name}</span>
              {isExpanded && product.material && (
                <Tag material={product.material as Parameters<typeof Tag>[0]['material']} />
              )}
            </li>
          ))}
        </ul>

        {isExpanded && (
          <div className="pg-cta-row">
            <Link href={`/products/${group.slug}`} className="btn btn--secondary btn--sm">
              View group {ARROW_UP_RIGHT}
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
          {isExpanded ? `Collapse ${ARROW_UP}` : `All ${products.length} parts ${ARROW_DOWN}`}
        </button>
        <Link href={`/products/${group.slug}`} className="pg-foot-link">
          View parts {ARROW_UP_RIGHT}
        </Link>
      </div>
    </div>
  );
}

const CSS = `
  .pg-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); margin-top: var(--space-xl); align-items: stretch; }
  .pg-card {
    position: relative; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
    background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 3px rgba(30,17,21,.04);
  }
  .pg-card-body { flex: 1; display: flex; flex-direction: column; padding: var(--space-md); min-width: 0; }
  .pg-card-head { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-xs); }
  .pg-card-id { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--burgundy); font-weight: 600; letter-spacing: 0.1em; }
  .pg-card-bar { width: 24px; height: 2px; background: var(--burgundy); display: inline-block; }
  .pg-card-title { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.1rem, 2vw, 1.4rem); font-weight: 650; letter-spacing: -0.02em; color: var(--ink); margin-bottom: var(--space-xs); }
  .pg-card-desc { font-size: 0.875rem; color: var(--body); line-height: 1.5; margin-bottom: var(--space-sm); }
  .pg-panel { position: relative; height: 144px; flex-shrink: 0; background: var(--surface-alt); border: 1px solid var(--grey-cloud); border-radius: var(--radius-card); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-sm); }
  .pg-panel-grid {
    position: absolute; inset: 0; opacity: 0.6;
    background-image:
      repeating-linear-gradient(var(--grey-cloud) 0, transparent 1px, transparent 7px, transparent 8px),
      repeating-linear-gradient(90deg, var(--grey-cloud) 0, transparent 1px, transparent 7px, transparent 8px);
    background-size: 8px 8px;
  }
  .pg-panel-row { position: relative; width: 100%; display: flex; align-items: center; justify-content: space-evenly; gap: var(--space-xs); padding: 0 var(--space-sm); }
  .pg-tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-xs); }
  .pg-parts { list-style: none; margin: 0; padding: 0; }
  .pg-part { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) 0; border-bottom: 1px solid var(--grey-cloud); font-size: 0.875rem; color: var(--body); min-width: 0; }
  .pg-part:last-child { border-bottom: none; }
  .pg-part-name { flex: 1; min-width: 0; }
  .pg-part-dot { display: inline-block; flex-shrink: 0; position: relative; }
  .pg-part-dot::after { content: ""; position: absolute; left: 7px; top: 7px; width: 6px; height: 6px; background: var(--grey-warm); transform: rotate(45deg); }
  .pg-cta-row { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-md); }
  .pg-card-foot { border-top: 1px solid var(--grey-cloud); padding: var(--space-xs) var(--space-md); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
  .pg-foot-btn { background: none; border: none; cursor: pointer; font-size: 0.8125rem; color: var(--burgundy); font-weight: 600; padding: var(--space-xs) 0; }
  .pg-foot-link { font-size: 0.8125rem; color: var(--burgundy); text-decoration: none; font-weight: 600; }
  .pg-paths { display: grid; grid-template-columns: minmax(0, 1fr); margin-top: var(--space-xl); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); overflow: hidden; }
  .pg-path { padding: var(--space-lg); display: flex; flex-direction: column; align-items: flex-start; }
  .pg-path--a { background: var(--surface); border-bottom: 1px solid var(--grey-warm); }
  .pg-path--b { background: var(--burgundy); }
  .pg-path-kicker { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; margin-bottom: var(--space-sm); }
  .pg-path-text { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 650; line-height: 1.2; margin-bottom: var(--space-md); flex: 1; }

  @media (min-width: 640px) { .pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1024px) {
    .pg-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .pg-card { grid-column: span var(--span); }
    .pg-paths { grid-template-columns: 1fr 1fr; }
    .pg-path--a { border-bottom: none; border-right: 1px solid var(--grey-warm); clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%); }
    .pg-path--b { clip-path: polygon(20px 0, 100% 0, 100% 100%, 0 100%); }
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
    <section
      aria-labelledby="products-heading"
      style={{ background: 'var(--surface-alt)', padding: 'var(--section-y) var(--grid-page-padding)' }}
    >
      <style>{CSS}</style>
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        <SectionHeader
          label="Products"
          labelNumber="02"
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
            <Link href="/enquiry" className="btn btn--on-burgundy btn--md">Enquire {ARROW_UP_RIGHT}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
