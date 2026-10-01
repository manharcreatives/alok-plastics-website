/**
 * /contact — address, enquiry form, click-to-load map (§8.2).
 * Phone / email / WhatsApp / GSTIN rows render only when set in site.contact.
 * LocalBusiness JSON-LD is Phase 8.
 */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import ShortEnquiryForm from '@/components/forms/ShortEnquiryForm';
import MapLoader from '@/components/contact/MapLoader';
import { site, formatAddress, formatAddressLines, telHref } from '@/content/site';
import { waGeneral, waDisplayNumber } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Alok Plastics, Plot No-06, Industrial Area Phase II, Ram Darbar, Chandigarh. Send an enquiry for water cooler, display counter and deep freezer parts.',
  alternates: { canonical: '/contact/' },
  robots: { index: true, follow: true },
};

const CSS = `
.ct-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); align-items: start; }
@media (max-width: 1023px) { .ct-grid { grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); } }
.ct-card { background: var(--surface); border: 1px solid var(--grey-cloud); border-radius: var(--radius-card); padding: var(--space-lg); }
@media (max-width: 639px) { .ct-card { padding: var(--space-sm); } }
.ct-row { display: flex; flex-direction: column; gap: 4px; padding: var(--space-sm) 0; border-top: 1px solid var(--grey-cloud); }
.ct-row:first-of-type { border-top: 0; padding-top: 0; }
.ct-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal); font-weight: 600; }
.ct-val { color: var(--ink); font-size: 1rem; line-height: 1.6; overflow-wrap: anywhere; }
.ct-link { color: var(--burgundy); text-decoration: none; display: inline-flex; align-items: center; min-height: 44px; font-weight: 600; }
.ct-link:hover { text-decoration: underline; }
.ct-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.ct-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.25rem, 2.2vw, 1.5rem); font-weight: 650; letter-spacing: -0.02em; color: var(--ink); margin-bottom: var(--space-sm); }
`;

function isEmbeddable(url: string): boolean {
  return /\/maps\/embed|[?&]output=embed/.test(url);
}

export default function ContactPage() {
  const c = site.contact;
  const [line1, line2] = formatAddressLines(c);
  const wa = waGeneral();
  const waNum = waDisplayNumber();
  const openUrl = c.mapsUrl && !isEmbeddable(c.mapsUrl)
    ? c.mapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(c))}`;
  const embedUrl = c.mapsUrl && isEmbeddable(c.mapsUrl) ? c.mapsUrl : null;

  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Contact' }]}
        label="Contact"
        title="Talk to Alok Plastics"
        lead="Tell us which part you need, in what quantity, and for which machine. We will come back to you with a quote."
      />
      <div style={{ background: 'var(--canvas)', padding: 'var(--space-xl) var(--grid-page-padding)' }}>
        <div className="ct-grid" style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <section aria-labelledby="ct-details-h" className="ct-card">
              <h2 id="ct-details-h" className="ct-h2">Our details</h2>
              <div className="ct-row">
                <span className="ct-label">Address</span>
                <address className="ct-val" style={{ fontStyle: 'normal' }}>
                  {site.name}<br />{line1}<br />{line2}
                </address>
              </div>
              {c.phone && (
                <div className="ct-row">
                  <span className="ct-label">Phone</span>
                  <a className="ct-link" href={telHref(c.phone)}>{c.phone}</a>
                </div>
              )}
              {c.email && (
                <div className="ct-row">
                  <span className="ct-label">Email</span>
                  <a className="ct-link" href={`mailto:${c.email}`}>{c.email}</a>
                </div>
              )}
              {wa && (
                <div className="ct-row">
                  <span className="ct-label">WhatsApp</span>
                  <a className="ct-link" href={wa} target="_blank" rel="noopener noreferrer">
                    {waNum ?? 'Message us on WhatsApp'}
                  </a>
                </div>
              )}
              {c.gstin && (
                <div className="ct-row">
                  <span className="ct-label">GSTIN</span>
                  <span className="ct-val">{c.gstin}</span>
                </div>
              )}
            </section>
            <section aria-labelledby="ct-map-h">
              <h2 id="ct-map-h" className="ct-h2">Find us</h2>
              <MapLoader embedUrl={embedUrl} openUrl={openUrl} title={`Map showing ${site.name}, ${c.city}`} />
            </section>
          </div>
          <section aria-labelledby="ct-form-h" className="ct-card">
            <h2 id="ct-form-h" className="ct-h2">Send an enquiry</h2>
            <ShortEnquiryForm source="enquiry-page" onLight />
          </section>
        </div>
      </div>
      <EnquiryBand />
    </>
  );
}
