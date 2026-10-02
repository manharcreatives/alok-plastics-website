/**
 * EnquiryBand — closing CTA band used at the end of every inner page (§8.3).
 * Light (surface-alt) with a folded 44-degree top edge, so it never reads as a second
 * burgundy block next to the burgundy footer. One action only: Get a Quote
 * (WhatsApp lives in the floating button only: round 2, ask 17).
 * `waHref` is accepted for backwards compatibility and ignored.
 */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import FoldEdge, { FOLD_SECTION_CSS, type FoldVariant } from '@/components/sections/FoldEdge';

interface Props {
  heading?: string;
  text?: string;
  waHref?: string | null;
  /** split: heading left, action right (default). wide: one big line, rule, then text + action. lock: heading beside a notched blush panel that holds the action. */
  variant?: 'split' | 'wide' | 'lock';
  /** edge into the band: fold (default) | diag | step | register. */
  fold?: FoldVariant;
}

const CSS = `
${FOLD_SECTION_CSS}
.eb { --pad-top: var(--section-y); background: var(--surface-alt); padding-bottom: var(--section-y); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); overflow: hidden; }
.eb__inner { position: relative; z-index: 1; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; display: grid; gap: var(--space-lg); align-items: end; }
.eb__label { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal-text); font-weight: 600; }
.eb__label i { width: 24px; height: 2px; background: var(--burgundy); display: inline-block; }
.eb__h { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.75rem, 4.4vw, 3.25rem); font-weight: 650; line-height: 1.06; letter-spacing: -0.03em; color: var(--ink); max-width: 18ch; text-wrap: balance; margin: 0 0 var(--space-sm); }
.eb__p { color: var(--body); line-height: 1.65; max-width: 52ch; margin: 0; }
.eb__cta { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 56px; padding: 0 var(--space-lg); background: var(--burgundy); color: var(--surface);
  font-weight: 650; font-size: 1.0625rem; text-decoration: none; border-radius: var(--radius-card); clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  transition: background-color 200ms; }
.eb__cta:hover, .eb__cta:focus-visible { background: var(--burgundy-deep); }
.eb__cta:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.eb__cta svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.eb__cta:hover svg { transform: translate3d(2px, -2px, 0); }
.eb__lines { position: absolute; right: 0; top: 0; bottom: 0; width: min(46%, 560px); z-index: 0; pointer-events: none;
  background: repeating-linear-gradient(-44deg, transparent 0 22px, color-mix(in srgb, var(--grey-metal) 16%, transparent) 22px 23px);
  -webkit-mask-image: linear-gradient(to left, var(--ink), transparent 90%); mask-image: linear-gradient(to left, var(--ink), transparent 90%); }
/* wide: the headline carries the band; text and action sit under a ruled line */
.eb--wide .eb__lines, .eb--lock .eb__lines { display: none; }
.eb--wide .eb__inner { grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); }
.eb--wide .eb__h { max-width: 20ch; font-size: clamp(2.25rem, 6.4vw, 5.5rem); line-height: 1.02; margin-bottom: 0; }
.eb--wide .eb__row { display: grid; gap: var(--space-md); align-items: center; padding-top: var(--space-md); border-top: 1px solid var(--grey-metal); }
/* lock: a big headline keyed against a stepped, notched blush panel (the L+O lock) that holds the action */
.eb--lock .eb__h { font-size: clamp(2.25rem, 4.6vw, 4rem); max-width: 16ch; line-height: 1.02; margin-bottom: 0; }
.eb--lock .eb__panel { position: relative; background: var(--blush); border-left: 2px solid var(--burgundy); padding: calc(var(--space-lg) + 28px) var(--space-lg) var(--space-lg); display: grid; gap: var(--space-md); justify-items: start;
  clip-path: polygon(0 28px, 34% 28px, 34% 14px, 68% 14px, 68% 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%); }
.eb--lock .eb__panel::after { content: ''; position: absolute; right: var(--space-md); bottom: var(--space-md); width: 56px; height: 56px; pointer-events: none;
  border-right: 1px solid var(--grey-metal); border-bottom: 1px solid var(--grey-metal); }
.eb--lock .eb__panel .eb__p { font-size: 1.0625rem; }
@media (min-width: 900px) {
  .eb--wide .eb__row { grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-xl); }
  .eb--lock .eb__inner { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); align-items: stretch; }
  .eb--lock .eb__panel { align-content: end; }
}
@media (min-width: 900px) { .eb__inner { grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-xl); } }
@media (prefers-reduced-motion: reduce) { .eb__cta svg { transition: none; } }
`;

export default function EnquiryBand({
  heading = 'Need a part? Tell us what you need.',
  text = 'Share the part name, quantity and use, and we reply with a quote.',
  variant = 'split',
  fold = 'fold',
}: Props) {
  const cta = <Link href="/enquiry/" className="eb__cta">Get a Quote <ArrowUpRight size={20} weight="light" aria-hidden="true" /></Link>;
  return (
    <section aria-labelledby="enquiry-band-h" className={`fold-sec fold-sec--${fold} eb eb--${variant}`}>
      <style>{CSS}</style>
      <FoldEdge variant={fold} />
      <div className="eb__lines" aria-hidden="true" />
      <div className="eb__inner">
        {variant === 'wide' ? (
          <>
            <div>
              <p className="eb__label"><i aria-hidden="true" />Next step</p>
              <h2 id="enquiry-band-h" className="eb__h">{heading}</h2>
            </div>
            <div className="eb__row">
              <p className="eb__p">{text}</p>
              {cta}
            </div>
          </>
        ) : variant === 'lock' ? (
          <>
            <div>
              <p className="eb__label"><i aria-hidden="true" />Next step</p>
              <h2 id="enquiry-band-h" className="eb__h">{heading}</h2>
            </div>
            <div className="eb__panel">
              <p className="eb__p">{text}</p>
              {cta}
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="eb__label"><i aria-hidden="true" />Next step</p>
              <h2 id="enquiry-band-h" className="eb__h">{heading}</h2>
              <p className="eb__p">{text}</p>
            </div>
            {cta}
          </>
        )}
      </div>
    </section>
  );
}
