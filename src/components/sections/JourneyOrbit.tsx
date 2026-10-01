/**
 * S7 · JourneyOrbit — §13 (the emotional peak)
 * bg: --canvas
 *
 * Desktop ≥1024px (motion allowed): rising arc with 6 markers; the section pins
 * for (markers - 1) × 55vh (~275vh of scroll) and scroll drives the active marker.
 * Mobile / tablet / reduced-motion: NO pin — a static vertical timeline with all
 * six markers visible.
 *
 * Layout switching is pure CSS (media queries) so there is no hydration flash, and
 * the ScrollTrigger is created inside gsap.matchMedia with the same query so it is
 * fully reverted (no leftover pin-spacer) whenever the query stops matching.
 * "The Future" marker is drawn dashed (isFuture).
 */

'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/motion';
import { useMaskRise } from '@/hooks/useMotion';
import { journeyMarkers } from '@/content/journey';

gsap.registerPlugin(ScrollTrigger);

const PIN_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
/* Scroll distance per marker transition, in viewport heights. 5 × 0.55 = 2.75vh. */
const VH_PER_STEP = 0.55;

/* Marker positions on a rising arc. ViewBox "0 0 760 420" */
const MARKER_POSITIONS = [
  { x: 60,  y: 360 },
  { x: 170, y: 310 },
  { x: 300, y: 245 },
  { x: 430, y: 195 },
  { x: 560, y: 160 },
  { x: 690, y: 130 },
] as const;

const ARC_PATH =
  'M 60 360 C 110 345 130 325 170 310 ' +
  'C 220 292 260 258 300 245 ' +
  'C 350 230 390 208 430 195 ' +
  'C 480 180 520 168 560 160 ' +
  'C 615 150 645 138 690 130';

const CSS = `
.jrn-pinned{display:none}
.jrn-static{display:block}
@media ${PIN_QUERY}{
  .jrn-pinned{display:block}
  .jrn-static{display:none}
  .jrn-section{padding-top:var(--space-xl);padding-bottom:var(--space-xl)}
}
`;

export default function JourneyOrbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useMaskRise(headingRef);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    const steps = journeyMarkers.length;
    const mm = gsap.matchMedia();

    mm.add(PIN_QUERY, () => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round((steps - 1) * VH_PER_STEP * window.innerHeight)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          setActiveIndex(Math.round(self.progress * (steps - 1)));
        },
      });
      return () => {
        st.kill();
        setActiveIndex(0);
      };
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="jrn-section"
      aria-labelledby="journey-heading"
      style={{
        background: 'var(--canvas)',
        padding: 'var(--section-y) var(--grid-page-padding)',
        overflow: 'hidden',
      }}
    >
      <style>{CSS}</style>
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', fontWeight: 600 }}>
              05 — Our Journey
            </span>
          </div>
          <h2
            id="journey-heading"
            ref={headingRef}
            style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: '"wdth" 125',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 650,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            Built on Manufacturing. Grown on Trust.
          </h2>
        </div>

        <div className="jrn-pinned"><RadialArc activeIndex={activeIndex} /></div>
        <div className="jrn-static"><VerticalTimeline /></div>
      </div>
    </section>
  );
}

