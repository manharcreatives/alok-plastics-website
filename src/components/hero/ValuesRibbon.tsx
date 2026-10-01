/**
 * ValuesRibbon — §11.6
 * 56px band of brand values in a continuous marquee.
 * Separators: 45° diamond in --burgundy.
 * Pauses on hover/focus (WCAG 2.2.2).
 * Aria-hidden duplicate track for seamless loop.
 * Static (no transform animation) under prefers-reduced-motion.
 */

'use client';

import { useRef } from 'react';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

const VALUES = [
  'Since 1998',
  'Pan-Bharat Dispatch',
  'Moulded Plastic & Steel',
  'Water Cooler Parts',
  'Display Counter Parts',
  'Deep Freezer Parts',
  'Nylon · HDPE · PPCP · Brass',
  'Chandigarh Manufacturer',
  'OEM Supplier',
  'Repeat Customers 70%+',
];

/* Separator — 45° rotated square (diamond) in burgundy */
function Diamond() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        background: 'var(--burgundy)',
        transform: 'rotate(45deg)',
        flexShrink: 0,
        margin: '0 var(--space-md)',
      }}
    />
  );
}

/* One copy of the track */
function Track({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      aria-hidden={ariaHidden || undefined}
    >
      {VALUES.map((value, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--muted)',
            fontFamily: 'var(--font-archivo, sans-serif)',
            whiteSpace: 'nowrap',
          }}>
            {value}
          </span>
          <Diamond />
        </span>
      ))}
    </span>
  );
}

export default function ValuesRibbon() {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  return (
    <div
      style={{
        height: 56,
        background: 'var(--surface)',
        borderTop: '1px solid var(--grey-warm)',
        borderBottom: '1px solid var(--grey-warm)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
      aria-label="Brand values"
    >
      {reduced ? (
        /* Static under reduced-motion — just list the values */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: '0 var(--grid-page-padding)',
          overflow: 'hidden',
        }}>
          <Track />
        </div>
      ) : (
        /* Scrolling marquee */
        <div
          ref={ribbonRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            /* pause on hover or focus-within — WCAG 2.2.2 */
            animation: 'marquee-scroll 40s linear infinite',
          }}
          onMouseEnter={() => { if (ribbonRef.current) ribbonRef.current.style.animationPlayState = 'paused'; }}
          onMouseLeave={() => { if (ribbonRef.current) ribbonRef.current.style.animationPlayState = 'running'; }}
          onFocus={() => { if (ribbonRef.current) ribbonRef.current.style.animationPlayState = 'paused'; }}
          onBlur={() => { if (ribbonRef.current) ribbonRef.current.style.animationPlayState = 'running'; }}
        >
          <Track />
          {/* Duplicate track — aria-hidden, seamless loop */}
          <Track ariaHidden />
        </div>
      )}

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
