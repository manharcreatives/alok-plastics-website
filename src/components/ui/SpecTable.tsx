/**
 * SpecTable — §15.1
 * Drawing-sheet title-block style.
 * Header row: burgundy bg, white micro text.
 * Rows: alternating --canvas stripe.
 * Numbers: tabular-nums (font-feature-settings "tnum").
 * Accessibility: <th scope="col"> / <th scope="row">.
 */

export interface SpecTableRow {
  label: string;
  values: (string | number | null)[];
}

interface SpecTableProps {
  caption?: string;
  columns: string[];
  rows: SpecTableRow[];
  className?: string;
}

export default function SpecTable({ caption, columns, rows, className = '' }: SpecTableProps) {
  return (
    <div
      className={className}
      style={{
        overflowX: 'auto',
        border: '1px solid var(--grey-warm)',
        borderRadius: 'var(--radius-card)',
        /* Lit top edge — §3 rule 9 */
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9)',
      }}
    >
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.875rem',
        fontFeatureSettings: '"tnum"',
        minWidth: 400,
      }}>
        {caption && (
          <caption style={{
            captionSide: 'top',
            textAlign: 'left',
            padding: '10px var(--space-md)',
            background: 'var(--burgundy)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: 'var(--font-archivo, sans-serif)',
          }}>
            {caption}
          </caption>
        )}

        <thead>
          <tr>
            {/* Row label column header */}
            <th
              scope="col"
              style={{
                background: 'var(--burgundy)',
                color: 'white',
                padding: '8px var(--space-md)',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-archivo, sans-serif)',
                borderRight: '1px solid rgba(255,255,255,0.15)',
                minWidth: 100,
              }}
            >
              Specification
            </th>
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                style={{
                  background: 'var(--burgundy)',
                  color: 'white',
                  padding: '8px var(--space-md)',
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontFamily: 'var(--font-archivo, sans-serif)',
                  borderRight: i < columns.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? 'var(--surface)' : 'var(--canvas)',
                borderBottom: '1px solid var(--grey-cloud)',
              }}
            >
              <th
                scope="row"
                style={{
                  padding: '8px var(--space-md)',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  fontSize: '0.875rem',
                  borderRight: '1px solid var(--grey-cloud)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-archivo, sans-serif)',
                }}
              >
                {row.label}
              </th>
              {row.values.map((val, vi) => (
                <td
                  key={vi}
                  style={{
                    padding: '8px var(--space-md)',
                    textAlign: 'right',
                    color: val === null ? 'var(--muted)' : 'var(--body)',
                    borderRight: vi < row.values.length - 1 ? '1px solid var(--grey-cloud)' : 'none',
                    fontSize: '0.875rem',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {val === null ? '—' : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
