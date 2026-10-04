/**
 * NavMegaPanel — §9.3 / §8.1
 * Solid --surface (never glass). 4 group columns + feature tile.
 * Accessibility: aria-expanded/aria-controls on the trigger, Esc, arrow keys.
 *
 * Hover reachability: the panel is wrapped in a zone that includes a transparent
 * bridge reaching up to the pill, and Header shares one 150ms close delay between
 * trigger and panel — so the pointer can travel from trigger to panel freely.
 */

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import ProductText from '@/components/runtime/ProductText';
import Pictogram from '@/components/brand/Pictogram';
import { productGroups, products } from '@/content/products';
import { useHiddenProductSlugs } from '@/components/runtime/useRuntime';

interface NavMegaPanelProps {
  /** id referenced by the trigger's aria-controls */
  id: string;
  isOpen: boolean;
  onClose: () => void;
  triggerId: string;
  /** Distance from viewport top — sits 8px under the nav */
  top?: number;
  /** Height (px) of the transparent hover bridge between the pill and the panel */
  bridge?: number;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export default function NavMegaPanel({
  id,
  isOpen,
  onClose,
  triggerId,
  top = 88,
  bridge = 24,
  onPointerEnter,
  onPointerLeave,
}: NavMegaPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hidden = useHiddenProductSlugs();

  /* Close on Esc, return focus to the trigger */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        document.getElementById(triggerId)?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, triggerId]);

  /* Arrow key navigation between links while focus is inside the panel */
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const handleKey = (e: KeyboardEvent) => {
      if (!panel.contains(document.activeElement)) return;
      const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>('a'));
      const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && idx < links.length - 1) {
        e.preventDefault();
        links[idx + 1]?.focus();
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && idx > 0) {
        e.preventDefault();
        links[idx - 1]?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="mega"
      data-mega-zone=""
      data-lenis-prevent
      style={{ top }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <style>{MEGA_CSS}</style>
      {/* Transparent hover bridge: keeps the panel open while the pointer
          crosses the gap between the pill and the panel. */}
      <div className="mega__bridge" style={{ height: bridge, top: -bridge }} aria-hidden="true" />

      <div ref={panelRef} role="region" aria-label="Products navigation" className="mega__panel">
        {/* 4 product group columns */}
        {productGroups.map(group => {
          /* Derive the group's products by their anchorParts slugs */
          const groupProducts = group.anchorParts
            .map(slug => products.find(p => p.slug === slug))
            .filter((p): p is NonNullable<typeof p> => p !== undefined && !hidden.has(p.slug));

          return (
            <div key={group.id} className="mega__col">
              <div className="mega__kicker">
                {groupProducts.length} {groupProducts.length === 1 ? 'part' : 'parts'}
              </div>

              <Link href={`/products/${group.slug}`} className="mega__group" onClick={onClose}>
                {group.name}
              </Link>

              <ul className="mega__list">
                {groupProducts.slice(0, 5).map(product => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${group.slug}/${product.slug}`}
                      className="mega__part"
                      onClick={onClose}
                    >
                      <Pictogram
                        name={product.slug as Parameters<typeof Pictogram>[0]['name']}
                        size={24}
                        className="mega__picto"
                      />
                      <span><ProductText slug={product.slug} field="name" fallback={product.name} /></span>
                      <ArrowUpRight weight="light" size={14} aria-hidden="true" className="mega__arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Feature tile — right column */}
        <div className="mega__tile">
          <div>
            <div className="mega__tile-kicker">Custom requirement?</div>
            <p className="mega__tile-title">Need a part made to your requirement?</p>
            <p className="mega__tile-body">
              Share a sample, drawing or photo and we&apos;ll develop and supply it.
            </p>
          </div>
          <Link href="/enquiry" className="mega__tile-cta" onClick={onClose}>
            Enquire
            <ArrowUpRight weight="light" size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Rail: the way in to the full range (also the keyboard / no-hover route) */}
        <div className="mega__rail">
          <Link href="/products" className="mega__rail-link" onClick={onClose}>
            Browse the full range
            <ArrowUpRight weight="light" size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const MEGA_CSS = `
.mega { position: fixed; left: 50%; translate: -50% 0; z-index: 48;
  width: min(1200px, calc(100vw - 48px)); }
.mega__bridge { position: absolute; left: 0; right: 0; background: transparent; }
.mega__panel { position: relative; display: grid; grid-template-columns: repeat(4, 1fr) 280px;
  background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card);
  box-shadow: inset 0 1px 0 var(--surface), 0 8px 40px rgba(30,17,21,0.10);
  max-height: calc(100svh - 120px); overflow-y: auto;
  animation: mega-in 400ms cubic-bezier(.16,1,.3,1) both; }
@keyframes mega-in { from { opacity: 0; clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); }
  to { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
.mega__col { padding: var(--space-lg) var(--space-lg) var(--space-md); border-right: 1px solid var(--grey-warm); }
.mega__kicker { display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-xs);
  font-size: .75rem; text-transform: uppercase; letter-spacing: .16em; font-weight: 600; color: var(--muted); }
.mega__group { display: block; margin-bottom: var(--space-sm); color: var(--ink); text-decoration: none;
  font: 600 1rem/1.3 var(--font-archivo, sans-serif); }
.mega__group:hover, .mega__group:focus-visible { color: var(--burgundy); }
.mega__list { list-style: none; margin: 0; padding: 0; }
.mega__part { display: flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--body);
  font-size: .875rem; text-decoration: none; border-bottom: 1px solid var(--grey-cloud);
  transition: color 200ms cubic-bezier(.16,1,.3,1); }
.mega__picto { width: 16px; height: 16px; flex-shrink: 0; color: var(--muted); transition: color 200ms cubic-bezier(.16,1,.3,1); }
.mega__arrow { margin-left: auto; opacity: 0; transform: translate3d(-2px, 2px, 0);
  transition: opacity 200ms cubic-bezier(.16,1,.3,1), transform 200ms cubic-bezier(.16,1,.3,1); }
.mega__part:hover, .mega__part:focus-visible { color: var(--burgundy); }
.mega__part:hover .mega__picto, .mega__part:focus-visible .mega__picto { color: var(--burgundy); }
.mega__part:hover .mega__arrow, .mega__part:focus-visible .mega__arrow { opacity: 1; transform: translate3d(0,0,0); }
.mega__tile { grid-row: 1 / span 2; grid-column: 5; background: var(--burgundy); padding: var(--space-lg);
  display: flex; flex-direction: column; justify-content: space-between; }
.mega__tile-kicker { margin-bottom: var(--space-sm); color: var(--rose-pale); font-size: .75rem;
  text-transform: uppercase; letter-spacing: .16em; font-weight: 600; }
.mega__tile-title { margin: 0 0 var(--space-sm); color: var(--surface); font: 600 1rem/1.4 var(--font-archivo, sans-serif); }
.mega__tile-body { margin: 0; color: var(--rose-pale); font-size: .875rem; line-height: 1.5; }
.mega__tile-cta { display: inline-flex; align-items: center; gap: 8px; width: fit-content;
  margin-top: var(--space-md); padding: 8px var(--space-sm); border-radius: var(--radius-card);
  background: var(--surface); color: var(--burgundy); font-size: .875rem; font-weight: 600; text-decoration: none; }
.mega__tile-cta:hover, .mega__tile-cta:focus-visible { background: var(--blush); }
.mega__rail { grid-column: 1 / span 4; border-top: 1px solid var(--grey-warm); background: var(--canvas);
  padding: var(--space-xs) var(--space-lg); }
.mega__rail-link { display: inline-flex; align-items: center; gap: 4px; padding: 8px 0; color: var(--burgundy);
  font-size: .875rem; font-weight: 600; text-decoration: none; }
.mega__rail-link:hover, .mega__rail-link:focus-visible { color: var(--burgundy-bright); }
.mega a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
@media (max-width: 1179px) { .mega__col { padding: var(--space-md); } .mega__tile { padding: var(--space-md); }
  .mega__panel { grid-template-columns: repeat(4, 1fr) 224px; } }
@media (prefers-reduced-motion: reduce) { .mega__panel { animation: none; } .mega__arrow { transition: none; } }
`;
