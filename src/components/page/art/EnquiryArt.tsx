/**
 * EnquiryArt — a generic part blueprint (front + side view, centre-lines, bore) with callouts
 * naming what a good enquiry contains. Schematic only: no dimensions, no product claim.
 */
import { D } from './artCss';

const CALLOUTS: { y: number; tx: number; ty: number; label: string }[] = [
  { y: 150, tx: 322, ty: 232, label: 'PART NAME' },
  { y: 270, tx: 274, ty: 280, label: 'MATERIAL' },
  { y: 450, tx: 330, ty: 548, label: 'QUANTITY' },
  { y: 560, tx: 356, ty: 560, label: 'DRAWING / SAMPLE' },
];

export default function EnquiryArt() {
  return (
    <svg className="pa-svg" viewBox="0 0 640 760" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      <rect x="24" y="24" width="592" height="712" fill="var(--surface)" stroke="var(--grey-metal)" strokeWidth="1" className="pa-fade" style={D(0)} />

      {/* front view */}
      <g fill="none" stroke="var(--ink)" strokeWidth="1.5">
        <circle className="pa-draw" pathLength={1} cx="240" cy="280" r="116" style={D(200)} />
        <circle className="pa-draw" pathLength={1} cx="240" cy="280" r="78" style={D(400)} />
        <circle className="pa-draw" pathLength={1} cx="240" cy="280" r="34" style={D(600)} />
      </g>
      {/* ribs */}
      <g stroke="var(--grey-metal)" strokeWidth="1" fill="none" opacity="0.5">
        {[0, 60, 120, 180, 240, 300].map(a => (
          <line key={a} x1={240 + 34 * Math.cos((a * Math.PI) / 180)} y1={280 + 34 * Math.sin((a * Math.PI) / 180)}
            x2={240 + 116 * Math.cos((a * Math.PI) / 180)} y2={280 + 116 * Math.sin((a * Math.PI) / 180)} />
        ))}
      </g>
      {/* centre lines */}
      <g stroke="var(--burgundy)" strokeWidth="1" strokeDasharray="14 5 3 5" fill="none" className="pa-fade" style={D(800)}>
        <path d="M96 280H384M240 136V424" />
      </g>

      {/* side view */}
      <g fill="none" stroke="var(--ink)" strokeWidth="1.5" className="pa-fade" style={D(900)}>
        <rect x="124" y="500" width="232" height="96" />
      </g>
      <g stroke="var(--grey-metal)" strokeWidth="1" strokeDasharray="6 4" fill="none" className="pa-fade" style={D(900)}>
        <path d="M206 500V596M274 500V596" />
      </g>

      {/* dimension line */}
      <g stroke="var(--grey-metal)" strokeWidth="1" fill="none" className="pa-fade" style={D(1000)}>
        <path d="M124 636H356M124 628v16M356 628v16" />
        <path d="M124 636l8-4v8zM356 636l-8-4v8z" fill="var(--grey-metal)" />
      </g>
      <text x="240" y="664" textAnchor="middle" className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 13 }}>Ø ?</text>

      {/* callouts */}
      {CALLOUTS.map((c, i) => (
        <g key={c.label} className="pa-fade" style={D(1100 + i * 150)}>
          <path d={`M${c.tx} ${c.ty}L440 ${c.y}H472`} stroke="var(--burgundy)" strokeWidth="1" fill="none" />
          <circle cx={c.tx} cy={c.ty} r="3.5" fill="var(--burgundy)" />
          <text x="480" y={c.y + 4} className="pa-mono" fill="var(--ink)" style={{ fontSize: 12, fontWeight: 500 }}>{c.label}</text>
        </g>
      ))}

      {/* title block */}
      <g className="pa-fade" style={D(1700)}>
        <rect x="412" y="676" width="172" height="40" fill="none" stroke="var(--grey-metal)" strokeWidth="1" />
        <text x="424" y="692" className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 10 }}>ALOK PLASTICS</text>
        <text x="424" y="706" className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 10 }}>SCHEMATIC</text>
      </g>
    </svg>
  );
}
