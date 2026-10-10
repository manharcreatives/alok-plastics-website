/**
 * LegalPage: one layout for Privacy, Terms and Refund. Dark 3D hero (isometric scene per policy),
 * one draft notice, a contents rail, the numbered sections, a side panel written for each policy
 * (practical checklist, a matching call to action, links to the other policies) and a single contact
 * close. Text lives in src/content/legal.ts; {{...}} marks details the client still has to supply.
 */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import Breadcrumbs from './Breadcrumbs';
import LegalScene from './art/LegalScene';
import { legalPages, type LegalBlock, type LegalSlug } from '@/content/legal';

const OTHER_POLICIES: { slug: LegalSlug; href: string; label: string }[] = [
  { slug: 'privacy', href: '/privacy/', label: 'Privacy Policy' },
  { slug: 'terms', href: '/terms/', label: 'Terms & Conditions' },
  { slug: 'refund', href: '/refund/', label: 'Refund Policy' },
];

/** Side panel content: written for each policy, not repeated across pages. */
const SIDE: Record<LegalSlug, {
  title: string;
  steps: string[];
  note?: string;
  ctaTitle: string;
  ctaText: string;
  ctaHref: string;
  ctaLabel: string;
}> = {
  privacy: {
    title: 'Making a privacy request',
    steps: [
      'Write to us through the contact page and say it is a privacy request.',
      'Quote the mobile number or email you used in the enquiry, so we can find your records.',
      'Say whether you want to see, correct or delete your details.',
    ],
    note: 'We confirm we have received your request within {{Client to confirm: response time}}.',
    ctaTitle: 'Have a question about your data?',
    ctaText: 'Send it through the contact page and we will reply to the address you give us.',
    ctaHref: '/contact/',
    ctaLabel: 'Send a privacy request',
  },
  terms: {
    title: 'Before you enquire',
    steps: [
      'Check the part name, size and variant against the catalogue.',
      'Note the material you need, as shown on the product page.',
      'Give the quantity and delivery city, so we can quote correctly.',
      'For a custom part, add your sample, drawing or photo.',
    ],
    ctaTitle: 'Ready to get a price?',
    ctaText: 'Send the details above and we will reply with a written quotation.',
    ctaHref: '/enquiry/',
    ctaLabel: 'Request a quote',
  },
  refund: {
    title: 'If a part arrives wrong',
    steps: [
      'Before signing, note any damage on the transporter\'s delivery receipt.',
      'Photograph the parts and the outer packing as they arrived.',
      'Keep the packing until we have confirmed your claim.',
    ],
    ctaTitle: 'Something not right with a delivery?',
    ctaText: 'Quote your order or invoice number when you write to us.',
    ctaHref: '/contact/',
    ctaLabel: 'Report a delivery problem',
  },
};

