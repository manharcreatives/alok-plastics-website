/**
 * PageHero — full-screen hero stage for every inner page.
 *
 * min-height 100svh: the glass pill floats on top (nav = 16px + 64px), content sits low-left
 * exactly like the home hero, and the folded exit line is drawn INSIDE the hero so nothing
 * from the next section peeks into the first viewport at any size.
 *
 * Props kept from v1 (crumbs, label, title, lead, children). Optional:
 *   art        right-side / background artwork (aria-hidden). Pass a bespoke drawing per page.
 *   photo      { src, position? } real photograph layered OVER the art (art stays as the placeholder and is
 *              hidden only once the photo has loaded) and UNDER a canvas veil that guarantees text contrast.
 *              The veil only appears once the photo has loaded, so a missing file shows the art untouched.
 *   specs      [{ k, v }] a hairline spec strip under the lead (mono keys), for datasheet-style heroes.
 *   size       'md' = H1 at --fs-h1 (long, keyword-led titles); default = display size.
 *   compact    short band (no 100svh) for utility pages such as the cart.
 *   titleAs    'p' when the page body already carries its own h1 (cart).
 *   enter      entrance: 'rise' (mask-rise H1) | 'wipe' (diagonal clip wipe) | 'draw' (rule draws, H1 slides from the rule).
 *   calm       quieter variant for legal pages (smaller type).
 *   layout     stage composition on >=768px (one-screen in every case):
 *              base       text bottom-left, art right (default)
 *              center     text vertically centred left, art large right
 *              top        text top-left, art lowered right (finder-forward pages)
 *              mirror     art left, text vertically centred right
 *              mirror-end art left, text bottom-right
 *              stack      huge title top-left, art strip across the bottom
 *              spec       left-anchored spec-sheet: burgundy rule, text vertically centred, art/photo right
 *              spec       left-anchored spec-sheet: burgundy rule, text vertically centred, art/photo right
 *
 * Entrances are CSS keyframes only (transform / opacity / clip-path / stroke-dashoffset),
 * fully disabled under prefers-reduced-motion.
 */
import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';
import PhotoBg from '@/components/ui/PhotoBg';
import { ART_CSS } from './art/artCss';

export interface HeroPhoto { src: string; position?: string }
export interface HeroSpec { k: string; v: string }

interface Props {
  crumbs: Crumb[];
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;   // optional actions row
  art?: ReactNode;
  photo?: HeroPhoto;
  specs?: HeroSpec[];
  size?: 'md';
  compact?: boolean;
  titleAs?: 'h1' | 'p';
  enter?: 'rise' | 'wipe' | 'draw';
  calm?: boolean;
  layout?: 'base' | 'center' | 'top' | 'mirror' | 'mirror-end' | 'stack' | 'spec';
}

