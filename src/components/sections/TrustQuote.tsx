/**
 * S10 · TrustQuote — "Why buyers reorder" (rebuilt: editorial typography, no A-peak art).
 * bg: --surface, register-mark top edge, optional faint photo slot over a drawn-grid placeholder.
 *
 * Four commitments set as oversized type on a staggered 12-column grid: a hairline technical
 * rule, an outlined index numeral, the keyword in display size, and one small caption. The
 * captions are the wording already approved on the old ledger (no new claims, no numbers: the
 * proof numbers live once, in AboutIntro). The core value (§5.4) stays as a quiet sign-off so
 * About's "core values" note remains true. No testimonials until the client supplies verified
 * quotes (§19). Motion: rules draw, words rise, once on scroll; static under reduced motion.
 */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import PhotoBg from '@/components/ui/PhotoBg';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

/* Wording: the confirmed ledger lines from the previous design, moved verbatim into captions.
   No guarantee, certification or quantity is claimed (see docs/client-questions.md #42). */
const POINTS: { n: string; word: string; cap: string }[] = [
  { n: '01', word: 'Quality', cap: 'Consistent manufacturing, order after order. Same spec, same finish, every batch.' },
  { n: '02', word: 'Fitment', cap: 'Parts that fit the machine they are made for, so a replacement goes in the first time.' },
  { n: '03', word: 'Supply', cap: 'Practical order quantities and supply a production line can plan around.' },
  { n: '04', word: 'B2B first', cap: 'Built around OEMs, dealers and distributors: clear quotes, repeat orders, no retail runaround.' },
];

/* Testimonials — hidden until client provides verified, attributed quotes */
const TESTIMONIALS: { quote: string; name: string; company: string }[] = [
  /* TODO(client): supply 2–3 real testimonials with full name + company name.
     §19 honesty rule: never invent customer names or quotes. Leave array empty. */
];

const CSS = FOLD_SECTION_CSS + `
  .tq-sec { --pad-top: calc(var(--section-y) * 1.2); background: var(--surface); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
  /* placeholder: drawn engineering grid, faded toward the lower right; the photo sits over it */
  .tq-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .tq-bg-grid { position: absolute; inset: 0;
    background-image: linear-gradient(to right, color-mix(in srgb, var(--grey-metal) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--grey-metal) 7%, transparent) 1px, transparent 1px);
    background-size: 40px 40px;
    -webkit-mask-image: radial-gradient(ellipse 70% 80% at 85% 70%, var(--ink), transparent); mask-image: radial-gradient(ellipse 70% 80% at 85% 70%, var(--ink), transparent); }
  .tq-bg-photo { position: absolute; inset: 0;
    -webkit-mask-image: linear-gradient(to left, var(--ink) 0%, transparent 75%); mask-image: linear-gradient(to left, var(--ink) 0%, transparent 75%); }
  .tq-wrap { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .tq-micro { position: relative; display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-md); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo), sans-serif; line-height: var(--lh-label); }
  .tq-micro::before { content: ""; width: 24px; height: 3px; background: var(--burgundy); }
  .tq-h { position: relative; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h1); font-weight: 650; line-height: var(--lh-h1); letter-spacing: var(--tr-h1); color: var(--ink); max-width: 16ch; margin: 0; text-wrap: balance; }
  .tq-sub { position: relative; margin: var(--space-sm) 0 0; max-width: 46ch; font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--body); }

  .tq-list { position: relative; list-style: none; margin: var(--space-xl) 0 0; padding: 0; }
  .tq-row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-xs); padding: var(--space-md) 0 var(--space-lg); }
  .tq-rule { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--grey-warm); transform-origin: left; }
  .tq-rule::before { content: ""; position: absolute; left: 0; top: -1px; width: 56px; height: 3px; background: var(--burgundy); }
  .tq-rule::after { content: ""; position: absolute; right: 0; top: -6px; width: 1px; height: 13px; background: var(--grey-metal); }
  .tq-num { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-stat); font-weight: 650; line-height: var(--lh-stat); letter-spacing: var(--tr-stat); color: transparent; -webkit-text-stroke: 1px var(--grey-metal); user-select: none; }
  .tq-word { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-display); font-weight: 650; line-height: var(--lh-display); letter-spacing: var(--tr-display); color: var(--ink); text-wrap: balance; }
  .tq-word::after { content: "."; color: var(--burgundy); }
  .tq-cap { margin: 0; max-width: 34ch; font-size: var(--fs-sm); line-height: var(--lh-sm); color: var(--body); padding-left: var(--space-sm); border-left: 1px solid var(--grey-warm); align-self: end; }

  .tq-end { position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm) var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--grey-warm); }
  .tq-core { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-lead-lg); line-height: var(--lh-lead-lg); letter-spacing: var(--tr-lead-lg); color: var(--ink); max-width: 28ch; text-wrap: balance; }
  .tq-go { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 44px; font-weight: 600; font-size: 0.9375rem; color: var(--burgundy); border-bottom: 2px solid var(--burgundy); text-decoration: none; }
  .tq-go svg { transition: transform 0.2s cubic-bezier(.16,1,.3,1); }
  .tq-go:hover svg { transform: translate(2px, -2px); }
  .tq-go:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }

  @media (min-width: 900px) {
    .tq-row { grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--grid-gutter); align-items: end; padding: var(--space-md) 0 var(--space-lg); }
    /* staggered: odd rows hang left, even rows are pushed in by two columns */
    .tq-row .tq-num { grid-column: 1 / 3; }
    .tq-row .tq-word { grid-column: 3 / 9; }
    .tq-row .tq-cap { grid-column: 9 / 13; }
    .tq-row:nth-child(even) .tq-num { grid-column: 3 / 5; }
    .tq-row:nth-child(even) .tq-word { grid-column: 5 / 10; }
    .tq-row:nth-child(even) .tq-cap { grid-column: 10 / 13; }
  }
  @media (prefers-reduced-motion: reduce) { .tq-go svg { transition: none; } }
  .tq-t { margin-top: var(--space-xl); border-top: 1px solid var(--grey-cloud); padding-top: var(--space-xl); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--space-lg); }
`;