const CSS = `
.lg-pw { max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; padding: 0 var(--grid-page-padding); }
.lg-hero { position: relative; overflow: hidden; background: radial-gradient(ellipse 70% 80% at 78% 40%, color-mix(in srgb, var(--burgundy) 55%, transparent) 0%, transparent 65%), linear-gradient(160deg, var(--burgundy-night) 0%, var(--burgundy-deep) 100%); color: var(--surface); padding: calc(120px + var(--space-sm)) 0 var(--space-xl); isolation: isolate; }
.lg-hero::before { content: ""; position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(color-mix(in srgb, var(--rose-pale) 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--rose-pale) 7%, transparent) 1px, transparent 1px); background-size: 56px 56px; -webkit-mask-image: linear-gradient(120deg, var(--ink) 0%, transparent 70%); mask-image: linear-gradient(120deg, var(--ink) 0%, transparent 70%); }
.lg-hero__in { display: grid; gap: var(--space-md); align-items: center; }
.lg-hero .bc ol { color: var(--pink-soft); }
.lg-hero .bc a { color: var(--rose-pale); }
.lg-hero .bc [aria-current] { color: var(--surface); }
.lg-hero .bc__sep { background: var(--rose-pale); opacity: 0.6; }
.lg-eyebrow { margin: var(--space-sm) 0 var(--space-xs); font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--rose-pale); }
.lg-h1 { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 118; font-size: var(--fs-h1); font-weight: 650; letter-spacing: var(--tr-h1); line-height: var(--lh-h1); color: var(--surface); text-wrap: balance; }
.lg-lead { margin: var(--space-sm) 0 0; max-width: 46ch; font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--pink-soft); }
.lg-scene { width: min(100%, 420px); justify-self: center; }
.lg-scene__svg { display: block; width: 100%; height: auto; overflow: visible; }
.lg-body { background: var(--canvas); padding: var(--section-y) 0; }
.lg-body__in { display: grid; gap: var(--space-lg); grid-template-areas: "main" "side"; }
.lg-rail { display: none; grid-area: rail; }
.lg-rail ol { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--grey-warm); }
.lg-rail a { display: flex; align-items: center; min-height: 44px; padding: var(--space-xs) var(--space-sm); font-size: 0.9375rem; color: var(--body); text-decoration: none; border-left: 2px solid transparent; margin-left: -1px; }
.lg-rail a:hover { color: var(--burgundy); border-left-color: var(--burgundy); }
.lg-rail a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.lg-rail__h { margin: 0 0 var(--space-sm); font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--grey-metal-text); }
.lg-main { grid-area: main; min-width: 0; max-width: 72ch; }
.lg-draft { margin: 0 0 var(--space-md); padding: var(--space-sm) var(--space-md); background: var(--surface); border: 1px solid var(--grey-warm); border-left: 3px solid var(--burgundy); border-radius: var(--radius-card); font-size: 0.9375rem; line-height: 1.6; color: var(--body); }
.lg-draft strong { color: var(--ink); }
.lg-cc { display: inline-block; padding: 0 6px; margin: 0 1px; border-radius: 3px; background: var(--blush); color: var(--burgundy-deep); font-weight: 600; font-size: 0.9em; line-height: 1.5; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--burgundy) 35%, transparent); }
.lg-sec { position: relative; padding: var(--space-lg) 0 0; margin-top: var(--space-lg); border-top: 1px solid var(--grey-cloud); scroll-margin-top: calc(112px + var(--space-sm)); }
.lg-num { display: block; margin-bottom: var(--space-xs); font-family: var(--font-mono, monospace); font-size: 0.75rem; letter-spacing: 0.14em; color: var(--burgundy); }
.lg-sec h2 { margin: 0 0 var(--space-sm); font-family: var(--font-archivo); font-variation-settings: "wdth" 115; font-size: var(--fs-h3); font-weight: 650; letter-spacing: var(--tr-h3); line-height: var(--lh-h3); color: var(--ink); text-wrap: balance; }
.lg-sec p { margin: 0 0 var(--space-sm); font-size: var(--fs-body); line-height: 1.75; color: var(--body); }
.lg-sec ul { margin: 0 0 var(--space-sm); padding: 0; list-style: none; display: grid; gap: var(--space-xs); }
.lg-sec li { position: relative; padding-left: var(--space-md); font-size: var(--fs-body); line-height: 1.7; color: var(--body); }
.lg-sec li::before { content: ""; position: absolute; left: 0; top: 0.72em; width: var(--space-xs); height: 2px; background: var(--burgundy); }
.lg-side { grid-area: side; display: grid; gap: var(--space-sm); align-content: start; min-width: 0; }
.lg-card { padding: var(--space-md); background: var(--surface); border: 1px solid var(--grey-cloud); border-radius: var(--radius-card); }
.lg-card__h { margin: 0 0 var(--space-sm); font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--grey-metal-text); }
.lg-steps { margin: 0; padding: 0; list-style: none; counter-reset: lgstep; display: grid; gap: var(--space-sm); }
.lg-steps li { counter-increment: lgstep; position: relative; padding-left: 2.25rem; font-size: 0.9375rem; line-height: 1.6; color: var(--body); }
.lg-steps li::before { content: counter(lgstep); position: absolute; left: 0; top: 0.1em; width: 1.5rem; height: 1.5rem; display: grid; place-items: center; background: var(--burgundy); color: var(--surface); font-family: var(--font-mono, monospace); font-size: 0.75rem; line-height: 1; }
.lg-note { margin: var(--space-sm) 0 0; font-size: 0.875rem; line-height: 1.6; color: var(--muted); }
.lg-links { list-style: none; margin: 0; padding: 0; }
.lg-links li { border-bottom: 1px solid var(--grey-cloud); }
.lg-links li:last-child { border-bottom: 0; }
.lg-links a { display: flex; align-items: center; justify-content: space-between; min-height: 44px; font-size: 0.9375rem; color: var(--ink); text-decoration: none; }
.lg-links a:hover { color: var(--burgundy); }
.lg-links a[aria-current] { color: var(--burgundy); font-weight: 600; pointer-events: none; }
.lg-links a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.lg-card--soft { background: var(--blush); border-color: transparent; }
.lg-card--soft p { margin: 0 0 var(--space-sm); font-size: 0.9375rem; line-height: 1.6; color: var(--body); }
.lg-quote { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 44px; font-weight: 650; color: var(--burgundy); text-decoration: none; }
.lg-quote:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.lg-contact { margin-top: var(--space-xl); padding: var(--space-lg) var(--space-md); background: var(--burgundy-night); color: var(--surface); border-radius: var(--radius-card); display: grid; gap: var(--space-sm); }
.lg-contact h2 { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 115; font-size: var(--fs-h3); font-weight: 650; line-height: var(--lh-h3); }
.lg-contact p { margin: 0; color: var(--pink-soft); line-height: 1.65; max-width: 52ch; }
.lg-btn { display: inline-flex; align-items: center; gap: var(--space-xs); justify-self: start; min-height: 48px; padding: 0 var(--space-md); background: var(--rose-pale); color: var(--burgundy-night); font-weight: 650; text-decoration: none; border-radius: var(--radius-card); }
.lg-btn:hover { background: var(--surface); }
.lg-btn:focus-visible { outline: 2px solid var(--rose-pale); outline-offset: 3px; }
@media (min-width: 720px) {
  .lg-hero__in { grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); }
}
@media (min-width: 900px) {
  .lg-body__in { grid-template-columns: minmax(0, 3fr) minmax(0, 8fr); grid-template-areas: "rail main" "side main"; gap: var(--space-xl); align-items: start; }
  .lg-rail { display: block; }
  .lg-contact { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .lg-contact .lg-btn { justify-self: end; }
}
@media (min-width: 1200px) {
  .lg-body__in { grid-template-columns: minmax(0, 2.4fr) minmax(0, 6fr) minmax(0, 2.6fr); grid-template-areas: "rail main side"; }
  .lg-rail { position: sticky; top: calc(112px + var(--space-sm)); }
  .lg-side { position: sticky; top: calc(112px + var(--space-sm)); }
}
`;

