/**
 * /enquiry: full bulk enquiry page (§8.2, §14.2).
 * Full Zod-validated form with multi-line product selection. Beside it: what helps us quote
 * faster, and the contact details that exist. No WhatsApp CTA (it lives in the floating button).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryFormPrefilled from '@/components/products/EnquiryFormPrefilled';
import { ArrowDown } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import PageHero from '@/components/page/PageHero';
import { EnquiryArt } from '@/components/page/art';
import Reveal from '@/components/ui/Reveal';
import { Eyebrow, SECTION_CSS, WRAP_STYLE } from '@/components/about/parts';
import { EnquiryContactRows, EnquiryEmailTip } from '@/components/contact/EnquiryContact';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description:
    'Request a quote for plastic and steel spare parts for water coolers, display counters and deep freezers. Tell us the part, quantity and use.',
  alternates: { canonical: '/enquiry/' },
  robots: { index: true, follow: true },
};

const PAGE_CSS = `
${SECTION_CSS}
.eq-sec { background: var(--surface-alt); padding-top: var(--section-y); padding-bottom: calc(var(--section-y) + var(--space-lg)); }
.eq-grid { display: grid; gap: var(--space-xl); align-items: start; }
.eq-panel { background: var(--surface); border: 1px solid var(--grey-metal); padding: var(--space-lg); position: relative; min-width: 0; }
.eq-panel::before { content: ''; position: absolute; left: -1px; top: -1px; width: 72px; height: 3px; background: var(--burgundy); }
.eq-side { display: flex; flex-direction: column; gap: var(--space-lg); min-width: 0; }
.eq-side h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h3); font-weight: 650; letter-spacing: var(--tr-h3); line-height: var(--lh-h3); color: var(--ink); margin: 0 0 var(--space-sm); }
.eq-list { list-style: none; margin: 0; padding: 0; border-top: 2px solid var(--ink); }
.eq-list li { display: grid; grid-template-columns: 12px minmax(0, 1fr); gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); color: var(--body); line-height: 1.55; font-size: 0.9375rem; }
.eq-list li::before { content: ''; width: 12px; height: 2px; background: var(--burgundy); margin-top: 0.7em; }
.eq-list b { color: var(--ink); font-weight: 650; }
.eq-contact { background: var(--surface); border: 1px solid var(--grey-warm); }
.eq-contact a.row, .eq-contact div.row { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-sm); align-items: start; padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--grey-warm); text-decoration: none; color: var(--body); font-size: 0.9375rem; line-height: 1.55; overflow-wrap: anywhere; }
.eq-contact .row:last-child { border-bottom: 0; }
.eq-contact a.row:hover { background: var(--blush); }
.eq-contact a.row:focus-visible { outline: 2px solid var(--burgundy); outline-offset: -2px; }
.eq-contact svg { color: var(--burgundy); margin-top: 2px; }
.eq-contact b { color: var(--ink); font-weight: 650; display: block; }
@media (max-width: 639px) { .eq-panel { padding: var(--space-md) var(--space-sm); } }
@media (min-width: 1024px) {
  .eq-grid { grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: var(--space-xl); }
  .eq-side { position: sticky; top: 112px; }
}
`;

export default function EnquiryPage() {

  return (
    <>
      <style>{PAGE_CSS}</style>
      <PageHero
        crumbs={[{ label: 'Get a Quote' }]}
        label="Get a quote"
        title={
          <>
            Name the part.{' '}
            <span style={{ background: 'var(--metal-gradient-text)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              We&rsquo;ll send the quote.
            </span>
          </>
        }
        lead="Tell us the part and the quantity. We manufacture and supply across India and reply with a quote."
        art={<EnquiryArt />}
        photo={{ src: '/images/heroes/enquiry.webp', position: '30% center' }}
        enter="rise"
        layout="mirror-end"
      >
        <a href="#enquiry-form" className="ph__btn">Start your enquiry <ArrowDown size={18} weight="light" aria-hidden="true" /></a>
        <Link href="/contact/" className="ph__btn ph__btn--ghost">Contact details</Link>
      </PageHero>

      <section id="enquiry-form" aria-label="Enquiry form" className="cp-section eq-sec">
        <div style={WRAP_STYLE}>
          <div className="eq-grid">
            <Reveal>
              <div className="eq-panel">
                <EnquiryFormPrefilled />
              </div>
            </Reveal>

            <Reveal as="aside" delay={120} className="eq-side">
              <div>
                <Eyebrow>For a faster quote</Eyebrow>
                <h2>Four details that speed up your quote.</h2>
                <ul className="eq-list">
                  <li><span><b>Part name</b> and where it is used in your machine.</span></li>
                  <li><span><b>Material</b> and size, if you know them.</span></li>
                  <li><span><b>Quantity</b> you need, in pieces or sets.</span></li>
                  <li>
                    <span>
                      <b>A drawing or photo.</b> Mention it in the message<EnquiryEmailTip /> and we will confirm how to share it.
                    </span>
                  </li>
                </ul>
              </div>

              <EnquiryContactRows />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
