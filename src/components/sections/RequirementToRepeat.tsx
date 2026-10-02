/**
 * S5 · RequirementToRepeat — §13
 * bg: --canvas, folded-diagonal top edge into the section.
 *
 * Understand → Develop → Manufacture → Supply → Repeat as a 3D cycle: the five folded-corner
 * tiles stand on a tilted ring (a turntable seen from slightly above). On desktop the section
 * pins and scroll turns the ring ONCE, bringing each step to the front in order, while a solid
 * burgundy track draws around the floor of the ring. On the last stretch the track closes back
 * to Understand (repeat supply made visible) and the ring stops. No idle spin, no loop.
 *
 * Desktop ≥1024 + motion allowed: 3D ring (data-ring="on", set by JS).
 * Desktop without JS / reduced motion: five tiles in a row. Below 1024: vertical stack on a rail.
 * COPY: node descriptions are drafted and flagged for client approval (journey.ts).
 */

'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/motion';
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
const N = uspChain.length;
const STEP_DEG = 360 / N;
/* Floor track in the ring's own plane: starts under Understand (front, +z) and runs the same way
   the steps are laid out (Develop sits to the right). Two half-circle arcs, pathLength 1. */
const TRACK = 'M 0 100 A 100 100 0 0 0 0 -100 A 100 100 0 0 0 0 100';

const CSS = FOLD_SECTION_CSS + `
  .usp-sec { --pad-top: calc(var(--section-y) * 0.9); background: var(--canvas); padding-bottom: calc(var(--section-y) * 1.2); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
  .usp-micro { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-sm); font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo); }
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
  .usp-step { display: block; font-family: var(--font-mono, monospace); font-size: 0.75rem; letter-spacing: 0.12em; color: var(--grey-metal); margin-bottom: var(--space-xs); }
  .usp-node-label { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1.25rem; font-weight: 650; letter-spacing: -0.015em; color: var(--ink); margin-bottom: var(--space-xs); }
  .usp-node--last .usp-node-label { color: var(--burgundy); }
  .usp-node-desc { font-size: 0.9375rem; color: var(--body); line-height: 1.5; }
  .usp-floor, .usp-dots { display: none; }

  /* Quote */
  .usp-quote { margin-top: calc(var(--space-xl) * 1.5); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); align-items: center; }
  .usp-peak { position: relative; width: 144px; height: 112px; flex-shrink: 0; }
  .usp-peak i { position: absolute; left: 0; top: 0; bottom: 0; width: 56%; background: var(--burgundy); clip-path: polygon(0 100%, 44% 0, 100% 0, 56% 100%); }
  .usp-peak b { position: absolute; left: 44%; right: 0; top: 0; bottom: 0; background: var(--silver-gradient); clip-path: polygon(44% 0, 100% 0, 56% 100%, 0 100%); opacity: .55; }
  .usp-quote-text { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.625rem, 3.6vw, 3.25rem); font-weight: 650; line-height: 1.12; letter-spacing: -0.03em; color: var(--ink); max-width: 24ch; text-wrap: balance; margin-bottom: var(--space-md); }
  .usp-quote-hl { background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: var(--burgundy); }
  .usp-quote-attr { display: flex; align-items: center; gap: var(--space-sm); font-size: 0.875rem; color: var(--body); font-weight: 600; }

  @media (min-width: 640px) { .usp-chain { grid-template-columns: repeat(2, minmax(0, 1fr)); } .usp-node--last { grid-column: 1 / -1; } }
  @media (min-width: 1024px) {
    /* static desktop (no JS / reduced motion): five tiles in a row */
    .usp-chain { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-md); padding: 0; align-items: stretch; }
    .usp-chain::before, .usp-node::before { display: none; }
    .usp-node--last { grid-column: auto; }
    .usp-quote { grid-template-columns: 200px minmax(0, 1fr); gap: var(--space-lg); margin-top: calc(var(--space-xl) * 1.8); }
    .usp-peak { width: 200px; height: 156px; }

    /* ── 3D ring ─────────────────────────────────────────────────────── */
    .usp-sec[data-ring='on'] .usp-stage { position: relative; height: 620px; isolation: isolate; margin-top: var(--space-lg);
      perspective: 1700px; perspective-origin: 50% 20%; }
    .usp-sec[data-ring='on'] .usp-ring { --r: 360px; position: absolute; left: 50%; top: 38%; width: 0; height: 0; z-index: 1;
      transform-style: preserve-3d; transform: rotateX(-11deg) rotateY(var(--ry, 0deg)); }
    .usp-sec[data-ring='on'] .usp-chain { position: absolute; left: 0; top: 0; width: 0; height: 0;
      display: block; margin: 0; padding: 0; transform-style: preserve-3d; }
    .usp-sec[data-ring='on'] .usp-node { position: absolute; left: -132px; top: -128px; width: 264px; height: 256px;
      transform: rotateY(calc(var(--i) * ${STEP_DEG}deg)) translateZ(var(--r)) rotateY(calc(-1 * (var(--i) * ${STEP_DEG}deg + var(--ry, 0deg)))) rotateX(11deg); }
    .usp-sec[data-ring='on'] .usp-node[data-active='true'] .usp-shape { background: var(--burgundy); }
    /* the floor the tiles stand on: a solid track, drawn as the ring turns */
    .usp-sec[data-ring='on'] .usp-floor { display: block; position: absolute; left: calc(-1 * var(--r)); top: calc(-1 * var(--r));
      width: calc(2 * var(--r)); height: calc(2 * var(--r)); overflow: visible;
      transform: translateY(176px) rotateX(90deg); pointer-events: none; }
    /* the floor lives in its own layer under the tiles so the track never crosses their text */
    .usp-sec[data-ring='on'] .usp-ring--floor { z-index: 0; }
    /* depth: an opaque wash of the page colour (not opacity) so tiles behind never show through */
    .usp-sec[data-ring='on'] .usp-node::after { content: ""; position: absolute; inset: -1px; background: var(--canvas);
      opacity: var(--fog, 0); pointer-events: none; }
    .usp-floor .t { fill: none; stroke: var(--grey-warm); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
    .usp-floor .p { fill: none; stroke: var(--burgundy); stroke-width: 0.9; }
    .usp-floor .s { fill: var(--surface); stroke: var(--burgundy); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
    .usp-floor .s[data-on='true'] { fill: var(--burgundy); }
    /* step index under the stage */
    .usp-sec[data-ring='on'] .usp-dots { display: flex; justify-content: center; gap: var(--space-md); margin: 0; padding: 0; list-style: none; }
    .usp-dots li { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; color: var(--muted); transition: color 300ms; }
    .usp-dots li i { width: 8px; height: 8px; border: 1.5px solid var(--grey-metal); transform: rotate(45deg); transition: background-color 300ms, border-color 300ms; }
    .usp-dots li[data-on='true'] { color: var(--burgundy); }
    .usp-dots li[data-on='true'] i { background: var(--burgundy); border-color: var(--burgundy); }
  }
`;

