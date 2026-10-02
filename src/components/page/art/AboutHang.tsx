/**
 * AboutHang: the original logo hanging from the crease of the About hero's folded peak.
 *
 * One rigid assembly (anchor fitting, hairline cable, shackle ring, logo) pivots on the single
 * hang point like a pendulum, so the cable leans and the logo follows. The logo hangs from its ring
 * and stays almost level (counter-rotated), so it never reads as tilted or spinning.
 *
 * Motion: a damped spring drives the swing angle toward a target made of
 *  - idle: two slow, incommensurate sines (never visibly repeats), and
 *  - proximity: a fine pointer near the logo pushes it AWAY from the side it approaches from,
 *    stronger the closer it gets; the influence eases in/out so nothing snaps.
 * One rAF loop, only while the hero is on screen and the tab visible; it writes one SVG
 * `transform` attribute per frame (no React state, no layout). Coarse pointers: idle only, smaller.
 * Reduced motion: no loop, static and centred.
 */
'use client';

import { useEffect, useRef } from 'react';
import Logo from '@/components/brand/Logo';
import { D } from './artCss';

/* Geometry in the AboutArt viewBox. The crease underside of the peak is y 290; the logo keeps its
   master proportions (2620 x 957) and sits inside the V's hollow, clear of both legs even at full swing. */
const PIVOT = { x: 320, y: 299 };
const CABLE_END = 452;
const RING_Y = 456;
const LOGO_W = 230;
const LOGO_H = Math.round((LOGO_W * 957) / 2620);
const LOGO_Y = RING_Y + 8;
const LOGO_CY = LOGO_Y + LOGO_H / 2;

/* Swing limits (degrees). The target never asks for more than TARGET_DEG; the spring may overshoot it
   a little (that is the momentum), and SAFE_DEG (~25 units sideways at the logo) is only a safety net. */
const TARGET_DEG = 5.5;
const SAFE_DEG = 7;
const IDLE = [{ a: 1.6, p: 5.3, ph: 0 }, { a: 0.7, p: 8.7, ph: 1.3 }];
const PUSH_DEG = 6;          /* lean when the cursor is at the logo's edge */
const RADIUS = 170;          /* proximity radius, measured from the logo's edge (viewBox units) */
const LEVEL = 0.78;          /* share of the swing the logo cancels so it hangs nearly level */
const K = 16, DAMP = 2.8;    /* spring stiffness / damping (slightly under-damped: a little momentum) */

export default function AboutHang() {
  const swingRef = useRef<SVGGElement>(null);
  const levelRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const swing = swingRef.current, level = levelRef.current;
    const svg = swing?.ownerSVGElement;
    if (!swing || !level || !svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const idleScale = finePointer ? 1 : 0.6;
    let theta = 0, vel = 0, influence = 0, push = 0;
    let pointer: { x: number; y: number } | null = null;
    let raf = 0, last = 0, onScreen = false;
    const t0 = performance.now();

    const toSvg = (cx: number, cy: number) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') pointer = toSvg(e.clientX, e.clientY); };
    const onLeave = () => { pointer = null; };

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - (last || now)) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      let idle = 0;
      for (const s of IDLE) idle += s.a * Math.sin((2 * Math.PI * t) / s.p + s.ph);
      idle *= idleScale;

      /* proximity: away from the cursor's side, eased so entering/leaving the radius is smooth */
      let rawInfluence = 0, rawPush = 0;
      if (pointer) {
        const logoX = PIVOT.x - (LOGO_CY - PIVOT.y) * Math.sin((theta * Math.PI) / 180);
        const dx = pointer.x - logoX, dy = pointer.y - LOGO_CY;
        /* distance to the logo's box, so the push builds as the cursor nears the logo, not its centre */
        const d = Math.hypot(Math.max(0, Math.abs(dx) - LOGO_W / 2), Math.max(0, Math.abs(dy) - LOGO_H / 2));
        if (d < RADIUS) {
          rawInfluence = (1 - d / RADIUS) ** 1.5;
          /* cursor on the right -> positive angle -> logo swings left; soft near the centre line */
          rawPush = Math.max(-1, Math.min(1, dx / 45)) * PUSH_DEG;
        }
      }
      const ease = 1 - Math.exp(-dt * 5);
      influence += (rawInfluence - influence) * ease;
      push += (rawPush - push) * ease;

      const target = Math.max(-TARGET_DEG, Math.min(TARGET_DEG, idle * (1 - 0.6 * influence) + push * influence));
      vel += (K * (target - theta) - DAMP * vel) * dt;
      theta += vel * dt;
      if (Math.abs(theta) > SAFE_DEG) { theta = Math.sign(theta) * SAFE_DEG; vel = 0; }

      swing.setAttribute('transform', `rotate(${theta.toFixed(3)} ${PIVOT.x} ${PIVOT.y})`);
      level.setAttribute('transform', `rotate(${(-theta * LEVEL).toFixed(3)} ${PIVOT.x} ${RING_Y})`);
      raf = onScreen && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const run = () => { if (!raf && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); });
    io.observe(svg);
    document.addEventListener('visibilitychange', run);
    if (finePointer) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', run);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <>
      {/* fixed anchor fitting under the crease (does not swing) */}
      <circle cx={PIVOT.x} cy={PIVOT.y} r="5" fill="none" stroke="var(--rose)" strokeWidth="1" className="pa-fade" style={D(900)} />
      <g ref={swingRef}>
        <line className="pa-draw" pathLength={1} x1={PIVOT.x} y1={PIVOT.y + 5} x2={PIVOT.x} y2={CABLE_END}
          stroke="var(--burgundy)" strokeWidth="1.25" strokeOpacity="0.85" fill="none" style={D(1000)} />
        <circle cx={PIVOT.x} cy={RING_Y} r="4" fill="none" stroke="var(--burgundy)" strokeWidth="1.25" className="pa-fade" style={D(1600)} />
        <g ref={levelRef}>
          <g className="pa-fade" style={D(1700)}>
            <Logo variant="color" lockup="full" x={PIVOT.x - LOGO_W / 2} y={LOGO_Y} width={LOGO_W} height={LOGO_H} aria-hidden="true" focusable="false" />
          </g>
        </g>
      </g>
      <circle cx={PIVOT.x} cy={PIVOT.y} r="2" fill="var(--burgundy)" className="pa-fade" style={D(900)} />
    </>
  );
}
