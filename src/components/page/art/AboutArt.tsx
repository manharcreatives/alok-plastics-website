/**
 * AboutArt — the folded A-peak as a lit sheet: light rays from above (आलोक = light),
 * a burgundy leg and a metal-grey leg meeting at a crease. The original logo hangs from the crease on a
 * single fine burgundy suspension line (one hang point, on the same axis as the light source above),
 * drawn in the same hairline language as the rays. No other lettering.
 * Pure geometry from the logo's language; no data.
 */
import Logo from '@/components/brand/Logo';
import { D } from './artCss';

/* Suspension geometry (viewBox units). The crease underside of the peak is (320, 290); the logo keeps
   its master proportions (2620 x 957) and sits inside the V's hollow, clear of both legs. */
const HANG = { x: 320, top: 290, ring: 456 };
const LOGO_W = 230;
const LOGO_H = Math.round((LOGO_W * 957) / 2620);
const LOGO_Y = HANG.ring + 8;

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

      {/* central suspension: anchor at the crease, one hairline cable, a small shackle ring */}
      <g fill="none">
        <line className="pa-draw" pathLength={1} x1={HANG.x} y1={HANG.top + 14} x2={HANG.x} y2={HANG.ring - 4}
          stroke="var(--burgundy)" strokeWidth="1.25" strokeOpacity="0.85" style={D(1000)} />
        <circle cx={HANG.x} cy={HANG.top + 9} r="5" stroke="var(--rose)" strokeWidth="1" className="pa-fade" style={D(900)} />
        <circle cx={HANG.x} cy={HANG.ring} r="4" stroke="var(--burgundy)" strokeWidth="1.25" className="pa-fade" style={D(1600)} />
      </g>
      <circle cx={HANG.x} cy={HANG.top + 9} r="2" fill="var(--burgundy)" className="pa-fade" style={D(900)} />

      {/* the original logo, hanging */}
      <g className="pa-fade" style={D(1700)}>
        <Logo variant="color" lockup="full" x={HANG.x - LOGO_W / 2} y={LOGO_Y} width={LOGO_W} height={LOGO_H} aria-hidden="true" focusable="false" />
      </g>

      {/* register marks */}
      <g stroke="var(--grey-warm)" strokeWidth="1" fill="none">
        <path d="M0 24h12M6 18v12" />
        <path d="M628 24h12M634 18v12" />
      </g>
    </svg>
  );
}
