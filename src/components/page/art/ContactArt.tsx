/**
 * ContactArt — a schematic site plan as a drawing sheet. The plot grid is illustrative
 * (NOT to scale, no coordinates); only the address words are real: Plot No-06,
 * Industrial Area Phase II, Ram Darbar, Chandigarh 160003.
 */
import { D } from './artCss';

const PLOTS: [number, number, number, number][] = [
  [64, 64, 120, 100], [196, 64, 120, 100], [328, 64, 120, 100], [460, 64, 116, 100],
  [64, 176, 120, 90], [196, 176, 120, 90], [328, 176, 120, 90], [460, 176, 116, 90],
  [64, 490, 120, 90], [196, 490, 120, 90], [460, 490, 116, 90],
  [64, 592, 120, 90], [196, 592, 120, 90], [328, 592, 120, 90], [460, 592, 116, 90],
];

export default function ContactArt() {
  return (
    <svg className="pa-svg" viewBox="0 0 640 760" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      {/* sheet */}
      <rect x="24" y="24" width="592" height="712" fill="var(--surface)" stroke="var(--grey-metal)" strokeWidth="1" className="pa-fade" style={D(0)} />
      <rect x="40" y="40" width="560" height="680" fill="none" stroke="var(--grey-warm)" strokeWidth="1" />

      {/* plots (illustrative) */}
      <g fill="none" stroke="var(--grey-warm)" strokeWidth="1">
        {PLOTS.map(([x, y, w, h], i) => (
          <rect key={i} className="pa-draw" pathLength={1} x={x} y={y} width={w} height={h} style={D(150 + i * 60)} />
        ))}
      </g>

      {/* road: two kerb lines + dashed centre line */}
      <g stroke="var(--grey-metal)" strokeWidth="1" fill="none">
        <path className="pa-draw" pathLength={1} d="M40 300H600" style={D(500)} />
        <path className="pa-draw" pathLength={1} d="M40 440H600" style={D(600)} />
      </g>
      <path d="M40 370H600" stroke="var(--grey-warm)" strokeWidth="1" strokeDasharray="10 8" fill="none" />
      <text x="320" y="364" textAnchor="middle" className="pa-mono pa-fade" fill="var(--grey-metal)" style={{ fontSize: 13, ...D(1000) }}>INDUSTRIAL AREA PHASE II</text>
      <text x="320" y="396" textAnchor="middle" className="pa-mono pa-fade" fill="var(--grey-metal)" style={{ fontSize: 11, ...D(1100) }}>RAM DARBAR</text>

      {/* THE plot */}
      <g className="pa-rise" style={D(900)}>
        <rect x="328" y="490" width="120" height="90" fill="var(--burgundy)" />
        <path d="M328 490h14M328 490v14M448 580h-14M448 580v-14" stroke="var(--rose-pale)" strokeWidth="1.5" fill="none" />
        {/* marker stem + pin on the plot */}
        <line x1="388" y1="535" x2="388" y2="448" stroke="var(--burgundy)" strokeWidth="1.5" />
        <circle cx="388" cy="535" r="5" fill="var(--surface)" />
      </g>
      <g className="pa-fade" style={D(1300)}>
        <line x1="448" y1="535" x2="500" y2="535" stroke="var(--burgundy)" strokeWidth="1" />
        <rect x="500" y="513" width="92" height="44" fill="var(--surface)" stroke="var(--burgundy)" strokeWidth="1" />
        <text x="546" y="530" textAnchor="middle" className="pa-mono" fill="var(--burgundy)" style={{ fontSize: 11 }}>PLOT</text>
        <text x="546" y="548" textAnchor="middle" fill="var(--ink)" style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-archivo)' }}>No-06</text>
      </g>

      {/* north arrow */}
      <g className="pa-fade" style={D(1200)} stroke="var(--grey-metal)" strokeWidth="1" fill="none">
        <path d="M562 140V90M562 90l-6 12M562 90l6 12" />
        <text x="562" y="80" textAnchor="middle" className="pa-mono" fill="var(--grey-metal)" stroke="none" style={{ fontSize: 12 }}>N</text>
      </g>

      {/* title block */}
      <g className="pa-fade" style={D(1400)}>
        <rect x="64" y="694" width="512" height="1" fill="var(--grey-metal)" />
        <text x="64" y="712" className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 11 }}>SITE PLAN · SCHEMATIC, NOT TO SCALE</text>
        <text x="576" y="712" textAnchor="end" className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 11 }}>CHANDIGARH 160003</text>
      </g>
    </svg>
  );
}
