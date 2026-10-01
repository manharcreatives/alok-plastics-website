/**
 * FoldEdge — the logo's folded diagonal as a section-to-section transition.
 *
 * Variants (default 'fold' keeps every existing import working unchanged):
 *  - 'fold'     3° rising fold: hairline across the cut, short burgundy arm at the high end.
 *  - 'diag'     flat run, then a true 44° cut up into the top-right corner (the A-peak angle).
 *  - 'step'     stepped L+O lock edge: two squared steps rising to the right.
 *  - 'register' straight hairline with crosshair register marks (no cut, no overlap).
 *
 * The section carries `fold-sec` (+ `fold-sec--diag|step|register`) and is clipped/pulled up
 * under the previous section; this draws the edge line itself.
 */

export type FoldVariant = 'fold' | 'diag' | 'step' | 'register';

/** Top-lit burgundy for gradient TEXT. Every stop is >= 7:1 on canvas/surface (the
 *  locked --metal-gradient fades to pale rose, ~2.2:1, so it stays for non-text use). */
export const METAL_TEXT_CSS = `
  .mt-grad { background: linear-gradient(175deg, var(--burgundy-night) 0%, var(--burgundy) 55%, var(--burgundy-bright) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: var(--burgundy); }
`;

export const FOLD_SECTION_CSS = METAL_TEXT_CSS + `
  .fold-sec {
    --fold: clamp(28px, 5vw, 72px);
    position: relative;
    margin-top: calc(var(--fold) * -1);
    padding-top: calc(var(--fold) + var(--pad-top, var(--section-y)));
    clip-path: polygon(0 var(--fold), 100% 0, 100% 100%, 0 100%);
  }
  .fold-sec--diag {
    --fold: clamp(40px, 6vw, 88px);
    clip-path: polygon(0 var(--fold), calc(100% - var(--fold) * 1.04) var(--fold), 100% 0, 100% 100%, 0 100%);
  }
  .fold-sec--step {
    --fold: clamp(32px, 4.4vw, 64px);
    clip-path: polygon(0 var(--fold), 36% var(--fold), 36% calc(var(--fold) * 0.5), 68% calc(var(--fold) * 0.5), 68% 0, 100% 0, 100% 100%, 0 100%);
  }
  .fold-sec--register { --fold: 0px; margin-top: 0; padding-top: var(--pad-top, var(--section-y)); clip-path: none; }
  .fold-edge { position: absolute; top: 0; left: 0; width: 100%; height: var(--fold); pointer-events: none; z-index: 2; overflow: visible; }
  .fold-edge--diag i { position: absolute; inset: 0; }
  .fold-edge--diag .fe-line { background: var(--grey-warm); clip-path: polygon(0 calc(100% - 1px), calc(100% - var(--fold) * 1.04) calc(100% - 1px), 100% 0, 100% 2px, calc(100% - var(--fold) * 1.04 + 1.4px) 100%, 0 100%); }
  .fold-edge--diag .fe-arm { background: var(--burgundy); clip-path: polygon(calc(100% - var(--fold) * 1.04) calc(100% - 1px), 100% 0, 100% 3px, calc(100% - var(--fold) * 1.04 + 2px) 100%); }
  .fold-edge--register { height: 0; }
  .fold-edge--register .fe-rule { position: absolute; left: var(--grid-page-padding); right: var(--grid-page-padding); top: 0; height: 1px; background: var(--grey-warm); }
  .fold-edge--register .fe-mark { position: absolute; top: -6px; width: 13px; height: 13px; }
  .fold-edge--register .fe-mark::before, .fold-edge--register .fe-mark::after { content: ""; position: absolute; background: var(--grey-metal); }
  .fold-edge--register .fe-mark::before { left: 6px; top: 0; width: 1px; height: 13px; }
  .fold-edge--register .fe-mark::after { top: 6px; left: 0; height: 1px; width: 13px; }
  .fold-edge--register .fe-arm { position: absolute; left: var(--grid-page-padding); top: -1px; width: 56px; height: 3px; background: var(--burgundy); }
`;

export default function FoldEdge({ flip = false, variant = 'fold' }: { flip?: boolean; variant?: FoldVariant }) {
  if (variant === 'diag') {
    return (
      <div aria-hidden="true" className="fold-edge fold-edge--diag">
        <i className="fe-line" /><i className="fe-arm" />
      </div>
    );
  }
  if (variant === 'register') {
    return (
      <div aria-hidden="true" className="fold-edge fold-edge--register">
        <span className="fe-rule" /><span className="fe-arm" />
        <span className="fe-mark" style={{ left: 'calc(var(--grid-page-padding) - 6px)' }} />
        <span className="fe-mark" style={{ right: 'calc(var(--grid-page-padding) - 6px)' }} />
      </div>
    );
  }
  if (variant === 'step') {
    return (
      <svg aria-hidden="true" className="fold-edge" viewBox="0 0 100 2" preserveAspectRatio="none">
        <polyline points="0,2 36,2 36,1 68,1 68,0 100,0" fill="none" stroke="var(--grey-warm)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points="68,0 100,0" fill="none" stroke="var(--burgundy)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      className="fold-edge"
      viewBox="0 0 100 1"
      preserveAspectRatio="none"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <line x1="0" y1="1" x2="100" y2="0" stroke="var(--grey-warm)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <line x1="76" y1="0.24" x2="100" y2="0" stroke="var(--burgundy)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
