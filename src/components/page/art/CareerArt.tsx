/**
 * CareerArt: people-and-craft typographic stage. A visible outlined display word top-right and a
 * drawing-sheet title block along the bottom whose four cells are the four real teams (careerConfig).
 * Built for PageHero layout="stack" (art fills the stage, word high, sheet low).
 */
import { careerConfig } from '@/content/career';
import { D } from './artCss';

const CSS = `
.pa-career { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; gap: var(--space-lg); }
.pa-career__word { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 700;
  font-size: clamp(3rem, 7vw, 7.5rem); line-height: 0.92; letter-spacing: -0.03em; color: transparent;
  -webkit-text-stroke: 2px color-mix(in srgb, var(--burgundy) 55%, transparent); text-align: right; white-space: nowrap; }
.pa-career__sheet { position: relative; width: min(100%, 960px); border: 1px solid var(--grey-metal); background: var(--surface); align-self: flex-start; }
.pa-career__sheet::before, .pa-career__sheet::after { content: ''; position: absolute; width: 10px; height: 10px; border: 1px solid var(--grey-metal); }
.pa-career__sheet::before { top: -8px; left: -8px; border-right: 0; border-bottom: 0; }
.pa-career__sheet::after { bottom: -8px; right: -8px; border-left: 0; border-top: 0; }
.pa-career__head { display: flex; justify-content: space-between; padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--grey-metal);
  font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--grey-metal); }
.pa-career__cells { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.pa-career__cell { padding: var(--space-sm); min-height: 88px; display: flex; flex-direction: column; justify-content: flex-end; border-bottom: 1px solid var(--grey-warm); }
.pa-career__cell + .pa-career__cell { border-left: 1px solid var(--grey-warm); }
.pa-career__cell b { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: 1rem; line-height: 1.2; font-weight: 650; color: var(--ink); }
.pa-career__cell--accent { background: var(--burgundy); }
.pa-career__cell--accent b { color: var(--surface); }
.pa-career__foot { padding: var(--space-xs) var(--space-sm); font-size: 0.875rem; color: var(--body); display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.pa-career__foot span + span::before { content: '·'; margin-right: var(--space-xs); color: var(--grey-metal); }
@media (max-width: 767px) {
  .pa-career { align-items: flex-start; justify-content: center; }
  .pa-career__word { display: none; }
  .pa-career__sheet { width: min(100%, 360px); }
  .pa-career__cells { grid-template-columns: 1fr 1fr; }
  .pa-career__cell { min-height: 56px; }
  .pa-career__cell:nth-child(odd) { border-left: 0; }
}
@media (min-width: 768px) and (max-width: 1023px) { .pa-career__cell { min-height: 128px; } .pa-career__word { font-size: 7.5rem; } .pa-career__cell b { font-size: 1.125rem; } }
`;

export default function CareerArt() {
  return (
    <div className="pa-career">
      <style>{CSS}</style>
      <div className="pa-career__word pa-fade" style={D(200)}>PEOPLE<br />&amp; CRAFT</div>
      <div className="pa-career__sheet pa-rise" style={D(500)}>
        <div className="pa-career__head"><span>Four teams</span><span className="pa-mono">Alok Plastics</span></div>
        <div className="pa-career__cells">
          {careerConfig.teams.map((t, i) => (
            <div key={t.id} className={`pa-career__cell${i === 0 ? ' pa-career__cell--accent' : ''}`}>
              <b>{t.name}</b>
            </div>
          ))}
        </div>
        <div className="pa-career__foot"><span>Joyful</span><span>Supportive</span><span>Trustworthy</span></div>
      </div>
    </div>
  );
}
