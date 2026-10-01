/**
 * MicroLabel — §7.2 / §15.1
 * 0.75rem uppercase, tracking 0.16em, grey-metal, weight 600.
 * Optional: sequential number in burgundy + 24px horizontal rule to the left.
 * Used as eyebrows for sections and card groups.
 */

interface MicroLabelProps {
  children: React.ReactNode;
  number?: string | number;
  showRule?: boolean;
  className?: string;
}

export default function MicroLabel({
  children,
  number,
  showRule = true,
  className = '',
}: MicroLabelProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {showRule && (
        <span
          aria-hidden="true"
          style={{
            width: 24,
            height: 2,
            background: 'var(--burgundy)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {number !== undefined && (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.6875rem',
            color: 'var(--burgundy)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            minWidth: '1.5ch',
          }}
        >
          {typeof number === 'number' ? String(number).padStart(2, '0') : number}
        </span>
      )}
      <span
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--muted)',
          fontWeight: 600,
          fontFamily: 'var(--font-archivo, sans-serif)',
        }}
      >
        {children}
      </span>
    </div>
  );
}
