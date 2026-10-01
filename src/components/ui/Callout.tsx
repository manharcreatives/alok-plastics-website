/**
 * Callout — §15.1
 * Blush background, 4px burgundy left rule, micro heading.
 * Matches the brand PDF callout style — §7.2 .callout-blush.
 */

interface CalloutProps {
  heading?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Callout({ heading, children, className = '' }: CalloutProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--blush)',
        borderLeft: '4px solid var(--burgundy)',
        borderRadius: '0 var(--radius-card) var(--radius-card) 0',
        padding: 'var(--space-md)',
      }}
      role="note"
    >
      {heading && (
        <p style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          fontWeight: 600,
          color: 'var(--burgundy)',
          marginBottom: 8,
          fontFamily: 'var(--font-archivo, sans-serif)',
        }}>
          {heading}
        </p>
      )}
      <div style={{
        fontSize: '0.9375rem',
        lineHeight: 1.6,
        color: 'var(--body)',
      }}>
        {children}
      </div>
    </div>
  );
}
