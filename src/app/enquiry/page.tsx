/**
 * /enquiry — Full bulk enquiry page (§8.2, §14.2)
 * Full Zod-validated form with multi-line product selection.
 * WhatsApp block beside the form on desktop.
 * Breadcrumb: Home → Enquiry
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryFormPrefilled from '@/components/products/EnquiryFormPrefilled';
import { site, formatAddressLines, telHref } from '@/content/site';
import { waGeneral } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description:
    'Request a quote for plastic and steel spare parts for water coolers, display counters and deep freezers. Tell us the part, quantity and use.',
  alternates: { canonical: '/enquiry/' },
  robots: { index: true, follow: true },
};

/* U+2197 + U+FE0E (text presentation) */
const ARROW_NE = '\u2197\uFE0E';

const PAGE_CSS = `
.enq-page-grid {
  display: grid; grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-xl); align-items: flex-start;
}
@media (max-width: 1023px) {
  .enq-page-grid { grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); }
}
.enq-page-panel { padding: var(--space-lg); }
@media (max-width: 639px) { .enq-page-panel { padding: var(--space-sm); } }
`;

export default function EnquiryPage() {
  const waHref = waGeneral();
  const [addrLine1, addrLine2] = formatAddressLines(site.contact);

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--grey-cloud)',
        padding: 'var(--space-xl) var(--grid-page-padding)',
      }}>
        <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
            <ol style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.8125rem', color: 'var(--muted)',
            }}>
              <li><Link href="/" style={{ color: 'var(--burgundy)', textDecoration: 'none' }}>Home</Link></li>
              <li aria-hidden="true" style={{ color: 'var(--silver)' }}>/</li>
              <li aria-current="page" style={{ color: 'var(--ink)' }}>Get a Quote</li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', fontWeight: 600 }}>
              Enquiry
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-archivo)',
            fontVariationSettings: '"wdth" 125',
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 650,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
            marginBottom: 'var(--space-sm)',
          }}>
            Tell us the part.<br />
            <span style={{
              background: 'var(--metal-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}>
              We&rsquo;ll take it from there.
            </span>
          </h1>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--body)',
            lineHeight: 1.65,
            maxWidth: '56ch',
          }}>
            {/* COPY: drafted, needs client approval */}
            Share the part name, quantity and any material or size preference — or just describe what the part does in your equipment.
            We manufacture and supply across India.
          </p>
        </div>
      </div>

      {/* ── Form + WhatsApp ──────────────────────────────────────── */}
      <style>{PAGE_CSS}</style>
      <div style={{
        background: 'var(--surface-alt)',
        padding: 'var(--section-y) var(--grid-page-padding)',
      }}>
        <div className="enq-page-grid" style={{
          maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))',
          margin: '0 auto',
        }}>

          {/* Form panel */}
          <div className="enq-page-panel" style={{
            background: 'var(--surface)',
            border: '1px solid var(--grey-warm)',
            borderRadius: 'var(--radius-card)',
            minWidth: 0,
          }}>
            <EnquiryFormPrefilled />
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 0 }}>

            {/* WhatsApp block */}
            {waHref && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--grey-warm)',
                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-card)',
                  background: 'var(--whatsapp)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.1 1.509 5.824L0 24l6.337-1.487A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.026-1.376l-.361-.214-3.761.882.936-3.643-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
                  </svg>
                </div>

                <p style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 110', fontWeight: 650, fontSize: '1rem', color: 'var(--ink)' }}>
                  Prefer WhatsApp?
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--body)', lineHeight: 1.6 }}>
                  Send a photo, drawing, or description of the part. We respond quickly.
                </p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 16px',
                    background: 'var(--whatsapp)', color: 'white',
                    borderRadius: 'var(--radius-card)',
                    fontWeight: 650, fontSize: '0.9375rem',
                    textDecoration: 'none',
                  }}
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}

            {/* Contact details */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--grey-warm)',
              borderRadius: 'var(--radius-card)',
                            padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', fontWeight: 600 }}>
                Contact
              </p>

              <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--body)', lineHeight: 1.65 }}>
                  {addrLine1},<br />
                  {addrLine2}
                </p>

                {site.contact.phone && (
                  <p>
                    <a href={telHref(site.contact.phone)}
                       style={{ fontSize: '0.875rem', color: 'var(--burgundy)', textDecoration: 'none', fontWeight: 600 }}>
                      {site.contact.phone}
                    </a>
                  </p>
                )}

                {site.contact.email && (
                  <p>
                    <a href={`mailto:${site.contact.email}`}
                       style={{ fontSize: '0.875rem', color: 'var(--burgundy)', textDecoration: 'none' }}>
                      {site.contact.email}
                    </a>
                  </p>
                )}
              </address>

              {site.contact.mapsUrl && (
                <a
                  href={site.contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.8125rem', color: 'var(--burgundy)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  View on Google Maps {ARROW_NE}
                </a>
              )}
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}
