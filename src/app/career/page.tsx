/**
 * /career: culture (§5.11 verbatim), four teams, open roles from config, contact CTA (§8.2).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import PageHero from '@/components/page/PageHero';
import { CareerArt } from '@/components/page/art';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import Reveal from '@/components/ui/Reveal';
import { careerConfig } from '@/content/career';
import { site } from '@/content/site';
import { Eyebrow, SECTION_CSS, SectionHead, WRAP_STYLE } from '@/components/about/parts';

export const metadata: Metadata = {
  title: { absolute: 'Careers | Alok Plastics' },
  description:
    'Join Alok Plastics, a Chandigarh manufacturer. Teams in product development, sales, social media and marketing, and tech.',
  alternates: { canonical: '/career/' },
  robots: { index: true, follow: true },
};

const CSS = `
${SECTION_CSS}
${FOLD_SECTION_CSS}
/* Culture */
.cr-culture { background: var(--surface); }
.cr-culture__grid { display: grid; gap: var(--space-xl); }
.cr-culture__statement { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(1.75rem, 3.6vw, 3rem); line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); margin: 0 0 var(--space-lg); text-wrap: balance; max-width: 18ch; }
.cr-culture__statement em { font-style: normal; color: var(--burgundy); }
.cr-culture p.p { color: var(--body); line-height: 1.8; font-size: 1.0625rem; max-width: 60ch; margin: 0 0 var(--space-md); }
.cr-words { list-style: none; margin: 0; padding: 0; }
.cr-words li { position: relative; padding: var(--space-md) 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 700; font-size: clamp(2rem, 4.6vw, 4.5rem); line-height: 1; letter-spacing: -0.04em; color: var(--ink); border-top: 1px solid var(--grey-warm); display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-sm); }
.cr-words li:last-child { border-bottom: 1px solid var(--grey-warm); }
.cr-words li:nth-child(2) { color: transparent; -webkit-text-stroke: 1.5px var(--ink); padding-left: var(--space-md); }
.cr-words li:nth-child(3) { color: var(--burgundy); padding-left: var(--space-lg); }
.cr-words li::after { content: ''; width: 40px; height: 2px; background: var(--burgundy); flex: none; align-self: center; }

/* Teams */
.cr-teams { background: var(--surface-alt); --pad-top: var(--section-y); }
.cr-team-list { list-style: none; margin: 0; padding: 0; border-top: 2px solid var(--ink); }
.cr-team { display: grid; gap: var(--space-xs); padding: var(--space-lg) 0 var(--space-lg) var(--space-sm); border-bottom: 1px solid var(--grey-warm); position: relative; transition: background-color 200ms, padding-left 200ms cubic-bezier(.16,1,.3,1); }
.cr-team::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--burgundy); transform: scaleY(0); transform-origin: top; transition: transform 400ms cubic-bezier(.16,1,.3,1); }
.cr-team:hover { background: var(--surface); padding-left: var(--space-md); }
.cr-team:hover::before { transform: scaleY(1); }
.cr-team__k { font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-metal); }
.cr-team h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(1.5rem, 3.2vw, 2.5rem); line-height: 1.08; letter-spacing: -0.03em; color: var(--ink); margin: 0; }
.cr-team p { margin: 0; color: var(--body); line-height: 1.6; max-width: 42ch; }

/* Roles */
.cr-roles { background: var(--canvas); }
.cr-roles__grid { display: grid; gap: var(--space-xl); }
.cr-role-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--grey-warm); }
.cr-role-list li { padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
.cr-empty { padding: var(--space-lg) var(--space-md); }
.cr-empty h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: clamp(1.5rem, 2.6vw, 2rem); letter-spacing: -0.02em; line-height: 1.1; color: var(--ink); margin: 0; }
.cr-empty p { color: var(--body); line-height: 1.65; margin: var(--space-sm) 0 0; max-width: 44ch; }
.cr-actions { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-lg); }

