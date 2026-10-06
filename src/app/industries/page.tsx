/**
 * /industries — core market (burgundy feature block) + seven industries (drawn scenes, asymmetric bento)
 * + a 'what to send us' submission sheet. Industry lines verbatim from §5.9. The submission-sheet copy
 * (SEND below) is DRAFTED by us, not client-supplied: flagged for client approval. No numbering in labels/titles.
 */
import type { Metadata } from 'next';
import Highlight from '@/components/ui/Highlight';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import Pictogram, { type PictogramName } from '@/components/brand/Pictogram';
import IndustryScene, { CoreMarketScene } from '@/components/art/IndustryScenes';
import { IndustriesHeroArt } from '@/components/products/art';
import { industriesConfig, coreMarket } from '@/content/industries';
import { Cube } from '@phosphor-icons/react/dist/ssr/Cube';
import { Blueprint } from '@phosphor-icons/react/dist/ssr/Blueprint';
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import '@/components/products/products.css';

export const metadata: Metadata = {
  title: { absolute: 'Industries We Serve | OEM Plastic Parts Supplier | Alok Plastics, Chandigarh' },
  description:
    'Plastic & steel spare parts for OEM manufacturers, engineering, automotive, electrical, gas & kitchen equipment, agriculture and packaging. Water coolers, display counters, deep freezers, with pan-India supply from Chandigarh.',
  alternates: { canonical: '/industries/' },
  robots: { index: true, follow: true },
};

const CORE: { name: string; pictogram: PictogramName }[] = [
  { name: 'Water coolers', pictogram: 'water-cooler' },
  { name: 'Display counters', pictogram: 'display-counter' },
  { name: 'Deep freezers', pictogram: 'deep-freezer' },
];

// DRAFTED copy (not client-supplied): pending client approval.
const SEND = [
  { key: 'A', label: 'A sample', line: 'A worn or broken part we can match. Tell us which machine it came from.', Icon: Cube },
  { key: 'B', label: 'A drawing', line: 'A drawing or a sketch, with the sizes that matter to you.', Icon: Blueprint },
  { key: 'C', label: 'Quantity', line: 'How many you need, and whether it will be a repeat requirement.', Icon: Stack },
  { key: 'D', label: 'Where it is used', line: 'The machine or application the part goes into, and the industry.', Icon: Gear },
];

