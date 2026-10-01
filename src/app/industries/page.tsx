/**
 * /industries — core market (burgundy feature block) + seven industries (drawn scenes, asymmetric bento)
 * + requirement-to-repeat process (stair-step). Industry lines verbatim from §5.9; process copy from
 * journey.ts (flagged for client approval there). No numbering in any label or title.
 */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import Pictogram, { type PictogramName } from '@/components/brand/Pictogram';
import IndustryScene, { CoreMarketScene } from '@/components/art/IndustryScenes';
import { IndustriesHeroArt } from '@/components/products/art';
import { industriesConfig, coreMarket } from '@/content/industries';
import { uspChain, uspPullQuote } from '@/content/journey';
import '@/components/products/products.css';

export const metadata: Metadata = {
  title: { absolute: 'Industries We Serve | Alok Plastics' },
  description:
    'Spare parts for water coolers, display counters and deep freezers, plus components for OEM, engineering, automotive, electrical, kitchen and agriculture.',
  alternates: { canonical: '/industries/' },
  robots: { index: true, follow: true },
};

const CORE: { name: string; pictogram: PictogramName }[] = [
  { name: 'Water coolers', pictogram: 'water-cooler' },
  { name: 'Display counters', pictogram: 'display-counter' },
  { name: 'Deep freezers', pictogram: 'deep-freezer' },
];

const CSS = `
${FOLD_SECTION_CSS}
.in-eyebrow { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; margin-bottom: var(--space-sm); line-height: 1; color: var(--grey-metal); }
.in-eyebrow::before { content: ''; width: 24px; height: 2px; background: var(--burgundy); }
.in-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: clamp(1.875rem, 4vw, 3.25rem); font-weight: 650; line-height: 1.06; letter-spacing: -0.025em; color: var(--ink); text-wrap: balance; }

/* core market: the one burgundy block on this page */
.ic { background: var(--burgundy); color: var(--surface); padding: var(--section-y) 0; position: relative; overflow: hidden; }
.ic::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(to right, color-mix(in srgb, var(--surface) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--surface) 5%, transparent) 1px, transparent 1px); background-size: 8px 8px; -webkit-mask-image: radial-gradient(ellipse 60% 70% at 78% 50%, var(--ink), transparent 80%); mask-image: radial-gradient(ellipse 60% 70% at 78% 50%, var(--ink), transparent 80%); }
.ic__in { position: relative; display: grid; gap: var(--space-xl); grid-template-columns: minmax(0, 1fr); align-items: center; }
.ic .in-eyebrow { color: var(--rose-pale); }
.ic .in-eyebrow::before { background: var(--rose-pale); }
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
.ib__body h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: clamp(1.25rem, 2vw, 1.625rem); font-weight: 650; letter-spacing: -0.02em; line-height: 1.12; color: var(--ink); margin: 0; }
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

/* process: a stair that climbs up-and-right, like the K */
.ip { background: var(--surface-alt); padding-bottom: var(--section-y); }
.ip__head { max-width: 46rem; margin-bottom: var(--space-xl); }
.ip__lead { margin-top: var(--space-sm); color: var(--body); line-height: 1.65; font-size: 1.0625rem; max-width: 56ch; }
.ip__steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); border-left: 2px solid var(--grey-metal); }
.ip__steps li { position: relative; padding: 0 0 var(--space-lg) var(--space-lg); min-width: 0; }
.ip__steps li:last-child { padding-bottom: 0; }
.ip__steps li::before { content: ''; position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; background: var(--surface-alt); border: 2px solid var(--grey-metal); transform: rotate(45deg); }
.ip__steps li:last-child::before { background: var(--burgundy); border-color: var(--burgundy); }
.ip__steps h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: 1.375rem; font-weight: 650; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 var(--space-xs); }
.ip__steps p { margin: 0; color: var(--body); line-height: 1.6; font-size: 0.9375rem; max-width: 36ch; }
@media (min-width: 1024px) {
  .ip__steps { grid-template-columns: repeat(5, minmax(0, 1fr)); border-left: 0; align-items: start; padding-top: 96px; }
  .ip__steps li { padding: var(--space-md) var(--space-sm) 0 var(--space-sm); border-top: 2px solid var(--grey-metal); border-left: 1px solid var(--grey-warm); margin-top: calc(var(--i) * 24px); }
  .ip__steps li:first-child { border-left: 0; padding-left: 0; }
  .ip__steps li::before { left: calc(var(--space-sm) - 6px); top: -7px; background: var(--surface-alt); }
  .ip__steps li:first-child::before { left: -6px; }
  .ip__steps li:last-child { border-top-color: var(--burgundy); }
}
.ip__quote { position: relative; margin: var(--space-xl) 0 0; padding: var(--space-lg); background: var(--blush); border-left: 2px solid var(--burgundy); clip-path: polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%); }
.ip__quote p { font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: clamp(1.25rem, 2.6vw, 2rem); font-weight: 650; line-height: 1.22; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 var(--space-sm); text-wrap: balance; max-width: 32ch; }
.ip__quote footer { font-size: 0.875rem; color: var(--muted); font-weight: 600; }

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
        lead="Our core market is spare parts for water coolers, display counters and deep freezers. The industries below are our wider reach."
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

      <section aria-labelledby="usp-h" className="ip fold-sec">
        <FoldEdge />
        <div className="pw">
          <header className="ip__head">
            <p className="in-eyebrow">Process</p>
            <h2 id="usp-h" className="in-h2">From requirement to repeat supply.</h2>
            <p className="ip__lead">We don’t just manufacture plastic components — we build reliable, repeatable supply partnerships.</p>
          </header>
          <ol className="ip__steps">
            {uspChain.map((s, idx) => (
              <li key={s.step} style={{ ['--i' as string]: 4 - idx }}>
                <h3>{s.label}</h3>
                <p>{s.description}</p>
              </li>
            ))}
          </ol>
          <blockquote className="ip__quote">
            <p>{uspPullQuote.quote}</p>
            <footer>{uspPullQuote.attribution}</footer>
          </blockquote>
        </div>
      </section>

      <EnquiryBand heading="Tell us your requirement." text="Share the part, quantity and the industry it is for — we reply with a quote." />
    </>
  );
}
