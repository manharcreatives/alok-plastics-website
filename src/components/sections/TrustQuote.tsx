/**
 * S10 · TrustQuote — the core value, set huge, over a drawn A-peak roof.
 * bg: --surface, register-mark top edge.
 *
 * Replaces the old three-icon "why choose" row. Now: ONE statement (§5.4, verbatim) and a
 * ruled commitments ledger — a drawing-sheet title block listing the four things the story
 * (§5.6) says customers look for: quality, competitive pricing, reliable supply, timely
 * delivery. Wording only — no numbers (the stats live once, in AboutIntro).
 * No testimonials until the client supplies verified quotes (§19).
 */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

/* COPY: drafted from §5.6 ("quality, competitive pricing, reliable supply, and timely delivery"), needs client approval */
const LEDGER: { k: string; v: string }[] = [
  { k: 'Quality', v: 'Consistent manufacturing, order after order.' },
  { k: 'Price', v: 'Competitive pricing for B2B buyers.' },
  { k: 'Supply', v: 'Reliable supply a production line can plan around.' },
  { k: 'Delivery', v: 'Timely delivery, to the date we agree.' },
];

/* Testimonials — hidden until client provides verified, attributed quotes */
const TESTIMONIALS: { quote: string; name: string; company: string }[] = [
  /* TODO(client): supply 2–3 real testimonials with full name + company name.
     §19 honesty rule: never invent customer names or quotes. Leave array empty. */
];

const CSS = FOLD_SECTION_CSS + `
  .tq-sec { --pad-top: calc(var(--section-y) * 1.2); background: var(--surface); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
  .tq-wrap { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .tq-micro { position: relative; display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-md); font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo); }
  .tq-micro::before { content: ""; width: 24px; height: 2px; background: var(--burgundy); }
  .tq-h { position: relative; z-index: 1; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(2.25rem, 6.4vw, 5.75rem); font-weight: 650; line-height: 1.02; letter-spacing: -0.035em; color: var(--ink); max-width: 14ch; text-wrap: balance; }
  .tq-lower { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); margin-top: var(--space-xl); align-items: end; }
  .tq-peak { width: min(100%, 560px); height: auto; overflow: visible; display: block; }
  .tq-peak path { fill: none; stroke: var(--grey-metal); stroke-width: 1.5; stroke-linecap: square; stroke-linejoin: miter; vector-effect: non-scaling-stroke; }
  .tq-peak path.tq-fine { stroke: var(--grey-warm); }
  .tq-peak path.tq-arm { stroke: var(--grey-metal); stroke-width: 1.5; }
  .tq-rib--b { fill: var(--burgundy); }
  .tq-rib--s { fill: url(#tq-silver); }
  .tq-wrap::before { content: ""; position: absolute; top: calc(var(--space-xl) * -1); right: calc(var(--grid-page-padding) * -1); width: 26%; height: clamp(300px, 34vw, 520px); background: var(--metal-gradient); opacity: 0.1; clip-path: polygon(44% 0, 100% 0, 100% 100%, 0 100%); pointer-events: none; }
  .tq-wrap::after { content: ""; position: absolute; top: calc(var(--space-xl) * -1); right: calc(var(--grid-page-padding) * -1); width: 26%; height: clamp(300px, 34vw, 520px); background: var(--burgundy); opacity: 0.5; clip-path: polygon(44% 0, 44.3% 0, 0.3% 100%, 0 100%); pointer-events: none; }
  .tq-sheet { position: relative; background: var(--canvas); border: 1px solid var(--grey-metal); clip-path: polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.9); }
  .tq-sheet-head { display: flex; justify-content: space-between; gap: var(--space-sm); padding: var(--space-xs) 56px var(--space-xs) var(--space-sm); background: var(--surface-alt); border-bottom: 1px solid var(--grey-metal); font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--muted); }
  .tq-rows { margin: 0; padding: 0; list-style: none; }
  .tq-row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; padding: var(--space-sm) var(--space-sm); border-bottom: 1px solid var(--grey-cloud); }
  .tq-row::after { content: ""; position: absolute; left: 0; bottom: -1px; height: 1px; width: 100%; background: var(--burgundy); transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(.16,1,.3,1); }
  .tq-row:hover::after { transform: scaleX(1); }
  .tq-k { font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--burgundy); font-family: var(--font-archivo); }
  .tq-v { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.1875rem, 2vw, 1.625rem); line-height: 1.2; font-weight: 600; letter-spacing: -0.02em; color: var(--ink); }
  .tq-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm); padding: var(--space-sm); background: var(--blush); }
  .tq-foot p { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; color: var(--burgundy); font-size: 1.125rem; letter-spacing: -0.01em; }
  .tq-go { display: inline-flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) 0; font-weight: 600; font-size: 0.9375rem; color: var(--burgundy); border-bottom: 2px solid var(--burgundy); text-decoration: none; }
  .tq-go svg { transition: transform 0.2s cubic-bezier(.16,1,.3,1); }
  .tq-go:hover svg { transform: translate(2px, -2px); }
  .tq-go:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }
  @media (min-width: 768px) {
    .tq-lower { grid-template-columns: 220px minmax(0, 1fr); gap: var(--space-lg); }
    .tq-row { grid-template-columns: 140px minmax(0, 1fr); gap: var(--space-md); align-items: baseline; padding: var(--space-md) var(--space-md); }
    .tq-foot { padding: var(--space-sm) var(--space-md); }
  }
  @media (min-width: 1024px) {
    .tq-lower { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
  }
  @media (max-width: 767px) { .tq-peak { width: min(70%, 300px); } }
  @media (min-width: 768px) and (max-width: 1023px) { .tq-row { grid-template-columns: minmax(0, 1fr); } }
  .tq-t { margin-top: var(--space-xl); border-top: 1px solid var(--grey-cloud); padding-top: var(--space-xl); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--space-lg); }
`;

