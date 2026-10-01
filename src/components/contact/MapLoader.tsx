/**
 * MapLoader — click-to-load Google Map (§8.2). No third-party request is made
 * until the visitor presses "Load map". An iframe is only offered when
 * site.contact.mapsUrl is an embeddable URL; otherwise the panel links out.
 */
'use client';

import { useState } from 'react';

interface Props {
  embedUrl: string | null;   // embeddable URL (only when client supplied one)
  openUrl: string;           // plain "open in Google Maps" link
  title: string;
}

const ARROW_NE = '↗︎';

const CSS = `
.map-panel { background: var(--surface-alt); border: 1px solid var(--grey-cloud); border-radius: var(--radius-card); min-height: 280px; display: flex; align-items: center; justify-content: center; text-align: center; padding: var(--space-md); position: relative; overflow: hidden; }
.map-panel iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.map-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; font-size: 0.9375rem; text-decoration: none; cursor: pointer; font-family: inherit; }
.map-btn--primary { background: var(--burgundy); color: white; border: 1px solid var(--burgundy); }
.map-btn--ghost { background: var(--surface); color: var(--burgundy); border: 1px solid var(--burgundy); }
.map-btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
`;

export default function MapLoader({ embedUrl, openUrl, title }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <style>{CSS}</style>
      <div className="map-panel">
        {loaded && embedUrl ? (
          <iframe src={embedUrl} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)', maxWidth: '36ch' }}>
            <p style={{ color: 'var(--body)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {embedUrl
                ? 'The map loads from Google only when you choose to show it.'
                : 'Find our location on Google Maps.'}
            </p>
            {embedUrl ? (
              <button type="button" className="map-btn map-btn--primary" onClick={() => setLoaded(true)}>
                Load map
              </button>
            ) : (
              <a className="map-btn map-btn--primary" href={openUrl} target="_blank" rel="noopener noreferrer">
                Open in Google Maps <span aria-hidden="true">{ARROW_NE}</span>
              </a>
            )}
          </div>
        )}
      </div>
      {embedUrl && (
        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem' }}>
          <a href={openUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--burgundy)', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
            Open in Google Maps <span aria-hidden="true">{ARROW_NE}</span>
          </a>
        </p>
      )}
    </div>
  );
}
