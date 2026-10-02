/**
 * S12 · Footer (§13)
 * One burgundy block (--burgundy, single shade). Folded 44-degree top edge pulls it up under
 * the previous section so it never sits flat against another burgundy block (ADR in docs/decisions.md).
 * Big tagline lockup · Products · Company · Contact · legal bar.
 * Address is a link to Google Maps (site.contact.mapsUrl, else a search URL built from the address).
 * Phone / email / GSTIN / social render only when they exist (§19). No WhatsApp here (FAB only).
 * Client component only for analytics click tracking.
 */

'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { InstagramLogo } from '@phosphor-icons/react/dist/ssr/InstagramLogo';
import { LinkedinLogo } from '@phosphor-icons/react/dist/ssr/LinkedinLogo';
import { FacebookLogo } from '@phosphor-icons/react/dist/ssr/FacebookLogo';
import { YoutubeLogo } from '@phosphor-icons/react/dist/ssr/YoutubeLogo';
import { site, formatAddressLines, telHref, mapsHref, MAPS_ARIA_LABEL } from '@/content/site';
import { navigation, footerProductLinks, footerCompanyLinks } from '@/content/navigation';
import Logo from '@/components/brand/Logo';
import { trackPhoneClick, trackQuoteCtaClick } from '@/lib/analytics';

