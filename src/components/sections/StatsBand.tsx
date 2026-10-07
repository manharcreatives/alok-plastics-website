/**
 * StatsBand — the proof numbers (20 Cr+, 70%+, 1998, 100%) plus the three word-proofs.
 * Moved out of AboutIntro; sits after the CEO quote so the numbers answer the promise.
 *
 * Design: engineered "spec sheet" cells on a blueprint ground. Each cell has a burgundy top bar,
 * an oversized metal-gradient numeral that counts up once on scroll-in, a ruler tick scale and a
 * plain label. Reduced motion / no IntersectionObserver: final values, no count.
 * Facts come from site.proof only.
 */

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import { site } from '@/content/site';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

const NUMERIC = site.proof.filter(p => p.isNumeric);
const WORDS = site.proof.filter(p => !p.isNumeric);

const isYear = (v: number) => v >= 1900 && v <= 2100;
const fmt = (n: number, final: number) => (isYear(final) ? String(n) : n.toLocaleString('en-IN'));
/* Slow, even climb: sine.inOut keeps the rate nearly constant so every step is readable. */
const COUNT_S = 3.2;
const COUNT_EASE = 'sine.inOut';

function Stat({ value, label, numericValue, index }: { value: string; label: string; numericValue?: number; index: number }) {
  const m = value.match(/^([\d.]+)\s*(.*)/);
  const numText = m?.[1] ?? value;
  const suffix = m?.[2] ?? '';
  const target = numericValue ?? Number(numText);
  const from = isYear(target) ? target - 98 : 0; /* the year rolls up from 1900 */

  const rootRef = useRef<HTMLLIElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current, num = numRef.current;
    if (!root || !num || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    num.textContent = fmt(from, target);
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      const o = { v: from };
      tween = gsap.to(o, {
        v: target,
        duration: COUNT_S,
        delay: 0.3 + index * 0.2,
        ease: COUNT_EASE,
        onUpdate: () => { num.textContent = fmt(Math.round(o.v), target); },
        onComplete: () => {
          num.textContent = fmt(target, target);
          wrapRef.current?.classList.add('sb-swept');
        },
      });
    }, { threshold: 0.6 });
    io.observe(root);
    return () => { io.disconnect(); tween?.kill(); num.textContent = fmt(target, target); };
  }, [from, target, index]);

  return (
    <li ref={rootRef} className="sb-cell">
      <span className="sb-idx" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div ref={wrapRef} className={`sb-num-wrap${suffix.startsWith('%') ? ' sb-num-wrap--pct' : ''}`} aria-hidden="true">
        <span ref={numRef} className="sb-num">{numText}</span>
        {suffix && <span className="sb-suffix">{suffix}</span>}
      </div>
      <span className="sb-ticks" aria-hidden="true" />
      <p className="sr-only">{value} {label}</p>
      <p className="sb-label">{label}</p>
    </li>
  );
}