export default function TrustQuote() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const paths = gsap.utils.toArray<SVGPathElement>('.tq-peak path');
    const ribs = gsap.utils.toArray<SVGPolygonElement>('.tq-rib');
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.from(ribs, { autoAlpha: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.18, scrollTrigger: { trigger: '.tq-lower', start: 'top 85%', once: true } });
    gsap.to(paths, {
      strokeDashoffset: 0, duration: 1.2, ease: 'power3.inOut', stagger: 0.2,
      scrollTrigger: { trigger: '.tq-lower', start: 'top 85%', once: true },
    });
    const rows = gsap.utils.toArray<HTMLElement>('.tq-row, .tq-foot');
    gsap.set(rows, { autoAlpha: 0, x: 24 });
    gsap.to(rows, {
      autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.tq-sheet', start: 'top 90%', once: true },
    });
    /* safety: never leave the ledger hidden */
    const t = window.setTimeout(() => {
      rows.forEach(r => { if (Number(gsap.getProperty(r, 'opacity')) === 0 && r.getBoundingClientRect().top < window.innerHeight * 0.1) gsap.set(r, { autoAlpha: 1, x: 0 }); });
      paths.forEach(p => { if (p.getBoundingClientRect().top < 0) gsap.set(p, { strokeDashoffset: 0 }); });
    }, 4000);
    return () => window.clearTimeout(t);
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} aria-labelledby="trust-heading" className="fold-sec fold-sec--register tq-sec">
      <style>{CSS}</style>
      <FoldEdge variant="register" />
      <div className="tq-wrap">
        <p className="tq-micro">Why manufacturers choose Alok Plastics</p>
        {/* Core value, verbatim — §5.4 */}
        <h2 id="trust-heading" ref={headingRef} className="tq-h">
          We don&apos;t just mould plastic. We mould <span className="mt-grad">possibilities.</span>
        </h2>

        <div className="tq-lower">
          {/* The A-peak roof: two nested fold lines + short burgundy arm, drawn */}
          <svg className="tq-peak" viewBox="0 0 600 320" aria-hidden="true">
            <defs>
              <linearGradient id="tq-silver" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--grey-cloud)' }} />
                <stop offset="1" style={{ stopColor: 'var(--grey-metal)' }} />
              </linearGradient>
            </defs>
            {/* the logo's two ribbons: burgundy leg, machined-silver leg */}
            <polygon className="tq-rib tq-rib--b" points="0,316 300,12 300,84 72,316" />
            <polygon className="tq-rib tq-rib--s" points="300,12 600,316 528,316 300,84" />
            <path pathLength={1} className="tq-fine" d="M 120 316 L 300 134 L 480 316" />
            <path pathLength={1} className="tq-fine" d="M 190 316 L 300 205 L 410 316" />
            <path pathLength={1} className="tq-arm" d="M 0 316 H 600" />
          </svg>

          <div className="tq-sheet">
            <div className="tq-sheet-head"><span>What you can hold us to</span><span>Alok Plastics</span></div>
            <ul className="tq-rows">
              {LEDGER.map(r => (
                <li key={r.k} className="tq-row">
                  <span className="tq-k">{r.k}</span>
                  <span className="tq-v">{r.v}</span>
                </li>
              ))}
            </ul>
            <div className="tq-foot">
              <p>Chandigarh. Since 1998.</p>
              <Link href="/enquiry/" className="tq-go">Start with your requirement <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>

        {/* TODO(client): real testimonials → hidden while empty */}
        {TESTIMONIALS.length > 0 && (
          <div className="tq-t">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} style={{ margin: 0 }}>
                <blockquote style={{ margin: 0 }}>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--body)', lineHeight: 1.6 }}>&ldquo;{t.quote}&rdquo;</p>
                </blockquote>
                <figcaption style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--body)', fontWeight: 600 }}>
                  {t.name}, {t.company}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
