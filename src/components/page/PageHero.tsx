/**
 * PageHero — full-screen hero stage for every inner page.
 *
 * min-height 100svh: the glass pill floats on top (nav = 16px + 64px), content sits low-left
 * exactly like the home hero, and the folded exit line is drawn INSIDE the hero so nothing
 * from the next section peeks into the first viewport at any size.
 *
 * Props kept from v1 (crumbs, label, title, lead, children). New (all optional):
 *   art        right-side / background artwork (aria-hidden). Pass a bespoke drawing per page.
 *   scrollHint small ↗-free scroll cue (line + dot) bottom-right on desktop.
 *   enter      entrance: 'rise' (mask-rise H1) | 'wipe' (diagonal clip wipe) | 'draw' (rule draws, H1 slides from the rule).
 *   calm       quieter variant for legal pages (smaller type, no cue).
 *
 * Entrances are CSS keyframes only (transform / opacity / clip-path / stroke-dashoffset),
 * fully disabled under prefers-reduced-motion.
 */
import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';
import { ART_CSS } from './art/artCss';

interface Props {
  crumbs: Crumb[];
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;   // optional actions row
  art?: ReactNode;
  scrollHint?: boolean;
  enter?: 'rise' | 'wipe' | 'draw';
  calm?: boolean;
}

const CSS = `
${ART_CSS}
.ph { position: relative; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
  min-height: 100svh; background: var(--canvas); isolation: isolate; }
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
.ph__rule { display: inline-block; width: 40px; height: 2px; background: var(--burgundy); transform-origin: left center; }
.ph__labeltext { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal); font-weight: 600; line-height: 1; }
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

.ph__cue { position: absolute; z-index: 3; right: var(--grid-page-padding); bottom: calc(var(--fold-h) + var(--space-lg));
  display: none; flex-direction: column; align-items: center; gap: var(--space-xs); }
.ph__cue-label { writing-mode: vertical-rl; font-size: 0.6875rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--grey-metal); font-weight: 600; }
.ph__cue-line { position: relative; width: 1px; height: 56px; background: var(--grey-warm); overflow: hidden; }
.ph__cue-dot { position: absolute; left: 0; top: 0; width: 1px; height: 16px; background: var(--burgundy); animation: ph-cue 1.8s cubic-bezier(.16,1,.3,1) infinite; }
@keyframes ph-cue { 0% { transform: translateY(-16px); } 70%, 100% { transform: translateY(56px); } }

.ph { --fold-h: clamp(24px, 4vw, 56px); }

/* ── Entrances ── */
.ph[data-ready] .ph__rule { animation: ph-draw 700ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__labeltext { animation: ph-fade 400ms 200ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__crumbs { animation: ph-fade 400ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__lead { animation: ph-rise 700ms 400ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__actions { animation: ph-rise 700ms 700ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready] .ph__art { animation: ph-fade 1200ms 200ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready][data-enter="rise"] .ph__h1 { animation: ph-maskrise 900ms 200ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready][data-enter="wipe"] .ph__h1 { animation: ph-wipe 900ms 200ms cubic-bezier(.65,0,.35,1) both; }
.ph[data-ready][data-enter="draw"] .ph__h1 { animation: ph-slide 900ms 400ms cubic-bezier(.16,1,.3,1) both; }
.ph[data-ready][data-enter="draw"] .ph__rule { animation-duration: 900ms; }
.ph[data-ready] .ph__fold { animation: ph-fade 1200ms 400ms cubic-bezier(.65,0,.35,1) both; }
@keyframes ph-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes ph-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ph-rise { from { opacity: 0; transform: translate3d(0, 16px, 0); } to { opacity: 1; transform: none; } }
@keyframes ph-maskrise { from { transform: translate3d(0, 105%, 0); } to { transform: none; } }
@keyframes ph-wipe { from { clip-path: polygon(0 0, 0 0, -44% 100%, -44% 100%); } to { clip-path: polygon(0 0, 150% 0, 106% 100%, 0 100%); } }
@keyframes ph-slide { from { opacity: 0; transform: translate3d(-24px, 0, 0); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .ph *, .ph *::before, .ph *::after { animation: none !important; }
}

@media (min-width: 768px) {
  .ph__h1 { font-size: clamp(2.5rem, 5.2vw, 4.25rem); }
  .ph--calm .ph__h1 { font-size: clamp(2.25rem, 4vw, 3.25rem); }
  .ph__lead { font-size: 1.1875rem; }
  .ph__body { padding-bottom: calc(var(--fold-h) + var(--space-xl)); }
  .ph__art { left: auto; width: min(54%, 820px); height: 100%; align-items: center; box-sizing: border-box; padding: 104px var(--grid-page-padding) calc(var(--fold-h) + var(--space-lg)) 0; }
  .ph__art > * { height: 100%; width: 100%; }
}
@media (min-width: 1024px) and (min-height: 700px) { .ph__cue { display: flex; } }
@media (max-width: 767px) {
  .ph__art { top: 80px; height: 38%; box-sizing: border-box; padding: 0 var(--grid-page-padding); justify-content: center; }
}
`;

export default function PageHero({ crumbs, label, title, lead, children, art, scrollHint, enter = 'rise', calm }: Props) {
  return (
    <section className={`ph${calm ? ' ph--calm' : ''}`} data-enter={enter} data-ready="" aria-label={label}>
      <style>{CSS}</style>
      <div className="ph__grid" aria-hidden="true" />
      {art && <div className="ph__art" aria-hidden="true">{art}</div>}
      <div className="ph__body">
        <div className="ph__text">
          <div className="ph__crumbs"><Breadcrumbs items={crumbs} /></div>
          <div className="ph__label">
            <span className="ph__rule" aria-hidden="true" />
            <span className="ph__labeltext">{label}</span>
          </div>
          <span className="ph__h1mask"><h1 className="ph__h1">{title}</h1></span>
          {lead && <p className="ph__lead">{lead}</p>}
          {children && <div className="ph__actions">{children}</div>}
        </div>
      </div>
      {scrollHint && (
        <div className="ph__cue" aria-hidden="true">
          <span className="ph__cue-label">Scroll</span>
          <span className="ph__cue-line"><span className="ph__cue-dot" /></span>
        </div>
      )}
      <svg className="ph__fold" aria-hidden="true" viewBox="0 0 100 1" preserveAspectRatio="none">
        <line x1="0" y1="1" x2="100" y2="0" stroke="var(--grey-warm)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="78" y1="0.22" x2="100" y2="0" stroke="var(--burgundy)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </section>
  );
}