/* ── Arc (desktop, pinned) ───────────────────────────────────── */
function RadialArc({ activeIndex }: { activeIndex: number }) {
  const m = journeyMarkers[activeIndex];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-lg)', alignItems: 'center' }}>
      <div style={{ position: 'relative', minWidth: 0 }}>
        <svg
          viewBox="0 0 760 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', maxHeight: 'calc(100svh - 360px)', minHeight: 240, display: 'block' }}
          aria-hidden="true"
        >
          <defs>
            <pattern id="jrn-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="var(--grey-metal)" strokeWidth="0.5" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="760" height="420" fill="url(#jrn-grid)" opacity="0.12" />

          <path d={ARC_PATH} stroke="var(--grey-warm)" strokeWidth="1.5" strokeLinecap="round" />

          {MARKER_POSITIONS.slice(0, activeIndex + 1).map((pos, i) => {
            if (i === 0) return null;
            const prev = MARKER_POSITIONS[i - 1];
            return (
              <line key={i} x1={prev.x} y1={prev.y} x2={pos.x} y2={pos.y}
                stroke="var(--burgundy)" strokeWidth="2" strokeLinecap="round" />
            );
          })}

          {MARKER_POSITIONS.map((pos, i) => {
            const isActive = i === activeIndex;
            const isFuture = journeyMarkers[i].isFuture;
            return (
              <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r={isActive ? 10 : 6}
                  fill={isActive ? 'var(--burgundy)' : 'var(--surface)'}
                  stroke={isFuture ? 'var(--grey-metal)' : 'var(--grey-warm)'}
                  strokeWidth={isFuture ? 1 : 1.5}
                  strokeDasharray={isFuture ? '3 2' : 'none'}
                  style={{ transition: 'all 0.4s ease' }}
                />
                <text
                  y={28}
                  textAnchor="middle"
                  fill={isActive ? 'var(--burgundy)' : 'var(--grey-metal)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight={isActive ? 600 : 400}
                  style={{ transition: 'fill 0.4s ease' }}
                >
                  {journeyMarkers[i].year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        key={activeIndex}
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xs)',
          padding: 'var(--space-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--grey-warm)',
          borderRadius: 'var(--radius-card)',
          minHeight: 280,
        }}
      >
        <p style={{
          fontFamily: 'var(--font-archivo)',
          fontVariationSettings: '"wdth" 125',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 650,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'var(--metal-gradient)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}>
          {m.year}
        </p>
        <p style={{
          fontFamily: 'var(--font-archivo)',
          fontVariationSettings: '"wdth" 125',
          fontSize: '1.1rem',
          fontWeight: 650,
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
        }}>
          {m.title}
        </p>
        <p style={{ fontSize: '0.9375rem', color: 'var(--body)', lineHeight: 1.65 }}>
          {m.line}
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 'var(--space-sm)' }}>
          {journeyMarkers.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 'var(--radius-card)',
                background: i === activeIndex ? 'var(--burgundy)' : 'var(--grey-warm)',
                transition: 'all 0.3s ease',
                display: 'inline-block',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Vertical timeline (mobile / tablet / reduced-motion) — fully static ── */
function VerticalTimeline() {
  return (
    <ol style={{ position: 'relative', listStyle: 'none', margin: 0, padding: '0 0 0 var(--space-lg)' }}>
      <li aria-hidden="true" style={{
        position: 'absolute', left: 12, top: 4, bottom: 4, width: 1, background: 'var(--grey-warm)',
      }} />
      {journeyMarkers.map((marker, i) => (
        <li
          key={marker.year}
          style={{
            position: 'relative',
            paddingBottom: i < journeyMarkers.length - 1 ? 'var(--space-lg)' : 0,
          }}
        >
          <span aria-hidden="true" style={{
            position: 'absolute',
            left: -34,
            top: 4,
            width: 10,
            height: 10,
            borderRadius: 'var(--radius-card)',
            background: marker.isFuture ? 'var(--surface)' : 'var(--burgundy)',
            border: `1px ${marker.isFuture ? 'dashed' : 'solid'} ${marker.isFuture ? 'var(--grey-metal)' : 'var(--burgundy)'}`,
          }} />
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--burgundy)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 4,
          }}>
            {marker.year}
          </p>
          <p style={{
            fontFamily: 'var(--font-archivo)',
            fontVariationSettings: '"wdth" 125',
            fontSize: '1rem',
            fontWeight: 650,
            color: 'var(--ink)',
            marginBottom: 8,
          }}>
            {marker.title}
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--body)', lineHeight: 1.6, maxWidth: '55ch' }}>
            {marker.line}
          </p>
        </li>
      ))}
    </ol>
  );
}
