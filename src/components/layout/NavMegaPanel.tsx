/**
 * NavMegaPanel — §9.3 / §8.1
 * Solid --surface (never glass). Five category columns in ONE row (water cooler, deep freezer &
 * display counter, commercial kitchen, caster wheel, on demand), each with a 4:3 image slot above the
 * title, followed by a bottom strip carrying "Browse the full range" and the custom-requirement CTA.
 *
 * Image slots: the existing artwork (pictogram on a burgundy-tint hatch) is the placeholder; the real
 * photo is layered over it with PhotoBg and simply fades in once the file exists (renders nothing on
 * error). Paths: /images/nav/*.webp — see docs/images/manifest.nav.json.
 *
 * Accessibility: aria-expanded/aria-controls on the chevron trigger, Esc, arrow keys.
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
import type { PictogramName } from '@/components/brand/Pictogram';
import PhotoBg from '@/components/ui/PhotoBg';
import { productGroups, productsByGroup, productPath } from '@/content/products';
import { useHiddenProductSlugs } from '@/components/runtime/useRuntime';

/** Image slot per product group (4:3). Files are generated later; the placeholder shows until then. */
const GROUP_IMAGE: Record<string, string> = {
  '01': '/images/nav/water-cooler.webp',
  '02': '/images/nav/deep-freezer-display-counter.webp',
  '03': '/images/nav/commercial-kitchen.webp',
  '04': '/images/nav/caster-wheel.webp',
  '05': '/images/nav/on-demand-custom.webp',
};

/** Placeholder artwork: an existing pictogram where one fits the category, otherwise the group number only. */
const GROUP_PICTOGRAM: Partial<Record<string, PictogramName>> = {
  '01': 'water-cooler',
  '02': 'deep-freezer',
  '03': 'gas-kitchen',
  '05': 'oem',
};

