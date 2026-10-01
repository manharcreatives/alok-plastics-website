/**
 * /about: story, brand idea, vision / mission / values, full journey, leadership, proof, culture teaser (§8.2).
 * Copy: verbatim from MASTER_PROMPT §5; no invented history.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import { AboutArt } from '@/components/page/art';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import Logo from '@/components/brand/Logo';
import JourneyOrbit from '@/components/sections/JourneyOrbit';
import Reveal from '@/components/ui/Reveal';
import { site } from '@/content/site';
import { brandIdea, story, vision, mission, coreValues } from '@/components/about/aboutContent';
import { Eyebrow, SECTION_CSS, SectionHead, WRAP_STYLE } from '@/components/about/parts';

export const metadata: Metadata = {
  title: { absolute: 'About Alok Plastics | Manufacturer, Chandigarh' },
  description:
    'Alok Plastics is a Chandigarh-based manufacturer, established in 1998, of moulded plastic and steel parts. Our story, vision, mission and values.',
  alternates: { canonical: '/about/' },
  robots: { index: true, follow: true },
};

function renderStory(p: { text: string; strong?: string[] }) {
  let parts: (string | { s: string })[] = [p.text];
  for (const s of p.strong ?? []) {
    parts = parts.flatMap(part => {
      if (typeof part !== 'string' || !part.includes(s)) return [part];
      const [a, b] = part.split(s);
      return [a, { s }, b];
    });
  }
  return parts.map((part, i) =>
    typeof part === 'string' ? part : <mark key={i} className="ab-mark">{part.s}</mark>,
  );
}

/** Split a value title at its last sentence so the closing sentence can carry the burgundy. */
function splitValue(t: string): [string, string] {
  const i = t.lastIndexOf('. ');
  return i === -1 ? [t, ''] : [t.slice(0, i + 1), t.slice(i + 2)];
}