/* Closing */
.cr-cta { background: var(--surface-alt); --pad-top: var(--section-y); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
.cr-cta__in { display: grid; gap: var(--space-lg); align-items: end; }

@media (min-width: 768px) {
  .cr-team { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: var(--space-xl); align-items: end; }
  .cr-team__k { grid-column: 1 / -1; }
  .cr-cta__in { grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-xl); }
}
@media (min-width: 1024px) {
  .cr-culture__grid { grid-template-columns: minmax(0, 6fr) minmax(0, 6fr); gap: var(--space-xl); align-items: center; }
  .cr-roles__grid { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); }
}
@media (prefers-reduced-motion: reduce) { .cr-team, .cr-team::before { transition: none; } }
`;

export default function CareerPage() {
  const { culture, teams } = careerConfig;
  const openRoles = careerConfig.openRoles.filter(r => r.published);
  const email = site.contact.email;
  const paragraphs = culture.split(/\n\s*\n/);

  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Career' }]}
        label="Career"
        title="Grow alongside the company."
        lead="A strong company is built by strong people."
        art={<CareerArt />}
        enter="wipe"
        scrollHint
      />

      <section aria-labelledby="culture-h" className="cp-section cr-culture">
        <div style={WRAP_STYLE}>
          <div className="cr-culture__grid">
            <div>
              <Eyebrow>Culture</Eyebrow>
              <h2 id="culture-h" className="cr-culture__statement">A workplace where people <em>enjoy working</em> and take pride in what they create.</h2>
              {paragraphs.map((p, i) => <Reveal as="p" key={i} className="p">{p}</Reveal>)}
            </div>
            <ul className="cr-words" aria-label="Our culture in three words">
              {['Joyful', 'Supportive', 'Trustworthy'].map((w, i) => (
                <li key={w}><Reveal as="span" variant="mask" delay={i * 140} style={{ display: "inline-block" }}>{w}</Reveal></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="teams-h" className="fold-sec cp-section cr-teams">
        <FoldEdge />
        <div style={WRAP_STYLE}>
          <SectionHead id="teams-h" label="Teams" title="Four teams, one company." />
          <ul className="cr-team-list">
            {teams.map(t => (
              <li key={t.id} className="cr-team">
                <span className="cr-team__k">Team</span>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="roles-h" className="cp-section cr-roles">
        <div style={WRAP_STYLE}>
          <div className="cr-roles__grid">
            <header>
              <Eyebrow>Open roles</Eyebrow>
              <h2 id="roles-h" className="cp-h2">Current openings</h2>
            </header>
            {openRoles.length > 0 ? (
              <ul className="cr-role-list">
                {openRoles.map(r => (
                  <li key={r.id}>
                    <strong style={{ color: 'var(--ink)' }}>{r.title}</strong>
                    <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.875rem' }}>{r.team} · {r.location} · {r.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Reveal variant="wipe">
                <div className="cp-sheet cr-empty">
                  <h3>No open roles right now</h3>
                  <p>
                    {email
                      ? 'You are welcome to send your CV and we will keep it on file.'
                      : 'Reach out through our contact page and tell us about yourself.'}
                  </p>
                  <div className="cr-actions">
                    {email ? (
                      <a className="cp-btn" href={`mailto:${email}?subject=${encodeURIComponent('Career enquiry: CV')}`}>
                        <EnvelopeSimple size={20} weight="light" aria-hidden="true" /> Send your CV
                      </a>
                    ) : (
                      <Link className="cp-btn" href="/contact/">Contact us <ArrowUpRight size={20} weight="light" aria-hidden="true" /></Link>
                    )}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="career-cta-h" className="fold-sec cr-cta">
        <FoldEdge />
        <div style={{ ...WRAP_STYLE, position: 'relative', zIndex: 1 }}>
          <div className="cr-cta__in">
            <div>
              <Eyebrow>Get in touch</Eyebrow>
              <h2 id="career-cta-h" className="cp-h2" style={{ maxWidth: '16ch' }}>Want to work with us?</h2>
            </div>
            <Link className="cp-btn" href="/contact/" style={{ minHeight: 56, padding: '0 var(--space-lg)' }}>Contact us <ArrowUpRight size={20} weight="light" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
