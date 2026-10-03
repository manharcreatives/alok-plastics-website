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
import RoleList from '@/components/career/RoleList';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
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
.cr-roles__grid { display: grid; gap: var(--space-xl); }
.cr-role-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--grey-warm); }
.cr-role-list li { padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
.cr-empty { padding: var(--space-lg) var(--space-md); background: var(--blush); border: 1px solid var(--pink-soft); border-left: 2px solid var(--burgundy); border-radius: var(--radius-card); }
.cr-empty h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 650; font-size: var(--fs-h3); letter-spacing: var(--tr-h3); line-height: var(--lh-h3); color: var(--ink); margin: 0; }
.cr-empty p { color: var(--body); line-height: 1.65; margin: var(--space-sm) 0 0; max-width: 44ch; }

/* Hero team sheet (in document flow below lead text) */
.cr-hero-sheet { font-family: var(--font-mono, monospace); border: 1px solid color-mix(in srgb, var(--grey-metal) 38%, transparent); max-width: min(100%, 580px); font-size: 0.6875rem; letter-spacing: 0.13em; text-transform: uppercase; }
.cr-hero-sheet__head { display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; border-bottom: 1px solid color-mix(in srgb, var(--grey-metal) 38%, transparent); color: var(--grey-metal); }
.cr-hero-sheet__cells { display: grid; grid-template-columns: repeat(2, 1fr); }
.cr-hero-sheet__cell { padding: 9px 10px; border-right: 1px solid color-mix(in srgb, var(--grey-metal) 38%, transparent); color: var(--ink); font-weight: 700; line-height: 1.3; }
.cr-hero-sheet__cell:nth-child(2n) { border-right: none; }
.cr-hero-sheet__cell:nth-child(-n+2) { border-bottom: 1px solid color-mix(in srgb, var(--grey-metal) 38%, transparent); }
.cr-hero-sheet__cell--accent { color: var(--burgundy); background: color-mix(in srgb, var(--burgundy) 6%, transparent); }
.cr-hero-sheet__foot { display: flex; justify-content: space-between; padding: 4px 10px; border-top: 1px solid color-mix(in srgb, var(--grey-metal) 38%, transparent); color: var(--grey-metal); }

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
        label="Career"
        title="Grow alongside the company."
        lead="A strong company is built by strong people."
        art={<CareerArt />}
        enter="wipe"
        layout="stack"
        scrollHint
      >
        <div className="cr-hero-sheet">
          <div className="cr-hero-sheet__head">
            <span>Four teams</span>
            <span>Alok Plastics</span>
          </div>
          <div className="cr-hero-sheet__cells">
            {teams.map((t, i) => (
              <div key={t.id} className={`cr-hero-sheet__cell${i === 0 ? ' cr-hero-sheet__cell--accent' : ''}`}>
                <b>{t.name}</b>
              </div>
            ))}
          </div>
          <div className="cr-hero-sheet__foot">
            <span>Joyful</span><span>Supportive</span><span>Trustworthy</span>
          </div>
        </div>
      </PageHero>

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
                <li key={w}><Reveal as="span" variant="mask" delay={i * 140} style={{ display: "inline-block" }}>{w}</Reveal><ArrowUpRight weight="light" aria-hidden="true" /></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="teams-h" className="fold-sec fold-sec--step cp-section cr-teams">
        <FoldEdge variant="step" />
        <div style={WRAP_STYLE}>
          <SectionHead id="teams-h" label="Teams" title="Four teams, one company." />
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
              <h2 id="roles-h" className="cp-h2">Current openings</h2>
            </header>
            <RoleList />
          </div>
        </div>
      </section>
    </>
  );
}
