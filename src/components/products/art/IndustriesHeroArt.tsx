/**
 * IndustriesHeroArt — /industries hero. The seven drawn industry scenes (src/components/art, owned by
 * the home-story agent, imported read-only) laid out as a staggered contact sheet that climbs
 * up-and-right. Decorative: the scenes depict a kind of application, not a customer.
 */
import IndustryScene from '@/components/art/IndustryScenes';
import { industriesConfig } from '@/content/industries';

const COLS: number[][] = [[0, 1, 2], [3, 4], [5, 6]];

const CSS = `
.ih { position: relative; display: flex; align-items: center; justify-content: flex-end; width: 100%; padding: 96px 0 var(--space-xl) var(--space-sm); box-sizing: border-box; }
.ih__sheet { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-sm); width: min(100%, 760px); align-items: start; }
.ih__col { display: grid; gap: var(--space-sm); min-width: 0; }
.ih__frame { min-width: 0; }
.ih__col:nth-child(1) { padding-top: 112px; }
.ih__col:nth-child(2) { padding-top: 56px; }
.ih__frame { position: relative; margin: 0; background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); box-shadow: inset 0 1px 0 var(--surface); }
.ih__frame:nth-child(odd)::before { content: ''; position: absolute; z-index: 1; top: -1px; right: -1px; width: 28px; height: 3px; background: var(--burgundy); }
.ih__scene { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: var(--canvas); }
.ih__scene .ind-art-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.ih__cap { display: block; padding: var(--space-xs) var(--space-xs); border-top: 1px solid var(--grey-cloud); font-family: var(--font-mono, monospace); font-size: 0.75rem; line-height: 1.35; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); text-wrap: balance; overflow-wrap: break-word; }
.ih__frame { animation: ih-in 900ms calc(var(--d, 0) * 1ms) cubic-bezier(.16,1,.3,1) backwards; }
@keyframes ih-in { from { opacity: 0; clip-path: polygon(0 0, 0 0, -44% 100%, -44% 100%); } to { opacity: 1; clip-path: polygon(0 0, 150% 0, 106% 100%, 0 100%); } }
@media (max-width: 767px) {
  .ih { align-items: flex-start; padding: 80px var(--grid-page-padding) 0; }
  .ih__sheet { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-xs); width: 100%; }
  .ih__col { gap: var(--space-xs); }
  .ih__col:nth-child(1) { padding-top: 48px; }
  .ih__col:nth-child(2) { padding-top: 24px; }
  .ih__cap { display: none; }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .ih { align-items: center; padding: 0; height: 100%; }
  .ih__sheet { gap: var(--space-sm); width: 100%; }
  .ih__col { gap: var(--space-xs); }
  .ih__col:nth-child(1) { padding-top: 64px; }
  .ih__col:nth-child(2) { padding-top: 32px; }
  .ih__cap { display: none; }
}
@media (prefers-reduced-motion: reduce) { .ih__frame { animation: none; } }
`;

export default function IndustriesHeroArt() {
  const { industries } = industriesConfig;
  return (
    <div className="ih">
      <style>{CSS}</style>
      <div className="ih__sheet">
        {COLS.map((col, ci) => (
          <div key={ci} className="ih__col">
            {col.map((idx, k) => {
              const ind = industries[idx];
              if (!ind) return null;
              return (
                <figure key={ind.id} className="ih__frame" style={{ ['--d' as string]: 200 + (ci * 3 + k) * 120 }}>
                  <div className="ih__scene"><IndustryScene scene={ind.scene ?? ind.id} /></div>
                  <figcaption className="ih__cap">{ind.name}</figcaption>
                </figure>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