const CSS = `
${ART_CSS}
.ph { position: relative; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
  min-height: 100svh; background: var(--canvas); isolation: isolate; container-type: inline-size; }
.ph__grid { position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--grey-metal) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--grey-metal) 4%, transparent) 1px, transparent 1px);
  background-size: 8px 8px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, var(--ink) 0%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 70% 40%, var(--ink) 0%, transparent 75%); }
.ph__art { position: absolute; z-index: 1; pointer-events: none; left: 0; right: 0; top: 0; height: 56%;
  display: flex; align-items: flex-start; justify-content: flex-end; }
.ph__art > * { max-width: 100%; max-height: 100%; }
.ph__body { position: relative; z-index: 2; width: 100%; margin: 0 auto;
  max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  padding: 96px var(--grid-page-padding) calc(var(--fold-h) + var(--space-lg)); }
.ph__text { max-width: 44rem; }
.ph__crumbs { margin-bottom: var(--space-md); }
.ph__label { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); }
.ph__label::before { content: ''; width: var(--space-md); height: 2px; background: var(--burgundy); flex: none; }
.ph__labeltext { font-size: var(--fs-label); text-transform: uppercase; letter-spacing: var(--tr-label); color: var(--grey-metal-text); font-weight: 600; line-height: var(--lh-label); font-family: var(--font-archivo), sans-serif; }
.ph__h1mask { display: block; overflow: hidden; padding-bottom: 0.12em; margin-bottom: calc(-0.12em); }
.ph__h1 { font-family: var(--font-archivo, sans-serif); font-variation-settings: "wdth" 125; font-weight: 650;
  font-size: clamp(2rem, 7.4vw, 2.75rem); line-height: 1.04; letter-spacing: -0.03em; color: var(--ink);
  text-wrap: balance; margin: 0 0 var(--space-md); overflow-wrap: break-word; }
.ph__lead { font-size: 1.0625rem; line-height: 1.65; color: var(--body); max-width: 56ch; margin: 0; text-wrap: pretty; }
.ph__actions { margin-top: var(--space-lg); display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.ph--calm .ph__h1 { font-size: clamp(1.875rem, 6vw, 2.5rem); }
.ph--calm .ph__art { opacity: 0.8; }

/* Folded exit: a hairline across the bottom at the logo's diagonal, burgundy arm at the high end */
.ph__fold { position: absolute; left: 0; bottom: 0; width: 100%; height: var(--fold-h); z-index: 3; pointer-events: none; overflow: visible; }

.ph { --fold-h: clamp(24px, 4vw, 56px); }

/* ── Entrances ── */
.ph[data-ready] .ph__labeltext { animation: ph-fade 400ms 200ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__crumbs { animation: ph-fade 400ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__lead { animation: ph-rise 700ms 400ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__actions { animation: ph-rise 700ms 700ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__art { animation: ph-fade 1200ms 200ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready][data-enter="rise"] .ph__h1 { animation: ph-maskrise 900ms 200ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready][data-enter="wipe"] .ph__h1 { animation: ph-wipe 900ms 200ms cubic-bezier(.65,0,.35,1) both; }
.ph[data-ready][data-enter="draw"] .ph__h1 { animation: ph-slide 900ms 400ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__fold { animation: ph-fade 1200ms 400ms cubic-bezier(.65,0,.35,1) both; }
@keyframes ph-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ph-rise { from { opacity: 0; transform: translate3d(0, 16px, 0); } to { opacity: 1; transform: none; } }
@keyframes ph-maskrise { from { transform: translate3d(0, 105%, 0); } to { transform: none; } }
@keyframes ph-wipe { from { clip-path: polygon(0 0, 0 0, -44% 100%, -44% 100%); } to { clip-path: polygon(0 0, 150% 0, 106% 100%, 0 100%); } }
@keyframes ph-slide { from { opacity: 0; transform: translate3d(-24px, 0, 0); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .ph *, .ph *::before, .ph *::after { animation: none !important; }
}

@media (min-width: 768px) {
  .ph__h1 { font-size: var(--fs-display); }
  .ph--calm .ph__h1 { font-size: var(--fs-h1); }
  .ph__lead { font-size: 1.1875rem; }
  .ph__body { padding-bottom: calc(var(--fold-h) + var(--space-xl)); }
  .ph__art { left: auto; width: min(54%, 820px); height: 100%; align-items: center; box-sizing: border-box; padding: 104px var(--grid-page-padding) calc(var(--fold-h) + var(--space-lg)) 0; }
  .ph__art > * { height: 100%; width: 100%; }
}

/* ── Stage compositions (>=768px). Mobile keeps one tidy stack: art on top, text below ── */
@media (min-width: 768px) {
  .ph[data-layout="center"] { justify-content: center; }
  .ph[data-layout="center"] .ph__body { padding-top: 104px; padding-bottom: calc(var(--fold-h) + var(--space-xl)); }
  .ph[data-layout="center"] .ph__text { max-width: 46rem; }

  .ph[data-layout="top"] { justify-content: flex-start; }
  .ph[data-layout="top"] .ph__body { padding-top: 120px; padding-bottom: calc(var(--fold-h) + var(--space-lg)); }
  .ph[data-layout="top"] .ph__art { padding-top: 200px; }

  .ph[data-layout="mirror"], .ph[data-layout="mirror-end"] { justify-content: center; }
  .ph[data-layout="mirror-end"] { justify-content: flex-end; }
  .ph[data-layout="mirror"] .ph__art, .ph[data-layout="mirror-end"] .ph__art { left: 0; right: auto; justify-content: flex-start; padding: 104px 0 calc(var(--fold-h) + var(--space-lg)) var(--grid-page-padding); }
  .ph[data-layout="mirror"] .ph__text, .ph[data-layout="mirror-end"] .ph__text { margin-left: auto; max-width: min(40rem, 46%); }

  .ph[data-layout="stack"] { justify-content: flex-start; }
  .ph[data-layout="stack"] .ph__body { padding-top: 112px; }
  .ph[data-layout="stack"] .ph__text { max-width: 62rem; }
  .ph[data-layout="stack"] .ph__h1 { font-size: var(--fs-display-xl); line-height: var(--lh-display-xl); margin-bottom: var(--space-lg); }
  .ph[data-layout="stack"] .ph__actions { display: block; margin-top: var(--space-lg); }
  .ph[data-layout="stack"] .ph__art { left: 0; right: 0; width: 100%; height: 100%; padding: 104px var(--grid-page-padding) calc(var(--fold-h) + var(--space-lg)); align-items: stretch; }
}
/* tablet (768-1023): ONE composition for every layout except stack. The art takes the whole upper
   stage in normal flow (flex-grows to whatever the text leaves), the text sits below it, so the
   100svh stage is filled intentionally and the two can never overlap. */
@media (min-width: 768px) and (max-width: 1023px) {
  .ph:not([data-layout="stack"]) { justify-content: flex-end; }
  .ph:not([data-layout="stack"]) .ph__body { padding-top: var(--space-sm); padding-bottom: calc(var(--fold-h) + var(--space-xl)); flex: none; }
  .ph:not([data-layout="stack"]) .ph__text { max-width: 44rem; margin-left: 0; }
  .ph:not([data-layout="stack"]) .ph__art { position: relative; inset: auto; left: auto; right: auto; top: auto; width: 100%; height: auto; flex: 1 1 auto; min-height: 280px; padding: 0; display: block; }
  .ph:not([data-layout="stack"]) .ph__art > svg { position: absolute; top: 96px; bottom: var(--space-sm); left: 50%; transform: translateX(-50%); width: auto; height: calc(100% - 96px - var(--space-sm)); max-width: calc(100% - 2 * var(--grid-page-padding)); max-height: none; margin: 0; }
  .ph:not([data-layout="stack"]) .ph__art > div { position: absolute; top: 96px; bottom: var(--space-sm); left: var(--grid-page-padding); right: var(--grid-page-padding); width: auto; height: auto; max-height: none; }
}
@media (min-width: 1024px) { .ph[data-layout="center"] .ph__art { width: min(66%, 960px); } }
/* ── Buttons used in hero action rows ── */
.ph__btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card);
  font-weight: 600; font-size: 0.9375rem; text-decoration: none; background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); transition: background-color 200ms, color 200ms; }
.ph__btn:hover { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.ph__btn--ghost { background: var(--surface); color: var(--burgundy); }
.ph__btn--ghost:hover { background: var(--blush); color: var(--burgundy-deep); border-color: var(--burgundy); }
.ph__btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.ph__btn svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.ph__btn:hover svg { transform: translate3d(2px, -2px, 0); }
@media (prefers-reduced-motion: reduce) { .ph__btn svg { transition: none; } }

/* ── Spec strip (datasheet furniture): hairline table of honest facts under the lead ── */
.ph__specs { margin: var(--space-lg) 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 40rem; border-top: 1px solid var(--ink); }
.ph__specs > div { padding: var(--space-xs) var(--space-sm) var(--space-xs) 0; border-bottom: 1px solid var(--grey-warm); min-width: 0; }
.ph__specs dt { font-family: var(--font-mono, monospace); font-size: 0.6875rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--grey-metal-text); }
.ph__specs dd { margin: 2px 0 0; font-family: var(--font-archivo, sans-serif); font-variation-settings: "wdth" 110; font-weight: 650; font-size: 0.9375rem; line-height: 1.35; color: var(--ink); overflow-wrap: anywhere; }
.ph[data-ready] .ph__specs { animation: ph-rise 700ms 600ms cubic-bezier(.16,1,.3,1) both; }

/* ── Photo layer: above the art, below the veil + text. The veil exists only once the photo has loaded ── */
.ph { --v1: var(--canvas); --v9: color-mix(in srgb, var(--canvas) 90%, transparent); --v7: color-mix(in srgb, var(--canvas) 70%, transparent);
  --v5: color-mix(in srgb, var(--canvas) 50%, transparent); --v3: color-mix(in srgb, var(--canvas) 30%, transparent); --v1x: color-mix(in srgb, var(--canvas) 10%, transparent); }
.ph__photo { position: absolute; z-index: 1; pointer-events: none; left: 0; right: 0; top: 0; height: 52%;
  --veil: linear-gradient(180deg, var(--v7) 0%, var(--v7) 30%, var(--v9) 62%, var(--v1) 100%); }
.ph__photo::after { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 600ms ease; background: var(--veil); }
.ph__photo:has(.photo-bg[data-loaded="true"])::after { opacity: 1; }
.ph:has(.ph__photo .photo-bg[data-loaded="true"]) .ph__art { visibility: hidden; transition: visibility 0s linear 650ms; }
@media (min-width: 768px) and (max-width: 1023px) { .ph__photo { height: 58%; } }
@media (min-width: 1024px) {
  .ph__photo { height: auto; bottom: 0; }
  .ph[data-layout="base"] .ph__photo, .ph[data-layout="center"] .ph__photo, .ph[data-layout="top"] .ph__photo, .ph[data-layout="spec"] .ph__photo {
    --veil: linear-gradient(90deg, var(--v1) 0%, var(--v1) 34%, var(--v9) 44%, var(--v5) 55%, var(--v1x) 70%, transparent 84%); }
  .ph[data-layout="base"] .ph__photo { --veil: linear-gradient(0deg, var(--v1) 0%, var(--v7) 16%, transparent 38%), linear-gradient(90deg, var(--v1) 0%, var(--v1) 34%, var(--v9) 44%, var(--v5) 55%, var(--v1x) 70%, transparent 84%); }
  .ph[data-layout="mirror"] .ph__photo { --veil: linear-gradient(270deg, var(--v1) 0%, var(--v1) 34%, var(--v9) 44%, var(--v5) 55%, var(--v1x) 70%, transparent 84%); }
  .ph[data-layout="mirror-end"] .ph__photo { --veil: linear-gradient(0deg, var(--v1) 0%, var(--v7) 16%, transparent 38%), linear-gradient(270deg, var(--v1) 0%, var(--v1) 34%, var(--v9) 44%, var(--v5) 55%, var(--v1x) 70%, transparent 84%); }
  .ph--photo[data-layout="base"] .ph__text, .ph--photo[data-layout="center"] .ph__text, .ph--photo[data-layout="top"] .ph__text, .ph--photo[data-layout="spec"] .ph__text { max-width: min(44rem, 56%); }
  .ph[data-layout="spec"] { justify-content: center; }
  .ph[data-layout="spec"] .ph__body { padding-top: 104px; padding-bottom: calc(var(--fold-h) + var(--space-xl)); }
}
@media (min-width: 768px) {
  .ph[data-layout="stack"] .ph__photo { height: auto; bottom: 0; --veil: linear-gradient(180deg, var(--v1) 0%, var(--v1) 36%, var(--v9) 46%, var(--v5) 58%, var(--v1x) 76%, transparent 92%); }
  .ph[data-layout="spec"] .ph__text { padding-left: var(--space-md); border-left: 2px solid var(--burgundy); }
  .ph[data-layout="spec"] .ph__label::before { display: none; }
}

/* h1 size md: long, keyword-led titles */
.ph--md .ph__h1 { font-size: clamp(1.875rem, 6.6vw, 2.5rem); }
@media (min-width: 768px) { .ph--md .ph__h1 { font-size: var(--fs-h1); line-height: var(--lh-h1); letter-spacing: var(--tr-h1); } }

/* compact: utility band (cart). Declared last so it wins the tablet rules above. */
.ph.ph--compact { min-height: 0; justify-content: flex-start; }
.ph.ph--compact .ph__body { padding-top: 112px; padding-bottom: calc(var(--fold-h) + var(--space-lg)); flex: none; }
.ph.ph--compact .ph__text { max-width: 44rem; margin-left: 0; }
.ph.ph--compact .ph__photo { height: auto; bottom: 0; --veil: linear-gradient(180deg, var(--v7) 0%, var(--v9) 60%, var(--v1) 100%); }
@media (min-width: 1024px) { .ph.ph--compact .ph__photo { --veil: linear-gradient(90deg, var(--v1) 0%, var(--v1) 34%, var(--v9) 44%, var(--v5) 55%, var(--v1x) 70%, transparent 84%); } }
/* ── Art present (>=1024): the art card owns its own column; the text column ends before it, so text never sits under the art ── */
@media (min-width: 1024px) {
  .ph--art[data-layout="base"], .ph--art[data-layout="top"], .ph--art[data-layout="spec"] { --art-w: min(46cqw, 820px); }
  .ph--art[data-layout="center"] { --art-w: min(48cqw, 960px); }
  .ph--art[data-layout="base"] .ph__art, .ph--art[data-layout="top"] .ph__art, .ph--art[data-layout="spec"] .ph__art, .ph--art[data-layout="center"] .ph__art { width: var(--art-w); }
  .ph--art[data-layout="base"] .ph__text, .ph--art[data-layout="top"] .ph__text, .ph--art[data-layout="spec"] .ph__text, .ph--art[data-layout="center"] .ph__text {
    max-width: min(44rem, calc(100cqw - var(--art-w) - var(--grid-page-padding) - var(--space-md))); }
}
@media (min-width: 1280px) {
  .ph--art[data-layout="base"], .ph--art[data-layout="top"], .ph--art[data-layout="spec"] { --art-w: min(54cqw, 820px); }
  .ph--art[data-layout="center"] { --art-w: min(56cqw, 960px); }
}
@media (max-width: 767px) {
  .ph__art { top: 80px; height: 38%; box-sizing: border-box; padding: 0 var(--grid-page-padding); justify-content: center; }
}
`;

