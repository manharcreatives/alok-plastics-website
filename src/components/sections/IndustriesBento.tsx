/**
 * S6 · IndustriesBento — §13
 * bg: --surface
 * Asymmetric bento: 1 large core-market tile (--burgundy) + 7 industry tiles.
 * Application lines (client-sourced) always visible — no hover-only content.
 * Logo marquee: hidden until client supplies logos.
 */

'use client';

import { useRef } from 'react';
import Pictogram from '@/components/brand/Pictogram';
import SectionHeader from '@/components/ui/SectionHeader';
import { industriesConfig, coreMarket } from '@/content/industries';
import { useMaskRise } from '@/hooks/useMotion';

const MACHINES = [
  { name: 'Water Coolers', pictogram: 'water-cooler' },
  { name: 'Display Counters', pictogram: 'display-counter' },
  { name: 'Deep Freezers', pictogram: 'deep-freezer' },
] as const;

/* Industry tile — name, pictogram and the client-sourced application line (always visible) */
function IndustryTile({
  index,
  name,
  line,
  pictogram,
  className,
}: {
  index: number;
  name: string;
  line: string;
  pictogram: string;
  className: string;
}) {
  return (
    <article className={`ind-tile ${className}`}>
      <div className="ind-tile-top">
        <Pictogram
          name={pictogram as Parameters<typeof Pictogram>[0]['name']}
          size={32}
          style={{ color: 'var(--muted)' }}
        />
        <span aria-hidden="true" className="ind-tile-idx">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="ind-tile-name">{name}</h3>
      {line && <p className="ind-tile-line">{line}</p>}
    </article>
  );
}

export default function IndustriesBento() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  return (
    <section
      aria-labelledby="industries-heading"
      style={{ background: 'var(--surface)', padding: 'var(--section-y) var(--grid-page-padding)' }}
    >
      <style>{`
        .ind-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); margin-top: var(--space-xl); }
        .ind-core {
          background: var(--burgundy); border: 1px solid var(--burgundy-deep); border-radius: var(--radius-card);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.18); padding: var(--space-lg);
          display: flex; flex-direction: column; gap: var(--space-sm); min-width: 0;
        }
        .ind-core-kicker { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--rose-pale); font-weight: 600; }
        .ind-core-name { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.2rem, 2.2vw, 1.6rem); font-weight: 650; color: white; line-height: 1.2; letter-spacing: -0.02em; }
        .ind-core-desc { font-size: 0.9375rem; color: var(--rose-pale); line-height: 1.6; }
        .ind-machines { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-sm); margin-top: auto; padding-top: var(--space-md); border-top: 1px solid rgba(255,255,255,.2); }
        .ind-machine { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-xs); min-width: 0; }
        .ind-machine span { font-size: 0.75rem; color: var(--rose-pale); line-height: 1.3; }
        .ind-tile {
          background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.9); padding: var(--space-md);
          display: flex; flex-direction: column; gap: var(--space-xs); min-width: 0;
        }
        .ind-tile-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-xs); }
        .ind-tile-idx { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--burgundy); font-weight: 600; letter-spacing: 0.1em; }
        .ind-tile-name { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1rem; font-weight: 650; color: var(--ink); letter-spacing: -0.01em; line-height: 1.25; }
        .ind-tile-line { font-size: 0.875rem; color: var(--body); line-height: 1.5; }

        @media (min-width: 640px) {
          .ind-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .ind-core { grid-column: span 2; }
          .ind-tile--last { grid-column: span 2; }
        }
        @media (min-width: 1024px) {
          .ind-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-rows: 1fr; }
          .ind-core { grid-column: 1 / span 4; grid-row: span 2; }
          .ind-tile { grid-column: span 2; }
          .ind-tile--last { grid-column: span 4; }
        }
      `}</style>

      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        <SectionHeader
          label="Industries"
          labelNumber="04"
          heading="Built for the industries that build India."
        />

        <div className="ind-grid">
          {/* Core market — burgundy tile, 4 cols × 2 rows at desktop */}
          <div className="ind-core">
            <div className="ind-core-kicker">
              <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--rose-pale)', display: 'inline-block' }} />
              Core Market
            </div>
            <p className="ind-core-name">{coreMarket.name}</p>
            <p className="ind-core-desc">{coreMarket.description}</p>
            <div className="ind-machines">
              {MACHINES.map(m => (
                <div key={m.name} className="ind-machine">
                  <Pictogram name={m.pictogram} size={32} style={{ color: 'var(--rose-pale)' }} />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {industriesConfig.industries.map((industry, i, all) => (
            <IndustryTile
              key={industry.id}
              index={i}
              name={industry.name}
              line={industry.line}
              pictogram={industry.pictogram}
              className={i === all.length - 1 ? 'ind-tile--last' : ''}
            />
          ))}
        </div>

        {/* Logo marquee — hidden until logos exist */}
        {industriesConfig.logos.length > 0 && (
          <div style={{
            marginTop: 'var(--space-xl)',
            borderTop: '1px solid var(--grey-cloud)',
            paddingTop: 'var(--space-xl)',
          }}>
            {/* TODO: logo marquee */}
          </div>
        )}
      </div>
    </section>
  );
}