export default function RequirementToRepeat() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chainRef = useRef<HTMLOListElement>(null);
  const progRef = useRef<SVGPathElement>(null);
  const [ring, setRing] = useState(false);
  const [active, setActive] = useState(0);

  useMaskRise(headingRef);
  useMaskRise(quoteRef);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const chain = chainRef.current;
    if (!chain) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const stage = stageRef.current, prog = progRef.current;
      if (!stage || !prog) return;
      const nodes = gsap.utils.toArray<HTMLElement>('.usp-node', chain);
      setRing(true);
      /* one pass: steps 0..N-1 come to the front (80% of the scroll), then the track closes the loop */
      const st = { turn: 0, track: 0 };
      const paint = () => {
        stage.style.setProperty('--ry', `${-st.turn * STEP_DEG}deg`);
        prog.style.strokeDashoffset = String(1 - st.track);
        nodes.forEach((n, i) => {
          const depth = (Math.cos(((i - st.turn) * STEP_DEG * Math.PI) / 180) + 1) / 2; /* 1 front, 0 back */
          n.style.setProperty('--fog', String(Math.min(0.86, (1 - depth) ** 1.2)));
        });
        setActive(Math.min(N - 1, Math.round(st.turn)));
      };
      paint();
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: paint,
        scrollTrigger: {
          trigger: stage, start: 'center 55%', end: `+=${N * 360}`,
          pin: sectionRef.current, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      tl.to(st, { turn: N - 1, track: (N - 1) / N, duration: 0.8, ease: 'sine.inOut' })
        .to(st, { track: 1, duration: 0.2, ease: 'power2.out' });
      return () => { tl.scrollTrigger?.kill(); tl.kill(); stage.style.removeProperty('--ry'); nodes.forEach(n => n.style.removeProperty('--fog')); setRing(false); setActive(0); };
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
    <section ref={sectionRef} aria-labelledby="usp-heading" className="fold-sec fold-sec--step usp-sec" data-ring={ring ? 'on' : undefined}>
      <style>{CSS}</style>
      <FoldEdge variant="step" />
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
        <p className="usp-micro">How we work</p>
        <h2 id="usp-heading" ref={headingRef} className="usp-h">From Requirement to Repeat Supply.</h2>
        {/* COPY: drafted, needs client approval */}
        <p className="usp-lead">We don&apos;t just manufacture plastic components. We build reliable, repeatable supply partnerships.</p>

        <div ref={stageRef} className="usp-stage">
          <div className="usp-ring usp-ring--floor" aria-hidden="true">
            {/* floor of the ring: grey track + burgundy progress + a stud under each step */}
            <svg className="usp-floor" viewBox="-100 -100 200 200" aria-hidden="true">
              <path className="t" d={TRACK} />
              <path ref={progRef} className="p" d={TRACK} pathLength={1} strokeDasharray="1 1" strokeDashoffset="1" />
              {uspChain.map((n, i) => {
                const a = (i * STEP_DEG * Math.PI) / 180;
                return <circle key={n.step} className="s" data-on={ring && i <= active ? 'true' : undefined}
                  cx={Math.round(Math.sin(a) * 1000) / 10} cy={Math.round(Math.cos(a) * 1000) / 10} r="3.2" />;
              })}
            </svg>
          </div>
          <div className="usp-ring">
          <ol ref={chainRef} className="usp-chain">
            {uspChain.map((node, i) => {
              const last = i === N - 1;
              return (
                <li key={node.step} className={`usp-node${last ? ' usp-node--last' : ''}`} style={{ ['--i' as string]: i }}
                  data-active={ring && i === active ? 'true' : undefined}
                  data-done={ring && i < active ? 'true' : undefined}>
                  <div className="usp-shape"><div className="usp-node-in">
                    <StepGlyph name={node.label} />
                    <span className="usp-step" aria-hidden="true">{String(node.step).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
                    <p className="usp-node-label">{node.label}</p>
                    {/* COPY: drafted, needs client approval */}
                    <p className="usp-node-desc">{node.description}</p>
                  </div></div>
                </li>
              );
            })}
          </ol>
          </div>
        </div>
        <ol className="usp-dots" aria-hidden="true">
          {uspChain.map((n, i) => <li key={n.step} data-on={ring && i <= active ? 'true' : undefined}><i />{n.label}</li>)}
        </ol>

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
