/**
 * S10 · TrustQuote — §13
 * bg: --surface, folded-diagonal top edge.
 * The core value, verbatim (§5.4): "We don't just mould plastic. We mould possibilities."
 * (S5 already carries the USP quote, so this one uses the other client-sourced line.)
 * Set huge over a drawn A-peak fold (the logo's roof) that draws itself on scroll-in,
 * with three verified-fact columns divided by 44° slashes beneath.
 * No testimonials until the client supplies verified quotes (§19). Slot renders nothing while empty.
 */

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import type { Icon } from '@phosphor-icons/react';
import { ClockCounterClockwise } from '@phosphor-icons/react/dist/csr/ClockCounterClockwise';
import { ArrowsClockwise } from '@phosphor-icons/react/dist/csr/ArrowsClockwise';
import { Factory } from '@phosphor-icons/react/dist/csr/Factory';
import { gsap } from '@/lib/motion';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useMaskRise } from '@/hooks/useMotion';
import { site } from '@/content/site';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

/* Three trust signals — each grounded ONLY in verified facts (site.ts `proof`) */
const TRUST_SIGNALS: { id: string; Icon: Icon; label: string; body: string }[] = [
  {
    id: 'est',
    Icon: ClockCounterClockwise,
    label: 'Manufacturing since 1998',
    body: `Alok Plastics has been manufacturing in ${site.contact.city} since ${site.foundingYear}.`,
  },
  {
    id: 'repeat',
    Icon: ArrowsClockwise,
    label: '70%+ repeat customers',
    body: 'More than 70% of our customers come back to order again.',
  },
  {
    id: 'moulding',
    Icon: Factory,
    label: 'Automatic moulding machines',
    body: 'Consistent quality and faster production.',
  },
];

/* Testimonials — hidden until client provides verified, attributed quotes */
const TESTIMONIALS: { quote: string; name: string; company: string }[] = [
  /* TODO(client): supply 2–3 real testimonials with full name + company name.
     §19 honesty rule: never invent customer names or quotes. Leave array empty. */
];

const CSS = FOLD_SECTION_CSS + `
  .tq-sec { --pad-top: calc(var(--section-y) * 1.2); background: var(--surface); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
  .tq-wrap { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .tq-peak { position: absolute; right: -4%; top: 0; width: min(62%, 760px); height: auto; pointer-events: none; overflow: visible; }
  .tq-peak path { fill: none; stroke: var(--grey-warm); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
  .tq-peak path.tq-arm { stroke: var(--burgundy); stroke-width: 3; }
  .tq-micro { position: relative; display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-md); font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo); }
  .tq-micro::before { content: ""; width: 24px; height: 2px; background: var(--burgundy); }
  .tq-h { position: relative; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(2.25rem, 6.4vw, 5.75rem); font-weight: 650; line-height: 1.02; letter-spacing: -0.035em; color: var(--ink); max-width: 14ch; text-wrap: balance; margin-bottom: var(--space-xl); }
  .tq-hl { background: var(--metal-gradient); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
  .tq-facts { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); border-top: 1px solid var(--grey-warm); padding-top: var(--space-lg); }
  .tq-fact { position: relative; display: flex; flex-direction: column; gap: var(--space-xs); min-width: 0; }
  .tq-chip { width: 56px; height: 56px; display: grid; place-items: center; margin-bottom: var(--space-xs); color: var(--burgundy); border: 1px solid var(--grey-warm); background: var(--canvas); clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%); }
  .tq-fact-label { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1.1875rem; font-weight: 650; color: var(--ink); letter-spacing: -0.015em; }
  .tq-fact-body { font-size: 0.9375rem; color: var(--body); line-height: 1.6; max-width: 34ch; }
  @media (min-width: 768px) {
    .tq-facts { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-xl); }
    .tq-fact + .tq-fact::before { content: ""; position: absolute; left: calc(var(--space-xl) / -2); top: 0; height: 100%; width: 1px; background: var(--grey-warm); transform: skewX(-44deg); transform-origin: top; }
    .tq-fact:nth-child(1) { margin-top: calc(var(--space-md) * 2); }
    .tq-fact:nth-child(2) { margin-top: var(--space-md); }
  }
  @media (max-width: 767px) { .tq-peak { width: 120%; right: -30%; top: auto; bottom: 30%; opacity: .35; } }
  .tq-t { margin-top: var(--space-xl); border-top: 1px solid var(--grey-cloud); padding-top: var(--space-xl); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--space-lg); }
`;

export default function TrustQuote() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const paths = gsap.utils.toArray<SVGPathElement>('.tq-peak path');
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(paths, {
      strokeDashoffset: 0, duration: 1.2, ease: 'power3.inOut', stagger: 0.2,
      scrollTrigger: { trigger: '.tq-wrap', start: 'top 70%', once: true },
    });
    gsap.from('.tq-fact', {
      autoAlpha: 0, y: 16, duration: 0.7, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.tq-facts', start: 'top 85%', once: true },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} aria-labelledby="trust-heading" className="fold-sec tq-sec">
      <style>{CSS}</style>
      <FoldEdge />
      <div className="tq-wrap">
        {/* The A-peak fold: roof line + short burgundy arm, drawn */}
        <svg className="tq-peak" viewBox="0 0 600 300" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
          <path pathLength={1} d="M 0 300 L 300 8 L 600 300" />
          <path pathLength={1} d="M 90 300 L 300 96 L 510 300" />
          <path pathLength={1} className="tq-arm" d="M 300 8 L 372 78" />
        </svg>

        <p className="tq-micro">Why manufacturers choose Alok Plastics</p>
        {/* Core value, verbatim — §5.4 */}
        <h2 id="trust-heading" ref={headingRef} className="tq-h">
          We don&apos;t just mould plastic. We mould <span className="tq-hl">possibilities.</span>
        </h2>

        <div className="tq-facts">
          {TRUST_SIGNALS.map(({ id, Icon: Ico, label, body }) => (
            <div key={id} className="tq-fact">
              <span className="tq-chip" aria-hidden="true"><Ico size={28} weight="light" /></span>
              <p className="tq-fact-label">{label}</p>
              <p className="tq-fact-body">{body}</p>
            </div>
          ))}
        </div>

        {/* TODO(client): real testimonials → hidden while empty */}
        {TESTIMONIALS.length > 0 && (
          <div className="tq-t">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} style={{ margin: 0 }}>
                <blockquote style={{ margin: 0 }}>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--body)', lineHeight: 1.6 }}>&ldquo;{t.quote}&rdquo;</p>
                </blockquote>
                <figcaption style={{ marginTop: 'var(--space-sm)', fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>
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