const FOOTER_CSS = `
.ft { --fold: clamp(28px, 5vw, 72px); position: relative; background: var(--burgundy); color: var(--surface);
  margin-top: calc(var(--fold) * -1); padding: calc(var(--fold) + var(--space-xl)) var(--grid-page-padding) var(--space-md);
  clip-path: polygon(0 var(--fold), 100% 0, 100% 100%, 0 100%); overflow: hidden; }
.ft__fold { position: absolute; top: 0; left: 0; width: 100%; height: var(--fold); pointer-events: none; z-index: 2; }
.ft__grid-bg { position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--surface) 4%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--surface) 4%, transparent) 1px, transparent 1px);
  background-size: 8px 8px; -webkit-mask-image: radial-gradient(ellipse 60% 80% at 80% 20%, var(--ink), transparent); mask-image: radial-gradient(ellipse 60% 80% at 80% 20%, var(--ink), transparent); }
.ft__in { position: relative; z-index: 1; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }

/* Tagline lockup */
.ft__lock { padding-bottom: var(--space-xl); border-bottom: 1px solid color-mix(in srgb, var(--surface) 20%, transparent); display: grid; gap: var(--space-lg); }
.ft__dev { margin: 0; font-family: var(--font-devanagari); font-weight: 600; font-size: clamp(1.75rem, 6.2vw, 4.75rem); line-height: 1.35; letter-spacing: -0.01em; color: var(--surface); text-wrap: balance; }
.ft__dev span { color: var(--rose-pale); }
.ft__en { margin: var(--space-xs) 0 0; font-size: clamp(0.9375rem, 1.4vw, 1.125rem); color: var(--rose-pale); }
.ft__cta { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 56px; padding: 0 var(--space-lg); background: var(--surface); color: var(--burgundy);
  font-weight: 650; font-size: 1.0625rem; text-decoration: none; border-radius: var(--radius-card); clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); transition: background-color 200ms cubic-bezier(.16,1,.3,1); width: fit-content; }
.ft__cta:hover { background: var(--pink-soft); }
/* A page-end enquiry band / the home enquiry form already carries the call to action: no second stacked CTA */
body:has(.eb, #enquiry) .ft__cta { display: none; }
.ft__cta svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.ft__cta:hover svg { transform: translate3d(2px, -2px, 0); }

/* Columns */
.ft__cols { display: grid; grid-template-columns: 1fr; gap: var(--space-lg); padding: var(--space-xl) 0 var(--space-lg); border-bottom: 1px solid color-mix(in srgb, var(--surface) 20%, transparent); }
.ft__cols > * { min-width: 0; }
.ft__h { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--rose-pale); font-weight: 600; margin: 0 0 var(--space-sm); }
.ft__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.ft__link { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 32px; font-size: 0.9375rem; color: color-mix(in srgb, var(--surface) 88%, transparent); text-decoration: none; transition: color 200ms cubic-bezier(.16,1,.3,1); }
.ft__link:hover { color: var(--surface); text-decoration: underline; text-underline-offset: 3px; }
.ft__link--accent { color: var(--rose-pale); font-weight: 600; }
.ft__link:focus-visible, .ft__cta:focus-visible, .ft__addr:focus-visible, .ft__soc a:focus-visible { outline: 2px solid var(--rose-pale); outline-offset: 2px; }
.ft__blurb { font-size: 0.9375rem; line-height: 1.65; color: color-mix(in srgb, var(--surface) 88%, transparent); max-width: 36ch; margin: var(--space-sm) 0 0; }
.ft__addr { display: grid; grid-template-columns: auto minmax(0, max-content) auto; justify-content: start; text-wrap: balance; gap: var(--space-xs); align-items: start; color: color-mix(in srgb, var(--surface) 92%, transparent); text-decoration: none; font-style: normal; font-size: 0.9375rem; line-height: 1.65; padding: var(--space-xs) 0; }
.ft__addr address { text-wrap: balance; }
.ft__addr:hover { color: var(--surface); }
.ft__addr:hover .ft__ar { transform: translate3d(2px, -2px, 0); }
.ft__addr svg:first-child { margin-top: 3px; color: var(--rose-pale); }
.ft__ar { transition: transform 200ms cubic-bezier(.16,1,.3,1); margin-top: 3px; }
.ft__soc { list-style: none; padding: 0; margin: var(--space-sm) 0 0; display: flex; gap: var(--space-xs); }
.ft__soc a { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: var(--surface); border: 1px solid color-mix(in srgb, var(--surface) 30%, transparent); border-radius: var(--radius-card); transition: background-color 200ms cubic-bezier(.16,1,.3,1); }
.ft__soc a:hover { background: color-mix(in srgb, var(--surface) 14%, transparent); }

/* Bottom bar */
.ft__bottom { padding-top: var(--space-md); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-xs) var(--space-md); }
.ft__bottom p { margin: 0; font-size: 0.8125rem; color: color-mix(in srgb, var(--surface) 80%, transparent); }
.ft__legal { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0 var(--space-md); }
.ft__legal .ft__link { font-size: 0.8125rem; }

@media (min-width: 640px) { .ft__cols { grid-template-columns: 1fr 1fr; gap: var(--space-lg) var(--space-xl); } }
@media (min-width: 900px) { .ft__lock { grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--space-xl); } }
@media (min-width: 1100px) { .ft__cols { grid-template-columns: 1.4fr 1fr 1fr 1.4fr; } }
@media (prefers-reduced-motion: reduce) { .ft__cta svg, .ft__ar { transition: none; } }
`;

