/**
 * /about: story, brand idea, vision / mission / values, full journey, leadership, proof, culture teaser (§8.2).
 * Copy: verbatim from MASTER_PROMPT §5; no invented history.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import Highlight from '@/components/ui/Highlight';
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
  title: { absolute: 'About Alok Plastics | Chandigarh Parts Maker Since 1998' },
  description:
    'Alok Plastics is a Chandigarh manufacturer of plastic and steel spare parts since 1998, serving OEMs, dealers and distributors across India. Our story.',
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
    typeof part === 'string' ? part : <mark key={i} className="kw">{part.s}</mark>,
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

/* Brand idea */
.ab-idea { background: var(--surface); }
.ab-idea__grid { display: grid; gap: var(--space-xl); align-items: center; }
.ab-idea__sheet { padding: var(--space-lg) 0 var(--space-md); max-width: 460px; margin: 0 auto; }
.ab-idea__logo { display: flex; justify-content: center; padding: var(--space-md) 0 var(--space-lg); }
.ab-legend { list-style: none; margin: 0 auto; padding: var(--space-sm) 0 0; border-top: 1px solid var(--grey-cloud); display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xs) var(--space-lg); max-width: 340px; }
.ab-legend li { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.875rem; color: var(--body); }
.ab-legend li b { font-weight: 600; color: var(--ink); }
.ab-legend i { width: 12px; height: 12px; display: inline-block; flex: none; }
.ab-idea__devname { font-family: var(--font-devanagari); font-weight: 700; font-size: clamp(3.5rem, 9vw, 7rem); line-height: 1.2; color: var(--burgundy); margin: 0; }
.ab-idea__means { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-lead-lg); font-weight: 650; letter-spacing: var(--tr-lead-lg); color: var(--grey-metal); margin: 0 0 var(--space-md); }
.ab-idea__p { font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--ink); max-width: 56ch; margin: 0; }
.ab-tag { margin-top: var(--space-lg); display: grid; width: fit-content; max-width: 100%; grid-template-columns: 40px auto 40px; column-gap: var(--space-sm); align-items: center; }
.ab-tag i { height: 1px; background: var(--grey-metal); opacity: 0.6; transform: translateY(0.14em); }
.ab-tag .dev { grid-column: 2; margin: 0; font-family: var(--font-devanagari); font-weight: 600; font-size: clamp(1.0625rem, 1.8vw, 1.25rem); line-height: 1.5; text-align: center; }
.ab-tag .en { grid-column: 2; margin: 2px 0 0; font-size: 0.8125rem; color: var(--body); text-align: center; }

/* Story */
.ab-story { background: var(--surface-alt); --pad-top: var(--section-y); }
.ab-story__grid { display: grid; gap: var(--space-xl); }
.ab-story__head h2 { max-width: 12ch; }
.ab-story__lead { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: var(--fs-lead-lg); line-height: var(--lh-lead-lg); letter-spacing: var(--tr-lead-lg); color: var(--ink); margin: 0 0 var(--space-lg); max-width: 36ch; font-weight: 500; }
.ab-story p.ab-p { color: var(--body); line-height: 1.8; font-size: 1.0625rem; max-width: 62ch; margin: 0 0 var(--space-md); }
.ab-story__close { margin: var(--space-xl) 0 0; padding-left: var(--space-md); border-left: 2px solid var(--burgundy); font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: var(--fs-h3); line-height: var(--lh-h3); letter-spacing: var(--tr-h3); color: var(--ink); max-width: 30ch; }

/* Vision / mission: two panels sharing a 44-degree seam */
.ab-vm { display: grid; background: var(--surface); }
.ab-vm__panel { padding: var(--section-y) var(--grid-page-padding); }
.ab-vm__in { max-width: 34rem; }
.ab-vm__panel--m { position: relative; background: var(--burgundy); color: var(--surface); --seam: clamp(28px, 5vw, 72px); margin-top: calc(var(--seam) * -1); padding-top: calc(var(--section-y) + var(--seam)); clip-path: polygon(0 var(--seam), 100% 0, 100% 100%, 0 100%); }
.ab-vm__big { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); margin: 0 0 var(--space-md); color: var(--ink); }
.ab-vm__panel--m .ab-vm__big { color: var(--surface); }
.ab-vm p.t { font-size: var(--fs-lead); line-height: var(--lh-lead); margin: 0; color: var(--body); }
.ab-vm__panel--m p.t { color: var(--surface); }

