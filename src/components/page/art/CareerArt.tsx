/**
 * CareerArt — people-and-craft typographic stage: outlined display words behind a
 * drawing-sheet title block whose four cells are the four real teams (careerConfig).
 */
import { careerConfig } from '@/content/career';
import { D } from './artCss';

const CSS = `
.pa-career { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-end; }
.pa-career__word { position: absolute; right: 0; top: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 700;
  font-size: clamp(3rem, 6.4vw, 7rem); line-height: 0.92; letter-spacing: -0.03em; color: transparent; -webkit-text-stroke: 1px var(--grey-warm); text-align: right; white-space: nowrap; }
.pa-career__sheet { position: relative; width: min(100%, 440px); border: 1px solid var(--grey-metal); background: var(--surface); margin-top: 16%; }
.pa-career__sheet::before, .pa-career__sheet::after { content: ''; position: absolute; width: 10px; height: 10px; border: 1px solid var(--grey-metal); }
.pa-career__sheet::before { top: -8px; left: -8px; border-right: 0; border-bottom: 0; }
.pa-career__sheet::after { bottom: -8px; right: -8px; border-left: 0; border-top: 0; }
.pa-career__head { display: flex; justify-content: space-between; padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--grey-metal);
  font-size: 0.6875rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--grey-metal); }
.pa-career__cells { display: grid; grid-template-columns: 1fr 1fr; }
.pa-career__cell { padding: var(--space-sm); min-height: 104px; display: flex; flex-direction: column; justify-content: space-between; border-bottom: 1px solid var(--grey-warm); }
.pa-career__cell:nth-child(odd) { border-right: 1px solid var(--grey-warm); }
.pa-career__cell b { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: 0.9375rem; line-height: 1.2; font-weight: 650; color: var(--ink); }
.pa-career__cell small { font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.08em; color: var(--grey-metal); }
.pa-career__cell--accent { background: var(--burgundy); }
.pa-career__cell--accent b { color: var(--surface); }
.pa-career__cell--accent small { color: var(--rose-pale); }
.pa-career__foot { padding: var(--space-xs) var(--space-sm); font-size: 0.75rem; color: var(--body); display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.pa-career__foot span + span::before { content: '\\00b7'; margin-right: var(--space-xs); color: var(--grey-metal); }
@media (max-width: 767px) {
  .pa-career { align-items: flex-start; justify-content: center; }
  .pa-career__word { display: none; }
  .pa-career__sheet { margin-top: 0; width: min(100%, 360px); }
  .pa-career__cell { min-height: 56px; }
}
`;

export default function CareerArt() {
  return (
    <div className="pa-career">
      <style>{CSS}</style>
      <div className="pa-career__word pa-fade" style={D(200)}>PEOPLE<br />&amp; CRAFT</div>
      <div className="pa-career__sheet pa-rise" style={D(500)}>
        <div className="pa-career__head"><span>Teams</span><span className="pa-mono">{careerConfig.teams.length}</span></div>
        <div className="pa-career__cells">
          {careerConfig.teams.map((t, i) => (
            <div key={t.id} className={`pa-career__cell${i === 0 ? ' pa-career__cell--accent' : ''}`}>
              <small>TEAM</small>
              <b>{t.name}</b>
            </div>
          ))}
        </div>
        <div className="pa-career__foot"><span>Joyful</span><span>Supportive</span><span>Trustworthy</span></div>
      </div>
    </div>
  );
}