export default function Footer() {
  const year = new Date().getFullYear();
  const c = site.contact;
  const [addrLine1, addrLine2] = formatAddressLines(c);
  const social = [
    { key: 'instagram', label: 'Instagram', Icon: InstagramLogo, href: site.social.instagram },
    { key: 'linkedin',  label: 'LinkedIn',  Icon: LinkedinLogo,  href: site.social.linkedin },
    { key: 'facebook',  label: 'Facebook',  Icon: FacebookLogo,  href: site.social.facebook },
    { key: 'youtube',   label: 'YouTube',   Icon: YoutubeLogo,   href: site.social.youtube },
  ].filter(s => !!s.href);
  const [devA, devB] = site.tagline.devanagari.split(', ');

  return (
    <footer id="site-footer" aria-label="Site footer" className="ft">
      <style>{FOOTER_CSS}</style>
      <svg className="ft__fold" aria-hidden="true" viewBox="0 0 100 1" preserveAspectRatio="none">
        <line x1="0" y1="1" x2="100" y2="0" stroke="var(--rose-pale)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.55" />
        <line x1="76" y1="0.24" x2="100" y2="0" stroke="var(--rose-pale)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="ft__grid-bg" aria-hidden="true" />
      <div className="ft__in">

        {/* Tagline lockup (§2.7: English line beneath, rose-pale on burgundy) */}
        <div className="ft__lock">
          <div>
            <Link href="/" aria-label="Alok Plastics, home" style={{ display: 'inline-block', marginBottom: 'var(--space-lg)' }}>
              <Logo variant="white" style={{ height: 56, width: 'auto', display: 'block' }} />
            </Link>
            <p lang="sa" className="ft__dev">{devA},<br /><span>{devB}</span></p>
            <p lang="en" className="ft__en">{site.tagline.english}</p>
          </div>
          <Link href="/enquiry/" className="ft__cta" onClick={() => trackQuoteCtaClick({ source: 'footer' })}>
            Get a Quote <ArrowUpRight size={20} weight="light" aria-hidden="true" />
          </Link>
        </div>

        <div className="ft__cols">
          {/* About blurb */}
          <div>
            <h2 className="ft__h">Alok Plastics</h2>
            <p className="ft__blurb" style={{ marginTop: 0 }}>
              B2B spare parts for the appliance and refrigeration industry, made in Chandigarh since {site.foundingYear}.
              If your cooler or freezer runs on a plastic part, there&rsquo;s a good chance we make it.
            </p>
            {social.length > 0 && (
              <ul className="ft__soc">
                {social.map(({ key, label, Icon, href }) => (
                  <li key={key}>
                    <a href={href!} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon size={22} weight="light" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-labelledby="ft-products">
            <h2 id="ft-products" className="ft__h">Products</h2>
            <ul className="ft__list">
              {footerProductLinks.map(link => (
                <li key={link.href}><Link href={link.href} className="ft__link">{link.label}</Link></li>
              ))}
              <li><Link href="/products/" className="ft__link ft__link--accent">All products <ArrowUpRight size={16} weight="light" aria-hidden="true" /></Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="ft-company">
            <h2 id="ft-company" className="ft__h">Company</h2>
            <ul className="ft__list">
              {footerCompanyLinks.map(link => (
                <li key={link.href}><Link href={link.href} className="ft__link">{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="ft__h">Visit and contact</h2>
            <a className="ft__addr" href={mapsHref(c)} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
              <MapPin size={20} weight="light" aria-hidden="true" />
              <address style={{ fontStyle: 'normal' }}>
                {site.name}<br />{addrLine1},<br />{addrLine2}
              </address>
              <ArrowUpRight className="ft__ar" size={18} weight="light" aria-hidden="true" />
            </a>
            {c.gstin && (
              <p style={{ fontSize: '0.8125rem', color: 'color-mix(in srgb, var(--surface) 80%, transparent)', fontFamily: 'var(--font-mono)', margin: 'var(--space-xs) 0 0' }}>
                GSTIN: {c.gstin}
              </p>
            )}
            <ul className="ft__list" style={{ marginTop: 'var(--space-xs)' }}>
              {c.phone && (
                <li><a href={telHref(c.phone)} onClick={() => trackPhoneClick('footer')} className="ft__link"><Phone size={18} weight="light" aria-hidden="true" />{c.phone}</a></li>
              )}
              {c.email && (
                <li><a href={`mailto:${c.email}`} className="ft__link" style={{ overflowWrap: 'anywhere' }}><EnvelopeSimple size={18} weight="light" aria-hidden="true" />{c.email}</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="ft__bottom">
          <p>&copy; {year} {site.name}. All rights reserved.</p>
          <nav aria-label="Legal">
            <ul className="ft__legal">
              {navigation.legal.map(link => (
                <li key={link.href}><Link href={link.href} className="ft__link">{link.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
