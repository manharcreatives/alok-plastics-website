/**
 * S11b · ClosingNote — the sign-off band between the enquiry section and the footer.
 * bg: --canvas (light), so the burgundy footer below never meets another burgundy block (ADR in
 * docs/decisions.md). Same drawn-grid + register-mark language as the footer's strip: the grid
 * continues, the burgundy arm on the top rule echoes the footer's fold highlight.
 *
 * Copy is a sincere sign-off built from facts already on the site (est. 1998, Chandigarh,
 * hero line "from a single component to thousands of parts"). No new claims, no numbers.
 * Links read the runtime contact so the panel's numbers apply. Default export, no props.
 */

'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr/WhatsappLogo';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { site, telHref } from '@/content/site';
import { waGeneral } from '@/lib/whatsapp';
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
import { METAL_TEXT_CSS } from './FoldEdge';

const CSS = METAL_TEXT_CSS + `
.cn { position: relative; overflow: hidden; background: var(--canvas); padding: var(--space-xl) var(--grid-page-padding) calc(var(--space-xl) + var(--space-lg)); }
.cn__bg { position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--grey-metal) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--grey-metal) 5%, transparent) 1px, transparent 1px);
  background-size: 8px 8px; -webkit-mask-image: radial-gradient(ellipse 60% 90% at 80% 100%, var(--ink), transparent); mask-image: radial-gradient(ellipse 60% 90% at 80% 100%, var(--ink), transparent); }
.cn__in { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; padding-top: var(--space-md); border-top: 1px solid var(--grey-warm); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); align-items: end; }
.cn__in::before { content: ""; position: absolute; left: 0; top: -1px; width: 56px; height: 3px; background: var(--burgundy); }
.cn__k { margin: 0 0 var(--space-sm); font-size: var(--fs-label); line-height: var(--lh-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo), sans-serif; }
.cn__h { margin: 0; font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h2); font-weight: 650; line-height: var(--lh-h2); letter-spacing: var(--tr-h2); color: var(--ink); max-width: 18ch; text-wrap: balance; }
.cn__p { margin: var(--space-sm) 0 0; max-width: 46ch; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--body); }
.cn__links { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--space-xs) var(--space-md); }
.cn__link { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 44px; font-size: 0.9375rem; font-weight: 600; color: var(--burgundy); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--burgundy) 40%, transparent); transition: border-color 200ms cubic-bezier(.16,1,.3,1); }
.cn__link:hover { border-bottom-color: var(--burgundy); }
.cn__link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 4px; }
.cn__link svg { flex: none; }
@media (min-width: 900px) { .cn__in { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: var(--space-xl); } .cn__links { flex-direction: column; align-items: flex-start; gap: var(--space-xs); } }
@media (prefers-reduced-motion: reduce) { .cn__link { transition: none; } }
`;

export default function ClosingNote() {
  const c = useRuntimeContact();
  const waHref = waGeneral(c.whatsapp);

  return (
    <section id="closing-note" aria-labelledby="closing-note-h" className="cn">
      <style>{CSS}</style>
      <div className="cn__bg" aria-hidden="true" />
      <div className="cn__in">
        <div>
          <p className="cn__k">{site.name} &middot; {site.contact.city} &middot; Since {site.foundingYear}</p>
          {/* COPY: drafted from the hero line and the founding facts, needs client approval */}
          <h2 id="closing-note-h" className="cn__h">Every part starts with <span className="mt-grad">a conversation.</span></h2>
          <p className="cn__p">From a single component to thousands of parts, we would like to hear what you are building. Reach us the way that suits you.</p>
        </div>
        <ul className="cn__links">
          {c.phone && (
            <li><a className="cn__link" href={telHref(c.phone)} onClick={() => trackPhoneClick('closing-note')}><Phone size={18} weight="light" aria-hidden="true" />Call us</a></li>
          )}
          {waHref && (
            <li><a className="cn__link" href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick({ source: 'enquiry-section' })}><WhatsappLogo size={18} weight="light" aria-hidden="true" />WhatsApp us</a></li>
          )}
          {c.email && (
            <li><a className="cn__link" href={`mailto:${c.email}`}><EnvelopeSimple size={18} weight="light" aria-hidden="true" />Email us</a></li>
          )}
          <li><Link className="cn__link" href="/products/">Browse the catalogue <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link></li>
        </ul>
      </div>
    </section>
  );
}
