/**
 * MapLoader: the map is already loaded inside the box (§8.2).
 * Double-click / double-tap (or the Expand button) opens it large on screen, where it can be
 * panned and zoomed freely; "Open in Google Maps" there goes to the exact location.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { ArrowsOutSimple } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { MAPS_ARIA_LABEL } from '@/content/site';

interface Props {
  embedUrl: string | null;
  openUrl: string;
  title: string;
  addressLines?: string[];
}

const CSS = `
.map-panel { position: relative; overflow: hidden; background: var(--surface); border: 1px solid var(--grey-metal); min-height: 400px; display: flex; align-items: center; justify-content: center; padding: 0; border-radius: var(--radius-card); }
.map-panel--idle { padding: var(--space-lg) var(--space-md); }
.map-panel--idle::before { content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--grey-metal) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--grey-metal) 8%, transparent) 1px, transparent 1px);
  background-size: 24px 24px; -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, var(--ink), transparent); mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, var(--ink), transparent); }
.map-panel iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
.map-hit { position: absolute; inset: 0; z-index: 1; background: transparent; cursor: zoom-in; border: 0; padding: 0; touch-action: manipulation; }
.map-expand { position: absolute; top: var(--space-xs); right: var(--space-xs); z-index: 2; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 var(--space-sm); background: var(--surface); color: var(--ink); border: 1px solid var(--grey-metal); border-radius: var(--radius-card); font: 600 0.8125rem/1 var(--font-inter), sans-serif; cursor: pointer; }
.map-expand:hover { border-color: var(--burgundy); color: var(--burgundy); }
.map-expand:focus-visible, .map-modal__x:focus-visible, .map-hit:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.map-modal { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; background: var(--surface); }
.map-modal__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--grey-metal); background: var(--surface); }
.map-modal__t { margin: 0; font-family: var(--font-archivo); font-weight: 650; font-size: 1rem; color: var(--ink); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.map-modal__acts { display: flex; align-items: center; gap: var(--space-xs); flex-shrink: 0; }
.map-modal__x { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: transparent; border: 1px solid var(--grey-metal); border-radius: var(--radius-card); color: var(--ink); cursor: pointer; }
.map-modal__frame { flex: 1; min-height: 0; border: 0; width: 100%; display: block; }
.map-dblclick-hint { position: absolute; z-index: 2; bottom: var(--space-sm); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.55); color: #fff; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; pointer-events: none; white-space: nowrap; opacity: 1; transition: opacity 2s ease 3s; }
.map-dblclick-hint.hide { opacity: 0; }
.map-inner { position: relative; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); text-align: center; max-width: 40ch; }
.map-pin { width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center; background: var(--burgundy); color: var(--surface); clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%); }
.map-addr { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-weight: 650; font-size: 1.125rem; line-height: 1.35; color: var(--ink); margin: 0; }
.map-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; font-size: 0.9375rem; text-decoration: none; cursor: pointer; font-family: inherit; transition: background-color 200ms cubic-bezier(.16,1,.3,1); }
.map-btn--primary { background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); }
.map-btn--primary:hover { background: var(--burgundy-deep); }
.map-btn svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.map-btn:hover svg { transform: translate3d(2px,-2px,0); }
.map-btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.map-open-link { margin-top: var(--space-xs); font-size: 0.875rem; }
.map-open-link a { color: var(--burgundy); display: inline-flex; align-items: center; gap: 4px; min-height: 44px; text-decoration: none; }
.map-open-link a:hover { text-decoration: underline; }
@media (prefers-reduced-motion: reduce) { .map-btn svg, .map-dblclick-hint { transition: none; } }
`;

export default function MapLoader({ embedUrl, openUrl, title, addressLines }: Props) {
  const [open, setOpen] = useState(false);
  const lastTap = useRef<number>(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const expand = useCallback(() => setOpen(true), []);

  /* Touch devices do not always fire dblclick, so double-tap is timed by hand. */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      e.preventDefault();
      lastTap.current = 0;
      setOpen(true);
    } else {
      lastTap.current = now;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!embedUrl) {
    return (
      <div>
        <style>{CSS}</style>
        <div className="map-panel map-panel--idle">
          <div className="map-inner">
            <span className="map-pin" aria-hidden="true"><MapPin size={28} weight="light" /></span>
            {addressLines && addressLines.length > 0 && <p className="map-addr">{addressLines.join(', ')}</p>}
            <a className="map-btn map-btn--primary" href={openUrl} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
              Open in Google Maps <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>
      <div className="map-panel">
        <iframe src={embedUrl} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        {/* The iframe swallows double-clicks, so a transparent layer sits on top and opens the large view. */}
        <button type="button" className="map-hit" onDoubleClick={expand} onTouchEnd={handleTouchEnd} onKeyDown={(e) => { if (e.key === 'Enter') expand(); }} aria-label="Double-click to enlarge the map" />
        <button type="button" className="map-expand" onClick={expand}>
          <ArrowsOutSimple size={16} weight="bold" aria-hidden="true" /> Expand map
        </button>
        <div className="map-dblclick-hint" aria-hidden="true">Double-click to enlarge</div>
      </div>
      <p className="map-open-link">
        <a href={openUrl} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
          Open in Google Maps <ArrowUpRight size={18} weight="light" aria-hidden="true" />
        </a>
      </p>
      {open && (
        <div className="map-modal" role="dialog" aria-modal="true" aria-label={title}>
          <div className="map-modal__bar">
            <p className="map-modal__t">{title}</p>
            <div className="map-modal__acts">
              <a className="map-btn map-btn--primary" href={openUrl} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
                Open in Google Maps <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </a>
              <button ref={closeRef} type="button" className="map-modal__x" onClick={() => setOpen(false)} aria-label="Close map"><X size={20} weight="bold" aria-hidden="true" /></button>
            </div>
          </div>
          <iframe className="map-modal__frame" src={embedUrl} title={`${title} (large)`} referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      )}
    </div>
  );
}
