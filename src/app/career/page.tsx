/**
 * /career — culture (§5.11 verbatim), four teams, open roles from config, contact CTA (§8.2).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/page/PageHero';
import { careerConfig } from '@/content/career';
import { site } from '@/content/site';
import { ARROW_NE, SECTION_CSS, SectionHead, WRAP_STYLE } from '@/components/about/parts';

export const metadata: Metadata = {
  title: { absolute: 'Careers | Alok Plastics' },
  description:
    'Join Alok Plastics, a Chandigarh manufacturer. Teams in product development, sales, social media and marketing, and tech.',
  alternates: { canonical: '/career/' },
  robots: { index: true, follow: true },
};

const CSS = `
${SECTION_CSS}
.cr-culture p { color: var(--body); line-height: 1.75; font-size: 1.0625rem; max-width: 64ch; margin: 0 0 var(--space-sm); }
.cr-roles { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--grey-cloud); }
.cr-roles li { padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-cloud); }
.cr-empty { background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); padding: var(--space-lg) var(--space-md); max-width: 720px; }
.cr-actions { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-md); }
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
        label="01 — Career"
        title="Grow alongside the company."
        lead="A strong company is built by strong people."
      />

      <section aria-labelledby="culture-h" className="cp-section" style={{ background: 'var(--canvas)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="culture-h" label="02 — Culture" title="Joyful, supportive, trustworthy." />
          <div className="cr-culture">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      <section aria-labelledby="teams-h" className="cp-section" style={{ background: 'var(--surface-alt)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="teams-h" label="03 — Teams" title="Four teams, one company." />
          <ul className="cp-grid cp-grid--4">
            {teams.map(t => (
              <li key={t.id} className="cp-card">
                <h3>{t.name}</h3>
                <p>{t.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="roles-h" className="cp-section" style={{ background: 'var(--canvas)' }}>
        <div style={WRAP_STYLE}>
          <SectionHead id="roles-h" label="04 — Open roles" title="Current openings" />
          {openRoles.length > 0 ? (
            <ul className="cr-roles">
              {openRoles.map(r => (
                <li key={r.id}>
                  <strong style={{ color: 'var(--ink)' }}>{r.title}</strong>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.875rem' }}>{r.team} · {r.location} · {r.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cr-empty">
              <p style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontWeight: 650, fontSize: '1.25rem', color: 'var(--ink)', margin: 0 }}>No open roles right now</p>
              <p style={{ color: 'var(--body)', lineHeight: 1.6, marginTop: 'var(--space-xs)' }}>
                {email ? 'You are welcome to send your CV and we will keep it on file.' : 'Reach out through our contact page and tell us about yourself.'}
              </p>
              <div className="cr-actions">
                {email ? (
                  <a className="cp-btn" href={`mailto:${email}?subject=${encodeURIComponent('Career enquiry — CV')}`}>Send your CV</a>
                ) : (
                  <Link className="cp-btn" href="/contact/">Contact us</Link>
                )}
                {!email && <Link className="cp-btn cp-btn--ghost" href="/enquiry/">Send an enquiry</Link>}
              </div>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="career-cta-h" style={{ background: 'var(--surface-alt)', borderTop: '1px solid var(--grey-cloud)', padding: 'var(--space-xl) var(--grid-page-padding)' }}>
        <div style={{ ...WRAP_STYLE, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
          <h2 id="career-cta-h" style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: 'clamp(1.375rem, 2.6vw, 2rem)', fontWeight: 650, letterSpacing: '-0.02em', color: 'var(--ink)', maxWidth: '36ch' }}>
            Want to work with us?
          </h2>
          <Link className="cp-btn" href="/contact/">Contact us <span aria-hidden="true">{ARROW_NE}</span></Link>
        </div>
      </section>
    </>
  );
}