export default function TrustQuote() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const rows = gsap.utils.toArray<HTMLElement>('.tq-row');
    rows.forEach(row => {
      const rule = row.querySelector('.tq-rule');
      const bits = row.querySelectorAll('.tq-num, .tq-word, .tq-cap');
      const st = { trigger: row, start: 'top 88%', once: true } as const;
      if (rule) gsap.from(rule, { scaleX: 0, duration: 1, ease: 'expo.inOut', scrollTrigger: st });
      gsap.from(bits, { autoAlpha: 0, y: 24, duration: 0.8, ease: 'expo.out', stagger: 0.1, scrollTrigger: st });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} aria-labelledby="trust-heading" className="fold-sec fold-sec--register tq-sec">
      <style>{CSS}</style>
      <FoldEdge variant="register" />
      {/* placeholder grid + optional photo (generated later; renders nothing until it exists) */}
      <div className="tq-bg" aria-hidden="true">
        <div className="tq-bg-grid" />
        <div className="tq-bg-photo"><PhotoBg src="/images/backgrounds/why-choose-us.webp" opacity={0.35} position="center right" /></div>
      </div>

      <div className="tq-wrap">
        <p className="tq-micro">Why Alok Plastics</p>
        <h2 id="trust-heading" ref={headingRef} className="tq-h">
          Four reasons buyers <span className="mt-grad">reorder.</span>
        </h2>
        <p className="tq-sub">What a production line needs from a parts supplier, and what we hold ourselves to.</p>

        <ol className="tq-list">
          {POINTS.map(p => (
            <li key={p.n} className="tq-row">
              <span className="tq-rule" aria-hidden="true" />
              <span className="tq-num" aria-hidden="true">{p.n}</span>
              <h3 className="tq-word">{p.word}</h3>
              <p className="tq-cap">{p.cap}</p>
            </li>
          ))}
        </ol>

        <div className="tq-end">
          {/* Core value, verbatim — §5.4 */}
          <p className="tq-core">We don&apos;t just mould plastic. We mould possibilities.</p>
          <Link href="/enquiry/" className="tq-go">Start with your requirement <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
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
