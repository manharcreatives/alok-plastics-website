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

import { useEffect, useRef } from 'react';
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
const MAIN = 'M720 830C720 720 960 760 960 640S740 540 880 450S1160 430 1160 340S1010 270 1180 230';
const FUTURE = 'M1180 230C1300 200 1380 150 1560 70';
const FUTURE_STOP = 0.78; // where along the ghost road "The Future" stands

/* ── Road surface geometry: sampled from the same beziers so the surface follows the
   centre line, but wider near the viewer (bottom) and narrower toward the horizon (top):
   a perspective foreshortening hint. Centre dashes shrink with the road. ──────────── */
type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt];
const BEZ_MAIN: Seg[] = [
  [[690, 980], [690, 920], [720, 890], [720, 830]],
  [[720, 830], [720, 720], [960, 760], [960, 640]],
  [[960, 640], [960, 520], [740, 540], [880, 450]],
  [[880, 450], [1020, 360], [1160, 430], [1160, 340]],
  [[1160, 340], [1160, 250], [1010, 270], [1180, 230]],
];
const BEZ_FUT: Seg[] = [[[1180, 230], [1300, 200], [1380, 150], [1560, 70]]];
const roadW = (y: number) => 30 + Math.max(0, Math.min(1, (y - 70) / 910)) * 56; // 86 at the bottom, ~30 at the horizon

function sample(segs: Seg[], per = 40) {
  const pts: { x: number; y: number; nx: number; ny: number }[] = [];
  segs.forEach(([p0, p1, p2, p3], si) => {
    for (let i = si === 0 ? 0 : 1; i <= per; i++) {
      const t = i / per, u = 1 - t;
      const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
      const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
      const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
      const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
      const l = Math.hypot(dx, dy) || 1;
      pts.push({ x, y, nx: -dy / l, ny: dx / l });
    }
  });
  return pts;
}
const r1 = (n: number) => Math.round(n * 10) / 10;
function roadShapes(segs: Seg[]) {
  const c = sample(segs);
  const edge = (k: number) => c.map(q => ({ x: q.x + q.nx * roadW(q.y) * k, y: q.y + q.ny * roadW(q.y) * k }));
  const line = (a: { x: number; y: number }[]) => 'M' + a.map(q => `${r1(q.x)} ${r1(q.y)}`).join('L');
  const L = edge(-0.5), R = edge(0.5);
  const surface = `${line(L)}L${R.slice().reverse().map(q => `${r1(q.x)} ${r1(q.y)}`).join('L')}Z`;
  const kerbL = line(edge(-0.42)), kerbR = line(edge(0.42));
  /* centre dashes, length proportional to local road width */
  let dashes = '';
  let acc = 0, on = false, d = '';
  for (let i = 1; i < c.length; i++) {
    const w = roadW(c[i].y);
    acc += Math.hypot(c[i].x - c[i - 1].x, c[i].y - c[i - 1].y);
    const run = on ? w * 0.34 : w * 0.3;
    if (!on) { if (acc >= run) { on = true; acc = 0; d = `M${r1(c[i].x)} ${r1(c[i].y)}`; } }
    else { d += `L${r1(c[i].x)} ${r1(c[i].y)}`; if (acc >= run) { on = false; acc = 0; dashes += d; d = ''; } }
  }
  return { surface, kerbL, kerbR, dashes, edgeL: line(L), edgeR: line(R) };
}
const ROAD_MAIN = roadShapes(BEZ_MAIN);
const ROAD_FUT = roadShapes(BEZ_FUT);

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
  /* slow, even roll (matches the AboutIntro counters) so the climb from 0 reads step by step */
  gsap.to(o, { p: value, duration: 3.2, ease: 'sine.inOut', onUpdate: paint });
}

