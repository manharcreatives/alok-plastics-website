/**
 * MapLoader: click-to-load Google Map (§8.2). No third-party request is made
 * until the visitor presses "Load map". An iframe is only offered when
 * site.contact.mapsUrl is an embeddable URL; otherwise the panel links out.
 * The idle panel is a small drawing sheet (grid + register marks), not a grey box.
 */
'use client';

import { useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { MAPS_ARIA_LABEL } from '@/content/site';

interface Props {
  embedUrl: string | null;   // embeddable URL (only when client supplied one)
  openUrl: string;           // plain "open in Google Maps" link
  title: string;
  addressLines?: string[];
}

const CSS = `
.map-panel { position: relative; overflow: hidden; background: var(--surface); border: 1px solid var(--grey-metal); min-height: 360px; display: flex; align-items: center; justify-content: center; padding: var(--space-lg) var(--space-md); }
.map-panel::before { content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--grey-metal) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--grey-metal) 8%, transparent) 1px, transparent 1px);
  background-size: 24px 24px; -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, var(--ink), transparent); mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, var(--ink), transparent); }
.map-panel iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.map-inner { position: relative; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); text-align: center; max-width: 40ch; }
.map-pin { width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center; background: var(--burgundy); color: var(--surface); clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%); }
.map-addr { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-weight: 650; font-size: 1.125rem; line-height: 1.35; color: var(--ink); margin: 0; }
.map-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; font-size: 0.9375rem; text-decoration: none; cursor: pointer; font-family: inherit; transition: background-color 200ms cubic-bezier(.16,1,.3,1); }
.map-btn--primary { background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); }
.map-btn--primary:hover { background: var(--burgundy-deep); }
.map-btn svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.map-btn:hover svg { transform: translate3d(2px, -2px, 0); }
.map-btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .map-btn svg { transition: none; } }
`;

export default function MapLoader({ embedUrl, openUrl, title, addressLines }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <style>{CSS}</style>
      <div className="map-panel">
        {loaded && embedUrl ? (
          <iframe src={embedUrl} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        ) : (
          <div className="map-inner">
            <span className="map-pin" aria-hidden="true"><MapPin size={28} weight="light" /></span>
            {addressLines && addressLines.length > 0 && <p className="map-addr">{addressLines.join(', ')}</p>}
            <p style={{ color: 'var(--body)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
              {embedUrl
                ? 'The map loads from Google only when you choose to show it.'
                : 'Find our location on Google Maps.'}
            </p>
            {embedUrl ? (
              <button type="button" className="map-btn map-btn--primary" onClick={() => setLoaded(true)}>
                Load map
              </button>
            ) : (
              <a className="map-btn map-btn--primary" href={openUrl} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
                Open in Google Maps <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
      {embedUrl && (
        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem' }}>
          <a href={openUrl} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL} style={{ color: 'var(--burgundy)', display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 44 }}>
            Open in Google Maps <ArrowUpRight size={18} weight="light" aria-hidden="true" />
          </a>
        </p>
      )}
    </div>
  );
}
