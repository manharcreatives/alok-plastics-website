/**
 * S11 · EnquirySection — §13
 * bg: --burgundy (full-bleed)
 * Wraps ShortEnquiryForm + WhatsApp block side-by-side.
 * Form is deferred to ShortEnquiryForm component (§14 single source).
 */

'use client';

import ShortEnquiryForm from '@/components/forms/ShortEnquiryForm';
import { site, formatAddressLines, telHref } from '@/content/site';
import { waGeneral } from '@/lib/whatsapp';
import { trackWhatsAppClick, trackPhoneClick } from '@/lib/analytics';

/* U+2197 + U+FE0E (text presentation) */
const ARROW_NE = '\u2197\uFE0E';

const SECTION_CSS = `
.enq-sec-grid {
  display: grid; grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-xl); align-items: flex-start;
}
@media (max-width: 1023px) {
  .enq-sec-grid { grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); }
}
.enq-sec-head { margin-bottom: var(--space-lg); }
@media (min-width: 1024px) { .enq-sec-head { margin-bottom: var(--space-xl); } }
.enq-sec-btn:hover { opacity: 0.9; }
.enq-sec-link { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
.enq-sec-btn:focus-visible, .enq-sec-link:focus-visible { outline: 2px solid var(--rose-pale); outline-offset: 2px; }
`;

export default function EnquirySection() {
  const c = site.contact;
  const waHref = waGeneral();
  const [addrLine1, addrLine2] = formatAddressLines(c);

  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-heading"
      style={{
        background: 'var(--burgundy)',
        padding: 'var(--section-y) var(--grid-page-padding)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: [
            'repeating-linear-gradient(rgba(255,255,255,.04) 0, transparent 1px, transparent 7px, transparent 8px)',
            'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0, transparent 1px, transparent 7px, transparent 8px)',
          ].join(', '),
          backgroundSize: '8px 8px',
          pointerEvents: 'none',
        }}
      />

      <style>{SECTION_CSS}</style>
      <div style={{
        position: 'relative',
        maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))',
        margin: '0 auto',
      }}>

        {/* Header */}
        <div className="enq-sec-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--rose-pale)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--rose-pale)', fontWeight: 600 }}>
              07 — Enquire
            </span>
          </div>
          <h2
            id="enquiry-heading"
            style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: '"wdth" 125',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 650,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: 'white',
            }}
          >
            {/* COPY: drafted, needs client approval */}
            Let&rsquo;s talk parts.
          </h2>
        </div>

        <div className="enq-sec-grid">

          {/* ── Form ────────────────────────────────────────────── */}
          <ShortEnquiryForm source="home-enquiry" onLight={false} />

          {/* ── Side panel: WhatsApp (when configured) + address ──── */}
          <aside
            aria-label="Other ways to reach us"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 'var(--radius-card)',
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              minWidth: 0,
            }}
          >
            {waHref ? (
              <>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-archivo)',
                    fontVariationSettings: '"wdth" 110',
                    fontSize: '1rem', fontWeight: 650, color: 'white',
                    letterSpacing: '-0.01em', marginBottom: 8,
                  }}>
                    Prefer WhatsApp?
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                    {/* COPY: drafted, needs client approval */}
                    Send us a photo of the part, a rough drawing, or just describe what you need.
                  </p>
                </div>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enq-sec-btn"
                  onClick={() => trackWhatsAppClick({ source: 'enquiry-section' })}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 20px', minHeight: 48,
                    background: 'var(--whatsapp)', color: 'white',
                    borderRadius: 'var(--radius-card)',
                    fontFamily: 'var(--font-archivo)',
                    fontVariationSettings: '"wdth" 110',
                    fontWeight: 650, fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.1 1.509 5.824L0 24l6.337-1.487A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.026-1.376l-.361-.214-3.761.882.936-3.643-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </>
            ) : (
              <div>
                <p style={{
                  fontFamily: 'var(--font-archivo)',
                  fontVariationSettings: '"wdth" 110',
                  fontSize: '1rem', fontWeight: 650, color: 'white',
                  letterSpacing: '-0.01em', marginBottom: 8,
                }}>
                  Tell us the part.
                </p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                  {/* COPY: drafted, needs client approval */}
                  Share the part name, quantity and any size or material preference &mdash; or describe what
                  the part does in your equipment.
                </p>
              </div>
            )}

            {/* Address + any configured contact details */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.18)',
              paddingTop: 'var(--space-sm)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)',
            }}>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--rose-pale)', fontWeight: 600, margin: 0 }}>
                Our address
              </p>
              <address style={{ fontStyle: 'normal', fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>
                {addrLine1},<br />
                {addrLine2}
              </address>
              {c.mapsUrl && (
                <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="enq-sec-link"
                   style={{ fontSize: '0.8125rem', color: 'var(--rose-pale)', width: 'fit-content' }}>
                  View on Maps {ARROW_NE}
                </a>
              )}
              {c.phone && (
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>Tel:</span>{' '}
                  <a href={telHref(c.phone)} className="enq-sec-link" onClick={() => trackPhoneClick('enquiry-section')}>{c.phone}</a>
                </p>
              )}
              {c.email && (
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', margin: 0, overflowWrap: 'anywhere' }}>
                  <span style={{ fontWeight: 600 }}>Email:</span>{' '}
                  <a href={`mailto:${c.email}`} className="enq-sec-link">{c.email}</a>
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
