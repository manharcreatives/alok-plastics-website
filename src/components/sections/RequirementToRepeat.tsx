/**
 * S5 · RequirementToRepeat — §13
 * bg: --canvas, folded-diagonal top edge into the section.
 *
 * Understand → Develop → Manufacture → Supply → Repeat as five folded-corner tiles on a
 * staircase that rises up-and-right (the K direction). The connectors are interlocking
 * chain links (the L+O lock) set at 45° between the steps; they draw as you scroll
 * (scrubbed). A loop arc then carries Repeat back to Understand — repeat supply made visible.
 * The pull quote closes the section beside a folded A-peak ribbon + silver lock block.
 *
 * Desktop ≥1024: staircase + scrubbed draw. Below: vertical stack on a left rail.
 * Reduced motion: everything fully drawn, nothing animates.
 * COPY: node descriptions are drafted and flagged for client approval (journey.ts).
 */

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import { uspChain, uspPullQuote } from '@/content/journey';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

/* Process pictograms — drawn on a 48 grid, 1.5px squared stroke, currentColor.
   understand = sample/drawing sheet with callout · develop = mould tool opened on its cavity ·
   manufacture = moulded part with sprue · supply = crate dispatched up-and-right · repeat = loop arc */
const STEP_GLYPH: Record<string, string[]> = {
  Understand: [
    'M 6 4 L 26 4 L 34 12 L 34 36 L 6 36 Z', 'M 26 4 L 26 12 L 34 12',
    'M 12 18 L 24 18 M 12 24 L 20 24 M 12 30 L 18 30',
    'M 28 30 L 42 30 L 42 44 L 28 44 Z', 'M 22 26 L 28 30',
  ],
  Develop: [
    'M 6 8 L 42 8 L 42 22 L 30 22 L 30 17 L 18 17 L 18 22 L 6 22 Z',
    'M 6 26 L 18 26 L 18 31 L 30 31 L 30 26 L 42 26 L 42 40 L 6 40 Z',
    'M 12 3 L 12 8 M 36 3 L 36 8 M 12 40 L 12 45 M 36 40 L 36 45',
  ],
  Manufacture: [
    'M 14 14 L 34 14 L 34 34 L 14 34 Z', 'M 20 20 L 28 20 L 28 28 L 20 28 Z',
    'M 8 34 L 40 34 L 40 40 L 8 40 Z', 'M 24 14 L 24 5 M 19 5 L 29 5',
  ],
  Supply: [
    'M 4 20 L 30 20 L 30 44 L 4 44 Z', 'M 4 28 L 30 28 M 4 36 L 30 36',
    'M 34 24 L 44 14 M 34 14 L 44 14 L 44 24',
  ],
  Repeat: [
    'M 40 24 A 16 16 0 1 1 24 8', 'M 24 8 L 31 3 M 24 8 L 31 13',
    'M 19 19 L 29 19 L 29 29 L 19 29 Z',
  ],
};

