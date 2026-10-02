/**
 * CareerArt: people-and-craft typographic stage. A visible outlined display word top-right and a
 * drawing-sheet title block along the bottom whose four cells are the four real teams (careerConfig).
 * Built for PageHero layout="stack" (art fills the stage, word high, sheet low).
 */
import { D } from './artCss';

/* CareerArt: purely the "PEOPLE & CRAFT" outlined watermark word.
   The team sheet was moved into PageHero children (document flow) so it
   can never absolutely-overlap the heading or lead text. */
const CSS = `
.pa-career { position: relative; width: 100%; height: 100%; pointer-events: none; }
.pa-career__word {
  position: absolute; top: 0; right: 0; z-index: 0;
  font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 700;
  font-size: clamp(3rem, 6.5vw, 6.5rem); line-height: 0.92; letter-spacing: -0.03em;
  color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--burgundy) 38%, transparent);
  text-align: right; white-space: nowrap; pointer-events: none; user-select: none;
}
@media (max-width: 767px) { .pa-career__word { display: none; } }
@media (min-width: 768px) and (max-width: 1023px) { .pa-career__word { font-size: clamp(3rem, 6vw, 5rem); } }
`;

export default function CareerArt() {
  return (
    <div className="pa-career">
      <style>{CSS}</style>
      <div className="pa-career__word pa-fade" style={D(200)}>PEOPLE<br />&amp; CRAFT</div>
    </div>
  );
}
