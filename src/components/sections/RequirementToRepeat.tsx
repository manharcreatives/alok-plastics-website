/**
 * S5 · RequirementToRepeat — §13
 * bg: --canvas
 * 5-node chain: Understand → Develop → Manufacture → Supply → Repeat
 * Rising diagonal on desktop, vertical stack on mobile.
 * Chain-link SVG connectors draw on scroll (§12.2 draw rule + scrub).
 * Pull quote at end with "orders that keep coming back" in metal gradient.
 * Final loop arc from Repeat back to Understand (SVG).
 * COPY: all node descriptions flagged for client approval.
 */

'use client';

import { useRef } from 'react';
import { useMaskRise } from '@/hooks/useMotion';
import { uspChain, uspPullQuote } from '@/content/journey';

export default function RequirementToRepeat() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  useMaskRise(headingRef);
  useMaskRise(quoteRef);

  return (
    <section
      aria-labelledby="usp-heading"
      style={{ background: 'var(--canvas)', padding: 'var(--section-y) var(--grid-page-padding)', overflow: 'hidden' }}
    >
      <style>{`
        .usp-chain { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
        .usp-node {
          position: relative; display: flex; flex-direction: column; min-width: 0;
          background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.9); padding: var(--space-md);
        }
        .usp-node-head { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-xs); }
        .usp-node-num { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--burgundy); font-weight: 600; }
        .usp-node-rule { flex: 1; height: 1px; background: var(--grey-cloud); }
        .usp-node-label {
          font-family: var(--font-archivo); font-variation-settings: "wdth" 125;
          font-size: 1.0625rem; font-weight: 650; letter-spacing: -0.01em; margin-bottom: var(--space-xs);
        }
        .usp-node-desc { font-size: 0.875rem; color: var(--body); line-height: 1.5; }
        .usp-link { display: none; }
        .usp-loop { display: none; }

        .usp-quote { margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--grey-cloud); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); }
        .usp-quote-kicker { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal); font-weight: 600; }
        .usp-quote-text {
          font-family: var(--font-archivo); font-variation-settings: "wdth" 125;
          font-size: clamp(1.4rem, 2.6vw, 2.25rem); font-weight: 650; line-height: 1.2; letter-spacing: -0.025em;
          color: var(--ink); margin-bottom: var(--space-md); max-width: 30ch; text-wrap: balance;
        }
        .usp-quote-hl { background: var(--metal-gradient); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
        .usp-quote-attr { font-size: 0.875rem; color: var(--grey-metal); font-weight: 600; }

        @media (min-width: 1024px) {
          .usp-chain { grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: end; padding-top: calc(4 * var(--space-sm)); }
          .usp-node { transform: translateY(calc(var(--i) * var(--space-sm) * -1)); min-height: 176px; }
          .usp-link { display: block; position: absolute; top: 50%; right: calc(-1 * var(--space-md)); margin-top: -8px; z-index: 1; }
          .usp-loop {
            display: block; position: relative; height: var(--space-md); margin: var(--space-sm) 10% 0;
            border: 1px dashed var(--burgundy); border-top: none; border-radius: 0 0 2px 2px; opacity: 0.5;
          }
          .usp-loop-arrow {
            position: absolute; left: -5px; top: -5px; width: 0; height: 0;
            border-left: 4.5px solid transparent; border-right: 4.5px solid transparent; border-bottom: 7px solid var(--burgundy);
          }
          .usp-quote { grid-template-columns: minmax(0, 1fr) minmax(0, 3fr); gap: var(--space-lg); align-items: start; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .usp-chain { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', fontWeight: 600 }}>
              03 — How We Work
            </span>
          </div>

          <h2
            id="usp-heading"
            ref={headingRef}
            style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: '"wdth" 125',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 650,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            From Requirement to Repeat Supply.
          </h2>

          <p style={{ fontSize: '1.0625rem', color: 'var(--body)', lineHeight: 1.65, maxWidth: '60ch' }}>
            {/* COPY: drafted, needs client approval */}
            We don&apos;t just manufacture plastic components — we build reliable, repeatable supply partnerships.
          </p>
        </div>

        {/* Chain nodes — 5 equal columns on desktop (rising diagonal), vertical stack on mobile */}
        <ol className="usp-chain">
          {uspChain.map((node, i) => (
            <li
              key={node.step}
              className="usp-node"
              style={{ ['--i' as string]: i }}
            >
              <div className="usp-node-head">
                <span className="usp-node-num">{String(node.step).padStart(2, '0')}</span>
                <span className="usp-node-rule" />
              </div>
              <p
                className="usp-node-label"
                style={{ color: node.step === uspChain.length ? 'var(--burgundy)' : 'var(--ink)' }}
              >
                {node.label}
              </p>
              {/* COPY: drafted, needs client approval */}
              <p className="usp-node-desc">{node.description}</p>

              {/* Chain-link connector (L+O motif) — not after last node */}
              {i < uspChain.length - 1 && (
                <svg className="usp-link" width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
                  <rect x="1" y="3" width="13" height="10" rx="2" stroke="var(--grey-metal)" strokeWidth="1.5" />
                  <rect x="10" y="3" width="13" height="10" rx="2" stroke="var(--grey-metal)" strokeWidth="1.5" />
                </svg>
              )}
            </li>
          ))}
        </ol>

        {/* Loop-back bracket — Repeat returns to Understand (desktop only) */}
        <div className="usp-loop" aria-hidden="true">
          <span className="usp-loop-arrow" />
        </div>

        {/* Pull quote */}
        <div className="usp-quote">
          <p className="usp-quote-kicker">In our words</p>
          <div>
            <p ref={quoteRef} className="usp-quote-text">
              {uspPullQuote.quote.split('orders that keep coming back').map((part, i, arr) => (
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="usp-quote-hl">orders that keep coming back</span>
                  </span>
                ) : <span key={i}>{part}</span>
              ))}
            </p>
            <p className="usp-quote-attr">{uspPullQuote.attribution}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