function Rich({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('{{') ? (
          <span key={i} className="lg-cc">{p.slice(2, -2)}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Body({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p><Rich text={block} /></p>;
  return (
    <ul>
      {block.ul.map((li, i) => <li key={i}><Rich text={li} /></li>)}
    </ul>
  );
}

export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const page = legalPages[slug];
  const side = SIDE[slug];
  return (
    <>
      <style>{CSS}</style>
      <header className="lg-hero">
        <div className="lg-pw lg-hero__in">
          <div>
            <Breadcrumbs items={[{ label: page.title }]} />
            <p className="lg-eyebrow">Legal</p>
            <h1 className="lg-h1">{page.title}</h1>
            <p className="lg-lead">{page.lead}</p>
          </div>
          <div className="lg-scene">
            <LegalScene slug={slug} />
          </div>
        </div>
      </header>

      <div className="lg-body">
        <div className="lg-pw lg-body__in">
          <nav className="lg-rail" aria-label="On this page">
            <p className="lg-rail__h">On this page</p>
            <ol>
              {page.sections.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
            </ol>
          </nav>

          <div className="lg-main">
            <p className="lg-draft">
              <strong>Draft for review.</strong> Alok Plastics will review and approve this wording before it is published.
              Highlighted items are details only the company can supply.
            </p>

            {page.sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="lg-sec">
                <span className="lg-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h2 id={`${s.id}-h`}>{s.title}</h2>
                {s.body.map((b, j) => <Body key={j} block={b} />)}
              </section>
            ))}

            <aside className="lg-contact" aria-labelledby="lg-contact-h">
              <div>
                <h2 id="lg-contact-h">Questions about this policy?</h2>
                <p>Send your question through the contact page and quote the page you are reading.</p>
              </div>
              <Link href="/contact/" className="lg-btn">
                Contact us <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </Link>
            </aside>
          </div>

          <aside className="lg-side" aria-label="Practical help and related pages">
            <div className="lg-card">
              <p className="lg-card__h">{side.title}</p>
              <ol className="lg-steps">
                {side.steps.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
              {side.note && <p className="lg-note"><Rich text={side.note} /></p>}
            </div>

            <div className="lg-card">
              <p className="lg-card__h">Other legal pages</p>
              <ul className="lg-links">
                {OTHER_POLICIES.map(p => (
                  <li key={p.slug}>
                    <Link href={p.href} aria-current={p.slug === slug ? 'page' : undefined}>
                      {p.label} <ArrowUpRight size={16} weight="light" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg-card lg-card--soft">
              <p className="lg-card__h">{side.ctaTitle}</p>
              <p>{side.ctaText}</p>
              <Link href={side.ctaHref} className="lg-quote">
                {side.ctaLabel} <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