/* Values: one hero statement, two supporting panels. Notched 44-degree corners, top-lit edge. */
.ab-vals { background: var(--canvas); }
.ab-vals__list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-md); }
.ab-val { position: relative; display: grid; align-content: space-between; gap: var(--space-md); padding: var(--space-lg) var(--space-md) var(--space-md); background: var(--surface); box-shadow: inset 0 1px 0 var(--surface), inset 0 0 0 1px var(--grey-warm); clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%); overflow: hidden; }
.ab-val::before { content: ''; position: absolute; left: 0; top: 0; width: 72px; height: 2px; background: var(--burgundy); }
.ab-val h3 { position: relative; z-index: 1; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h2); line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--ink); margin: 0; text-wrap: balance; }
.ab-val h3 em { font-style: normal; color: var(--burgundy); display: block; }
.ab-val p { position: relative; z-index: 1; margin: 0; padding-top: var(--space-sm); border-top: 1px solid var(--grey-warm); color: var(--body); font-size: 1.0625rem; line-height: 1.6; max-width: 36ch; }
.ab-val--hero { padding: var(--space-xl) var(--space-md); min-height: clamp(300px, 44vw, 460px); background: var(--burgundy); box-shadow: none; }
.ab-val--hero::before { background: var(--surface); }
.ab-val--hero h3 { color: var(--surface); font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); max-width: none; }
.ab-val--hero h3 em { color: var(--pink-soft); }
.ab-val--hero p { color: var(--surface); border-top-color: color-mix(in srgb, var(--surface) 35%, transparent); font-family: var(--font-archivo); font-variation-settings: "wdth" 115; font-weight: 600; font-size: 1.25rem; }
.ab-val__draw { position: absolute; right: var(--space-md); top: 50%; width: min(26%, 280px); height: auto; transform: translateY(-50%); opacity: 0.5; stroke: var(--surface); stroke-width: 1.25; stroke-linecap: square; pointer-events: none; }
.ab-val__draw .ab-val__accent { stroke: var(--pink-soft); stroke-width: 3; }
.ab-val--hero::after { display: none; }
@media (max-width: 767px) { .ab-val__draw { display: none; } }
.ab-val--soc { background: var(--surface); }
.ab-val--soc::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: min(46%, 520px); pointer-events: none;
  background: repeating-linear-gradient(-44deg, transparent 0 18px, color-mix(in srgb, var(--burgundy) 14%, transparent) 18px 19px);
  -webkit-mask-image: linear-gradient(to left, var(--ink), transparent 90%); mask-image: linear-gradient(to left, var(--ink), transparent 90%); }

/* Leadership */
.ab-lead { background: var(--surface); }
.ab-plates { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-lg); }
.ab-plate { padding: 0; }
.ab-plate__head { display: flex; justify-content: space-between; align-items: center; padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--grey-metal); font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: var(--grey-metal); }
.ab-plate__head b { color: var(--burgundy); font-weight: 600; }
.ab-plate__name { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h2); letter-spacing: var(--tr-h2); line-height: var(--lh-h2); color: var(--ink); margin: 0; padding: var(--space-lg) var(--space-sm) var(--space-sm); }
.ab-plate__foot { padding: 0 var(--space-sm) var(--space-sm); font-size: 0.875rem; color: var(--muted); margin: 0; }


/* Culture teaser */
.ab-culture { background: var(--surface); }
.ab-culture__link { display: grid; gap: var(--space-md); align-items: end; text-decoration: none; color: inherit; padding: var(--space-lg) 0; border-top: 2px solid var(--burgundy); border-bottom: 1px solid var(--grey-warm); }
.ab-culture__link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }
.ab-culture__t { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); color: var(--ink); margin: 0; text-wrap: balance; }
.ab-culture__go { display: inline-flex; align-items: center; gap: var(--space-xs); font-weight: 650; color: var(--burgundy); white-space: nowrap; }
.ab-culture__arrow { width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center; background: var(--burgundy); color: var(--surface); clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%); transition: transform 200ms cubic-bezier(.16,1,.3,1), background-color 200ms; }
.ab-culture__link:hover .ab-culture__arrow { transform: translate3d(2px, -2px, 0); background: var(--burgundy-deep); }

