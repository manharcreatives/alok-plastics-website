/**
 * NOTE: not rendered on the home page any more — merged into AboutIntro (ADR-011). Kept compiling.
 * S3 · ProofStrip — §13
 * Canvas bg + 8px technical grid at 3%.
 * 4 primary stats with odometer roll on first view + light sweep.
 * Secondary row: 3 word stats in micro-type with hairline dividers.
 * Register marks at grid intersections (§3.1). Corner crop marks.
 * Reduced motion: show final values immediately.
 */

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useLightSweep } from '@/hooks/useMotion';
import { site } from '@/content/site';

/* Only the 4 numeric proof points are shown as primary stats */
const PRIMARY_STATS = site.proof.filter(p => p.isNumeric);
const SECONDARY_STATS = site.proof.filter(p => !p.isNumeric);

/* A 4-digit calendar year must never carry a thousands separator. */
const isYear = (n: number) => n >= 1900 && n <= 2100;
const formatNum = (n: number, v: number) =>
  isYear(v) ? String(n) : n.toLocaleString('en-IN');

/* Count-up (odometer-style) with explicit formatting; final text is always the
   authored numeral so SSR/no-JS/reduced-motion show the correct value. */
function useCountUp(
  ref: React.RefObject<HTMLElement | null>,
  value: number,
) {
  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.4,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate() {
        el.textContent = formatNum(Math.round(obj.val), value);
      },
      onComplete() {
        el.textContent = formatNum(value, value);
      },
    });
  }, { scope: ref, dependencies: [value] });
}

function StatCard({
  value,
  label,
  numericValue,
}: {
  value: string;
  label: string;
  numericValue?: number;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useCountUp(numRef, numericValue ?? 0);
  useLightSweep(cardRef);

  /* Split "20 Cr+" → "20" + "Cr+" */
  const match = value.match(/^([\d.]+)\s*(.*)/);
  const numPart = match?.[1] ?? value;
  const suffix = match?.[2] ?? '';

  return (
    <div ref={cardRef} className="proof-stat">
      <span aria-hidden="true" className="proof-reg">+</span>

      <div className="proof-num-wrap">
        <div className="proof-num-row">
          <span ref={numRef} aria-hidden="true" className="proof-num">
            {numPart}
          </span>
          {suffix && <span aria-hidden="true" className="proof-suffix">{suffix}</span>}
        </div>
        {/* Measurement rule with end caps */}
        <div className="proof-rule" aria-hidden="true">
          <span className="proof-rule-line" />
          <span className="proof-rule-cap proof-rule-cap--l" />
          <span className="proof-rule-cap proof-rule-cap--r" />
        </div>
      </div>

      <p className="sr-only">{value} {label}</p>
      <p className="proof-label">{label}</p>
    </div>
  );
}

export default function ProofStrip() {
  return (
    <section aria-label="Proof points" className="proof-section">
      <style>{`
        .proof-section { background: var(--canvas); position: relative; overflow: hidden; }
        .proof-grid-bg {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.03;
          background-image:
            repeating-linear-gradient(var(--grey-metal) 0, transparent 1px, transparent 7px, transparent 8px),
            repeating-linear-gradient(90deg, var(--grey-metal) 0, transparent 1px, transparent 7px, transparent 8px);
          background-size: 8px 8px;
        }
        .proof-inner {
          position: relative;
          max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
          margin: 0 auto;
          padding: var(--space-md) var(--grid-page-padding);
        }
        .proof-frame { border-top: 1px solid var(--grey-warm); border-bottom: 1px solid var(--grey-warm); position: relative; }
        .proof-primary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .proof-secondary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--grey-warm); }
        .proof-stat {
          position: relative; display: flex; flex-direction: column; align-items: flex-start;
          gap: var(--space-xs); min-width: 0; overflow: hidden;
          padding: var(--space-lg) var(--space-md);
          border-left: 1px solid var(--grey-warm);
        }
        .proof-stat:first-child { border-left: none; }
        .proof-reg {
          position: absolute; top: 0; left: 0; width: 10px; height: 10px; transform: translate(-50%, 0);
          color: var(--grey-warm); font: 10px/1 var(--font-mono);
          display: flex; align-items: center; justify-content: center;
        }
        .proof-stat:first-child .proof-reg { display: none; }
        .proof-num-wrap { width: 100%; }
        .proof-num-row { display: flex; align-items: baseline; gap: 4px; flex-wrap: nowrap; }
        .proof-num {
          font-family: var(--font-archivo); font-variation-settings: "wdth" 125;
          font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 650; line-height: 1;
          letter-spacing: -0.04em; font-feature-settings: "tnum";
          background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          white-space: nowrap;
        }
        .proof-suffix {
          font-family: var(--font-archivo); font-variation-settings: "wdth" 125;
          font-size: clamp(1.25rem, 2.2vw, 2rem); font-weight: 500;
          color: var(--grey-metal); letter-spacing: -0.02em; white-space: nowrap;
        }
        .proof-rule { position: relative; height: 8px; margin-top: var(--space-xs); }
        .proof-rule-line { position: absolute; left: 0; right: 0; top: 3px; height: 1px; background: var(--grey-warm); }
        .proof-rule-cap { position: absolute; top: 0; width: 1px; height: 8px; background: var(--grey-warm); }
        .proof-rule-cap--l { left: 0; } .proof-rule-cap--r { right: 0; }
        .proof-label { font-size: 0.9375rem; color: var(--body); line-height: 1.4; max-width: 22ch; }

        .proof-sec-item {
          display: flex; flex-direction: column; gap: 4px; min-width: 0;
          padding: var(--space-md);
          border-left: 1px solid var(--grey-warm);
        }
        .proof-sec-item:first-child { border-left: none; }
        .proof-sec-head { display: flex; align-items: center; gap: var(--space-xs); }
        .proof-sec-value {
          font-family: var(--font-archivo); font-size: 0.875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em; color: var(--body); line-height: 1.3;
        }
        .proof-sec-label { font-size: 0.875rem; color: var(--muted); line-height: 1.4; padding-left: 14px; }

        @media (max-width: 1023px) {
          .proof-primary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .proof-stat:nth-child(odd) { border-left: none; }
          .proof-stat:nth-child(odd) .proof-reg { display: none; }
          .proof-stat:nth-child(n+3) { border-top: 1px solid var(--grey-warm); }
          .proof-secondary { grid-template-columns: minmax(0, 1fr); }
          .proof-sec-item { border-left: none; }
          .proof-sec-item + .proof-sec-item { border-top: 1px solid var(--grey-warm); }
        }
        @media (max-width: 479px) {
          .proof-stat { padding: var(--space-md) var(--space-sm); }
          .proof-inner { padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
        }
      `}</style>

      <div aria-hidden="true" className="proof-grid-bg" />

      <div className="proof-inner">
        <div className="proof-frame">
          <div className="proof-primary">
            {PRIMARY_STATS.map(stat => (
              <StatCard
                key={stat.value}
                value={stat.value}
                label={stat.label}
                numericValue={stat.numericValue}
              />
            ))}
          </div>

          <div className="proof-secondary">
            {SECONDARY_STATS.map(stat => (
              <div key={stat.value} className="proof-sec-item">
                <div className="proof-sec-head">
                  <span className="proof-sec-value">{stat.value}</span>
                </div>
                <span className="proof-sec-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