const CSS = `
${FOLD_SECTION_CSS}
.in-eyebrow { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--fs-label); text-transform: uppercase; letter-spacing: var(--tr-label); font-weight: 600; margin-bottom: var(--space-sm); line-height: var(--lh-label); color: var(--grey-metal-text); font-family: var(--font-archivo), sans-serif; }
.in-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: var(--fs-h2); font-weight: 650; line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--ink); text-wrap: balance; }

/* core market: the one burgundy block on this page */
.ic { background: var(--burgundy); color: var(--surface); padding: var(--section-y) 0; position: relative; overflow: hidden; }
.ic::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(to right, color-mix(in srgb, var(--surface) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--surface) 5%, transparent) 1px, transparent 1px); background-size: 8px 8px; -webkit-mask-image: radial-gradient(ellipse 60% 70% at 78% 50%, var(--ink), transparent 80%); mask-image: radial-gradient(ellipse 60% 70% at 78% 50%, var(--ink), transparent 80%); }
.ic__in { position: relative; display: grid; gap: var(--space-xl); grid-template-columns: minmax(0, 1fr); align-items: center; }
.ic .in-eyebrow { color: var(--rose-pale); }
.ic .in-h2 { color: var(--surface); }
.ic__lead { margin-top: var(--space-sm); color: var(--rose-pale); line-height: 1.65; max-width: 48ch; font-size: 1.0625rem; }
.ic__list { list-style: none; margin: var(--space-lg) 0 0; padding: 0; border-top: 1px solid color-mix(in srgb, var(--surface) 24%, transparent); }
.ic__list li { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid color-mix(in srgb, var(--surface) 24%, transparent); font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-weight: 650; font-size: 1.25rem; letter-spacing: -0.01em; }
.ic__list svg { color: var(--rose-pale); flex: none; }
.ic__scene .ind-art-svg { width: 100%; height: auto; display: block; }
@media (min-width: 1024px) { .ic__in { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); } }

/* seven industries: asymmetric bento, no equal-card row */
.ib { background: var(--surface); padding-bottom: var(--section-y); }
.ib__head { max-width: 46rem; margin-bottom: var(--space-xl); }
.ib__lead { margin-top: var(--space-sm); color: var(--body); line-height: 1.65; font-size: 1.0625rem; max-width: 56ch; }
.ib__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-md); grid-template-columns: minmax(0, 1fr); }
.ib__grid > li { min-width: 0; scroll-margin-top: calc(112px + var(--space-sm)); }
.ib__card { position: relative; height: 100%; display: flex; flex-direction: column; background: var(--canvas); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); box-shadow: inset 0 1px 0 var(--surface); overflow: hidden; transition: border-color 200ms ease, box-shadow 200ms ease; }
.ib__card::before { content: ''; position: absolute; z-index: 2; top: 0; left: 0; width: 0; height: 2px; background: var(--burgundy); transition: width 700ms cubic-bezier(.16,1,.3,1); }
.ib__card:hover { border-color: var(--grey-metal); box-shadow: 0 16px 40px color-mix(in srgb, var(--burgundy-night) 10%, transparent); }
.ib__card:hover::before { width: 100%; }
.ib__scene { position: relative; flex: 1 1 auto; aspect-ratio: 16 / 10; background: linear-gradient(180deg, var(--surface), var(--canvas)); border-bottom: 1px solid var(--grey-cloud); overflow: hidden; }
.ib__scene .ind-art-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; transition: transform 700ms cubic-bezier(.16,1,.3,1); }
.ib__card:hover .ib__scene .ind-art-svg { transform: scale(1.04); }
.ib__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ib__body { padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-xs); flex: 1; }
.ib__body h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: var(--fs-h3); font-weight: 650; letter-spacing: var(--tr-h3); line-height: var(--lh-h3); color: var(--ink); margin: 0; }
.ib__body p { margin: 0; color: var(--body); line-height: 1.6; font-size: 0.9375rem; max-width: 46ch; }
@media (min-width: 768px) {
  .ib__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ib__grid > li:last-child { grid-column: 1 / -1; }
  .ib__grid > li:last-child .ib__card { flex-direction: row; }
  .ib__grid > li:last-child .ib__scene { flex: 0 0 42%; aspect-ratio: auto; min-height: 220px; border-bottom: 0; border-right: 1px solid var(--grey-cloud); }
  .ib__grid > li:last-child .ib__body { justify-content: center; padding: var(--space-lg); }
}
@media (min-width: 1024px) {
  .ib__grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .ib__grid > li:nth-child(1) { grid-column: span 7; }
  .ib__grid > li:nth-child(2) { grid-column: span 5; }
  .ib__grid > li:nth-child(3) { grid-column: span 5; }
  .ib__grid > li:nth-child(4) { grid-column: span 7; }
  .ib__grid > li:nth-child(5) { grid-column: span 8; }
  .ib__grid > li:nth-child(6) { grid-column: span 4; }
  .ib__grid > li:nth-child(7) { grid-column: span 12; }
  .ib__grid > li:nth-child(1) .ib__scene, .ib__grid > li:nth-child(4) .ib__scene, .ib__grid > li:nth-child(5) .ib__scene { aspect-ratio: 2 / 1; }
}

/* what to send us: a submission sheet (drawing-sheet furniture, not the home process stair) */
.ip { background: var(--surface-alt); padding-bottom: var(--section-y); }
.ip__in { display: grid; gap: var(--space-xl); grid-template-columns: minmax(0, 1fr); align-items: start; }
.ip__lead { margin-top: var(--space-sm); color: var(--body); line-height: 1.65; font-size: 1.0625rem; max-width: 44ch; }
.ip__cta { display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-md); font-weight: 650; color: var(--burgundy); text-decoration: none; border-bottom: 1px solid var(--burgundy); padding-bottom: 2px; min-height: 44px; }
.ip__cta svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.ip__cta:hover svg { transform: translate3d(2px, -2px, 0); }
.ip__sheet { position: relative; background: var(--surface); border: 1px solid var(--grey-metal); clip-path: polygon(0 0, calc(100% - 44px) 0, 100% 44px, 100% 100%, 0 100%); }
.ip__sheet::before { content: ''; position: absolute; top: 0; left: 0; width: 64px; height: 3px; background: var(--burgundy); }
.ip__bar { display: flex; justify-content: space-between; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); padding-right: 64px; border-bottom: 1px solid var(--grey-metal); font-family: var(--font-mono, monospace); font-size: 0.8125rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.ip__bar b { color: var(--burgundy); }
.ip__rows { list-style: none; margin: 0; padding: 0; }
.ip__row { display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: stretch; border-bottom: 1px solid var(--grey-warm); }
.ip__row:last-child { border-bottom: 0; }
.ip__key { display: grid; place-items: center; border-right: 1px solid var(--grey-warm); background: var(--canvas); font-family: var(--font-mono, monospace); font-weight: 700; font-size: 1rem; color: var(--grey-metal); }
.ip__row:first-child .ip__key { background: var(--burgundy); color: var(--surface); }
.ip__txt { padding: var(--space-md); display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-sm); align-items: start; }
.ip__txt svg { color: var(--burgundy); flex: none; margin-top: 2px; }
.ip__txt h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: 1.375rem; font-weight: 650; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 var(--space-xs); line-height: 1.1; }
.ip__txt p { margin: 0; color: var(--body); line-height: 1.6; font-size: 0.9375rem; max-width: 46ch; }
.ip__foot { padding: var(--space-sm) var(--space-md); border-top: 1px solid var(--grey-metal); background: var(--blush); color: var(--ink); font-size: 0.9375rem; line-height: 1.5; }
@media (min-width: 1024px) { .ip__in { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); } .ip__row { grid-template-columns: 72px minmax(0, 1fr); } }

@media (prefers-reduced-motion: reduce) { .ib__card, .ib__card::before, .ib__scene .ind-art-svg { transition: none; } }
`;

