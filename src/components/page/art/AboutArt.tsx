/**
 * AboutArt — the folded A-peak as a lit sheet: light rays from above (आलोक = light),
 * a burgundy leg and a metal-grey leg meeting at a crease, outline wordmark beneath.
 * Pure geometry from the logo's language; no data.
 */
import { D } from './artCss';

const RAYS = [-80, 20, 120, 220, 320, 420, 520, 620, 720];

export default function AboutArt() {
  return (
    <svg className="pa-svg" viewBox="0 0 640 760" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      <defs>
        <linearGradient id="aa-burg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--burgundy-night)" />
          <stop offset="0.45" stopColor="var(--burgundy)" />
          <stop offset="1" stopColor="var(--burgundy-bright)" />
        </linearGradient>
        <linearGradient id="aa-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--grey-metal)" />
          <stop offset="0.6" stopColor="var(--silver)" />
          <stop offset="1" stopColor="var(--grey-warm)" />
        </linearGradient>
        <linearGradient id="aa-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rose)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--grey-warm)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* rays: light from the top */}
      <g fill="none" strokeWidth="1">
        {RAYS.map((x, i) => (
          <line key={x} className="pa-draw" pathLength={1} x1="320" y1="64" x2={x} y2="744" stroke="url(#aa-ray)" style={D(200 + i * 90)} />
        ))}
      </g>
      <circle cx="320" cy="64" r="5" fill="var(--burgundy)" className="pa-fade" style={D(100)} />
      <circle cx="320" cy="64" r="16" fill="none" stroke="var(--rose)" strokeWidth="1" className="pa-fade" style={D(300)} />

      {/* the folded ribbon: peak at 46 degrees, burgundy leg + metal leg, crease between */}
      <g className="pa-rise" style={D(400)}>
        <polygon points="320,200 20,512 20,602 320,290" fill="url(#aa-burg)" />
        <polygon points="320,200 620,512 620,602 320,290" fill="url(#aa-metal)" />
        <line x1="320" y1="200" x2="320" y2="290" stroke="var(--surface)" strokeWidth="1.5" opacity="0.7" />
        <line x1="320" y1="200" x2="20" y2="512" stroke="var(--rose-pale)" strokeWidth="1.5" opacity="0.8" />
        <line x1="320" y1="200" x2="620" y2="512" stroke="var(--surface)" strokeWidth="1.5" opacity="0.8" />
      </g>

      {/* outline wordmark */}
      <text x="320" y="728" textAnchor="middle" lang="hi" fill="none" stroke="var(--grey-metal)" strokeWidth="1" className="pa-fade"
        style={{ fontFamily: 'var(--font-devanagari)', fontSize: 120, fontWeight: 700, ...D(1100) }}>आलोक</text>

      {/* register marks */}
      <g stroke="var(--grey-warm)" strokeWidth="1" fill="none">
        <path d="M0 24h12M6 18v12" />
        <path d="M628 24h12M634 18v12" />
      </g>
    </svg>
  );
}
