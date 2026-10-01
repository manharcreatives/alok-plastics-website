/**
 * S7 · JourneyOrbit — §13 (rebuilt in Round 2, ask 12): a cinematic scroll roadmap.
 *
 * Desktop >= 1024px (motion allowed): the section pins and scroll scrubs a marker along a
 * winding, rising road drawn over a drawn factory-roofline backdrop. There is NO info box:
 * the milestone year (huge, metal gradient), its title and its line sit directly on the
 * page and mask-rise / swap as the marker reaches each milestone, like film credits.
 * 1998 -> 2000s -> 2010s -> 2020s (odometer runs 20 Cr+) -> Today -> The Future, where the
 * road continues as a dashed ghost road off the corner of the frame.
 *
 * Mobile / tablet / reduced motion: no pin. A vertical road runs down the left, one
 * segment per milestone; segments fill (scaleY, scrubbed) as you scroll and the stacked
 * milestones rise in. Reduced motion shows everything already drawn.
 *
 * Layout switching is pure CSS (media queries) so there is no hydration flash; every
 * GSAP piece lives inside gsap.matchMedia with the matching query so it fully reverts.
 * Only transform / opacity / stroke-dashoffset / clip are animated.
 */

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, DURATIONS, EASINGS } from '@/lib/motion';
import { useMaskRise } from '@/hooks/useMotion';
import { journeyMarkers } from '@/content/journey';
import JourneyBackdrop from '@/components/art/JourneyBackdrop';
import type { JourneyMarker } from '@/content/types';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_Q = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
const MOBILE_Q = '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)';
/* Scroll distance per timeline unit, in viewport heights (scrub). */
const VH_PER_UNIT = 0.7;

/* ── The road, in a 1600 x 900 drawing space ─────────────────────────────── */
const LEAD_IN = 'M690 980C690 920 720 890 720 830';
const MAIN = 'M720 830C720 720 960 760 960 640S740 540 880 450S1160 430 1160 340S1010 270 1180 230';
const FUTURE = 'M1180 230C1300 200 1380 150 1560 70';
const ROAD = `${LEAD_IN}${MAIN.replace('M720 830', '')}`; // one continuous strip for the road surface
const FUTURE_STOP = 0.78; // where along the ghost road "The Future" stands

const last = journeyMarkers.length - 1;

/* A small odometer: digit strips that roll to the verified number. Final value shows without JS. */
function Odometer({ stat }: { stat: NonNullable<JourneyMarker['stat']> }) {
  const tens = Math.floor(stat.value / 10);
  const ones = Array.from({ length: stat.value + 1 }, (_, i) => i % 10);
  const tensDigits = Array.from({ length: tens + 1 }, (_, i) => i);
  return (
    <div className="jrn-odo" data-odo={stat.value} role="img" aria-label={`${stat.value} ${stat.suffix} ${stat.label}`}>
      <span className="jrn-odo-num" aria-hidden="true">
        {tens > 0 && (
          <span className="odo-win">
            <span className="odo-col" data-col="tens" data-n={tensDigits.length} style={{ translate: `0 -${((tensDigits.length - 1) / tensDigits.length) * 100}%` }}>
              {tensDigits.map((d, i) => <span key={i}>{d}</span>)}
            </span>
          </span>
        )}
        <span className="odo-win">
          <span className="odo-col" data-col="ones" data-n={ones.length} style={{ translate: `0 -${((ones.length - 1) / ones.length) * 100}%` }}>
            {ones.map((d, i) => <span key={i}>{d}</span>)}
          </span>
        </span>
        <span className="odo-suffix">{stat.suffix}</span>
      </span>
      <span className="jrn-odo-label" aria-hidden="true">{stat.label}</span>
    </div>
  );
}