const CSS = FOLD_SECTION_CSS + `
  .sb { --pad-top: calc(var(--section-y) * 1.1); background: var(--canvas); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
  .sb::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.55;
    background-image: linear-gradient(var(--grey-cloud) 1px, transparent 1px), linear-gradient(90deg, var(--grey-cloud) 1px, transparent 1px);
    background-size: 40px 40px;
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, var(--ink) 0%, transparent 78%);
            mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, var(--ink) 0%, transparent 78%); }
  .sb-in { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .sb-head { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); margin-bottom: var(--space-xl); }
  .sb-k { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); line-height: var(--lh-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); }
  .sb-k::before { content: ""; width: 24px; height: 2px; background: var(--burgundy); }
  .sb-h { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); font-weight: 650; color: var(--ink); max-width: 18ch; text-wrap: balance; }
  .sb-sub { margin: 0; font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--body); max-width: 46ch; }

  .sb-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-sm); }
  .sb-cell { container-type: inline-size; position: relative; min-width: 0; display: flex; flex-direction: column; padding: var(--space-md) var(--space-sm) var(--space-sm);
    background: var(--surface); border: 1px solid var(--grey-warm); border-top: 3px solid var(--burgundy);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.9); }
  .sb-idx { position: absolute; top: var(--space-sm); right: var(--space-sm); font-family: var(--font-mono, monospace); font-size: var(--fs-label); letter-spacing: 0.12em; color: var(--grey-metal-text); }
  .sb-num-wrap { position: relative; display: inline-flex; align-items: baseline; gap: 4px; overflow: hidden; padding: var(--space-sm) 0.08em 4px 0; align-self: flex-start; max-width: 100%; }
  .sb-num { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-variant-numeric: tabular-nums lining-nums;
    font-size: clamp(2rem, 20cqw, 5.5rem); font-weight: 650; line-height: 1; letter-spacing: var(--tr-stat);
    background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: var(--burgundy); white-space: nowrap; }
  .sb-suffix { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1rem, 9cqw, 2rem); font-weight: 500; color: var(--grey-metal-text); letter-spacing: -0.02em; white-space: nowrap; }
  /* '%' and '%+' belong to the numeral: same size and gradient, no gap, so '70%+' reads as one figure */
  .sb-num-wrap--pct { gap: 0; }
  .sb-num-wrap--pct .sb-suffix { font-size: clamp(2rem, 20cqw, 5.5rem); font-weight: 650; line-height: 1; letter-spacing: var(--tr-stat);
    background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: var(--burgundy); }
  .sb-num-wrap::after { content: ""; position: absolute; inset: -20%; pointer-events: none; opacity: 0;
    background: linear-gradient(45deg, transparent 38%, rgba(255,255,255,.85) 50%, transparent 62%); transform: translateX(-120%); }
  .sb-swept::after { animation: sb-sweep 1.2s cubic-bezier(.16,1,.3,1) 1 forwards; }
  @keyframes sb-sweep { 0% { transform: translateX(-120%); opacity: 1; } 100% { transform: translateX(120%); opacity: 1; } }
  .sb-ticks { display: block; height: 8px; margin: var(--space-xs) 0 var(--space-sm); opacity: .6;
    background-image: repeating-linear-gradient(90deg, var(--grey-metal) 0, var(--grey-metal) 1px, transparent 1px, transparent 8px);
    -webkit-mask-image: linear-gradient(90deg, var(--ink) 0%, transparent 100%); mask-image: linear-gradient(90deg, var(--ink) 0%, transparent 100%); }
  .sb-label { margin: 0; font-size: 0.9375rem; line-height: 1.4; color: var(--body); max-width: 24ch; }

  .sb-words { list-style: none; margin: var(--space-md) 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; border-top: 1px solid var(--ink); }
  .sb-word { display: flex; flex-direction: column; gap: 4px; min-width: 0; padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
  .sb-word strong { display: flex; align-items: center; gap: var(--space-xs); font-family: var(--font-archivo); font-size: 0.9375rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink); font-weight: 650; }
  .sb-word strong::before { content: ""; width: 12px; height: 2px; background: var(--burgundy); flex-shrink: 0; }
  .sb-word span { font-size: 0.875rem; color: var(--muted); padding-left: var(--space-md); }

  @media (min-width: 768px) {
    .sb-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-md); }
    .sb-cell { padding: var(--space-md); }
    .sb-words { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); border-top: 0; }
    .sb-word { border-top: 1px solid var(--ink); border-bottom: 0; padding-top: var(--space-sm); }
  }
  @media (min-width: 1024px) {
    .sb-head { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); align-items: end; gap: var(--space-xl); }
  }
  @media (prefers-reduced-motion: reduce) { .sb-swept::after { animation: none; } }
`;

export default function StatsBand() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  return (
    <section aria-labelledby="stats-heading" className="fold-sec sb">
      <style>{CSS}</style>
      <FoldEdge />
      <div className="sb-in">
        <div className="sb-head">
          <div>
            <p className="sb-k" style={{ marginBottom: 'var(--space-sm)' }}>By the numbers</p>
            <h2 id="stats-heading" ref={headingRef} className="sb-h">What 1998 to today adds up to.</h2>
          </div>
          <p className="sb-sub">Supplied from Chandigarh since 1998, and ordered again by most of the businesses we work with.</p>
        </div>

        <ul className="sb-grid" aria-label="Alok Plastics in numbers">
          {NUMERIC.map((s, i) => (
            <Stat key={s.value} value={s.value} label={s.label} numericValue={s.numericValue} index={i} />
          ))}
        </ul>

        <ul className="sb-words">
          {WORDS.map(w => (
            <li key={w.value} className="sb-word"><strong>{w.value}</strong><span>{w.label}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
