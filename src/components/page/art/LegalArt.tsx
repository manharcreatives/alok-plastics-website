/** LegalArt — quiet variant: a folded document sheet with ruled lines. No claims, no text. */
import { D } from './artCss';

export default function LegalArt() {
  return (
    <svg className="pa-svg" viewBox="0 0 640 760" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      <g className="pa-rise" style={D(200)}>
        <path d="M200 120H460L520 180V640H200Z" fill="var(--surface)" stroke="var(--grey-warm)" strokeWidth="1.5" />
        <path d="M460 120V180H520Z" fill="var(--blush)" stroke="var(--grey-warm)" strokeWidth="1.5" />
      </g>
      <g stroke="var(--grey-warm)" strokeWidth="1.5" fill="none">
        {[260, 308, 356, 404, 452, 500, 548, 596].map((y, i) => (
          <line key={y} className="pa-draw" pathLength={1} x1="240" y1={y} x2={i % 3 === 2 ? 380 : 480} y2={y} style={D(500 + i * 90)} />
        ))}
      </g>
      <line className="pa-draw" pathLength={1} x1="240" y1="200" x2="320" y2="200" stroke="var(--burgundy)" strokeWidth="3" style={D(400)} />
    </svg>
  );
}
