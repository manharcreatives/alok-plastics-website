/**
 * FoldEdge — the logo's folded diagonal as a section-to-section transition.
 * The section using it is clipped with a rising-to-the-right diagonal (the K / A-peak
 * direction) and pulled up under the previous section; this draws the fold line itself:
 * a hairline across the cut with a short burgundy arm at the high end.
 */

export const FOLD_SECTION_CSS = `
  .fold-sec {
    --fold: clamp(28px, 5vw, 72px);
    position: relative;
    margin-top: calc(var(--fold) * -1);
    padding-top: calc(var(--fold) + var(--pad-top, var(--section-y)));
    clip-path: polygon(0 var(--fold), 100% 0, 100% 100%, 0 100%);
  }
  .fold-edge { position: absolute; top: 0; left: 0; width: 100%; height: var(--fold); pointer-events: none; z-index: 2; overflow: visible; }
`;

export default function FoldEdge({ flip = false }: { flip?: boolean }) {
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