const CSS = `
${SECTION_CSS}
${FOLD_SECTION_CSS}
.ab-mark { background: linear-gradient(transparent 62%, var(--pink-soft) 62%); color: var(--ink); font-weight: 650; padding: 0 2px; }

/* Brand idea */
.ab-idea { background: var(--surface); }
.ab-idea__grid { display: grid; gap: var(--space-xl); align-items: center; }
.ab-idea__sheet { padding: var(--space-lg) var(--space-md) var(--space-md); }
.ab-idea__logo { display: flex; justify-content: center; padding: var(--space-md) 0 var(--space-lg); }
.ab-legend { list-style: none; margin: 0; padding: var(--space-sm) 0 0; border-top: 1px solid var(--grey-warm); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); }
.ab-legend li { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.8125rem; color: var(--body); }
.ab-legend i { width: 16px; height: 16px; display: inline-block; flex: none; }
.ab-idea__devname { font-family: var(--font-devanagari); font-weight: 700; font-size: clamp(3.5rem, 9vw, 7rem); line-height: 1.2; color: var(--burgundy); margin: 0; }
.ab-idea__means { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.25rem, 2.4vw, 1.75rem); font-weight: 650; letter-spacing: -0.02em; color: var(--grey-metal); margin: 0 0 var(--space-md); }
.ab-idea__p { font-size: clamp(1.0625rem, 1.5vw, 1.25rem); line-height: 1.7; color: var(--ink); max-width: 56ch; margin: 0; }
.ab-tag { margin-top: var(--space-lg); display: grid; width: fit-content; max-width: 100%; grid-template-columns: 40px auto 40px; column-gap: var(--space-sm); align-items: center; }
.ab-tag i { height: 1px; background: var(--grey-metal); opacity: 0.6; transform: translateY(0.14em); }
.ab-tag .dev { grid-column: 2; margin: 0; font-family: var(--font-devanagari); font-weight: 600; font-size: clamp(1.0625rem, 1.8vw, 1.25rem); line-height: 1.5; text-align: center; }
.ab-tag .en { grid-column: 2; margin: 2px 0 0; font-size: 0.8125rem; color: var(--body); text-align: center; }

/* Story */
.ab-story { background: var(--surface-alt); --pad-top: var(--section-y); }
.ab-story__grid { display: grid; gap: var(--space-xl); }
.ab-story__head h2 { max-width: 12ch; }
.ab-story__spine { display: none; }
.ab-story__lead { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: clamp(1.25rem, 2.2vw, 1.75rem); line-height: 1.4; letter-spacing: -0.01em; color: var(--ink); margin: 0 0 var(--space-lg); max-width: 36ch; font-weight: 500; }
.ab-story p.ab-p { color: var(--body); line-height: 1.8; font-size: 1.0625rem; max-width: 62ch; margin: 0 0 var(--space-md); }
.ab-story__close { margin: var(--space-xl) 0 0; padding-left: var(--space-md); border-left: 2px solid var(--burgundy); font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: clamp(1.25rem, 2.4vw, 1.875rem); line-height: 1.35; letter-spacing: -0.015em; color: var(--ink); max-width: 30ch; }

/* Vision / mission: two panels sharing a 44-degree seam */
.ab-vm { display: grid; background: var(--surface); }
.ab-vm__panel { padding: var(--section-y) var(--grid-page-padding); }
.ab-vm__in { max-width: 34rem; }
.ab-vm__panel--m { position: relative; background: var(--burgundy); color: var(--surface); --seam: clamp(28px, 5vw, 72px); margin-top: calc(var(--seam) * -1); padding-top: calc(var(--section-y) + var(--seam)); clip-path: polygon(0 var(--seam), 100% 0, 100% 100%, 0 100%); }
.ab-vm__big { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(2.25rem, 5vw, 4rem); line-height: 1; letter-spacing: -0.03em; margin: 0 0 var(--space-md); color: var(--ink); }
.ab-vm__panel--m .ab-vm__big { color: var(--surface); }
.ab-vm p.t { font-size: clamp(1.0625rem, 1.5vw, 1.1875rem); line-height: 1.7; margin: 0; color: var(--body); }
.ab-vm__panel--m p.t { color: var(--surface); }

/* Values */
.ab-vals { background: var(--canvas); }
.ab-vals__list { list-style: none; margin: 0; padding: 0; }
.ab-val { display: grid; gap: var(--space-sm); padding: var(--space-lg) 0; position: relative; }
.ab-val::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: var(--grey-warm); }
.ab-val:first-child::before { height: 2px; background: var(--burgundy); right: auto; width: 72px; }
.ab-val h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(1.625rem, 3.6vw, 3rem); line-height: 1.08; letter-spacing: -0.03em; color: var(--ink); margin: 0; max-width: 20ch; text-wrap: balance; }
.ab-val h3 em { font-style: normal; color: var(--burgundy); display: block; }
.ab-val p { margin: 0; color: var(--body); line-height: 1.6; max-width: 36ch; align-self: end; }

/* Leadership */
.ab-lead { background: var(--surface); }
.ab-plates { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-lg); }
.ab-plate { padding: 0; }
.ab-plate__head { display: flex; justify-content: space-between; align-items: center; padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--grey-metal); font-size: 0.6875rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--grey-metal); }
.ab-plate__head b { color: var(--burgundy); font-weight: 600; }
.ab-plate__name { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(1.75rem, 3.6vw, 2.75rem); letter-spacing: -0.03em; line-height: 1.05; color: var(--ink); margin: 0; padding: var(--space-lg) var(--space-sm) var(--space-sm); }
.ab-plate__foot { padding: 0 var(--space-sm) var(--space-sm); font-size: 0.875rem; color: var(--muted); margin: 0; }

/* Proof */
.ab-proof { background: var(--surface-alt); --pad-top: var(--section-y); }
.ab-proof__list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-lg) var(--space-md); grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ab-proof__list li { position: relative; padding-top: var(--space-sm); min-width: 0; }
.ab-proof__list li::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 9px; border-top: 1px solid var(--grey-metal); border-left: 1px solid var(--grey-metal); border-right: 1px solid var(--grey-metal); border-bottom: 0; }
.ab-proof .v { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; letter-spacing: -0.03em; color: var(--ink); font-size: clamp(2rem, 4.4vw, 3.5rem); line-height: 1; font-variant-numeric: tabular-nums lining-nums; }
.ab-proof .v--w { font-size: clamp(1.125rem, 2vw, 1.5rem); line-height: 1.15; letter-spacing: -0.02em; color: var(--burgundy); }
.ab-proof .l { margin-top: var(--space-xs); font-size: 0.875rem; color: var(--body); line-height: 1.5; }

/* Culture teaser */
.ab-culture { background: var(--surface); }
.ab-culture__link { display: grid; gap: var(--space-md); align-items: end; text-decoration: none; color: inherit; padding: var(--space-lg) 0; border-top: 2px solid var(--burgundy); border-bottom: 1px solid var(--grey-warm); }
.ab-culture__link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }
.ab-culture__t { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(2rem, 6vw, 5rem); line-height: 1.02; letter-spacing: -0.035em; color: var(--ink); margin: 0; text-wrap: balance; }
.ab-culture__go { display: inline-flex; align-items: center; gap: var(--space-xs); font-weight: 650; color: var(--burgundy); white-space: nowrap; }
.ab-culture__arrow { width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center; background: var(--burgundy); color: var(--surface); clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%); transition: transform 200ms cubic-bezier(.16,1,.3,1), background-color 200ms; }
.ab-culture__link:hover .ab-culture__arrow { transform: translate3d(2px, -2px, 0); background: var(--burgundy-deep); }

@media (min-width: 768px) {
  .ab-legend { grid-template-columns: auto auto; justify-content: space-between; }
  .ab-proof__list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ab-plates { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ab-val { grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: var(--space-xl); align-items: end; }
  .ab-culture__link { grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-xl); }
}
@media (min-width: 1024px) {
  .ab-idea__grid { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
  .ab-story__grid { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); }
  .ab-story__head { position: sticky; top: 112px; align-self: start; }
  .ab-story__spine { display: block; width: 1px; height: 160px; background: linear-gradient(to bottom, var(--burgundy), transparent); margin-top: var(--space-lg); }
  .ab-vm { grid-template-columns: 1fr 1fr; }
  .ab-vm__panel--m { margin-top: 0; margin-left: calc(var(--seam) * -1); padding-top: var(--section-y); padding-left: calc(var(--grid-page-padding) + var(--seam)); clip-path: polygon(var(--seam) 0, 100% 0, 100% 100%, 0 100%); }
  .ab-vm__panel--v { padding-left: max(var(--grid-page-padding), calc((100vw - var(--grid-max)) / 2)); padding-right: var(--space-xl); display: flex; justify-content: flex-end; }
  .ab-vm__panel--m { padding-right: max(var(--grid-page-padding), calc((100vw - var(--grid-max)) / 2)); }
  .ab-proof__list { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) { .ab-culture__arrow { transition: none; } }
`;

