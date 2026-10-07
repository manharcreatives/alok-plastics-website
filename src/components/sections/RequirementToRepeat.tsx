/**
 * S5 · RequirementToRepeat — "How we work" (§13)
 * bg: --burgundy-night with a 3D-set backdrop slot (/images/backgrounds/how-we-work.webp over a
 * drawn spotlight + perspective-floor placeholder). Stepped fold edge into the section.
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
 * The CEO pull-quote now lives in its own section (CeoQuote).
 */

'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Blueprint } from '@phosphor-icons/react/dist/csr/Blueprint';
import { PencilRuler } from '@phosphor-icons/react/dist/csr/PencilRuler';
import { Factory } from '@phosphor-icons/react/dist/csr/Factory';
import { Truck } from '@phosphor-icons/react/dist/csr/Truck';
import { ArrowsClockwise } from '@phosphor-icons/react/dist/csr/ArrowsClockwise';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import { uspChain, howWeWork } from '@/content/journey';
import PhotoBg from '@/components/ui/PhotoBg';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

/* Process icons: Phosphor, light weight, the same set as the rest of the site. */
const STEP_ICON = {
  Understand: Blueprint,
  Develop: PencilRuler,
  Manufacture: Factory,
  Supply: Truck,
  Repeat: ArrowsClockwise,
} as const;

function StepGlyph({ name }: { name: string }) {
  const Icon = STEP_ICON[name as keyof typeof STEP_ICON];
  if (!Icon) return null;
  return <Icon className="usp-ico" size={40} weight="light" aria-hidden="true" />;
}

const N = uspChain.length;
const STEP_DEG = 360 / N;
/* Floor track in the ring's own plane: starts under Understand (front, +z) and runs the same way
   the steps are laid out (Develop sits to the right). Two half-circle arcs, pathLength 1. */
const TRACK = 'M 0 100 A 100 100 0 0 0 0 -100 A 100 100 0 0 0 0 100';

