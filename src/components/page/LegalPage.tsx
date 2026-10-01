/**
 * LegalPage: layout + headings only. No legal text is written here (master prompt §8.2);
 * the body is a pending notice until the client supplies approved wording.
 * Quiet hero variant (calm) + a sticky contents rail beside the section outline.
 */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import PageHero from './PageHero';
import EnquiryBand from './EnquiryBand';
import { LegalArt } from './art';

interface Props {
  slug: string;            // 'privacy' | 'terms' | 'refund'
  title: string;
  label: string;
  sections: string[];      // heading structure only
}

const CSS = `
.lg { background: var(--canvas); padding: var(--section-y) var(--grid-page-padding); }
.lg__in { max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; display: grid; gap: var(--space-lg); }
.lg__toc { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--grey-warm); }
.lg__toc a { display: block; padding: var(--space-xs) var(--space-sm); font-size: 0.9375rem; color: var(--body); text-decoration: none; border-left: 2px solid transparent; margin-left: -1px; }
.lg__toc a:hover { color: var(--burgundy); border-left-color: var(--burgundy); }
.lg__toc a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.lg__tochead { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal); font-weight: 600; margin: 0 0 var(--space-sm); }
.lg__note { background: var(--surface); border: 1px solid var(--grey-warm); border-left: 2px solid var(--burgundy); border-radius: var(--radius-card); padding: var(--space-md); margin-bottom: var(--space-lg); }
.lg__sec { padding: var(--space-md) 0; border-top: 1px solid var(--grey-cloud); scroll-margin-top: 96px; }
.lg__sec h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-size: clamp(1.25rem, 2vw, 1.5rem); font-weight: 650; letter-spacing: -0.01em; color: var(--ink); margin: 0; }
.lg__link { display: inline-flex; align-items: center; gap: 4px; color: var(--burgundy); font-weight: 600; text-decoration: none; min-height: 44px; }
.lg__link:hover { color: var(--burgundy-bright); }
@media (min-width: 900px) {
  .lg__in { grid-template-columns: minmax(0, 3fr) minmax(0, 8fr); gap: var(--space-xl); }
  .lg__rail { position: sticky; top: 112px; align-self: start; }
}
`;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function LegalPage({ title, label, sections }: Props) {
  return (
    <>
      <style>{CSS}</style>
      <PageHero crumbs={[{ label: title }]} label={label} title={title} art={<LegalArt title={title} />} enter="draw" calm layout="top"
        lead="This page is being finalised. The outline below shows what it will cover." />
      <div className="lg">
        <div className="lg__in">
          <nav className="lg__rail" aria-label="On this page">
            <p className="lg__tochead">On this page</p>
            <ul className="lg__toc">
              {sections.map(s => <li key={s}><a href={`#${slugify(s)}`}>{s}</a></li>)}
            </ul>
          </nav>
          <div>
            <div role="note" className="lg__note">
              <p style={{ color: 'var(--ink)', fontWeight: 600, margin: 0 }}>This policy is being finalised. Each heading below will carry its approved text when it is published.</p>
              <p style={{ color: 'var(--body)', lineHeight: 1.65, margin: 'var(--space-xs) 0 0' }}>
                For any question in the meantime, please{' '}
                <Link href="/contact/" className="lg__link">contact us <ArrowUpRight size={16} weight="light" aria-hidden="true" /></Link>
              </p>
            </div>
            {sections.map(s => (
              <section key={s} id={slugify(s)} aria-labelledby={`${slugify(s)}-h`} className="lg__sec">
                <h2 id={`${slugify(s)}-h`}>{s}</h2>
              </section>
            ))}
          </div>
        </div>
      </div>
      <EnquiryBand fold="register" heading="Questions about this page?" text="Get in touch and we will respond." />
    </>
  );
}
