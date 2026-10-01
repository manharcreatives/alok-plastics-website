/**
 * S8 · PanIndiaMap — §13
 * bg: --surface-alt
 * Dot-matrix schematic of India (see indiaDots.ts). Chandigarh (verified origin)
 * pulses; dispatch arcs radiate to generic directions only — no city names, no
 * claimed coverage beyond the verified "Pan Bharat delivery network".
 * Legend is HTML (never clipped); the only in-SVG label is "Chandigarh".
 * Reduced-motion: pulse / arc animation disabled via CSS media query.
 */

'use client';

import { useRef } from 'react';
import { useMaskRise } from '@/hooks/useMotion';
import { site } from '@/content/site';
import { INDIA_DOTS_PATH, MAP_W, MAP_H, project } from './indiaDots';

const ORIGIN = project(76.78, 30.73); // Chandigarh

/* Generic directions (no place names): lon/lat chosen to sit inside the dot field */
const DESTINATIONS = [
  project(71.5, 22.6),  // west
  project(78.0, 21.0),  // central
  project(77.5, 11.0),  // south
  project(80.5, 14.5),  // south-east coast
  project(85.5, 22.5),  // east
  project(93.0, 26.2),  // north-east
  project(75.0, 18.0),  // west-south
];

const arc = (to: { x: number; y: number }) => {
  const mx = (ORIGIN.x + to.x) / 2;
  const my = (ORIGIN.y + to.y) / 2;
  const dx = to.x - ORIGIN.x;
  /* bow the curve sideways, away from straight line */
  const cx = mx + (dx >= 0 ? -22 : 22);
  const cy = my - 14;
  return `M ${ORIGIN.x.toFixed(1)} ${ORIGIN.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
};

const CSS = `
@media (prefers-reduced-motion: no-preference){
  .pim-pulse{transform-box:fill-box;transform-origin:center;animation:pim-pulse 2.4s ease-out infinite}
  .pim-arc{animation:pim-dash 2.4s linear infinite}
}
@keyframes pim-pulse{0%{transform:scale(.5);opacity:.5}100%{transform:scale(2.6);opacity:0}}
@keyframes pim-dash{to{stroke-dashoffset:-16}}
`;

export default function PanIndiaMap() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  return (
    <section
      aria-labelledby="map-heading"
      style={{ background: 'var(--surface-alt)', padding: 'var(--section-y) var(--grid-page-padding)', overflow: 'hidden' }}
    >
      <style>{CSS}</style>
      <div style={{
        maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'var(--space-xl)',
        alignItems: 'center',
      }}>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', fontWeight: 600 }}>
              06 — Pan Bharat
            </span>
          </div>

          <h2
            id="map-heading"
            ref={headingRef}
            style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: '"wdth" 125',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 650,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              marginBottom: 'var(--space-md)',
            }}
          >
            Dispatched from Chandigarh.{' '}
            <span style={{
              background: 'var(--metal-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}>
              Delivered across India.
            </span>
          </h2>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--body)',
            lineHeight: 1.65,
            maxWidth: '48ch',
            marginBottom: 'var(--space-lg)',
          }}>
            {/* COPY: drafted from verified facts (Chandigarh base; Pan Bharat delivery network) — needs client approval */}
            Alok Plastics manufactures in {site.contact.city} and delivers through a Pan Bharat delivery network.
          </p>

          {/* Legend */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.9375rem', color: 'var(--ink)', fontWeight: 500 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="8" fill="none" stroke="var(--burgundy)" strokeWidth="1" opacity="0.4" />
                <circle cx="10" cy="10" r="4.5" fill="var(--burgundy)" />
              </svg>
              Origin — Chandigarh
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.9375rem', color: 'var(--ink)', fontWeight: 500 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M 2 14 Q 10 2 18 6" fill="none" stroke="var(--burgundy)" strokeWidth="1.25" strokeDasharray="3 3" />
                <circle cx="18" cy="6" r="2.5" fill="var(--surface)" stroke="var(--burgundy)" strokeWidth="1.25" />
              </svg>
              Pan Bharat delivery network
            </li>
          </ul>
        </div>

        <figure style={{ margin: 0, minWidth: 0, justifySelf: 'center', width: '100%', maxWidth: 480 }}>
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            role="img"
            aria-label="Schematic dot map of India showing Chandigarh as the origin of the Pan Bharat delivery network"
          >
            <path d={INDIA_DOTS_PATH} stroke="var(--grey-warm)" strokeWidth="4.5" strokeLinecap="round" />

            {DESTINATIONS.map((d, i) => (
              <g key={i}>
                <path d={arc(d)} className="pim-arc" stroke="var(--burgundy)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.55" />
                <circle cx={d.x} cy={d.y} r="4" fill="var(--surface)" stroke="var(--burgundy)" strokeWidth="1.5" />
              </g>
            ))}

            {/* Origin */}
            <circle className="pim-pulse" cx={ORIGIN.x} cy={ORIGIN.y} r="8" fill="none" stroke="var(--burgundy)" strokeWidth="1.25" />
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r="6" fill="var(--burgundy)" />

            {/* Label sits in the empty north-west of the frame, joined by a leader line */}
            <line x1={ORIGIN.x - 7} y1={ORIGIN.y - 5} x2="92" y2="84" stroke="var(--burgundy)" strokeWidth="1" opacity="0.6" />
            <text x="20" y="88" fontSize="12" fill="var(--burgundy)" fontFamily="var(--font-mono)" fontWeight="600">
              Chandigarh
            </text>
          </svg>
          <figcaption style={{ fontSize: '0.6875rem', color: 'var(--muted)', textAlign: 'center', marginTop: 'var(--space-xs)', fontStyle: 'italic' }}>
            Schematic representation. Not to scale; arcs show direction only.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
