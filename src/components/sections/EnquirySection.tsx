/**
 * S11 · EnquirySection (§13)
 * Light section (--surface-alt) with ONE burgundy accent panel (the "tell us the part" block).
 * The footer below is burgundy too, so this section stays light and the footer opens on a folded
 * edge: never two burgundy blocks adjacent (ADR in docs/decisions.md).
 * The address lives only in the footer (it used to repeat here). Form is ShortEnquiryForm (§14 single source). No WhatsApp CTA here (floating button only).
 */

'use client';

import ShortEnquiryForm from '@/components/forms/ShortEnquiryForm';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { site, telHref } from '@/content/site';
import { trackPhoneClick } from '@/lib/analytics';

const SECTION_CSS = `
.enq-sec { position: relative; overflow: hidden; background: var(--surface-alt); padding: var(--section-y) var(--grid-page-padding); }
.enq-sec__bg { position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--grey-metal) 4%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--grey-metal) 4%, transparent) 1px, transparent 1px);
  background-size: 8px 8px; -webkit-mask-image: radial-gradient(ellipse 60% 70% at 25% 40%, var(--ink), transparent); mask-image: radial-gradient(ellipse 60% 70% at 25% 40%, var(--ink), transparent); }
.enq-sec__in { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
.enq-sec-head { margin-bottom: var(--space-xl); max-width: 40rem; }
.enq-sec-eyebrow { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); font-size: var(--fs-label); text-transform: uppercase; letter-spacing: var(--tr-label); color: var(--grey-metal); font-weight: 600; line-height: var(--lh-label); font-family: var(--font-archivo), sans-serif; }
.enq-sec-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-xl); align-items: start; }
.enq-sec-form { position: relative; background: var(--surface); border: 1px solid var(--grey-metal); padding: var(--space-lg); min-width: 0; }
.enq-sec-form::before { content: ''; position: absolute; left: -1px; top: -1px; width: 72px; height: 3px; background: var(--burgundy); }
.enq-sec-aside { position: relative; background: var(--burgundy); color: var(--surface); padding: var(--space-lg); min-width: 0; display: flex; flex-direction: column; gap: var(--space-md);
  clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%); }
.enq-sec-aside h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h3); font-weight: 650; letter-spacing: var(--tr-h3); line-height: var(--lh-h3); margin: 0; color: var(--surface); }
.enq-sec-aside p { margin: 0; font-size: 0.9375rem; line-height: 1.65; color: color-mix(in srgb, var(--surface) 90%, transparent); }
.enq-sec-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--rose-pale); font-weight: 600; }
.enq-sec-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--space-xs); align-items: start; color: color-mix(in srgb, var(--surface) 92%, transparent); text-decoration: none; font-style: normal; font-size: 0.9375rem; line-height: 1.6; min-height: 44px; }
a.enq-sec-row:hover { color: var(--surface); }
a.enq-sec-row:hover .enq-sec-ar { transform: translate3d(2px, -2px, 0); }
.enq-sec-row svg:first-child { margin-top: 3px; color: var(--rose-pale); }
.enq-sec-ar { transition: transform 200ms cubic-bezier(.16,1,.3,1); margin-top: 3px; }
.enq-sec-row:focus-visible { outline: 2px solid var(--rose-pale); outline-offset: 2px; }
.enq-sec-aside .rule { border-top: 1px solid color-mix(in srgb, var(--surface) 24%, transparent); padding-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-xs); }
@media (max-width: 639px) { .enq-sec-form { padding: var(--space-md) var(--space-sm); } .enq-sec-aside { padding: var(--space-md); } }
@media (min-width: 1024px) { .enq-sec-grid { grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: var(--space-xl); } .enq-sec-aside { margin-top: var(--space-lg); } }
@media (prefers-reduced-motion: reduce) { .enq-sec-ar { transition: none; } }
`;

export default function EnquirySection() {
  const c = site.contact;

  return (
    <section id="enquiry" aria-labelledby="enquiry-heading" className="enq-sec">
      <style>{SECTION_CSS}</style>
      <div className="enq-sec__bg" aria-hidden="true" />
      <div className="enq-sec__in">
        <div className="enq-sec-head">
          <p className="enq-sec-eyebrow">Enquire</p>
          {/* COPY: drafted, needs client approval */}
          <h2 id="enquiry-heading" style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: 'var(--fs-h1)', fontWeight: 650, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0 }}>
            Let&rsquo;s talk parts.
          </h2>
        </div>

        <div className="enq-sec-grid">
          <div className="enq-sec-form">
            <ShortEnquiryForm source="home-enquiry" onLight />
          </div>

          <aside className="enq-sec-aside" aria-label="Other ways to reach us">
            <div>
              {/* COPY: drafted, needs client approval */}
              <h3>Tell us the part.</h3>
              <p style={{ marginTop: 'var(--space-xs)' }}>
                Share the part name, quantity and any size or material preference, or describe what the part does in your equipment.
              </p>
            </div>
            {(c.phone || c.email) && (
            <div className="rule">
              <span className="enq-sec-lbl">Prefer to talk?</span>
              {c.phone && (
                <a className="enq-sec-row" href={telHref(c.phone)} onClick={() => trackPhoneClick('enquiry-section')}>
                  <Phone size={20} weight="light" aria-hidden="true" /><span>{c.phone}</span><span />
                </a>
              )}
              {c.email && (
                <a className="enq-sec-row" href={`mailto:${c.email}`} style={{ overflowWrap: 'anywhere' }}>
                  <EnvelopeSimple size={20} weight="light" aria-hidden="true" /><span>{c.email}</span><span />
                </a>
              )}
            </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