const CSS = `
.jrn { position: relative; isolation: isolate; background: linear-gradient(180deg, var(--canvas) 0%, var(--surface-alt) 100%); overflow: hidden; border-top: 1px solid var(--grey-warm); }
.jrn-inner { position: relative; z-index: 2; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; padding: calc(var(--section-y) + 24px) var(--grid-page-padding) 0; }
.jrn-label { display: flex; align-items: center; gap: 10px; font-size: var(--fs-label); text-transform: uppercase; letter-spacing: var(--tr-label); color: var(--muted); font-weight: 600; font-family: var(--font-archivo), sans-serif; margin-bottom: var(--space-sm); line-height: var(--lh-label); }
.jrn-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h2); font-weight: 650; line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--ink); max-width: 18ch; text-wrap: balance; }

/* shared milestone typography */
.jrn-year { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; letter-spacing: -0.04em; line-height: 1; }
.jrn-year .jrn-rise { display: inline-block; background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; padding-bottom: 0.1em; }
.jrn-title { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h3); font-weight: 650; letter-spacing: var(--tr-h3); color: var(--ink); line-height: var(--lh-h3); }
.jrn-line { font-size: 1.0625rem; line-height: 1.65; color: var(--body); max-width: 42ch; }
.mk { display: block; overflow: hidden; }
.jrn-rise { display: block; will-change: transform; }
.jrn-future-tag { display: inline-flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; color: var(--muted); }
.jrn-future-tag i { width: 24px; border-top: 2px dashed var(--grey-metal); display: inline-block; }

/* odometer */
.jrn-odo { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--space-xs) var(--space-sm); margin-top: var(--space-sm); }
.jrn-ms .jrn-odo { margin-top: var(--space-lg); }
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
.jrn-seg { position: absolute; left: -58px; top: 12px; bottom: -12px; width: 32px; background: color-mix(in srgb, var(--grey-warm) 50%, transparent); border-left: 2px solid var(--grey-metal); border-right: 2px solid var(--grey-metal); box-shadow: inset 3px 0 0 var(--surface), inset -3px 0 0 var(--surface); }
.jrn-seg::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; transform: translateX(-50%); background: repeating-linear-gradient(to bottom, var(--surface) 0 12px, transparent 12px 22px); }
.jrn-seg-fill { position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; margin-left: -2px; background: var(--burgundy); transform-origin: top; }
.jrn-li:last-child .jrn-seg { bottom: 40%; background: transparent; border-left: 1px dashed var(--grey-metal); border-right: 1px dashed var(--grey-metal); -webkit-mask-image: linear-gradient(to bottom, var(--ink), transparent); mask-image: linear-gradient(to bottom, var(--ink), transparent); }
.jrn-li:last-child .jrn-seg-fill { display: none; }
.jrn-node { position: absolute; left: -58px; top: -2px; width: 32px; height: 28px; display: grid; place-items: center; }
.jrn-node i { width: 18px; height: 18px; transform: rotate(45deg); background: var(--surface); border: 2.5px solid var(--burgundy); box-shadow: 0 0 0 5px var(--canvas); display: block; transition: background-color 400ms cubic-bezier(.16,1,.3,1); }
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
  .jrn-pulse { transform-box: fill-box; transform-origin: center; }
  .jrn.live .jrn-pulse { animation: jrn-pulse 2.4s cubic-bezier(.16,1,.3,1) infinite; }
}
@keyframes jrn-pulse { 0% { transform: scale(.6); opacity: .6; } 100% { transform: scale(2.2); opacity: 0; } }
`;

