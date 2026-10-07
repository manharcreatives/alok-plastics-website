/**
 * EnquiryArt — engineering-style technical schematic for the Get a Quote hero.
 * Front view (disc/bush) + cross-section + 5 callouts: Part Name, Material,
 * Quantity, Drawing/Sample, Dimension/Size. All text ≥14px so labels are legible
 * at display size. Burgundy leaders + monospace labels follow the drawing-sheet
 * visual system used across the site.
 */
import { D } from './artCss';

const HEADING_SIZE = 11;

// cx=208, cy=295 for front-view centre
const CX = 208;
const CY = 295;
const R_OUTER = 122;   // outer body
const R_INNER = 72;    // shoulder / inner step
const R_BORE  = 30;    // through-bore

// Callouts: anchor point on drawing → elbow x → end x → label y, text
const CALLOUTS = [
  { ax: CX,          ay: CY - R_OUTER,      ex: 604, ly: 134, label: 'PART NAME' },
  { ax: CX + R_INNER, ay: CY - 30,          ex: 604, ly: 214, label: 'MATERIAL' },
  { ax: CX,          ay: CY,                ex: 604, ly: 294, label: 'DRAWING / SAMPLE' },
  { ax: CX,          ay: CY + R_OUTER,      ex: 604, ly: 378, label: 'QUANTITY' },
  { ax: 208,         ay: 518,               ex: 604, ly: 490, label: 'DIMENSION / SIZE' },
];

