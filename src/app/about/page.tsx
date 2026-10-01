/**
 * /about — story, brand idea, vision / mission / values, full journey, proof, culture teaser (§8.2).
 * Copy: verbatim from MASTER_PROMPT §5; no invented history.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import Logo from '@/components/brand/Logo';
import JourneyOrbit from '@/components/sections/JourneyOrbit';
import { site } from '@/content/site';
import { brandIdea, story, vision, mission, coreValues } from '@/components/about/aboutContent';
import { ARROW_NE, SECTION_CSS, SectionHead, WRAP_STYLE } from '@/components/about/parts';

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
    typeof part === 'string' ? part : <strong key={i} style={{ color: 'var(--ink)', fontWeight: 650 }}>{part.s}</strong>,
  );
}

const CSS = `
${SECTION_CSS}
.ab-idea { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); align-items: center; }
.ab-logo { background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); padding: var(--space-lg); display: flex; align-items: center; justify-content: center; }
.ab-story { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
.ab-proof { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-md); list-style: none; margin: 0; padding: 0; }
.ab-proof li { border-top: 2px solid var(--burgundy); padding-top: var(--space-sm); min-width: 0; }
.ab-proof .v { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.25rem, 2.2vw, 1.75rem); font-weight: 650; letter-spacing: -0.02em; color: var(--ink); overflow-wrap: anywhere; }
.ab-proof .l { margin-top: var(--space-xs); font-size: 0.875rem; color: var(--muted); line-height: 1.5; }
.ab-val-num { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--burgundy); font-weight: 600; display: block; margin-bottom: var(--space-xs); }
@media (min-width: 1024px) {
  .ab-idea { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
  .ab-story { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); }
  .ab-proof { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (min-width: 768px) and (max-width: 1023px) { .ab-proof { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
`;

export default function AboutPage() {
  const owners = site.owners;
  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'About' }]}
        label="01 — About"
        title="About Alok Plastics, Chandigarh."
        lead="Alok Plastics is a Chandigarh-based manufacturer, established in 1998, of moulded plastic and steel spare parts for water coolers, display counters and deep freezers."
      />

      {/* Brand idea */}
      <section aria-labelledby="idea-h" className="cp-section" style={{ background: 'var(--canvas)' }}>
        <div style={WRAP_STYLE}>
          <div className="ab-idea">
            <div className="ab-logo">
              <Logo variant="color" style={{ width: '100%', maxWidth: 360, height: 'auto' }} />
            </div>
            <div>
              <SectionHead id="idea-h" label="02 — The brand idea" title={<><span lang="hi" style={{ fontFamily: 'var(--font-devanagari)' }}>आलोक</span> <span style={{ color: 'var(--muted)' }}>= light</span></>} />
              <p style={{ fontSize: 'clamp(1.0625rem, 1.6vw, 1.25rem)', lineHeight: 1.7, color: 'var(--ink)', maxWidth: '58ch' }}>{brandIdea}</p>
              <p lang="hi" style={{ marginTop: 'var(--space-md)', fontFamily: 'var(--font-devanagari)', color: 'var(--burgundy)', fontWeight: 600 }}>
                {site.tagline.devanagari}
                <span lang="en" style={{ display: 'block', fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--muted)', marginTop: 'var(--space-xs)' }}>{site.tagline.english}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section aria-labelledby="story-h" className="cp-section" style={{ background: 'var(--surface-alt)' }}>
        <div style={WRAP_STYLE}>
          <div className="ab-story">
            <SectionHead id="story-h" label="03 — Our story" title="Good products build business. Trust builds relationships." />
            <div style={{ display: 'grid', gap: 'var(--space-sm)', maxWidth: '64ch' }}>
              {story.map((p, i) => (
                <p key={i} style={{ color: 'var(--body)', lineHeight: 1.75, fontSize: '1.0625rem' }}>{renderStory(p)}</p>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <h3 style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: '1.125rem', fontWeight: 650, color: 'var(--ink)', marginBottom: 'var(--space-sm)' }}>Leadership</h3>
            <ul className="cp-grid cp-grid--2" style={{ maxWidth: 720 }}>
              {owners.map(o => (
                <li key={o.name} className="cp-card">
                  <h3>{o.name}</h3>
                  <p>{o.title}, Alok Plastics</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Vision / mission / values */}
      <section aria-labelledby="vmv-h" className="cp-section" style={{ background: 'var(--surface)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="vmv-h" label="04 — Vision, mission, values" title="Where we are going, and how we work." />
          <div className="cp-grid cp-grid--2" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="cp-card"><h3>Vision</h3><p>{vision}</p></div>
            <div className="cp-card"><h3>Mission</h3><p>{mission}</p></div>
          </div>
          <ul className="cp-grid cp-grid--3" aria-label="Core values">
            {coreValues.map((v, i) => (
              <li key={v.title} className="cp-card">
                <span className="ab-val-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{v.title}</h3>
                {v.note && <p>{v.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Journey — pins on desktop only; static vertical timeline on mobile / reduced motion */}
      <JourneyOrbit />

      {/* Proof */}
      <section aria-labelledby="proof-h" className="cp-section" style={{ background: 'var(--surface-alt)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="proof-h" label="06 — In numbers" title="What we stand behind." />
          <ul className="ab-proof">
            {site.proof.map(p => (
              <li key={p.label}>
                <div className="v">{p.value}</div>
                <div className="l">{p.label}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Culture teaser */}
      <section aria-labelledby="culture-h" className="cp-section" style={{ background: 'var(--canvas)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead
            id="culture-h"
            label="07 — Our people"
            title="Joyful, supportive, trustworthy."
            lead="We aim to create a joyful, supportive, and trustworthy working environment where every team member feels valued and respected."
          />
          <Link href="/career/" className="cp-link">Life at Alok Plastics <span aria-hidden="true">{ARROW_NE}</span></Link>
        </div>
      </section>

      <EnquiryBand />
    </>
  );
}