export default function JourneyOrbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  /* the looping marker pulse only runs while the section is on screen */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('live', e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      const settle = () => {
        /* snap whatever swap is in flight to its end state so nothing rests half-masked */
        blocks.forEach((b, i) => {
          gsap.getTweensOf(rises(b)).forEach(tw => tw.progress(1));
          if (i !== active) gsap.set(b, { autoAlpha: 0 });
        });
      };
      const setActive = (n: number) => {
        if (n === active) return;
        const dir = n > active ? 1 : -1;
        const prev = blocks[active];
        const next = blocks[n];
        const prevIdx = active;
        gsap.killTweensOf([...rises(prev), ...rises(next)]);
        gsap.to(rises(prev), {
          yPercent: -110 * dir, duration: DURATIONS.micro, ease: EASINGS.inOut, stagger: 0.03,
          onComplete: () => { if (active !== prevIdx) gsap.set(prev, { autoAlpha: 0 }); },
        });
        gsap.set(next, { autoAlpha: 1 });
        gsap.fromTo(rises(next), { yPercent: 110 * dir }, {
          yPercent: 0, duration: DURATIONS.medium, ease: EASINGS.out, stagger: 0.06, delay: 0.1,
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
        /* hysteresis: advance a hair before a stone, retreat only once clearly back past it */
        const up = Math.floor(t + 0.12);
        const down = Math.floor(t + 0.12 + 0.18);
        const n = Math.max(0, Math.min(last, up > active ? up : down < active ? down : active));
        setActive(n);
      };

      const tl = gsap.timeline({
        defaults: { ease: EASINGS.powerInOut },
        onUpdate: render,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(tl.duration() * VH_PER_UNIT * window.innerHeight)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onScrubComplete: settle,
          invalidateOnRefresh: true,
        },
      });
      tl.to({}, { duration: 0.3 });
      for (let i = 1; i <= last; i++) {
        tl.to(proxy, { t: i, duration: 0.7, ease: EASINGS.powerInOut });
        tl.to({}, { duration: 0.4 });
      }
      tl.to({}, { duration: 0.15 });
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
            scaleY: 1, ease: EASINGS.powerInOut,
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
            <linearGradient id="jrn-fade-g" gradientUnits="userSpaceOnUse" x1="0" y1="840" x2="0" y2="935">
              <stop offset="0" style={{ stopColor: "var(--surface)" }} />
              <stop offset="1" style={{ stopColor: "var(--ink)" }} />
            </linearGradient>
            <mask id="jrn-fade" maskUnits="userSpaceOnUse" x="0" y="-100" width="1700" height="1200">
              <rect x="0" y="-100" width="1700" height="1200" fill="url(#jrn-fade-g)" />
            </mask>
          </defs>
          {/* road surface: tarmac, kerbs, centre paint (perspective: wider near, narrower far) */}
          <g mask="url(#jrn-fade)">
            <path d={ROAD_MAIN.surface} fill="var(--grey-warm)" fillOpacity="0.5" />
            <path d={ROAD_MAIN.edgeL} stroke="var(--grey-metal)" strokeOpacity="0.55" strokeWidth="2" />
            <path d={ROAD_MAIN.edgeR} stroke="var(--grey-metal)" strokeOpacity="0.55" strokeWidth="2" />
            <path d={ROAD_MAIN.kerbL} stroke="var(--surface)" strokeOpacity="0.95" strokeWidth="2.5" />
            <path d={ROAD_MAIN.kerbR} stroke="var(--surface)" strokeOpacity="0.95" strokeWidth="2.5" />
            <path d={ROAD_MAIN.dashes} stroke="var(--surface)" strokeWidth="3.5" strokeLinecap="butt" />
          </g>
          {/* the road ahead: ghost road, dashed */}
          <path d={ROAD_FUT.surface} fill="var(--grey-metal)" fillOpacity="0.08" />
          <path d={ROAD_FUT.edgeL} stroke="var(--grey-metal)" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="10 8" />
          <path d={ROAD_FUT.edgeR} stroke="var(--grey-metal)" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="10 8" />
          <path id="jrn-future" d={FUTURE} stroke="var(--grey-metal)" strokeOpacity="0.75" strokeWidth="2.5" strokeDasharray="4 14" strokeLinecap="round" />
          {/* travelled road */}
          <path id="jrn-main" d={MAIN} stroke="none" />
          <path id="jrn-progress" d={MAIN} stroke="var(--burgundy)" strokeWidth="5" strokeLinecap="round" />
          {/* milestone stones */}
          {journeyMarkers.map((m, i) => (
            <g key={m.year} className="jrn-stone" style={{ visibility: 'hidden' }} data-i={i}>
              <circle r="19" className="stone-ring" />
              <rect x="-9" y="-9" width="18" height="18" transform="rotate(45)" className="stone-sq" />
              <circle r="2.6" className="stone-dot" />
              <line x1="-26" y1="0" x2="-58" y2="0" className="stone-tick" />
              <text x="-68" y="7" textAnchor="end" className="stone-tx">{m.year}</text>
            </g>
          ))}
          {/* the marker that travels */}
          <g id="jrn-marker">
            <circle className="jrn-pulse" r="20" stroke="var(--burgundy)" strokeWidth="1.5" />
            <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" fill="url(#jrn-mk)" stroke="var(--surface)" strokeWidth="2.5" />
          </g>
        </svg>
        <style>{`
          .stone-sq { fill: var(--surface); stroke: var(--grey-metal); stroke-width: 2.5; transition: fill 400ms cubic-bezier(.16,1,.3,1), stroke 400ms cubic-bezier(.16,1,.3,1); }
          .stone-tx { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: 22px; fill: var(--body); letter-spacing: -0.01em; paint-order: stroke; stroke: var(--canvas); stroke-width: 5px; stroke-linejoin: round; transition: fill 400ms cubic-bezier(.16,1,.3,1); }
          .stone-ring { fill: none; stroke: var(--grey-metal); stroke-opacity: .35; stroke-width: 1.2; transition: stroke 400ms cubic-bezier(.16,1,.3,1), stroke-opacity 400ms; }
          .stone-dot { fill: var(--grey-metal); transition: fill 400ms; }
          .stone-tick { stroke: var(--grey-metal); stroke-opacity: .5; stroke-width: 1.5; transition: stroke 400ms; }
          .jrn-stone.on .stone-ring { stroke: var(--burgundy); stroke-opacity: .55; }
          .jrn-stone.on .stone-dot { fill: var(--surface); }
          .jrn-stone.on .stone-tick { stroke: var(--burgundy); }
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
        <div className="jrn-label">Our Journey</div>
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
