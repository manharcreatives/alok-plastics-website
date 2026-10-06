/**
 * S2b · AboutIntro — manufacturer snapshot + proof numbers (merged ProofStrip, see ADR-011).
 *
 * Composition: an editorial split. Left = label, the company name as the headline and a quiet
 * descriptor; right = four ruled fact rows (Works, Process, Focus, Business Type) and
 * "Read our story". Below = the numbers band (20 Cr+, 70%+, 1998, 100%) that counts up slowly
 * and evenly (~3.2s) once on scroll-in.
 *
 * Facts come from src/content/site.ts (client-supplied). Reduced motion: final values, no reveals.
 */

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Highlight from '@/components/ui/Highlight';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import { site, manufacturerSnapshot } from '@/content/site';
import { METAL_TEXT_CSS } from './FoldEdge';

const NUMERIC = site.proof.filter(p => p.isNumeric);
const WORDS = site.proof.filter(p => !p.isNumeric);

const isYear = (v: number) => v >= 1900 && v <= 2100;
const fmt = (n: number, final: number) => (isYear(final) ? String(n) : n.toLocaleString('en-IN'));
/* Slow, even climb: sine.inOut keeps the rate nearly constant so every step is readable
   (power3.inOut packed most of the climb into ~0.8s and read as a jump). */
const COUNT_S = 3.2;
const COUNT_EASE = 'sine.inOut';

/* One numeral: counts up once when it scrolls in; light sweep on landing. */
function Stat({ value, label, numericValue, index }: { value: string; label: string; numericValue?: number; index: number }) {
  const m = value.match(/^([\d.]+)\s*(.*)/);
  const numText = m?.[1] ?? value;
  const suffix = m?.[2] ?? '';
  const target = numericValue ?? Number(numText);
  const from = isYear(target) ? target - 98 : 0; /* the year rolls up from 1900 */

  const rootRef = useRef<HTMLDivElement>(null);
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
          wrapRef.current?.classList.add('ap-swept');
        },
      });
    }, { threshold: 0.6 });
    io.observe(root);
    return () => { io.disconnect(); tween?.kill(); num.textContent = fmt(target, target); };
  }, [from, target, index]);

  return (
    <div ref={rootRef} className="ap-stat">
      <div ref={wrapRef} className="ap-num-wrap" aria-hidden="true">
        <span ref={numRef} className="ap-num">{numText}</span>
        {suffix && <span className="ap-suffix">{suffix}</span>}
      </div>
      <span className="ap-rule" aria-hidden="true"><i /><b /><b /></span>
      <p className="sr-only">{value} {label}</p>
      <p className="ap-label">{label}</p>
    </div>
  );
}

