/**
 * Two ways to start: pick a part from the catalogue, or send a sample, drawing or photo and
 * have it developed. Two tall, equal-weight "route" cards, each a dark engineered panel with a
 * quiet photograph (PhotoBg, shaded for legibility) over a drawn gradient + grid placeholder:
 *   - Catalogue route  -> /images/cards/browse-catalogue.webp  (hands choosing parts)
 *   - Custom route     -> /images/cards/send-requirement.webp   (two people reviewing a sample)
 * Both links keep their targets (/products/ and /enquiry/). Server component: no client state.
 */

import Link from 'next/link';
import PhotoBg from '@/components/ui/PhotoBg';
import FoldEdge, { FOLD_SECTION_CSS } from './FoldEdge';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilRuler } from '@phosphor-icons/react/dist/ssr/PencilRuler';

const CSS = FOLD_SECTION_CSS + `
.np { --pad-top: calc(var(--section-y) * 1.1); background: var(--canvas); padding-bottom: calc(var(--section-y) * 1.1); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
.np::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: linear-gradient(var(--grey-cloud) 1px, transparent 1px), linear-gradient(90deg, var(--grey-cloud) 1px, transparent 1px);
  background-size: 40px 40px; -webkit-mask-image: linear-gradient(180deg, transparent 0%, var(--ink) 35%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0%, var(--ink) 35%, transparent 100%); }
.np-in { position: relative; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
.np-head { max-width: 44rem; margin-bottom: var(--space-xl); }
.np-k { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-sm); font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); line-height: var(--lh-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--grey-metal-text); }
.np-k::before { content: ""; width: 24px; height: 2px; background: var(--burgundy); }
.np-h { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); font-weight: 650; color: var(--ink); margin: 0 0 var(--space-sm); text-wrap: balance; }
.np-sub { font-size: var(--fs-lead); line-height: var(--lh-lead); color: var(--body); margin: 0; max-width: 46ch; }
.np-cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }

/* route card: dark engineered panel, chamfered top-right corner */
.np-card { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 400px; padding: var(--space-lg); color: var(--surface); overflow: hidden; isolation: isolate;
  background: linear-gradient(160deg, var(--burgundy-deep) 0%, var(--burgundy-night) 100%);
  clip-path: polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 0 100%); }
.np-card--steel { background: linear-gradient(160deg, var(--ink) 0%, var(--burgundy-night) 100%); }
.np-card::before { content: ""; position: absolute; inset: 0; z-index: -2; opacity: .5; pointer-events: none;
  background-image: linear-gradient(color-mix(in srgb, var(--rose-pale) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--rose-pale) 12%, transparent) 1px, transparent 1px);
  background-size: 24px 24px; -webkit-mask-image: linear-gradient(200deg, var(--ink) 0%, transparent 65%); mask-image: linear-gradient(200deg, var(--ink) 0%, transparent 65%); }
/* shade: dark at the text edge (bottom/left), lighter toward the photo's subject */
.np-shade { position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(0deg, color-mix(in srgb, var(--burgundy-night) 92%, transparent) 0%, color-mix(in srgb, var(--burgundy-night) 70%, transparent) 55%, color-mix(in srgb, var(--burgundy-night) 38%, transparent) 100%); }
.np-card::after { content: ""; position: absolute; left: 0; top: 0; width: 72px; height: 3px; background: var(--rose); }
.np-top { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); margin-bottom: var(--space-lg); padding-right: var(--space-lg); }
.np-ico { display: grid; place-items: center; width: 48px; height: 48px; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--surface) 35%, transparent); color: var(--rose-pale); background: color-mix(in srgb, var(--burgundy-night) 50%, transparent); }
.np-route { font-family: var(--font-mono, monospace); font-size: var(--fs-label); letter-spacing: 0.16em; text-transform: uppercase; color: var(--rose-pale); }
.np-label { margin: 0 0 var(--space-xs); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 700; color: var(--rose-pale); }
.np-t { margin: 0 0 var(--space-xs); font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: var(--fs-h3); line-height: var(--lh-h3); letter-spacing: var(--tr-h3); font-weight: 650; color: var(--surface); max-width: 20ch; text-wrap: balance; }
.np-d { margin: 0 0 var(--space-md); font-size: 1rem; line-height: 1.6; color: var(--pink-soft); max-width: 40ch; }
.np-body { position: relative; z-index: 1; margin-top: auto; }
.np-cta { align-self: flex-start; }
.np-cta svg { margin-left: var(--space-xs); transition: transform 200ms var(--ease-expo-out); }
.np-cta:hover svg { transform: translate(2px, -2px); }
@media (min-width: 768px) { .np-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .np-card { min-height: 480px; } }
@media (max-width: 639px) { .np-card { padding: var(--space-md); min-height: 360px; } .np-top { margin-bottom: var(--space-md); padding-right: var(--space-md); } }
@media (prefers-reduced-motion: reduce) { .np-cta svg { transition: none; } }
`;

export default function NeedPartBlock() {
  return (
    <section aria-labelledby="need-part-h" className="fold-sec np">
      <style>{CSS}</style>
      <FoldEdge />
      <div className="np-in">
        <div className="np-head">
          <span className="np-k">Two ways to start</span>
          <h2 id="need-part-h" className="np-h">Know the part, or only have a sample?</h2>
          <p className="np-sub">Pick it from the catalogue, or send us what you have and we&rsquo;ll develop it.</p>
        </div>
        <div className="np-cards">
          <div className="np-card">
            <PhotoBg src="/images/cards/browse-catalogue.webp" opacity={0.6} position="center" />
            <span className="np-shade" aria-hidden="true" />
            <div className="np-top">
              <span className="np-ico" aria-hidden="true"><MagnifyingGlass size={24} weight="light" /></span>
              <span className="np-route" aria-hidden="true">Route 01</span>
            </div>
            <div className="np-body">
              <p className="np-label">From the catalogue</p>
              <h3 className="np-t">Pick it from the shelf.</h3>
              <p className="np-d">Browse by group, material or machine, then send an enquiry for the parts you need.</p>
              <Link href="/products/" className="btn btn--on-burgundy np-cta" style={{ minHeight: 48, padding: '0 var(--space-md)', fontSize: '1rem' }}>
                View Catalogue <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="np-card np-card--steel">
            <PhotoBg src="/images/cards/send-requirement.webp" opacity={0.6} position="center" />
            <span className="np-shade" aria-hidden="true" />
            <div className="np-top">
              <span className="np-ico" aria-hidden="true"><PencilRuler size={24} weight="light" /></span>
              <span className="np-route" aria-hidden="true">Route 02</span>
            </div>
            <div className="np-body">
              <p className="np-label">Custom development</p>
              <h3 className="np-t">Send us the sample.</h3>
              <p className="np-d">Share a sample, drawing or photo and we&rsquo;ll develop and supply it.</p>
              <Link href="/enquiry/" className="btn btn--on-burgundy np-cta" style={{ minHeight: 48, padding: '0 var(--space-md)', fontSize: '1rem' }}>
                Get Custom Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