export default function AboutPage() {
  const owners = site.owners;
  const [storyLead, ...storyRest] = story;
  const storyClose = storyRest.pop();
  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'About' }]}
        label="About"
        title="About Alok Plastics, Chandigarh."
        lead="Alok Plastics is a Chandigarh-based manufacturer, established in 1998, of moulded plastic and steel spare parts for water coolers, display counters and deep freezers."
        art={<AboutArt />}
        enter="rise"
        scrollHint
      />

      {/* Brand idea */}
      <section aria-labelledby="idea-h" className="cp-section ab-idea">
        <div style={WRAP_STYLE}>
          <div className="ab-idea__grid">
            <Reveal variant="wipe">
              <div className="cp-sheet ab-idea__sheet">
                <div className="ab-idea__logo">
                  <Logo variant="color" style={{ width: '100%', maxWidth: 340, height: 'auto' }} />
                </div>
                <ul className="ab-legend" aria-label="What the colours mean">
                  <li><i style={{ background: 'var(--burgundy)' }} aria-hidden="true" />Burgundy: our strength</li>
                  <li><i style={{ background: 'var(--grey-metal)' }} aria-hidden="true" />Grey: our metal</li>
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <Eyebrow>The brand idea</Eyebrow>
              <h2 id="idea-h" className="ab-idea__devname" lang="hi">आलोक</h2>
              <p className="ab-idea__means">means light.</p>
              <p className="ab-idea__p">{brandIdea}</p>
              <div className="ab-tag" aria-label={`${site.tagline.devanagari}. ${site.tagline.english}`}>
                <i aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }} />
                <p lang="sa" className="dev" style={{ gridRow: 1 }}>
                  <span style={{ color: 'var(--burgundy)' }}>भारते शिल्पितम्,</span>{' '}
                  <span style={{ color: 'var(--grey-metal)' }}>विश्वय निर्मितम्</span>
                </p>
                <i aria-hidden="true" style={{ gridColumn: 3, gridRow: 1 }} />
                <p lang="en" className="en" style={{ gridRow: 2 }}>{site.tagline.english}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Story */}
      <section aria-labelledby="story-h" className="fold-sec cp-section ab-story">
        <FoldEdge />
        <div style={WRAP_STYLE}>
          <div className="ab-story__grid">
            <div className="ab-story__head">
              <Eyebrow>Our story</Eyebrow>
              <h2 id="story-h" className="cp-h2">Good products build business. Trust builds relationships.</h2>
              <div className="ab-story__spine" aria-hidden="true" />
            </div>
            <div>
              <Reveal as="p" className="ab-story__lead">{renderStory(storyLead)}</Reveal>
              {storyRest.map((p, i) => (
                <Reveal as="p" key={i} className="ab-p">{renderStory(p)}</Reveal>
              ))}
              {storyClose && <Reveal as="p" variant="mask" className="ab-story__close">{renderStory(storyClose)}</Reveal>}
            </div>
          </div>
        </div>
      </section>

      {/* Vision / mission */}
      <section aria-label="Vision and mission" className="ab-vm">
        <div className="ab-vm__panel ab-vm__panel--v">
          <Reveal className="ab-vm__in">
            <Eyebrow>Where we are going</Eyebrow>
            <h2 className="ab-vm__big">Vision</h2>
            <p className="t">{vision}</p>
          </Reveal>
        </div>
        <div className="ab-vm__panel ab-vm__panel--m">
          <Reveal className="ab-vm__in" delay={120}>
            <Eyebrow dark>How we work</Eyebrow>
            <h2 className="ab-vm__big">Mission</h2>
            <p className="t">{mission}</p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="vals-h" className="cp-section ab-vals">
        <div style={WRAP_STYLE}>
          <SectionHead id="vals-h" label="Core values" title="What we hold to." />
          <ul className="ab-vals__list" aria-label="Core values">
            {coreValues.map(v => {
              const [a, b] = splitValue(v.title);
              return (
                <li key={v.title} className="ab-val">
                  <Reveal as="h3">{a}{b && <em>{b}</em>}</Reveal>
                  {v.note && <Reveal as="p" delay={120}>{v.note}</Reveal>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Journey: pins on desktop only; static vertical timeline on mobile / reduced motion */}
      <JourneyOrbit />

      {/* Leadership */}
      <section aria-labelledby="lead-h" className="cp-section ab-lead">
        <div style={WRAP_STYLE}>
          <SectionHead id="lead-h" label="Leadership" title="The people behind the company." />
          <ul className="ab-plates">
            {owners.map((o, i) => (
              <li key={o.name}>
                <Reveal className="cp-sheet ab-plate" delay={i * 120}>
                  <div className="ab-plate__head"><b>{o.title}</b><span>Alok Plastics</span></div>
                  <p className="ab-plate__name">{o.name}</p>
                  <p className="ab-plate__foot">{o.title}, Alok Plastics</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Proof */}
      <section aria-labelledby="proof-h" className="fold-sec cp-section ab-proof">
        <FoldEdge />
        <div style={WRAP_STYLE}>
          <SectionHead id="proof-h" label="In numbers" title="What we stand behind." />
          <ul className="ab-proof__list">
            {site.proof.map((p, i) => (
              <li key={p.label}>
                <Reveal delay={i * 60}>
                  <div className={p.isNumeric ? 'v' : 'v v--w'}>{p.value}</div>
                  <div className="l">{p.label}</div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Culture teaser */}
      <section aria-labelledby="culture-h" className="cp-section ab-culture">
        <div style={WRAP_STYLE}>
          <Eyebrow>Our people</Eyebrow>
          <Reveal>
            <Link href="/career/" className="ab-culture__link" aria-labelledby="culture-h">
              <h2 id="culture-h" className="ab-culture__t">Joyful, supportive, trustworthy.</h2>
              <span className="ab-culture__go">Life at Alok Plastics <span className="ab-culture__arrow"><ArrowUpRight size={24} weight="light" aria-hidden="true" /></span></span>
            </Link>
          </Reveal>
        </div>
      </section>

      <EnquiryBand />
    </>
  );
}
