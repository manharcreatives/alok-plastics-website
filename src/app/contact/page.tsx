/**
 * /contact: address (clickable to Maps), enquiry form, click-to-load map (§8.2).
 * Phone / email / GSTIN rows render only when set in site.contact. No WhatsApp CTA here
 * (it lives in the floating button only).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/page/PageHero';
import { ContactArt } from '@/components/page/art';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import ShortEnquiryForm from '@/components/forms/ShortEnquiryForm';
import { ContactSheet, VisitingHours } from '@/components/contact/ContactSheet';
import MapLoader from '@/components/contact/MapLoader';
import Reveal from '@/components/ui/Reveal';
import { Eyebrow, SECTION_CSS, WRAP_STYLE } from '@/components/about/parts';
import { site, isEmbeddableMapsUrl, mapsHref } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact Alok Plastics | Plastic Parts Manufacturer, Chandigarh',
  description:
    'Contact Alok Plastics at Plot No-06, Industrial Area Phase II, Ram Darbar, Chandigarh 160003. Enquire for water cooler, display counter & deep freezer spare parts. OEM & B2B orders welcome.',
  alternates: { canonical: '/contact/' },
  robots: { index: true, follow: true },
};

const CSS = `
${SECTION_CSS}
${FOLD_SECTION_CSS}
.ct-main { background: var(--canvas); }
.ct-grid { display: grid; gap: var(--space-xl); align-items: start; }
.ct-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h2); font-weight: 650; line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--ink); margin: 0 0 var(--space-lg); }

/* Address as a drawing-sheet title block */
.ct-addr { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--space-sm); align-items: start; text-decoration: none; color: inherit; padding: var(--space-md); border-bottom: 1px solid var(--grey-warm); background: var(--surface); transition: background-color 200ms; }
.ct-addr:hover { background: var(--blush); }
.ct-addr:focus-visible { outline: 2px solid var(--burgundy); outline-offset: -2px; }
.ct-addr__pin { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; background: var(--burgundy); color: var(--surface); clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%); }
.ct-addr__t { font-family: var(--font-archivo); font-variation-settings: "wdth" 110; font-weight: 650; font-size: 1.25rem; line-height: 1.3; letter-spacing: -0.01em; color: var(--ink); font-style: normal; }
.ct-addr__t span { display: block; font-family: var(--font-inter); font-variation-settings: normal; font-weight: 400; font-size: 1rem; letter-spacing: 0; color: var(--body); margin-top: var(--space-xs); line-height: 1.6; }
.ct-addr__go { color: var(--burgundy); transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.ct-addr:hover .ct-addr__go { transform: translate3d(2px, -2px, 0); }
.ct-row { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-sm); align-items: center; padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--grey-warm); }
.ct-row:last-child { border-bottom: 0; }
.ct-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal); font-weight: 600; display: block; }
.ct-val { color: var(--ink); font-size: 1rem; line-height: 1.5; overflow-wrap: anywhere; }
.ct-link { color: var(--burgundy); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; min-height: 44px; }
.ct-link:hover { color: var(--burgundy-bright); text-decoration: underline; text-underline-offset: 3px; }
.ct-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.ct-row svg { color: var(--grey-metal); }
.ct-more { margin: var(--space-md) 0 0; font-size: 0.9375rem; line-height: 1.6; color: var(--body); }
.ct-more__link { color: var(--burgundy); font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
.ct-form { background: var(--surface); border: 1px solid var(--grey-metal); padding: var(--space-lg); position: relative; }
.ct-form::before { content: ''; position: absolute; left: -1px; top: -1px; width: 72px; height: 3px; background: var(--burgundy); }
.ct-find { background: var(--surface); --pad-top: var(--section-y); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); }
.ct-find__grid { display: grid; gap: var(--space-xl); align-items: start; }
.ct-visit { margin: var(--space-lg) 0 0; padding: 0; border-top: 1px solid var(--ink); }
.ct-visit div { display: grid; grid-template-columns: minmax(96px, 1fr) minmax(0, 2fr); gap: var(--space-sm); align-items: baseline; padding: var(--space-sm) 0; border-bottom: 1px solid var(--grey-warm); }
.ct-visit dt { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal); font-weight: 600; }
.ct-visit dd { margin: 0; color: var(--ink); font-size: 1.0625rem; line-height: 1.5; }
@media (max-width: 639px) { .ct-form { padding: var(--space-md) var(--space-sm); } .ct-addr { grid-template-columns: auto minmax(0, 1fr); } .ct-addr__go { display: none; } }
@media (min-width: 1024px) { .ct-find__grid { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); } .ct-grid { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-xl); } }
@media (prefers-reduced-motion: reduce) { .ct-addr__go { transition: none; } }
`;

export default function ContactPage() {
  const c = site.contact;
  const openUrl = mapsHref(c);
  const embedUrl = c.mapsUrl && isEmbeddableMapsUrl(c.mapsUrl) ? c.mapsUrl : null;

  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Contact' }]}
        label="Contact"
        title="Talk to Alok Plastics"
        lead="Tell us which part you need, in what quantity, and for which machine. We will come back to you with a quote."
        art={<ContactArt />}
        enter="draw"
        layout="mirror"
        scrollHint
      />

      <section aria-labelledby="ct-details-h" className="cp-section ct-main">
        <div style={WRAP_STYLE}>
          <div className="ct-grid">
            <Reveal>
              <Eyebrow>Our details</Eyebrow>
              <h2 id="ct-details-h" className="ct-h2">Where to find us.</h2>
              <ContactSheet />
            </Reveal>
            <Reveal delay={120}>
              <section aria-labelledby="ct-form-h" className="ct-form">
                <h2 id="ct-form-h" className="ct-h2" style={{ marginBottom: 'var(--space-md)' }}>Send an enquiry</h2>
                <ShortEnquiryForm source="enquiry-page" onLight />
                <p className="ct-more">Several parts, or a custom part? <Link href="/enquiry/" className="ct-more__link">Use the full enquiry form</Link>.</p>
              </section>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Getting here: no address repeat (it lives in the details card above); directions + an honest visiting note. */}
      <section aria-labelledby="ct-map-h" className="fold-sec fold-sec--diag ct-find">
        <FoldEdge variant="diag" />
        <div style={WRAP_STYLE}>
          <div className="ct-find__grid">
            <Reveal>
              <Eyebrow>Getting here</Eyebrow>
              <h2 id="ct-map-h" className="ct-h2" style={{ marginBottom: 0 }}>Planning a visit?</h2>
              {/* TODO(client): visiting hours and any gate / landmark directions */}
              <dl className="ct-visit">
                <div><dt>Directions</dt><dd>Open the map and the route starts from wherever you are.</dd></div>
                <div><dt>Visiting hours</dt><VisitingHours /></div>
              </dl>
            </Reveal>
            <Reveal delay={120}>
              <MapLoader embedUrl={embedUrl} openUrl={openUrl} title={`Map showing ${site.name}, ${c.city}`} />
            </Reveal>
          </div>
        </div>
      </section>

    </>
  );
}
