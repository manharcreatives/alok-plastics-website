/**
 * /career: culture (§5.11 verbatim), four teams, open roles from config, contact CTA (§8.2).
 */
import type { Metadata } from 'next';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import Highlight from '@/components/ui/Highlight';
import PageHero from '@/components/page/PageHero';
import { CareerArt } from '@/components/page/art';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import Reveal from '@/components/ui/Reveal';
import RoleList from '@/components/career/RoleList';
import CareerApplyForm from '@/components/career/CareerApplyForm';
import { careerConfig } from '@/content/career';
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
.cr-culture__statement { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h2); line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--ink); margin: 0 0 var(--space-lg); text-wrap: balance; max-width: 18ch; }
.cr-culture__statement em { font-style: normal; color: var(--burgundy); }
.cr-culture p.p { color: var(--body); line-height: 1.8; font-size: 1.125rem; max-width: 60ch; margin: 0 0 var(--space-md); }
.cr-words { list-style: none; margin: 0; padding: 0; }
.cr-words li { position: relative; padding: var(--space-md) 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 700; font-size: var(--fs-display); line-height: var(--lh-display); letter-spacing: var(--tr-display); color: var(--ink); border-top: 1px solid var(--grey-warm); display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-sm); }
.cr-words li:last-child { border-bottom: 1px solid var(--grey-warm); }
.cr-words li:nth-child(2) { color: var(--grey-metal); padding-left: var(--space-md); }
.cr-words li:nth-child(3) { color: var(--burgundy); padding-left: var(--space-lg); }
.cr-words li svg { color: var(--burgundy); flex: none; align-self: center; width: clamp(24px, 3vw, 44px); height: auto; }

/* Teams */
.cr-teams { background: var(--surface-alt); --pad-top: var(--section-y); }
.cr-team-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--ink); }
.cr-team { display: grid; gap: var(--space-xs); padding: var(--space-lg) 0 var(--space-lg) var(--space-sm); border-bottom: 1px solid var(--grey-warm); position: relative; transition: background-color 200ms, padding-left 200ms cubic-bezier(.16,1,.3,1); }
.cr-team::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--burgundy); transform: scaleY(0); transform-origin: top; transition: transform 400ms cubic-bezier(.16,1,.3,1); }
.cr-team:hover { background: var(--surface); padding-left: var(--space-md); }
.cr-team:hover::before { transform: scaleY(1); }
.cr-team h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h3); line-height: var(--lh-h3); letter-spacing: var(--tr-h3); color: var(--ink); margin: 0; }
.cr-team p { margin: 0; color: var(--body); line-height: 1.6; font-size: 1.0625rem; max-width: 42ch; }

/* Roles */
.cr-roles { background: var(--canvas); }
.cr-apply { background: var(--surface); }
.cr-roles__grid { display: grid; gap: var(--space-xl); }
.cr-role-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--grey-warm); }
.cr-role-list li { padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
.cr-empty { padding: var(--space-lg) var(--space-md); background: var(--blush); border: 1px solid var(--pink-soft); border-left: 2px solid var(--burgundy); border-radius: var(--radius-card); }
.cr-empty h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h3); letter-spacing: var(--tr-h3); line-height: var(--lh-h3); color: var(--ink); margin: 0; }
.cr-empty p { color: var(--body); line-height: 1.65; margin: var(--space-sm) 0 0; max-width: 44ch; }

/* Hero action row */
.cr-hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-sm); }
/* Closing */
.cr-cta { background: var(--surface-alt); --pad-top: var(--section-y); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
.cr-cta__in { display: grid; gap: var(--space-lg); align-items: end; }

@media (min-width: 768px) {
  .cr-team { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: var(--space-xl); align-items: baseline; }
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
  const paragraphs = culture.split(/\n\s*\n/);

  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Career' }]}
        label="Careers at Alok Plastics"
        title="Make parts. Make a career."
        lead="A strong company is built by strong people. Join one of four teams and grow alongside the company."
        art={<CareerArt />}
        photo={{ src: '/images/heroes/career.webp', position: 'center 40%' }}
        enter="wipe"
        layout="stack"
      >
        <div className="cr-hero-actions">
          <a href="#roles-h" className="ph__btn">See open roles <ArrowUpRight size={18} weight="light" aria-hidden="true" /></a>
          <a href="#apply" className="ph__btn ph__btn--ghost">Send your CV</a>
        </div>
      </PageHero>

      <section aria-labelledby="culture-h" className="cp-section cr-culture">
        <div style={WRAP_STYLE}>
          <div className="cr-culture__grid">
            <div>
              <Eyebrow>How we work together</Eyebrow>
              <h2 id="culture-h" className="cr-culture__statement">A workplace where people <em>enjoy working</em> and take pride in what they create.</h2>
              {paragraphs.map((p, i) => <Reveal as="p" key={i} className="p">{i === 0 ? <Highlight keywords={['joyful, supportive, and trustworthy']}>{p}</Highlight> : p}</Reveal>)}
            </div>
            <ul className="cr-words" aria-label="Our culture in three words">
              {['Joyful', 'Supportive', 'Trustworthy'].map((w, i) => (
                <li key={w}><Reveal as="span" variant="mask" delay={i * 140} style={{ display: "inline-block" }}>{w}</Reveal><ArrowUpRight weight="light" aria-hidden="true" /></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="teams-h" className="fold-sec fold-sec--step cp-section cr-teams">
        <FoldEdge variant="step" />
        <div style={WRAP_STYLE}>
          <SectionHead id="teams-h" label="Teams" title="Four teams. Find where you fit." />
          <ul className="cr-team-list">
            {teams.map(t => (
              <li key={t.id} className="cr-team">
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
              <h2 id="roles-h" className="cp-h2">Open roles at Alok Plastics</h2>
            </header>
            <RoleList />
          </div>
        </div>
      </section>

      <section id="apply" aria-labelledby="apply-h" className="cp-section cr-apply">
        <div style={WRAP_STYLE}>
          <header style={{ marginBottom: 'var(--space-lg)' }}>
            <Eyebrow>Apply</Eyebrow>
            <h2 id="apply-h" className="cp-h2">Introduce yourself to the team.</h2>
          </header>
          <CareerApplyForm />
        </div>
      </section>
    </>
  );
}