function runOdometer(root: Element | null) {
  if (!root) return;
  const el = root.querySelector<HTMLElement>('[data-odo]');
  if (!el) return;
  const value = Number(el.dataset.odo);
  const tens = el.querySelector<HTMLElement>('[data-col="tens"]');
  const ones = el.querySelector<HTMLElement>('[data-col="ones"]');
  const nT = Number(tens?.dataset.n ?? 1);
  const nO = Number(ones?.dataset.n ?? 1);
  [tens, ones].forEach(c => { if (c) c.style.translate = 'none'; });
  const o = { p: 0 };
  const paint = () => {
    if (ones) gsap.set(ones, { yPercent: -(o.p / nO) * 100 });
    if (tens) gsap.set(tens, { yPercent: -((o.p / 10) / nT) * 100 });
  };
  gsap.killTweensOf(o);
  paint();
  gsap.to(o, { p: value, duration: DURATIONS.full, ease: EASINGS.out, onUpdate: paint });
}

const CSS = `
.jrn { position: relative; isolation: isolate; background: linear-gradient(180deg, var(--canvas) 0%, var(--surface-alt) 100%); overflow: hidden; border-top: 1px solid var(--grey-warm); }
.jrn-inner { position: relative; z-index: 2; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; padding: calc(var(--section-y) + 24px) var(--grid-page-padding) 0; }
.jrn-label { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--muted); font-weight: 600; font-family: var(--font-archivo); margin-bottom: var(--space-sm); }
.jrn-label i { width: 24px; height: 2px; background: var(--burgundy); display: inline-block; }
.jrn-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 650; line-height: 1.1; letter-spacing: -0.025em; color: var(--ink); max-width: 18ch; text-wrap: balance; }

/* shared milestone typography */
.jrn-year { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; letter-spacing: -0.04em; line-height: 1; }
.jrn-year .jrn-rise { display: inline-block; background: var(--metal-gradient); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; padding-bottom: 0.1em; }
.jrn-title { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.25rem, 2vw, 1.625rem); font-weight: 650; letter-spacing: -0.015em; color: var(--ink); line-height: 1.2; }
.jrn-line { font-size: 1.0625rem; line-height: 1.65; color: var(--body); max-width: 42ch; }
.mk { display: block; overflow: hidden; }
.jrn-rise { display: block; will-change: transform; }
.jrn-future-tag { display: inline-flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; color: var(--muted); }
.jrn-future-tag i { width: 24px; border-top: 2px dashed var(--grey-metal); display: inline-block; }

/* odometer */
.jrn-odo { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--space-xs) var(--space-sm); margin-top: var(--space-sm); }
.jrn-odo-num { display: inline-flex; align-items: baseline; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(2rem, 3.4vw, 3rem); line-height: 1; letter-spacing: -0.03em; color: var(--burgundy); font-variant-numeric: tabular-nums; }
.odo-win { display: inline-block; height: 1em; overflow: hidden; }
.odo-col { display: flex; flex-direction: column; will-change: transform; }
.odo-col span { display: block; height: 1em; line-height: 1; }
.odo-suffix { margin-left: 0.15em; font-size: 0.6em; }
.jrn-odo-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; color: var(--muted); }

/* ── Layout switch: desktop = pinned stage, otherwise = vertical road ── */
.jrn-stage { display: none; }
.jrn-list { display: block; }

/* mobile / tablet vertical road */
.jrn-list { list-style: none; margin: var(--space-xl) 0 0; padding: 0 0 calc(var(--section-y) + 120px); position: relative; }
.jrn-li { position: relative; margin-left: 56px; padding-bottom: var(--space-xl); }
.jrn-li:last-child { padding-bottom: 0; }
.jrn-seg { position: absolute; left: -56px; top: 12px; bottom: -12px; width: 28px; background: var(--mist); border-left: 1px solid var(--grey-warm); border-right: 1px solid var(--grey-warm); }
.jrn-seg::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; transform: translateX(-50%); background: repeating-linear-gradient(to bottom, var(--grey-metal) 0 10px, transparent 10px 20px); opacity: .6; }
.jrn-seg-fill { position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; margin-left: -2px; background: var(--burgundy); transform-origin: top; }
.jrn-li:last-child .jrn-seg { bottom: 40%; background: transparent; border-left: 1px dashed var(--grey-metal); border-right: 1px dashed var(--grey-metal); -webkit-mask-image: linear-gradient(to bottom, var(--ink), transparent); mask-image: linear-gradient(to bottom, var(--ink), transparent); }
.jrn-li:last-child .jrn-seg-fill { display: none; }
.jrn-node { position: absolute; left: -56px; top: 0; width: 28px; height: 24px; display: grid; place-items: center; }
.jrn-node i { width: 14px; height: 14px; transform: rotate(45deg); background: var(--surface); border: 2px solid var(--burgundy); display: block; transition: background-color .4s; }
.jrn-li.on .jrn-node i { background: var(--burgundy); }
.jrn-li:last-child .jrn-node i { border-style: dashed; border-color: var(--grey-metal); }
.jrn-li .jrn-year { font-size: clamp(3.5rem, 17vw, 6rem); margin-bottom: var(--space-xs); }
.jrn-li .jrn-year[data-long] { font-size: clamp(2.5rem, 12vw, 4.5rem); }
.jrn-li .jrn-title { margin-bottom: var(--space-xs); }

@media ${DESKTOP_Q} {
  .jrn { height: 100svh; min-height: 640px; }
  .jrn-inner { padding-top: calc(var(--section-y) - 8px); }
  .jrn-list { display: none; }
  .jrn-stage { display: block; position: absolute; inset: 0; z-index: 1; pointer-events: none; }
  .jrn-road { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
  .jrn-texts { position: absolute; left: max(var(--grid-page-padding), calc((100% - var(--grid-max)) / 2)); top: clamp(300px, 38svh, 400px); width: min(34vw, 520px); }
  .jrn-ms { position: absolute; left: 0; top: 0; width: 100%; visibility: hidden; display: flex; flex-direction: column; gap: var(--space-xs); }
  .jrn-ms:first-child { visibility: visible; }
  .jrn-ms .jrn-year { --y: clamp(4.5rem, min(8.2vw, 17svh), 8rem); font-size: var(--y); }
  .jrn-ms .jrn-year[data-long] { font-size: calc(var(--y) * 0.62); }
  .jrn-pulse { transform-box: fill-box; transform-origin: center; animation: jrn-pulse 2.4s cubic-bezier(.16,1,.3,1) infinite; }
}
@keyframes jrn-pulse { 0% { transform: scale(.6); opacity: .6; } 100% { transform: scale(2.2); opacity: 0; } }
`;

