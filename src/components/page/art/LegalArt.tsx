/**
 * LegalArt: a quiet drawing-sheet title block (LEGAL / REV TBD), not a generic document icon.
 * Pure furniture from the site's drawing language: sheet, crop marks, ruled title block, fold corner.
 * No legal claims, no text beyond the page's own title and honest status words.
 */
import { D } from './artCss';

export default function LegalArt({ title = 'Legal' }: { title?: string }) {
  const rows: [string, string][] = [['DOCUMENT', title.toUpperCase()], ['STATUS', 'BEING FINALISED'], ['REV', 'TBD']];
  return (
    <svg className="pa-svg" viewBox="90 268 520 312" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      <g className="pa-rise" style={D(200)}>
        <rect x="120" y="300" width="460" height="240" fill="var(--surface)" stroke="var(--grey-metal)" strokeWidth="1" />
        <rect x="132" y="312" width="436" height="216" fill="none" stroke="var(--grey-warm)" strokeWidth="1" />
        <path d="M132 312h40l-40 40Z" fill="var(--blush)" stroke="none" />
      </g>
      <g stroke="var(--grey-warm)" strokeWidth="1" fill="none">
        {[0, 1, 2].map(i => (
          <line key={i} className="pa-draw" pathLength={1} x1="132" y1={372 + i * 52} x2="568" y2={372 + i * 52} style={D(500 + i * 120)} />
        ))}
        <line className="pa-draw" pathLength={1} x1="272" y1="372" x2="272" y2="528" style={D(700)} />
      </g>
      <g className="pa-fade" style={D(900)}>
        <text x="148" y="352" className="pa-mono" fill="var(--burgundy)" style={{ fontSize: 14, fontWeight: 700 }}>ALOK PLASTICS</text>
        <text x="556" y="352" textAnchor="end" className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 13 }}>LEGAL</text>
        {rows.map(([k, v], i) => (
          <g key={k}>
            <text x="148" y={403 + i * 52} className="pa-mono" fill="var(--grey-metal)" style={{ fontSize: 13 }}>{k}</text>
            <text x="288" y={403 + i * 52} className="pa-mono" fill="var(--ink)" style={{ fontSize: 15, fontWeight: 600 }}>{v}</text>
          </g>
        ))}
      </g>
      <line className="pa-draw" pathLength={1} x1="120" y1="300" x2="200" y2="300" stroke="var(--burgundy)" strokeWidth="3" style={D(400)} />
      <g stroke="var(--grey-warm)" strokeWidth="1" fill="none">
        <path d="M100 280h12M106 274v12" /><path d="M588 560h12M594 554v12" />
      </g>
    </svg>
  );
}
