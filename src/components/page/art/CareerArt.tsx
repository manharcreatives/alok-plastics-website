/**
 * CareerArt: people-and-craft typographic stage. A visible outlined display word top-right and a
 * drawing-sheet title block along the bottom whose four cells are the four real teams (careerConfig).
 * Built for PageHero layout="stack" (art fills the stage, word high, sheet low).
 */
import { D } from './artCss';

/* CareerArt: purely the "PEOPLE & CRAFT" outlined watermark word.
   The team sheet was moved into PageHero children (document flow) so it
   can never absolutely-overlap the heading or lead text. */
/* The word lives in the band to the RIGHT of the headline's widest line ("Grow alongside"), so it can
   never cross it at any width. Its size is derived from that band instead of a fixed vw value:
     headline size  = the PageHero stack h1 clamp (keep in sync with PageHero.tsx)
     headline width ≈ 8.9em  (measured 8.78em in Archivo wdth 125, rounded up)
     word width     ≈ 5.6em  ("& CRAFT", measured 5.47em, rounded up)
     band           = 100vw - both page paddings - headline width - a 48px gap
   The hero clips overflow; below 768px there is no room beside the headline, so the word is hidden. */
const CSS = `
.pa-career { --h1: clamp(2.75rem, 7vw, 6.25rem); position: relative; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
.pa-career__word {
  position: absolute; top: 0; right: 0; z-index: 0;
  font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 700;
  font-size: clamp(1.5rem, calc((100vw - 2 * var(--grid-page-padding) - 8.9 * var(--h1) - 48px) / 5.6), 6.5rem);
  line-height: 0.92; letter-spacing: -0.03em;
  color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--burgundy) 38%, transparent);
  text-align: right; white-space: nowrap; pointer-events: none; user-select: none;
}
@media (max-width: 767px) { .pa-career__word { display: none; } }
`;

export default function CareerArt() {
  return (
    <div className="pa-career">
      <style>{CSS}</style>
      <div className="pa-career__word pa-fade" style={D(200)}>PEOPLE<br />&amp; CRAFT</div>
    </div>
  );
}