export default function JourneyOrbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    /* ── Desktop: pinned scrub along the road ─────────────────────────── */
    mm.add(DESKTOP_Q, () => {
      const q = <T extends Element>(s: string) => section.querySelector<T>(s)!;
      const main = q<SVGPathElement>('#jrn-main');
      const fut = q<SVGPathElement>('#jrn-future');
      const prog = q<SVGPathElement>('#jrn-progress');
      const marker = q<SVGGElement>('#jrn-marker');
      const stones = gsap.utils.toArray<SVGGElement>('.jrn-stone', section);
      const blocks = gsap.utils.toArray<HTMLElement>('.jrn-ms', section);
      const L1 = main.getTotalLength();
      const L2 = fut.getTotalLength();

      const posOf = (t: number) => {
        if (t <= 4) return main.getPointAtLength((t / 4) * L1);
        return fut.getPointAtLength(((t - 4) * FUTURE_STOP) * L2);
      };

      /* place milestone stones once */
      stones.forEach((s, i) => {
        const p = posOf(i);
        gsap.set(s, { x: p.x, y: p.y, autoAlpha: 1 });
      });
      gsap.set(prog, { strokeDasharray: L1, strokeDashoffset: L1 });

      let active = 0;
      const paintStones = (n: number) => {
        stones.forEach((s, i) => s.classList.toggle('on', i <= n));
      };
      const rises = (b: HTMLElement) => b.querySelectorAll('.jrn-rise');
      const setActive = (n: number) => {
        if (n === active) return;
        const dir = n > active ? 1 : -1;
        const prev = blocks[active];
        const next = blocks[n];
        const prevIdx = active;
        gsap.killTweensOf([...rises(prev), ...rises(next)]);
        gsap.to(rises(prev), {
          yPercent: -110 * dir, duration: DURATIONS.short, ease: EASINGS.inOut, stagger: 0.04,
          onComplete: () => { if (active !== prevIdx) gsap.set(prev, { autoAlpha: 0 }); },
        });
        gsap.set(next, { autoAlpha: 1 });
        gsap.fromTo(rises(next), { yPercent: 110 * dir }, {
          yPercent: 0, duration: DURATIONS.long, ease: EASINGS.out, stagger: 0.08, delay: 0.2,
        });
        active = n;
        paintStones(n);
        if (journeyMarkers[n].stat) runOdometer(next);
      };

      const proxy = { t: 0 };
      const render = () => {
        const t = proxy.t;
        const p = posOf(t);
        gsap.set(marker, { x: p.x, y: p.y });
        gsap.set(prog, { strokeDashoffset: L1 - (Math.min(t, 4) / 4) * L1 });
        setActive(Math.max(0, Math.min(last, Math.floor(t + 0.12))));
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: render,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(tl.duration() * VH_PER_UNIT * window.innerHeight)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to({}, { duration: 0.5 });
      for (let i = 1; i <= last; i++) {
        tl.to(proxy, { t: i, duration: 0.7, ease: EASINGS.powerInOut });
        tl.to({}, { duration: 0.4 });
      }
      tl.to({}, { duration: 0.4 });
      render();

      return () => {
        gsap.killTweensOf(proxy);
        blocks.forEach(b => {
          gsap.killTweensOf(rises(b));
          gsap.set([b, ...rises(b)], { clearProps: 'all' });
        });
        gsap.set(stones, { clearProps: 'all' });
        gsap.set([prog, marker], { clearProps: 'all' });
      };
    });

    /* ── Mobile / tablet: scrubbed vertical road + rising milestones ──── */
    mm.add(MOBILE_Q, () => {
      const items = gsap.utils.toArray<HTMLElement>('.jrn-li', section);
      items.forEach(li => {
        const fill = li.querySelector('.jrn-seg-fill');
        const rise = li.querySelectorAll('.jrn-rise');
        gsap.set(rise, { yPercent: 110 });
        ScrollTrigger.create({
          trigger: li,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(rise, { yPercent: 0, duration: DURATIONS.long, ease: EASINGS.out, stagger: 0.08 });
            if (li.querySelector('[data-odo]')) runOdometer(li);
          },
        });
        ScrollTrigger.create({
          trigger: li,
          start: 'top 62%',
          onToggle: self => li.classList.toggle('on', self.isActive || self.progress === 1),
          end: 'bottom 62%',
        });
        if (fill) {
          gsap.fromTo(fill, { scaleY: 0 }, {
            scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: li, start: 'top 62%', end: 'bottom 62%', scrub: 0.6 },
          });
        }
      });
      return () => {
        items.forEach(li => {
          gsap.set(li.querySelectorAll('.jrn-rise, .jrn-seg-fill'), { clearProps: 'all' });
          li.classList.remove('on');
        });
      };
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="jrn" aria-labelledby="journey-heading">
      <style>{CSS}</style>
      <JourneyBackdrop />

      {/* Desktop stage: the road and the credits-style text, no box */}
      <div className="jrn-stage">
        <svg className="jrn-road" viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMid slice" fill="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="jrn-mk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--burgundy-bright)' }} />
              <stop offset="0.5" style={{ stopColor: 'var(--burgundy)' }} />
              <stop offset="1" style={{ stopColor: 'var(--burgundy-deep)' }} />
            </linearGradient>
          </defs>
          {/* road surface: edge + body + centre dashes */}
          <path d={ROAD} stroke="var(--grey-metal)" strokeOpacity="0.4" strokeWidth="68" strokeLinecap="butt" strokeLinejoin="round" />
          <path d={ROAD} stroke="var(--mist)" strokeWidth="64" strokeLinecap="butt" strokeLinejoin="round" />
          <path d={ROAD} stroke="var(--grey-metal)" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="14 12" />
          {/* the road ahead: ghost road, dashed */}
          <path d={FUTURE} stroke="var(--grey-metal)" strokeOpacity="0.16" strokeWidth="64" strokeDasharray="30 20" />
          <path id="jrn-future" d={FUTURE} stroke="var(--grey-metal)" strokeOpacity="0.7" strokeWidth="2.5" strokeDasharray="4 14" strokeLinecap="round" />
          {/* travelled road */}
          <path id="jrn-main" d={MAIN} stroke="none" />
          <path id="jrn-progress" d={MAIN} stroke="var(--burgundy)" strokeWidth="5" strokeLinecap="round" />
          {/* milestone stones */}
          {journeyMarkers.map((m, i) => (
            <g key={m.year} className="jrn-stone" style={{ visibility: 'hidden' }} data-i={i}>
              <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" className="stone-sq" />
              <text x="-52" y="5" textAnchor="end" className="stone-tx">{m.year}</text>
            </g>
          ))}
          {/* the marker that travels */}
          <g id="jrn-marker">
            <circle className="jrn-pulse" r="20" stroke="var(--burgundy)" strokeWidth="1.5" />
            <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" fill="url(#jrn-mk)" stroke="var(--surface)" strokeWidth="2.5" />
          </g>
        </svg>
        <style>{`
          .stone-sq { fill: var(--surface); stroke: var(--grey-metal); stroke-width: 2; transition: fill .4s, stroke .4s; }
          .stone-tx { font-family: var(--font-mono); font-size: 17px; fill: var(--grey-metal); letter-spacing: 0.08em; text-transform: uppercase; transition: fill .4s; }
          .jrn-stone.on .stone-sq { fill: var(--burgundy); stroke: var(--burgundy); }
          .jrn-stone.on .stone-tx { fill: var(--burgundy); }
        `}</style>

        <div className="jrn-texts">
          {journeyMarkers.map((m, i) => (
            <article key={m.year} className="jrn-ms" data-ms={i}>
              <p className="jrn-year" {...(m.year.length > 6 ? { 'data-long': '' } : {})}>
                <span className="mk"><span className="jrn-rise">{m.year}</span></span>
              </p>
              <h3 className="jrn-title"><span className="mk"><span className="jrn-rise">{m.title}</span></span></h3>
              <p className="jrn-line"><span className="mk"><span className="jrn-rise">{m.line}</span></span></p>
              {m.stat && <Odometer stat={m.stat} />}
              {m.isFuture && <span className="jrn-future-tag"><i aria-hidden="true" />The road continues</span>}
            </article>
          ))}
        </div>
      </div>

      <div className="jrn-inner">
        <div className="jrn-label"><i aria-hidden="true" />Our Journey</div>
        <h2 id="journey-heading" ref={headingRef} className="jrn-h2">Built on Manufacturing. Grown on Trust.</h2>

        {/* Mobile / tablet / reduced-motion: the vertical road */}
        <ol className="jrn-list">
          {journeyMarkers.map(m => (
            <li key={m.year} className="jrn-li">
              <span className="jrn-seg" aria-hidden="true"><span className="jrn-seg-fill" /></span>
              <span className="jrn-node" aria-hidden="true"><i /></span>
              <p className="jrn-year" {...(m.year.length > 6 ? { 'data-long': '' } : {})}>
                <span className="mk"><span className="jrn-rise">{m.year}</span></span>
              </p>
              <h3 className="jrn-title"><span className="mk"><span className="jrn-rise">{m.title}</span></span></h3>
              <p className="jrn-line"><span className="mk"><span className="jrn-rise">{m.line}</span></span></p>
              {m.stat && <Odometer stat={m.stat} />}
              {m.isFuture && <span className="jrn-future-tag"><i aria-hidden="true" />The road continues</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
