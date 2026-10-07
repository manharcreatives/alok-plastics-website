/**
 * CeoQuote — the CEO's pull-quote, lifted out of "How we work" into its own full-width moment.
 *
 * Big typographic quote over a quiet, shaded photograph (PhotoBg, ~0.28) that sits on a solid
 * burgundy-night gradient placeholder. Without the photo the gradient + drawn rule art stands
 * alone. The quote text and attribution are verbatim from src/content/journey.ts (uspPullQuote).
 * bg: --burgundy-night, diagonal fold into the section from the light map above.
 */

'use client';

import { useRef } from 'react';
import { useMaskRise } from '@/hooks/useMotion';
import { uspPullQuote } from '@/content/journey';
import PhotoBg from '@/components/ui/PhotoBg';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';

const HIGHLIGHT = 'orders that keep coming back';
/* "Aalok Kumar, CEO, Alok Plastics" -> name / role line */
const [NAME, ...REST] = uspPullQuote.attribution.split(', ');
const ROLE = REST.join(', ');

const CSS = FOLD_SECTION_CSS + `
  .cq { --pad-top: calc(var(--section-y) * 1.1); background: var(--burgundy-night); color: var(--surface); padding-bottom: calc(var(--section-y) * 1.1); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; isolation: isolate; }
  .cq-art { position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 80% at 80% 20%, color-mix(in srgb, var(--burgundy-bright) 40%, transparent) 0%, transparent 62%),
      linear-gradient(160deg, var(--burgundy-night) 0%, var(--burgundy-deep) 60%, var(--burgundy-night) 100%); }
  .cq-art::after { content: ""; position: absolute; inset: 0; opacity: .5;
    background-image: linear-gradient(color-mix(in srgb, var(--rose-pale) 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--rose-pale) 10%, transparent) 1px, transparent 1px);
    background-size: 40px 40px;
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 20% 60%, var(--ink) 0%, transparent 75%); mask-image: radial-gradient(ellipse 80% 80% at 20% 60%, var(--ink) 0%, transparent 75%); }
  /* shade keeps the quote above AA contrast whatever the photograph turns out to be */
  .cq-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: linear-gradient(90deg, color-mix(in srgb, var(--burgundy-night) 88%, transparent) 0%, color-mix(in srgb, var(--burgundy-night) 55%, transparent) 60%, color-mix(in srgb, var(--burgundy-night) 80%, transparent) 100%); }
  .cq-in { position: relative; z-index: 2; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
  .cq-fig { margin: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
  .cq-mark { display: block; width: clamp(56px, 9vw, 120px); height: auto; color: var(--rose); }
  .cq-k { display: inline-flex; align-items: center; gap: 10px; margin: 0; font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); line-height: var(--lh-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--rose-pale); }
  .cq-k::before { content: ""; width: 24px; height: 2px; background: var(--rose); }
  .cq-text { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); font-weight: 650; color: var(--surface); max-width: 26ch; text-wrap: balance; }
  .cq-hl { color: var(--rose-pale); }
  .cq-by { display: flex; align-items: center; gap: var(--space-sm); margin: 0; }
  .cq-by i { display: block; width: 56px; height: 2px; background: var(--rose); flex-shrink: 0; }
  .cq-name { display: block; font-family: var(--font-archivo); font-size: 1.125rem; font-weight: 650; color: var(--surface); }
  .cq-role { display: block; font-size: 0.9375rem; color: var(--rose-pale); }
  @media (min-width: 1024px) {
    .cq-fig { grid-template-columns: auto minmax(0, 1fr); column-gap: var(--space-xl); align-items: start; }
    .cq-mark { grid-row: 1 / span 3; margin-top: var(--space-xs); }
  }
  @media (max-width: 639px) { .cq-by i { width: var(--space-md); } }
`;

export default function CeoQuote() {
  const textRef = useRef<HTMLParagraphElement>(null);
  useMaskRise(textRef);
  const [pre, post] = uspPullQuote.quote.split(HIGHLIGHT);

  return (
    <section aria-label="A word from our CEO" className="fold-sec fold-sec--diag cq">
      <style>{CSS}</style>
      <div aria-hidden="true" className="cq-art" />
      <PhotoBg src="/images/backgrounds/ceo-quote.webp" opacity={0.28} position="center 30%" />
      <div aria-hidden="true" className="cq-shade" />
      <FoldEdge variant="diag" />
      <div className="cq-in">
        <figure className="cq-fig">
          <svg className="cq-mark" viewBox="0 0 96 72" fill="currentColor" aria-hidden="true">
            <path d="M0 72V40C0 17 12 4 36 0l4 10C26 14 20 22 20 32h20v40H0zm56 0V40C56 17 68 4 92 0l4 10C82 14 76 22 76 32h20v40H56z" />
          </svg>
          <p className="cq-k">From our CEO</p>
          <blockquote style={{ margin: 0 }}>
            <p ref={textRef} className="cq-text">
              {pre}<span className="cq-hl">{HIGHLIGHT}</span>{post}
            </p>
          </blockquote>
          <figcaption className="cq-by">
            <i aria-hidden="true" />
            <span><span className="cq-name">{NAME}</span><span className="cq-role">{ROLE}</span></span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