@media (min-width: 768px) {
    .ab-plates { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ab-val--hero { padding: var(--space-xl) var(--space-lg); }
  .ab-val { padding: var(--space-lg); min-height: 240px; }
  .ab-culture__link { grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-xl); }
}
@media (min-width: 1024px) {
  .ab-idea__grid { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
  .ab-story__grid { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); }
  .ab-story__head { position: sticky; top: 112px; align-self: start; }
  .ab-vm { grid-template-columns: 1fr 1fr; }
  .ab-vm__panel--m { margin-top: 0; margin-left: calc(var(--seam) * -1); padding-top: var(--section-y); padding-left: calc(var(--grid-page-padding) + var(--seam)); clip-path: polygon(var(--seam) 0, 100% 0, 100% 100%, 0 100%); }
  .ab-vm__panel--v { padding-left: max(var(--grid-page-padding), calc((100vw - var(--grid-max)) / 2)); padding-right: var(--space-xl); display: flex; justify-content: flex-end; }
  .ab-vm__panel--m { padding-right: max(var(--grid-page-padding), calc((100vw - var(--grid-max)) / 2)); }
}
@media (min-width: 1024px) {
  .ab-vals__list { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: var(--space-md); }
  .ab-val--soc { min-height: 0; justify-content: stretch; }
  .ab-val--soc h3 { font-size: var(--fs-h2); }
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
        label="About Alok Plastics"
        title="The small parts that hold coolers, counters and freezers together."
        size="md"
        lead={<Highlight keywords={['moulded plastic and steel spare parts']}>Alok Plastics is a Chandigarh-based manufacturer, established in 1998, of moulded plastic and steel spare parts for water coolers, display counters and deep freezers.</Highlight>}
        specs={[
          { k: 'Since', v: '1998' },
          { k: 'Works', v: `Industrial Area Phase II, ${site.contact.city}` },
          { k: 'Process', v: 'Moulds + plastic granules' },
          { k: 'Delivered', v: '20 Cr+ products' },
        ]}
        art={<AboutArt />}
        photo={{ src: '/images/heroes/about.webp', position: '68% center' }}
        enter="rise"
        layout="spec"
      >
        <Link href="/enquiry/" className="ph__btn">Get a quote <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
        <a href="#story-h" className="ph__btn ph__btn--ghost">Read our story</a>
      </PageHero>

      {/* Brand idea */}
      <section aria-labelledby="idea-h" className="cp-section ab-idea">
        <div style={WRAP_STYLE}>
          <div className="ab-idea__grid">
            <Reveal variant="wipe">
              <div className="ab-idea__sheet">
                <div className="ab-idea__logo">
                  <Logo variant="color" style={{ width: '100%', maxWidth: 340, height: 'auto' }} />
                </div>
                <ul className="ab-legend" aria-label="What the colours mean">
                  <li><i style={{ background: 'linear-gradient(135deg, var(--burgundy-deep), var(--burgundy-bright))' }} aria-hidden="true" /><span><b>Burgundy:</b> our strength</span></li>
                  <li><i style={{ background: 'linear-gradient(180deg, var(--grey-metal), var(--silver))' }} aria-hidden="true" /><span><b>Grey:</b> our metal</span></li>
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <Eyebrow>Why we are called Alok</Eyebrow>
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
              <Eyebrow>Our story since 1998</Eyebrow>
              <h2 id="story-h" className="cp-h2">Good products win the order. Trust wins the next one.</h2>
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
            <Eyebrow>Vision</Eyebrow>
            <h2 className="ab-vm__big">Where we are going.</h2>
            <p className="t">{vision}</p>
          </Reveal>
        </div>
        <div className="ab-vm__panel ab-vm__panel--m">
          <Reveal className="ab-vm__in" delay={120}>
            <Eyebrow dark>Mission</Eyebrow>
            <h2 className="ab-vm__big">How we get there.</h2>
            <p className="t">{mission}</p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="vals-h" className="cp-section ab-vals">
        <div style={WRAP_STYLE}>
          <SectionHead id="vals-h" label="Core values" title="Two values we build on." />
          <ul className="ab-vals__list" aria-label="Core values">
            {coreValues.map((v, i) => {
              const [a, b] = splitValue(v.title);
              return (
                <li key={v.title} className={`ab-val${i === 0 ? ' ab-val--hero' : ' ab-val--soc'}`}>
                  {i === 0 && (
                    <svg className="ab-val__draw" viewBox="0 0 360 220" fill="none" aria-hidden="true">
                      {/* sprue + runner feeding three parts: the waste is the runner, so it is drawn small */}
                      <path d="M20 110 H120 M120 110 V40 M120 110 V180 M120 40 H190 M120 110 H190 M120 180 H190" />
                      <rect x="190" y="22" width="56" height="36" /><rect x="190" y="92" width="56" height="36" /><rect x="190" y="162" width="56" height="36" />
                      <circle cx="218" cy="40" r="8" /><circle cx="218" cy="110" r="8" /><circle cx="218" cy="180" r="8" />
                      <path d="M276 40 H340 M276 110 H340 M276 180 H340" strokeDasharray="4 4" />
                      <path className="ab-val__accent" d="M20 110 H120" />
                    </svg>
                  )}
                  <Reveal as="h3" variant={i === 0 ? 'mask' : undefined}>{a}{b && <em>{b}</em>}</Reveal>
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
          <SectionHead id="lead-h" label="Leadership" title="The two people who run Alok Plastics." />
          <ul className="ab-plates">
            {owners.map((o, i) => (
              <li key={o.name}>
                <Reveal className="cp-sheet ab-plate" delay={i * 120}>
                  <div className="ab-plate__head"><b>{o.title}</b></div>
                  <p className="ab-plate__name">{o.name}</p>
                  <p className="ab-plate__foot">Alok Plastics</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Culture teaser */}
      <section aria-labelledby="culture-h" className="cp-section ab-culture">
        <div style={WRAP_STYLE}>
          <Eyebrow>Work with us</Eyebrow>
          <Reveal>
            <Link href="/career/" className="ab-culture__link" aria-labelledby="culture-h">
              <h2 id="culture-h" className="ab-culture__t">Joyful, supportive, trustworthy.</h2>
              <span className="ab-culture__go">Life at Alok Plastics <span className="ab-culture__arrow"><ArrowUpRight size={24} weight="light" aria-hidden="true" /></span></span>
            </Link>
          </Reveal>
        </div>
      </section>

      <EnquiryBand variant="wide" />
    </>
  );
}