/** Max parts listed per column; the rest sit one click away on the category page. */
const PARTS_SHOWN = 5;

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
      const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>('a:not([tabindex="-1"])'));
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
      style={{ top, ['--mega-top' as string]: `${top}px` }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <style>{MEGA_CSS}</style>
      {/* Transparent hover bridge: keeps the panel open while the pointer
          crosses the gap between the pill and the panel. */}
      <div className="mega__bridge" style={{ height: bridge, top: -bridge }} aria-hidden="true" />

      <div ref={panelRef} role="region" aria-label="Products navigation" className="mega__panel">
        <div className="mega__cols">
          {productGroups.map(group => {
            const parts = productsByGroup(group.id).filter(p => !hidden.has(p.slug));
            const picto = GROUP_PICTOGRAM[group.id];
            const href = `/products/${group.slug}/`;
            const kicker = group.id === '05'
              ? 'Made to order'
              : parts.length > 0
                ? `${parts.length} ${parts.length === 1 ? 'part' : 'parts'}`
                : 'Ask for a quote';

            return (
              <div key={group.id} className="mega__col">
                {/* Image slot: artwork placeholder underneath, photo layered over it */}
                <Link href={href} className="mega__media" tabIndex={-1} aria-hidden="true" onClick={onClose}>
                  <span className="mega__art" aria-hidden="true">
                    {picto && <Pictogram name={picto} size={48} className="mega__art-icon" />}
                    <span className="mega__art-no">{group.id}</span>
                  </span>
                  <PhotoBg src={GROUP_IMAGE[group.id]} alt="" width={400} height={300} className="mega__photo" />
                </Link>

                <div className="mega__kicker">{kicker}</div>

                <Link href={href} className="mega__group" onClick={onClose}>
                  {group.name}
                </Link>

                {parts.length > 0 ? (
                  <ul className="mega__list">
                    {parts.slice(0, PARTS_SHOWN).map(product => (
                      <li key={product.slug}>
                        <Link href={productPath(product)} className="mega__part" onClick={onClose}>
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
                    {parts.length > PARTS_SHOWN && (
                      <li>
                        <Link href={href} className="mega__more" onClick={onClose}>
                          All {parts.length} parts
                          <ArrowUpRight weight="light" size={14} aria-hidden="true" />
                        </Link>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mega__blurb">{group.tagline}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom strip: the way in to the full range + the custom-requirement CTA (also the keyboard / no-hover route) */}
        <div className="mega__strip">
          <Link href="/products/" className="mega__rail-link" onClick={onClose}>
            Browse the full range
            <ArrowUpRight weight="light" size={16} aria-hidden="true" />
          </Link>
          <div className="mega__custom">
            <p className="mega__custom-text">
              <strong>Need a part made to your requirement?</strong>
              <span> Share a sample, drawing or photo and we&apos;ll develop and supply it.</span>
            </p>
            <Link href="/enquiry" className="mega__tile-cta" onClick={onClose}>
              Enquire
              <ArrowUpRight weight="light" size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const MEGA_CSS = `
.mega { position: fixed; left: 50%; translate: -50% 0; z-index: 48;
  width: min(var(--grid-max), calc(100% - 32px)); }
.mega__bridge { position: absolute; left: 0; right: 0; background: transparent; }
.mega__panel { position: relative; display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card);
  box-shadow: inset 0 1px 0 var(--surface), 0 8px 40px color-mix(in srgb, var(--ink) 10%, transparent);
  max-height: calc(100svh - var(--mega-top, 88px) - var(--space-sm)); overflow-y: auto; overscroll-behavior: contain;
  animation: mega-in 400ms cubic-bezier(.16,1,.3,1) both; }
@keyframes mega-in { from { opacity: 0; clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); }
  to { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
.mega__cols { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.mega__col { min-width: 0; padding: var(--space-md) var(--space-md) var(--space-sm); border-right: 1px solid var(--grey-warm); }
.mega__col:last-child { border-right: 0; }

/* image slot — 4:3, artwork placeholder under the photo */
.mega__media { position: relative; display: block; aspect-ratio: 4 / 3; overflow: hidden; margin-bottom: var(--space-sm);
  border-radius: var(--radius-card); border: 1px solid var(--grey-cloud); background: var(--blush); isolation: isolate; }
.mega__art { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background:
    repeating-linear-gradient(135deg, transparent 0 12px, color-mix(in srgb, var(--burgundy) 6%, transparent) 12px 13px),
    linear-gradient(160deg, var(--blush) 0%, var(--pink-soft) 100%); color: var(--burgundy); }
.mega__art-icon { width: 48px; height: 48px; opacity: .55; }
.mega__art-no { position: absolute; left: var(--space-xs); top: var(--space-xs); font: 600 .75rem/1 var(--font-archivo, sans-serif);
  letter-spacing: .16em; color: var(--burgundy-bright); }
.mega__photo { transition: transform 700ms cubic-bezier(.16,1,.3,1), opacity 600ms ease !important; }
.mega__col:hover .mega__photo, .mega__media:focus-visible .mega__photo { transform: scale(1.04); }

.mega__kicker { display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-xs);
  font-size: .75rem; text-transform: uppercase; letter-spacing: .16em; font-weight: 600; color: var(--muted); }
.mega__group { display: block; min-height: 2.6em; margin-bottom: var(--space-sm); color: var(--ink); text-decoration: none;
  font: 600 1rem/1.3 var(--font-archivo, sans-serif); }
.mega__group:hover, .mega__group:focus-visible { color: var(--burgundy); }
.mega__list { list-style: none; margin: 0; padding: 0; }
.mega__part { display: flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--body);
  font-size: .875rem; text-decoration: none; border-bottom: 1px solid var(--grey-cloud);
  transition: color 200ms cubic-bezier(.16,1,.3,1); }
.mega__part > span { min-width: 0; }
.mega__picto { width: 16px; height: 16px; flex-shrink: 0; color: var(--muted); transition: color 200ms cubic-bezier(.16,1,.3,1); }
.mega__arrow { margin-left: auto; flex-shrink: 0; opacity: 0; transform: translate3d(-2px, 2px, 0);
  transition: opacity 200ms cubic-bezier(.16,1,.3,1), transform 200ms cubic-bezier(.16,1,.3,1); }
.mega__part:hover, .mega__part:focus-visible { color: var(--burgundy); }
.mega__part:hover .mega__picto, .mega__part:focus-visible .mega__picto { color: var(--burgundy); }
.mega__part:hover .mega__arrow, .mega__part:focus-visible .mega__arrow { opacity: 1; transform: translate3d(0,0,0); }
.mega__more { display: inline-flex; align-items: center; gap: 4px; padding: 8px 0; color: var(--burgundy);
  font-size: .8125rem; font-weight: 600; text-decoration: none; }
.mega__more:hover, .mega__more:focus-visible { color: var(--burgundy-bright); }
.mega__blurb { margin: 0; color: var(--muted); font-size: .875rem; line-height: 1.5; }

/* bottom strip */
.mega__strip { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-xs) var(--space-md);
  border-top: 1px solid var(--grey-warm); background: var(--canvas); padding: var(--space-xs) var(--space-md); }
.mega__rail-link { display: inline-flex; align-items: center; gap: 4px; padding: 8px 0; color: var(--burgundy);
  font-size: .875rem; font-weight: 600; text-decoration: none; }
.mega__rail-link:hover, .mega__rail-link:focus-visible { color: var(--burgundy-bright); }
.mega__custom { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-xs) var(--space-sm); min-width: 0; }
.mega__custom-text { margin: 0; color: var(--body); font-size: .875rem; line-height: 1.4; }
.mega__custom-text strong { color: var(--ink); font-weight: 600; }
.mega__tile-cta { display: inline-flex; align-items: center; gap: 8px; width: fit-content;
  padding: 8px var(--space-sm); border-radius: var(--radius-card);
  background: var(--burgundy); color: var(--surface); font-size: .875rem; font-weight: 600; text-decoration: none;
  transition: background-color 200ms cubic-bezier(.16,1,.3,1); }
.mega__tile-cta:hover, .mega__tile-cta:focus-visible { background: var(--burgundy-deep); }
.mega a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
@media (max-width: 1279px) {
  .mega__col { padding: var(--space-sm) var(--space-sm) var(--space-xs); }
  .mega__strip { padding: var(--space-xs) var(--space-sm); }
  .mega__custom-text span { display: none; }
}
@media (prefers-reduced-motion: reduce) { .mega__panel { animation: none; } .mega__arrow, .mega__photo, .mega__part, .mega__picto { transition: none !important; }
  .mega__col:hover .mega__photo { transform: none; } }
`;