function StepGlyph({ name }: { name: string }) {
  const d = STEP_GLYPH[name];
  if (!d) return null;
  return (
    <svg className="usp-ico" width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const HIGHLIGHT = 'orders that keep coming back';

const CSS = FOLD_SECTION_CSS + `
  .usp-sec { --pad-top: calc(var(--section-y) * 0.9); background: var(--canvas); padding-bottom: calc(var(--section-y) * 1.2); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
  .usp-micro { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-sm); font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo); }
  .usp-micro::before { content: ""; width: 24px; height: 2px; background: var(--burgundy); }
  .usp-h { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 650; line-height: 1.1; letter-spacing: -0.025em; color: var(--ink); margin-bottom: var(--space-sm); }
  .usp-lead { font-size: 1.0625rem; color: var(--body); line-height: 1.65; max-width: 60ch; }

  /* Chain — mobile: vertical on a rail */
  .usp-chain { list-style: none; margin: var(--space-xl) 0 0; padding: 0 0 0 var(--space-md); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); position: relative; }
  .usp-chain::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(180deg, var(--burgundy) 0%, var(--grey-warm) 100%); }
  .usp-node { position: relative; display: flex; min-width: 0; }
  .usp-shape { flex: 1; display: flex; min-width: 0; padding: 1px; background: var(--grey-warm); clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%); }
  .usp-node::before { content: ""; position: absolute; left: calc(-1 * var(--space-md) - 4px); top: var(--space-md); width: 10px; height: 10px; background: var(--burgundy); transform: rotate(45deg); }
  .usp-node-in { flex: 1; min-width: 0; background: var(--surface); padding: var(--space-md); box-shadow: inset 0 1px 0 rgba(255,255,255,.9); clip-path: polygon(0 0, calc(100% - 23px) 0, 100% 23px, 100% 100%, 0 100%); }
  .usp-node--last .usp-shape { background: var(--burgundy); }
  .usp-node--last .usp-node-in { background: var(--blush); }
  .usp-ico { display: block; color: var(--burgundy); margin-bottom: var(--space-sm); }
  .usp-node--last .usp-ico { color: var(--burgundy-bright); }
  .usp-node-label { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1.25rem; font-weight: 650; letter-spacing: -0.015em; color: var(--ink); margin-bottom: var(--space-xs); }
  .usp-node--last .usp-node-label { color: var(--burgundy); }
  .usp-node-desc { font-size: 0.9375rem; color: var(--body); line-height: 1.5; }
  .usp-link, .usp-loop-wrap { display: none; }

  /* Quote */
  .usp-quote { margin-top: calc(var(--space-xl) * 1.5); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); align-items: center; }
  .usp-peak { position: relative; width: 144px; height: 112px; flex-shrink: 0; }
  .usp-peak i { position: absolute; left: 0; top: 0; bottom: 0; width: 56%; background: var(--burgundy); clip-path: polygon(0 100%, 44% 0, 100% 0, 56% 100%); }
  .usp-peak b { position: absolute; left: 44%; right: 0; top: 0; bottom: 0; background: var(--silver-gradient); clip-path: polygon(44% 0, 100% 0, 56% 100%, 0 100%); opacity: .55; }
  .usp-quote-text { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.625rem, 3.6vw, 3.25rem); font-weight: 650; line-height: 1.12; letter-spacing: -0.03em; color: var(--ink); max-width: 24ch; text-wrap: balance; margin-bottom: var(--space-md); }
  .usp-quote-hl { background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: var(--burgundy); }
  .usp-quote-attr { display: flex; align-items: center; gap: var(--space-sm); font-size: 0.875rem; color: var(--body); font-weight: 600; }
  .usp-quote-attr::before { content: ""; width: 56px; height: 2px; background: var(--burgundy); }

  @media (min-width: 640px) { .usp-chain { grid-template-columns: repeat(2, minmax(0, 1fr)); } .usp-node--last { grid-column: 1 / -1; } }
  @media (min-width: 1024px) {
    .usp-chain { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-lg); padding: 0; margin-top: var(--space-xl); align-items: start; }
    .usp-chain::before, .usp-node::before { display: none; }
    .usp-node { min-height: 232px; }
    .usp-node:nth-child(1) { margin-top: calc(4 * var(--space-lg)); } .usp-node:nth-child(2) { margin-top: calc(3 * var(--space-lg)); } .usp-node:nth-child(3) { margin-top: calc(2 * var(--space-lg)); } .usp-node:nth-child(4) { margin-top: var(--space-lg); } .usp-node:nth-child(5) { margin-top: 0; }
    .usp-node--last { grid-column: auto; }
    .usp-node-in { padding: var(--space-md); }
    .usp-link { display: block; position: absolute; left: calc(100% - 4px); top: 50%; width: 56px; height: 24px; margin: -12px 0 0 -8px; transform: rotate(-45deg); z-index: 3; overflow: visible; }
    .usp-link rect { fill: none; stroke: var(--burgundy); stroke-width: 1.5; }
    .usp-loop-wrap { display: block; position: relative; margin: var(--space-sm) 8% var(--space-md); height: 56px; }
    .usp-loop { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; display: block; }
    .usp-loop path { fill: none; stroke: var(--burgundy); stroke-width: 1.5; stroke-dasharray: 6 5; vector-effect: non-scaling-stroke; }
    .usp-loop-head { position: absolute; left: -6px; top: -4px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid var(--burgundy); }
    .usp-loop-label { position: absolute; left: 50%; bottom: 0; transform: translate(-50%, 50%); padding: 0 var(--space-sm); background: var(--canvas); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; color: var(--muted); white-space: nowrap; }
    .usp-quote { grid-template-columns: 200px minmax(0, 1fr); gap: var(--space-lg); margin-top: calc(var(--space-xl) * 1.8); }
    .usp-peak { width: 200px; height: 156px; }
  }
`;

export default function RequirementToRepeat() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const chainRef = useRef<HTMLOListElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);

  useMaskRise(headingRef);
  useMaskRise(quoteRef);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const chain = chainRef.current;
    if (!chain) return;
    const mm = gsap.matchMedia();

    /* Reveal can never be left half-visible: completes once the chain scrolls past,
       on refresh while already past, and via a timeout safety net. */
    const settle = (tl: gsap.core.Timeline) => {
      const done = () => { tl.progress(1); tl.scrollTrigger?.kill(false); };
      const tid = window.setTimeout(() => {
        if (chain.getBoundingClientRect().bottom < window.innerHeight * 0.6) done();
      }, 3500);
      ScrollTrigger.create({
        trigger: chain, start: 'bottom 55%', onEnter: done,
        onRefresh: self => { if (self.scroll() > self.start) done(); },
      });
      return () => window.clearTimeout(tid);
    };

    mm.add('(min-width: 1024px)', () => {
      const nodes = gsap.utils.toArray<HTMLElement>('.usp-node', chain);
      const links = gsap.utils.toArray<SVGRectElement>('.usp-link rect', chain);
      const loop = loopRef.current;
      gsap.set(nodes, { autoAlpha: 0, x: -16, y: 16 });
      gsap.set(links, { strokeDasharray: 1, strokeDashoffset: 1 });
      if (loop) gsap.set(loop, { clipPath: 'inset(0 0 0 100%)' });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: chain, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 },
      });
      nodes.forEach((n, i) => {
        tl.to(n, { autoAlpha: 1, x: 0, y: 0, duration: 1, ease: 'back.out(1.4)' }, i * 1.2);
        if (i < nodes.length - 1) {
          tl.to(links.slice(i * 2, i * 2 + 2), { strokeDashoffset: 0, duration: 0.8, ease: 'power3.inOut', stagger: 0.1 }, i * 1.2 + 0.7);
        }
      });
      if (loop) tl.to(loop, { clipPath: 'inset(0 0 0 0%)', duration: 1.4, ease: 'power3.inOut' }, (nodes.length - 1) * 1.2 + 0.9);
      const stop = settle(tl);
      return () => { stop(); gsap.set([...nodes, ...links], { clearProps: 'opacity,visibility,transform,clipPath,strokeDasharray,strokeDashoffset' }); if (loop) gsap.set(loop, { clearProps: 'opacity,visibility,transform,clipPath,strokeDasharray,strokeDashoffset' }); };
    });

    mm.add('(max-width: 1023px)', () => {
      const nodes = gsap.utils.toArray<HTMLElement>('.usp-node', chain);
      const tweens = nodes.map(n => gsap.from(n, {
        autoAlpha: 0, x: -16, y: 16, duration: 0.7, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: n, start: 'top 92%', once: true },
      }));
      /* nodes already above the viewport (fast scroll / anchor jump) are finished at once */
      const tid = window.setTimeout(() => {
        tweens.forEach((tw, i) => { if (nodes[i].getBoundingClientRect().top < window.innerHeight * 0.5) tw.progress(1); });
      }, 2500);
      return () => window.clearTimeout(tid);
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  const [pre, post] = uspPullQuote.quote.split(HIGHLIGHT);

  return (
    <section ref={sectionRef} aria-labelledby="usp-heading" className="fold-sec fold-sec--step usp-sec">
      <style>{CSS}</style>
      <FoldEdge variant="step" />
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
        <p className="usp-micro">How we work</p>
        <h2 id="usp-heading" ref={headingRef} className="usp-h">From Requirement to Repeat Supply.</h2>
        {/* COPY: drafted, needs client approval */}
        <p className="usp-lead">We don&apos;t just manufacture plastic components — we build reliable, repeatable supply partnerships.</p>

        <ol ref={chainRef} className="usp-chain">
          {uspChain.map((node, i) => {
            const last = i === uspChain.length - 1;
            return (
              <li key={node.step} className={`usp-node${last ? ' usp-node--last' : ''}`}>
                <div className="usp-shape"><div className="usp-node-in">
                  <StepGlyph name={node.label} />
                  <p className="usp-node-label">{node.label}</p>
                  {/* COPY: drafted, needs client approval */}
                  <p className="usp-node-desc">{node.description}</p>
                </div></div>
                {!last && (
                  <svg className="usp-link" viewBox="0 0 56 24" fill="none" aria-hidden="true">
                    <rect x="2" y="4" width="32" height="16" rx="2" pathLength={1} />
                    <rect x="22" y="4" width="32" height="16" rx="2" pathLength={1} />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>

        <div className="usp-loop-wrap" aria-hidden="true">
          <div ref={loopRef} style={{ position: 'absolute', inset: 0 }}>
            <svg className="usp-loop" viewBox="0 0 100 56" preserveAspectRatio="none">
              <path d="M 98 0 C 98 56, 2 56, 2 6" />
            </svg>
            <span className="usp-loop-head" />
          </div>
          <span className="usp-loop-label">Repeat supply</span>
        </div>

        <div className="usp-quote">
          <div className="usp-peak" aria-hidden="true"><i /><b /></div>
          <div>
            <p ref={quoteRef} className="usp-quote-text">
              {pre}<span className="usp-quote-hl">{HIGHLIGHT}</span>{post}
            </p>
            <p className="usp-quote-attr">{uspPullQuote.attribution}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