const CSS = FOLD_SECTION_CSS + `
  .usp-sec { --pad-top: calc(var(--section-y) * 0.9); background: var(--burgundy-night); padding-bottom: calc(var(--section-y) * 0.6); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; isolation: isolate; }
  /* the set behind the ring: spotlight from above, a perspective floor grid, then the photograph, then a legibility shade */
  .usp-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .usp-bg-art { position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 55% at 50% 38%, color-mix(in srgb, var(--burgundy-bright) 45%, transparent) 0%, transparent 70%), linear-gradient(180deg, var(--burgundy-deep) 0%, var(--burgundy-night) 70%); }
  .usp-bg-art::after { content: ""; position: absolute; left: -20%; right: -20%; bottom: 0; height: 55%; opacity: .55;
    background-image: linear-gradient(color-mix(in srgb, var(--rose-pale) 16%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--rose-pale) 16%, transparent) 1px, transparent 1px);
    background-size: 48px 48px; transform: perspective(520px) rotateX(62deg); transform-origin: 50% 100%;
    -webkit-mask-image: linear-gradient(0deg, var(--ink) 0%, transparent 85%); mask-image: linear-gradient(0deg, var(--ink) 0%, transparent 85%); }
  .usp-bg-shade { position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--burgundy-night) 70%, transparent) 0%, color-mix(in srgb, var(--burgundy-night) 25%, transparent) 45%, color-mix(in srgb, var(--burgundy-night) 70%, transparent) 100%); }
  .usp-in { position: relative; z-index: 1; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .usp-micro { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-sm); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--rose-pale); font-family: var(--font-archivo), sans-serif; line-height: var(--lh-label); }
  .usp-h { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h2); font-weight: 650; line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--surface); margin-bottom: var(--space-sm); max-width: 20ch; text-wrap: balance; }
  .usp-lead { font-size: 1.0625rem; color: var(--pink-soft); line-height: 1.65; max-width: 60ch; }

  /* Chain — mobile: vertical on a rail. The rail alone marks the run; each step is
       identified by its own 01/05 mono index, so no node ornament sits on it. */
  .usp-chain { list-style: none; margin: var(--space-xl) 0 0; padding: 0 0 0 var(--space-md); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); position: relative; }
  .usp-chain::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(180deg, var(--rose) 0%, var(--grey-metal) 100%); }
  .usp-node { position: relative; display: flex; min-width: 0; }
  .usp-shape { flex: 1; display: flex; min-width: 0; padding: 1px; background: var(--grey-warm); clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%); }
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

  @media (min-width: 640px) { .usp-chain { grid-template-columns: repeat(2, minmax(0, 1fr)); } .usp-node--last { grid-column: 1 / -1; } }
  @media (min-width: 1024px) {
    /* static desktop (no JS / reduced motion): five tiles in a row */
    .usp-chain { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-md); padding: 0; align-items: stretch; }
    .usp-chain::before { display: none; }
    .usp-node--last { grid-column: auto; }

    /* ── 3D ring ─────────────────────────────────────────────────────── */
    .usp-sec[data-ring='on'] .usp-stage { position: relative; height: 560px; isolation: isolate; margin-top: var(--space-lg);
      perspective: 1700px; perspective-origin: 50% 20%; }
    .usp-sec[data-ring='on'] .usp-ring { --r: 360px; position: absolute; left: 50%; top: 38%; width: 0; height: 0; z-index: 1;
      transform-style: preserve-3d; transform: rotateX(-11deg) rotateY(var(--ry, 0deg)); }
    .usp-sec[data-ring='on'] .usp-chain { position: absolute; left: 0; top: 0; width: 0; height: 0;
      display: block; margin: 0; padding: 0; transform-style: preserve-3d; }
    .usp-sec[data-ring='on'] .usp-node { position: absolute; left: -132px; top: -128px; width: 264px; height: 256px;
      transform: rotateY(calc(var(--i) * ${STEP_DEG}deg)) translateZ(var(--r)) rotateY(calc(-1 * (var(--i) * ${STEP_DEG}deg + var(--ry, 0deg)))) rotateX(11deg); }
    .usp-sec[data-ring='on'] .usp-node[data-active='true'] .usp-shape { background: var(--rose); }
    /* the floor the tiles stand on: a solid track, drawn as the ring turns */
    .usp-sec[data-ring='on'] .usp-floor { display: block; position: absolute; left: calc(-1 * var(--r)); top: calc(-1 * var(--r));
      width: calc(2 * var(--r)); height: calc(2 * var(--r)); overflow: visible;
      transform: translateY(176px) rotateX(90deg); pointer-events: none; }
    /* the floor lives in its own layer under the tiles so the track never crosses their text */
    .usp-sec[data-ring='on'] .usp-ring--floor { z-index: 0; }
    /* depth: an opaque wash of the section colour (not opacity) so tiles behind never show through */
    .usp-sec[data-ring='on'] .usp-node::after { content: ""; position: absolute; inset: -1px; background: var(--burgundy-night);
      opacity: var(--fog, 0); pointer-events: none; }
    .usp-floor .t { fill: none; stroke: var(--grey-metal); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
    .usp-floor .p { fill: none; stroke: var(--rose); stroke-width: 0.9; }
    .usp-floor .s { fill: var(--burgundy-night); stroke: var(--rose); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
    .usp-floor .s[data-on='true'] { fill: var(--rose); }
    /* step index under the stage — a rule, matching the nav/drawer active language */
    .usp-sec[data-ring='on'] .usp-dots { display: flex; justify-content: center; gap: var(--space-md); margin: 0; padding: 0; list-style: none; }
    .usp-dots li { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; color: var(--rose-pale); transition: color 300ms; }
    .usp-dots li i { width: 2px; height: 12px; background: var(--grey-metal); flex-shrink: 0; transition: background-color 300ms; }
    .usp-dots li[data-on='true'] { color: var(--surface); }
    .usp-dots li[data-on='true'] i { background: var(--rose); }
  }
`;

export default function RequirementToRepeat() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chainRef = useRef<HTMLOListElement>(null);
  const progRef = useRef<SVGPathElement>(null);
  const [ring, setRing] = useState(false);
  const [active, setActive] = useState(0);

  useMaskRise(headingRef);

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

  return (
    <section ref={sectionRef} aria-labelledby="usp-heading" className="fold-sec fold-sec--step usp-sec" data-ring={ring ? 'on' : undefined}>
      <style>{CSS}</style>
      <div aria-hidden="true" className="usp-bg">
        <div className="usp-bg-art" />
        <PhotoBg src="/images/backgrounds/how-we-work.webp" opacity={0.55} position="center" />
        <div className="usp-bg-shade" />
      </div>
      <FoldEdge variant="step" />
      <div className="usp-in">
        <p className="usp-micro">{howWeWork.label}</p>
        <h2 id="usp-heading" ref={headingRef} className="usp-h">{howWeWork.title}</h2>
        {/* COPY: drafted, needs client approval */}
        <p className="usp-lead">{howWeWork.lead}</p>

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

      </div>
    </section>
  );
}