export default function EnquiryArt() {
  return (
    <svg
      className="pa-svg"
      viewBox="0 0 640 760"
      preserveAspectRatio="xMinYMid meet"
      role="presentation"
      focusable="false"
    >
      {/* ── Outer frame ──────────────────────────────────────────────── */}
      <rect
        x="16" y="16" width="608" height="728"
        fill="var(--surface)" stroke="var(--grey-metal)" strokeWidth="1"
        className="pa-fade" style={D(0)}
      />

      {/* ── Header strip ─────────────────────────────────────────────── */}
      <rect
        x="16" y="16" width="608" height="48"
        fill="none" stroke="var(--grey-metal)" strokeWidth="1"
        className="pa-fade" style={D(0)}
      />
      <text
        x="30" y="36"
        fontFamily="var(--font-mono, monospace)"
        fontSize={HEADING_SIZE}
        letterSpacing="0.16em"
        fill="var(--grey-metal)"
        className="pa-fade" style={D(100)}
      >PART DRAWING</text>
      <text
        x="30" y="53"
        fontFamily="var(--font-mono, monospace)"
        fontSize={HEADING_SIZE}
        letterSpacing="0.16em"
        fill="var(--burgundy)"
        className="pa-fade" style={D(150)}
      >TECHNICAL SCHEMATIC</text>

      {/* vertical divider in header */}
      <line x1="420" y1="16" x2="420" y2="64" stroke="var(--grey-metal)" strokeWidth="1" className="pa-fade" style={D(100)} />
      <text x="434" y="36" fontFamily="var(--font-mono, monospace)" fontSize={HEADING_SIZE} letterSpacing="0.14em" fill="var(--grey-metal)" className="pa-fade" style={D(100)}>ALOK PLASTICS</text>
      <text x="434" y="53" fontFamily="var(--font-mono, monospace)" fontSize={HEADING_SIZE} letterSpacing="0.14em" fill="var(--grey-metal)" className="pa-fade" style={D(150)}>CHANDIGARH</text>

      {/* ── Vertical divider: drawing area | callout area ────────────── */}
      <line x1="386" y1="64" x2="386" y2="700" stroke="var(--grey-warm)" strokeWidth="1" strokeDasharray="4 4" className="pa-fade" style={D(200)} />

      {/* ── Centre lines (front view) ────────────────────────────────── */}
      <g stroke="var(--burgundy)" strokeWidth="1" strokeDasharray="14 5 3 5" fill="none" className="pa-fade" style={D(400)}>
        {/* horizontal */}
        <line x1="52" y1={CY} x2="370" y2={CY} />
        {/* vertical */}
        <line x1={CX} y1="80" x2={CX} y2="450" />
      </g>

      {/* ── Front view circles ───────────────────────────────────────── */}
      {/* Outer body */}
      <circle className="pa-draw" pathLength={1} cx={CX} cy={CY} r={R_OUTER}
        fill="none" stroke="var(--ink)" strokeWidth="2" style={D(200)} />
      {/* Inner shoulder */}
      <circle className="pa-draw" pathLength={1} cx={CX} cy={CY} r={R_INNER}
        fill="none" stroke="var(--ink)" strokeWidth="1.5" style={D(350)} />
      {/* Bore */}
      <circle className="pa-draw" pathLength={1} cx={CX} cy={CY} r={R_BORE}
        fill="none" stroke="var(--ink)" strokeWidth="1.5" style={D(500)} />

      {/* Spoke / rib lines (between shoulder and outer) */}
      <g stroke="var(--grey-metal)" strokeWidth="1" fill="none" opacity="0.55" className="pa-fade" style={D(600)}>
        {[0, 60, 120, 180, 240, 300].map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={CX + R_BORE * Math.cos(rad)} y1={CY + R_BORE * Math.sin(rad)}
              x2={CX + R_INNER * Math.cos(rad)} y2={CY + R_INNER * Math.sin(rad)}
            />
          );
        })}
      </g>

      {/* Hatching strip (material zone between shoulder and outer, top-right quadrant) */}
      <clipPath id="eq-hatch-clip">
        <path d={`M ${CX} ${CY} m ${R_INNER} 0 a ${R_INNER} ${R_INNER} 0 0 1 ${-R_INNER} ${-R_INNER} L ${CX + R_OUTER} ${CY - R_OUTER} a ${R_OUTER} ${R_OUTER} 0 0 0 ${-R_OUTER} ${R_OUTER} Z`} />
      </clipPath>
      <g stroke="var(--grey-metal)" strokeWidth="0.75" opacity="0.3" className="pa-fade" style={D(650)}>
        {[-60, -40, -20, 0, 20, 40, 60, 80, 100, 120, 140].map(off => (
          <line key={off}
            x1={CX + off - 20} y1={CY - R_OUTER - 10}
            x2={CX + off + R_OUTER + 10} y2={CY - 10}
          />
        ))}
      </g>

      {/* ── Side view (cross-section) ─────────────────────────────────── */}
      <text x={CX} y="477" textAnchor="middle"
        fontFamily="var(--font-mono, monospace)" fontSize={HEADING_SIZE}
        letterSpacing="0.14em" fill="var(--grey-metal)"
        className="pa-fade" style={D(700)}
      >SECTION A–A</text>

      {/* Profile outer rectangle */}
      <rect className="pa-draw" pathLength={1}
        x={CX - 108} y="486" width="216" height="68"
        fill="none" stroke="var(--ink)" strokeWidth="1.5" style={D(700)}
      />
      {/* Bore walls (dashed centre lines through profile) */}
      <g stroke="var(--ink)" strokeWidth="1" strokeDasharray="8 4" fill="none" className="pa-fade" style={D(850)}>
        <line x1={CX - R_BORE} y1="484" x2={CX - R_BORE} y2="556" />
        <line x1={CX + R_BORE} y1="484" x2={CX + R_BORE} y2="556" />
      </g>
      {/* Shoulder step lines inside profile */}
      <g stroke="var(--grey-metal)" strokeWidth="1" strokeDasharray="6 3" fill="none" className="pa-fade" style={D(850)}>
        <line x1={CX - R_INNER} y1="486" x2={CX - R_INNER} y2="554" />
        <line x1={CX + R_INNER} y1="486" x2={CX + R_INNER} y2="554" />
      </g>

      {/* ── Dimension line (outer diameter) ──────────────────────────── */}
      <g stroke="var(--grey-metal)" strokeWidth="1" fill="none" className="pa-fade" style={D(900)}>
        {/* extension lines */}
        <line x1={CX - R_OUTER} y1={CY} x2={CX - R_OUTER} y2="576" strokeDasharray="3 3" strokeWidth="0.75" />
        <line x1={CX + R_OUTER} y1={CY} x2={CX + R_OUTER} y2="576" strokeDasharray="3 3" strokeWidth="0.75" />
        {/* dimension bar */}
        <line x1={CX - R_OUTER} y1="572" x2={CX + R_OUTER} y2="572" />
        {/* tick marks */}
        <line x1={CX - R_OUTER} y1="564" x2={CX - R_OUTER} y2="580" />
        <line x1={CX + R_OUTER} y1="564" x2={CX + R_OUTER} y2="580" />
        {/* arrowheads */}
        <path d={`M${CX - R_OUTER} 572 l10-3.5 0 7z`} fill="var(--grey-metal)" />
        <path d={`M${CX + R_OUTER} 572 l-10-3.5 0 7z`} fill="var(--grey-metal)" />
      </g>
      <text x={CX} y="596" textAnchor="middle"
        fontFamily="var(--font-mono, monospace)" fontSize={13}
        fill="var(--grey-metal)" letterSpacing="0.06em"
        className="pa-fade" style={D(950)}
      >Ø</text>

      {/* ── Callout lines + labels ────────────────────────────────────── */}
      {CALLOUTS.map((c, i) => (
        <g key={c.label} className="pa-fade" style={D(1000 + i * 140)}>
          {/* dot at part */}
          <circle cx={c.ax} cy={c.ay} r="3.5" fill="var(--burgundy)" />
          {/* leader to column */}
          <polyline
            points={`${c.ax},${c.ay} ${c.ax},${c.ly} ${c.ex - 160},${c.ly}`}
            fill="none" stroke="var(--burgundy)" strokeWidth="1"
          />
          {/* horizontal rule in callout column */}
          <line x1="390" y1={c.ly} x2="608" y2={c.ly} stroke="var(--grey-warm)" strokeWidth="0.75" />
          {/* label */}
          <text
            x="394" y={c.ly - 5}
            fontFamily="var(--font-mono, monospace)"
            fontSize={HEADING_SIZE}
            letterSpacing="0.16em"
            fill="var(--burgundy)"
          >{c.label}</text>
          {/* blank line below label showing "fill in here" */}
          <line x1="394" y1={c.ly + 8} x2="600" y2={c.ly + 8} stroke="var(--grey-warm)" strokeWidth="1" strokeDasharray="3 4" />
        </g>
      ))}

      {/* ── Title block (bottom-right) ────────────────────────────────── */}
      <g className="pa-fade" style={D(1750)}>
        <rect x="390" y="655" width="230" height="89" fill="none" stroke="var(--grey-metal)" strokeWidth="1" />
        <line x1="390" y1="684" x2="620" y2="684" stroke="var(--grey-metal)" strokeWidth="0.75" />
        <line x1="390" y1="714" x2="620" y2="714" stroke="var(--grey-metal)" strokeWidth="0.75" />
        <text x="404" y="675" fontFamily="var(--font-mono, monospace)" fontSize={HEADING_SIZE} letterSpacing="0.14em" fill="var(--grey-metal)">DRAWN BY</text>
        <text x="404" y="705" fontFamily="var(--font-mono, monospace)" fontSize={13} fill="var(--ink)" fontWeight="600" letterSpacing="0.06em">ALOK PLASTICS</text>
        <text x="404" y="735" fontFamily="var(--font-mono, monospace)" fontSize={HEADING_SIZE} letterSpacing="0.14em" fill="var(--grey-metal)">CHANDIGARH · SINCE 1998</text>
      </g>

      {/* ── Drawing label (front view) ────────────────────────────────── */}
      <text x={CX} y="100"
        textAnchor="middle"
        fontFamily="var(--font-mono, monospace)"
        fontSize={HEADING_SIZE}
        letterSpacing="0.14em"
        fill="var(--grey-metal)"
        className="pa-fade" style={D(300)}
      >FRONT VIEW</text>
    </svg>
  );
}