export default function IndustriesPage() {
  const { industries } = industriesConfig;
  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Industries' }]}
        label="Industries"
        title="Built for the industries that build India."
        lead={<Highlight keywords={['core market']}>Our core market first, then the seven industries beyond it.</Highlight>}
        art={<IndustriesHeroArt />}
        enter="rise"
      />

      <section aria-labelledby="core-h" className="ic">
        <div className="pw ic__in">
          <div>
            <p className="in-eyebrow">Core market</p>
            <h2 id="core-h" className="in-h2">{coreMarket.name.replace(/ · /g, ', ')}</h2>
            <p className="ic__lead">{coreMarket.description}</p>
            <ul className="ic__list">
              {CORE.map(c => (
                <li key={c.name}><Pictogram name={c.pictogram} size={32} aria-hidden="true" />{c.name}</li>
              ))}
            </ul>
          </div>
          <div className="ic__scene" aria-hidden="true"><CoreMarketScene /></div>
        </div>
      </section>

      <section aria-labelledby="ind-h" className="ib fold-sec">
        <FoldEdge />
        <div className="pw">
          <header className="ib__head">
            <p className="in-eyebrow">Wider reach</p>
            <h2 id="ind-h" className="in-h2">Components for seven industries.</h2>
            <p className="ib__lead">The same moulding and supply discipline, applied beyond the cooler and the counter.</p>
          </header>
          <ul className="ib__grid">
            {industries.map(i => (
              <li key={i.id} id={i.slug}>
                <article className="ib__card">
                  <div className="ib__scene" aria-hidden={i.image ? undefined : true}>
                    {i.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="ib__img" src={i.image.src} alt={i.image.alt} width={i.image.w} height={i.image.h} loading="lazy" />
                    ) : (
                      <IndustryScene scene={i.scene ?? i.id} />
                    )}
                  </div>
                  <div className="ib__body">
                    <h3>{i.name}</h3>
                    <p>{i.line}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="send-h" className="ip fold-sec fold-sec--step">
        <FoldEdge variant="step" />
        <div className="pw ip__in">
          <header>
            <p className="in-eyebrow">Before you enquire</p>
            <h2 id="send-h" className="in-h2">What to send us.</h2>
            <p className="ip__lead">Any one of these is enough to start. Whichever industry the part is for, the more you share, the faster we can quote.</p>
          </header>
          <div className="ip__sheet">
            <div className="ip__bar"><b>Submission sheet</b><span>Any one to begin</span></div>
            <ul className="ip__rows">
              {SEND.map(r => (
                <li key={r.key} className="ip__row">
                  <span className="ip__key" aria-hidden="true">{r.key}</span>
                  <div className="ip__txt">
                    <r.Icon size={32} weight="light" aria-hidden="true" />
                    <div><h3>{r.label}</h3><p>{r.line}</p></div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="ip__foot">Not sure what you have? Send what you can and we will ask for the rest.</p>
          </div>
        </div>
      </section>

      <EnquiryBand variant="wide" fold="register" heading="Tell us your requirement." text="Share the part, quantity and the industry it is for, and we will reply with a quote." />
    </>
  );
}
