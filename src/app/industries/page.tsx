/**
 * /industries — core market + 7 industries + requirement-to-repeat process (§8.2).
 * Industry lines verbatim from §5.9; process steps from journey.ts (copy flagged for client approval there).
 */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import Pictogram, { type PictogramName } from '@/components/brand/Pictogram';
import { industriesConfig, coreMarket } from '@/content/industries';
import { uspChain, uspPullQuote } from '@/content/journey';
import { SECTION_CSS, SectionHead, WRAP_STYLE } from '@/components/about/parts';

export const metadata: Metadata = {
  title: { absolute: 'Industries We Serve | Alok Plastics' },
  description:
    'Spare parts for water coolers, display counters and deep freezers, plus components for OEM, engineering, automotive, electrical, kitchen and agriculture.',
  alternates: { canonical: '/industries/' },
  robots: { index: true, follow: true },
};

const CORE: { name: string; pictogram: PictogramName }[] = [
  { name: 'Water Coolers', pictogram: 'water-cooler' },
  { name: 'Display Counters', pictogram: 'display-counter' },
  { name: 'Deep Freezers', pictogram: 'deep-freezer' },
];

const CSS = `
${SECTION_CSS}
.in-card { scroll-margin-top: calc(112px + var(--space-sm)); display: flex; flex-direction: column; gap: var(--space-sm); }
.in-card .pic { color: var(--burgundy); }
.in-core { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); list-style: none; margin: 0; padding: 0; }
.in-core li { display: flex; align-items: center; gap: var(--space-sm); background: var(--surface); border: 1px solid var(--grey-warm); border-top: 2px solid var(--burgundy); border-radius: var(--radius-card); padding: var(--space-md); color: var(--ink); font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; min-width: 0; }
.in-core li svg { color: var(--burgundy); flex: none; }
.in-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); counter-reset: s; }
.in-steps li { background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); padding: var(--space-md); min-width: 0; }
.in-steps .n { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--burgundy); font-weight: 600; display: block; margin-bottom: var(--space-xs); }
.in-steps h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1.0625rem; font-weight: 650; color: var(--ink); margin: 0 0 var(--space-xs); }
.in-steps p { font-size: 0.875rem; line-height: 1.55; color: var(--body); margin: 0; }
.in-quote { margin: var(--space-xl) 0 0; padding-top: var(--space-lg); border-top: 1px solid var(--grey-cloud); max-width: 40ch; }
.in-quote p { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.25rem, 2.4vw, 1.875rem); font-weight: 650; line-height: 1.25; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 var(--space-sm); text-wrap: balance; }
.in-quote footer { font-size: 0.875rem; color: var(--muted); font-weight: 600; }
@media (min-width: 768px) { .in-core { grid-template-columns: repeat(3, minmax(0, 1fr)); } .in-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1280px) { .in-steps { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
`;

export default function IndustriesPage() {
  const { industries } = industriesConfig;
  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Industries' }]}
        label="01 — Industries"
        title="Built for the industries that build India."
        lead="Our core market is spare parts for water coolers, display counters and deep freezers. The industries below are our wider reach."
      />

      <section aria-labelledby="core-h" className="cp-section" style={{ background: 'var(--canvas)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="core-h" label="02 — Core market" title={coreMarket.name.replace(/ · /g, ', ')} lead={coreMarket.description} />
          <ul className="in-core">
            {CORE.map(c => (
              <li key={c.name}>
                <Pictogram name={c.pictogram} size={48} aria-hidden="true" />
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ind-h" className="cp-section" style={{ background: 'var(--surface-alt)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="ind-h" label="03 — Wider reach" title="Components for seven industries." />
          <ul className="cp-grid cp-grid--3">
            {industries.map(i => (
              <li key={i.id} id={i.slug} className="cp-card in-card">
                <span className="pic"><Pictogram name={i.pictogram as PictogramName} size={32} aria-hidden="true" /></span>
                <h3>{i.name}</h3>
                <p>{i.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="usp-h" className="cp-section" style={{ background: 'var(--canvas)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="usp-h" label="04 — Process" title="From requirement to repeat supply." lead="We don’t just manufacture plastic components — we build reliable, repeatable supply partnerships." />
          <ol className="in-steps">
            {uspChain.map(s => (
              <li key={s.step}>
                <span className="n" aria-hidden="true">{String(s.step).padStart(2, '0')}</span>
                <h3>{s.label}</h3>
                <p>{s.description}</p>
              </li>
            ))}
          </ol>
          <blockquote className="in-quote">
            <p>{uspPullQuote.quote}</p>
            <footer>{uspPullQuote.attribution}</footer>
          </blockquote>
        </div>
      </section>

      <EnquiryBand heading="Tell us your requirement." text="Share the part, quantity and the industry it is for — we reply with a quote." />
    </>
  );
}
