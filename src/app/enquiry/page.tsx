/**
 * /enquiry: full bulk enquiry page (§8.2, §14.2).
 * Full Zod-validated form with multi-line product selection. Beside it: what helps us quote
 * faster, and the contact details that exist. No WhatsApp CTA (it lives in the floating button).
 */
import type { Metadata } from 'next';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import EnquiryFormPrefilled from '@/components/products/EnquiryFormPrefilled';
import PageHero from '@/components/page/PageHero';
import { EnquiryArt } from '@/components/page/art';
import Reveal from '@/components/ui/Reveal';
import { Eyebrow, SECTION_CSS, WRAP_STYLE } from '@/components/about/parts';
import { site, formatAddressLines, mapsHref, telHref, MAPS_ARIA_LABEL } from '@/content/site';

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
.eq-side h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.25rem, 2.2vw, 1.75rem); font-weight: 650; letter-spacing: -0.02em; line-height: 1.15; color: var(--ink); margin: 0 0 var(--space-sm); }
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
  const c = site.contact;
  const [addrLine1, addrLine2] = formatAddressLines(c);

  return (
    <>
      <style>{PAGE_CSS}</style>
      <PageHero
        crumbs={[{ label: 'Get a Quote' }]}
        label="Enquiry"
        title={
          <>
            Tell us the part.{' '}
            <span style={{ background: 'var(--metal-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              We&rsquo;ll take it from there.
            </span>
          </>
        }
        lead="Share the part name, quantity and any material or size preference, or just describe what the part does in your equipment. We manufacture and supply across India."
        art={<EnquiryArt />}
        enter="rise"
        scrollHint
      />

      <section aria-label="Enquiry form" className="cp-section eq-sec">
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
                <h2>What helps us most.</h2>
                <ul className="eq-list">
                  <li><span><b>Part name</b> and where it is used in your machine.</span></li>
                  <li><span><b>Material</b> and size, if you know them.</span></li>
                  <li><span><b>Quantity</b> you need, in pieces or sets.</span></li>
                  <li>
                    <span>
                      <b>A drawing or photo.</b> Mention it in the message{c.email ? <> or send it to <a href={`mailto:${c.email}`} style={{ color: 'var(--burgundy)', fontWeight: 600 }}>{c.email}</a></> : ''} and we will confirm how to share it.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="eq-contact">
                <a className="row" href={mapsHref(c)} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
                  <MapPin size={22} weight="light" aria-hidden="true" />
                  <span><b>{site.name}</b>{addrLine1},<br />{addrLine2}</span>
                </a>
                {c.phone && (
                  <a className="row" href={telHref(c.phone)}>
                    <Phone size={22} weight="light" aria-hidden="true" />
                    <span><b>Phone</b>{c.phone}</span>
                  </a>
                )}
                {c.email && (
                  <a className="row" href={`mailto:${c.email}`}>
                    <EnvelopeSimple size={22} weight="light" aria-hidden="true" />
                    <span><b>Email</b>{c.email}</span>
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