const CSS = METAL_TEXT_CSS + `
  .ap { position: relative; background: var(--canvas); padding-top: calc(var(--section-y) * 1.35); padding-bottom: var(--space-xl); overflow: hidden; }
  .ap-grid-bg {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
    background-image:
      repeating-linear-gradient(var(--grey-metal) 0, var(--grey-metal) 1px, transparent 1px, transparent 8px),
      repeating-linear-gradient(90deg, var(--grey-metal) 0, var(--grey-metal) 1px, transparent 1px, transparent 8px);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, white 0%, transparent 75%);
            mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, white 0%, transparent 75%);
  }
  .ap-wrap { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; padding: 0 var(--grid-page-padding); }
  .ap-top { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); align-items: start; }
  .ap-micro { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-md); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo), sans-serif; line-height: var(--lh-label); }
  .ap-h {
    font-family: var(--font-archivo); font-variation-settings: "wdth" 125;
    font-size: var(--fs-h1); font-weight: 650; line-height: var(--lh-h1); letter-spacing: var(--tr-h1);
    color: var(--ink); max-width: 12ch; margin: 0; text-wrap: balance;
  }
  .ap-desc { margin: var(--space-md) 0 0; font-size: var(--fs-lead); line-height: 1.5; color: var(--muted); max-width: 28ch; }
  .ap-facts { margin: 0; border-top: 1px solid var(--ink); }
  .ap-fact { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px var(--space-md); padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
  .ap-fact dt { font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); line-height: var(--lh-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--grey-metal-text); }
  .ap-fact dd { margin: 0; font-size: var(--fs-body); line-height: 1.5; color: var(--ink); text-wrap: pretty; }
  .ap-link {
    display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-md);
    min-height: 44px; padding: var(--space-xs) 0; font-weight: 600; font-size: 0.9375rem; color: var(--burgundy);
    border-bottom: 2px solid var(--burgundy); text-decoration: none;
  }
  .ap-link svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
  .ap-link:hover { color: var(--burgundy-bright); border-color: var(--burgundy-bright); }
  .ap-link:hover svg { transform: translate(2px, -2px); }
  .ap-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }


  /* Numbers band */
  .ap-band { position: relative; margin-top: var(--space-xl); }
  .ap-band-in {
    position: relative; background: var(--surface); border-top: 1px solid var(--grey-warm); border-bottom: 1px solid var(--grey-warm);
    padding: var(--space-lg) var(--grid-page-padding) var(--space-md);
  }
  .ap-stats { max-width: var(--grid-max); margin: 0 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-lg) var(--space-md); }
  .ap-stat { position: relative; min-width: 0; }
  .ap-num-wrap { position: relative; display: inline-flex; align-items: baseline; gap: 4px; overflow: hidden; padding: 0 4px 4px 0; }
  .ap-num {
    font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-variant-numeric: tabular-nums lining-nums;
    font-size: var(--fs-stat); font-weight: 650; line-height: var(--lh-stat); letter-spacing: var(--tr-stat);
    background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: var(--burgundy); white-space: nowrap;
  }
  .ap-suffix { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-stat-unit); font-weight: 500; color: var(--grey-metal); letter-spacing: -0.02em; white-space: nowrap; }
  .ap-num-wrap::after {
    content: ""; position: absolute; inset: -20%; pointer-events: none; opacity: 0;
    background: linear-gradient(45deg, transparent 38%, rgba(255,255,255,.85) 50%, transparent 62%);
    transform: translateX(-120%);
  }
  .ap-swept::after { animation: ap-sweep 1.2s cubic-bezier(.16,1,.3,1) 1 forwards; }
  @keyframes ap-sweep { 0% { transform: translateX(-120%); opacity: 1; } 100% { transform: translateX(120%); opacity: 1; } }
  .ap-rule { position: relative; display: block; height: 8px; margin: var(--space-xs) 0; max-width: 200px; }
  .ap-rule i { position: absolute; left: 0; right: 0; top: 3px; height: 1px; background: var(--grey-metal); opacity: .5; }
  .ap-rule b { position: absolute; top: 0; width: 1px; height: 8px; background: var(--grey-metal); opacity: .6; }
  .ap-rule b:first-of-type { left: 0; } .ap-rule b:last-of-type { right: 0; }
  .ap-label { font-size: 0.9375rem; line-height: 1.4; color: var(--body); max-width: 24ch; margin: 0; }
  .ap-words { max-width: var(--grid-max); margin: var(--space-lg) auto 0; padding-top: var(--space-sm); border-top: 1px solid var(--grey-cloud); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); }
  .ap-word { display: flex; flex-direction: column; gap: 4px; }
  .ap-word strong { font-family: var(--font-archivo); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink); font-weight: 650; display: flex; align-items: center; gap: var(--space-xs); }
  /* marker: a short rule, the same list grammar as .eq-list — not a rotated square */
  .ap-word strong::before { content: ""; width: 12px; height: 2px; background: var(--burgundy); flex-shrink: 0; }
  .ap-word span { font-size: 0.875rem; color: var(--muted); padding-left: 20px; }

  @media (min-width: 640px) { .ap-fact { grid-template-columns: 9.5rem minmax(0, 1fr); align-items: baseline; padding: var(--space-md) 0; } }
  @media (min-width: 768px) {
    .ap-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-md); }
    .ap-stat + .ap-stat { border-left: 1px solid var(--grey-cloud); padding-left: var(--space-md); }
    .ap-words { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
  }
  @media (min-width: 1024px) {
    .ap-top { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
    .ap-band-in { clip-path: polygon(0 0, 100% 0, 100% calc(100% - 56px), calc(100% - 56px) 100%, 0 100%); padding-bottom: var(--space-lg); }
  }
  @media (prefers-reduced-motion: reduce) { .ap-swept::after { animation: none; } }
`;

export default function AboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  return (
    <section ref={sectionRef} aria-labelledby="about-intro-heading" className="ap">
      <style>{CSS}</style>
      <div aria-hidden="true" className="ap-grid-bg" />
      <div className="ap-wrap">
        <div className="ap-top">
          <div>
            <p className="ap-micro">About</p>
            <h2 id="about-intro-heading" ref={headingRef} className="ap-h">{manufacturerSnapshot.name}</h2>
            <p className="ap-desc"><Highlight keywords={['Plastic Components']}>{manufacturerSnapshot.descriptor}</Highlight></p>
          </div>
          <div className="ap-body">
            <dl className="ap-facts">
              {manufacturerSnapshot.rows.map(r => (
                <div key={r.label} className="ap-fact"><dt>{r.label}</dt><dd>{r.value}</dd></div>
              ))}
            </dl>
            <Link href="/about/" className="ap-link">
              Read our story <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="ap-band">
        <div className="ap-band-in">
          <div className="ap-stats">
            {NUMERIC.map((s, i) => (
              <Stat key={s.value} value={s.value} label={s.label} numericValue={s.numericValue} index={i} />
            ))}
          </div>
          <div className="ap-words">
            {WORDS.map(w => (
              <div key={w.value} className="ap-word"><strong>{w.value}</strong><span>{w.label}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
