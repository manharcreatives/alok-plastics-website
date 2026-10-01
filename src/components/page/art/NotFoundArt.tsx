/**
 * NotFoundArt: a part that is not on the sheet. Dashed ghost outline of a generic ring part,
 * centre-lines, a dimension line that ends in "?" and an outlined 404. Schematic only.
 */
import { D } from './artCss';

export default function NotFoundArt() {
  return (
    <svg className="pa-svg" viewBox="0 0 640 760" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      <text x="320" y="236" textAnchor="middle" fill="none" stroke="var(--grey-warm)" strokeWidth="1.5" className="pa-fade"
        style={{ fontFamily: 'var(--font-archivo)', fontWeight: 800, fontSize: 220, letterSpacing: '-0.04em', ...D(200) }}>404</text>

      <g fill="none" stroke="var(--grey-metal)" strokeWidth="1.5" strokeDasharray="10 8">
        <circle className="pa-fade" cx="320" cy="470" r="130" style={D(500)} />
        <circle className="pa-fade" cx="320" cy="470" r="86" style={D(650)} />
        <circle className="pa-fade" cx="320" cy="470" r="38" style={D(800)} />
      </g>
      <g stroke="var(--burgundy)" strokeWidth="1" strokeDasharray="14 5 3 5" fill="none" className="pa-fade" style={D(950)}>
        <path d="M160 470H480M320 310V630" />
      </g>
      <g stroke="var(--grey-metal)" strokeWidth="1" fill="none" className="pa-fade" style={D(1100)}>
        <path d="M190 668H450M190 660v16M450 660v16" />
        <path d="M190 668l8-4v8zM450 668l-8-4v8z" fill="var(--grey-metal)" />
      </g>
      <text x="320" y="696" textAnchor="middle" className="pa-mono pa-fade" fill="var(--grey-metal)" style={{ fontSize: 14, ...D(1200) }}>Ø ?</text>
    </svg>
  );
}
