/**
 * S12 · Footer — §13
 * bg: --burgundy-deep (continuous from EnquirySection)
 * Brand block (white logo + tagline) · Products · Company · Contact · bottom bar.
 * Layout: 4-col >= 1100px, 2-col >= 640px, 1-col below. Layout + hover live in
 * scoped CSS (no JS hover handlers).
 * Contact column renders only what exists in site.contact — nothing placeholder-ish
 * is ever shown; "Enquire online" is always available.
 * Social: render only when URLs are set. GSTIN: only when set (§19).
 * Client component only for analytics click tracking.
 */

'use client';

import Link from 'next/link';
import { site, formatAddressLines, telHref } from '@/content/site';
import { navigation, footerProductLinks, footerCompanyLinks } from '@/content/navigation';
import Logo from '@/components/brand/Logo';
import { waGeneral } from '@/lib/whatsapp';
import { trackWhatsAppClick, trackPhoneClick, trackQuoteCtaClick } from '@/lib/analytics';

/* U+2197 + U+FE0E (text presentation) — never the blue emoji box */
const ARROW_NE = '↗︎';

const FOOTER_CSS = `
.ft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(255,255,255,0.16);
}
@media (min-width: 640px) {
  .ft-grid { grid-template-columns: 1fr 1fr; gap: var(--space-lg) var(--space-xl); }
}
@media (min-width: 1100px) {
  .ft-grid { grid-template-columns: 1.5fr 1fr 1fr 1.2fr; }
}
.ft-grid > * { min-width: 0; }
.ft-heading {
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--rose-pale); font-weight: 600; margin: 0 0 var(--space-sm);
}
.ft-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-xs); }
.ft-link {
  display: inline-block; padding: 4px 0;
  font-size: 0.875rem; color: rgba(255,255,255,0.8);
  text-decoration: none; transition: color 0.2s;
}
.ft-link:hover { color: white; text-decoration: underline; text-underline-offset: 3px; }
.ft-link--accent { color: var(--rose-pale); font-weight: 600; }
.ft-link--accent:hover { color: white; }
.ft-cta {
  display: inline-flex; align-items: center; justify-content: center;
  margin-top: var(--space-xs); padding: 12px 20px; min-height: 44px;
  background: white; color: var(--burgundy);
  border-radius: var(--radius-card);
  font-size: 0.875rem; font-weight: 650; text-decoration: none;
  transition: background-color 0.2s;
}
.ft-cta:hover { background: var(--pink-soft); }
.ft-wa {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 20px; min-height: 44px;
  background: var(--whatsapp); color: white;
  border-radius: var(--radius-card);
  font-size: 0.875rem; font-weight: 650; text-decoration: none;
}
.ft-link:focus-visible, .ft-cta:focus-visible, .ft-wa:focus-visible {
  outline: 2px solid var(--rose-pale); outline-offset: 2px;
}
.ft-bottom {
  padding-top: var(--space-md);
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: var(--space-xs) var(--space-md);
}
.ft-legal { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--space-xs) var(--space-md); }
.ft-legal .ft-link { font-size: 0.8125rem; color: rgba(255,255,255,0.75); }
`;

export default function Footer() {
  const year = new Date().getFullYear();
  const c = site.contact;
  const [addrLine1, addrLine2] = formatAddressLines(c);
  const waHref = waGeneral();
  const social = [
    { key: 'instagram', label: 'Instagram', short: 'IG', href: site.social.instagram },
    { key: 'linkedin',  label: 'LinkedIn',  short: 'LI', href: site.social.linkedin },
    { key: 'facebook',  label: 'Facebook',  short: 'FB', href: site.social.facebook },
    { key: 'youtube',   label: 'YouTube',   short: 'YT', href: site.social.youtube },
  ].filter(s => !!s.href);

  return (
    <footer
      id="site-footer"
      aria-label="Site footer"
      style={{
        background: 'var(--burgundy-deep)',
        borderTop: '1px solid rgba(255,255,255,0.16)',
        padding: 'var(--space-xl) var(--grid-page-padding) var(--space-md)',
        color: 'rgba(255,255,255,0.8)',
      }}
    >
      <style>{FOOTER_CSS}</style>
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        <div className="ft-grid">

          {/* Col 1: Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <Link href="/" aria-label="Alok Plastics — home" style={{ display: 'inline-block', width: 'fit-content' }}>
              <Logo variant="white" style={{ height: 40, width: 'auto', display: 'block' }} />
            </Link>
            <p style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: '"wdth" 110',
              fontSize: '1rem', fontWeight: 600, lineHeight: 1.4,
              color: 'white', maxWidth: '30ch', margin: 0,
            }}>
              {site.tagline.english}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, maxWidth: '38ch', margin: 0 }}>
              Moulded plastic and steel spare parts for water coolers, display counters and deep freezers.
              Manufacturing since {site.foundingYear}.
            </p>
            <p lang="hi" style={{
              fontFamily: 'var(--font-devanagari)',
              fontSize: '0.8125rem', color: 'var(--rose-pale)',
              letterSpacing: '0.02em', margin: 0,
            }}>
              {site.tagline.devanagari}
            </p>
          </div>

          {/* Col 2: Products */}
          <nav aria-labelledby="ft-products">
            <h2 id="ft-products" className="ft-heading">Products</h2>
            <ul className="ft-list">
              {footerProductLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/products/" className="ft-link ft-link--accent">All products {ARROW_NE}</Link>
              </li>
            </ul>
          </nav>

          {/* Col 3: Company */}
          <nav aria-labelledby="ft-company">
            <h2 id="ft-company" className="ft-heading">Company</h2>
            <ul className="ft-list">
              {footerCompanyLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 4: Contact */}
          <div>
            <h2 className="ft-heading">Contact</h2>
            <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>
                {site.name}<br />
                {addrLine1},<br />
                {addrLine2}
              </p>

              {c.gstin && (
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)', margin: 0 }}>
                  GSTIN: {c.gstin}
                </p>
              )}

              {c.mapsUrl && (
                <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="ft-link ft-link--accent" style={{ width: 'fit-content' }}>
                  View on Maps {ARROW_NE}
                </a>
              )}

              {c.phone && (
                <a href={telHref(c.phone)} onClick={() => trackPhoneClick('footer')} className="ft-link" style={{ width: 'fit-content' }}>
                  {c.phone}
                </a>
              )}

              {c.email && (
                <a href={`mailto:${c.email}`} className="ft-link" style={{ width: 'fit-content', overflowWrap: 'anywhere' }}>
                  {c.email}
                </a>
              )}
            </address>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
              <Link
                href="/enquiry/"
                className="ft-cta"
                onClick={() => trackQuoteCtaClick({ source: 'footer' })}
              >
                Enquire online &rarr;
              </Link>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-wa"
                  onClick={() => trackWhatsAppClick({ source: 'footer' })}
                >
                  WhatsApp
                </a>
              )}
            </div>

            {social.length > 0 && (
              <ul className="ft-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                {social.map(s => (
                  <li key={s.key}>
                    <a href={s.href!} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                       className="ft-link" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {s.short}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="ft-bottom">
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            &copy; {year} {site.name}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="ft-legal">
              {navigation.legal.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