export default function PageHero({ crumbs, label, title, lead, children, art, photo, specs, size, compact, titleAs = 'h1', enter = 'rise', calm, layout = 'base' }: Props) {
  const cls = ['ph', calm && 'ph--calm', size === 'md' && 'ph--md', compact && 'ph--compact', photo && 'ph--photo', art && 'ph--art'].filter(Boolean).join(' ');
  const H = titleAs;
  return (
    <section className={cls} data-enter={enter} data-layout={layout} data-ready="" aria-label={label}>
      <style>{CSS}</style>
      <div className="ph__grid" aria-hidden="true" />
      {art && <div className="ph__art" aria-hidden="true">{art}</div>}
      {photo && (
        <div className="ph__photo" aria-hidden="true">
          <PhotoBg src={photo.src} position={photo.position ?? 'center'} priority />
        </div>
      )}
      <div className="ph__body">
        <div className="ph__text">
          <div className="ph__crumbs"><Breadcrumbs items={crumbs} /></div>
          <div className="ph__label">
            <span className="ph__labeltext">{label}</span>
          </div>
          <span className="ph__h1mask"><H className="ph__h1">{title}</H></span>
          {lead && <p className="ph__lead">{lead}</p>}
          {specs && specs.length > 0 && (
            <dl className="ph__specs">
              {specs.map(r => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
            </dl>
          )}
          {children && <div className="ph__actions">{children}</div>}
        </div>
      </div>
      <svg className="ph__fold" aria-hidden="true" viewBox="0 0 100 1" preserveAspectRatio="none">
        <line x1="0" y1="1" x2="100" y2="0" stroke="var(--grey-warm)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="78" y1="0.22" x2="100" y2="0" stroke="var(--burgundy)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </section>
  );
}
