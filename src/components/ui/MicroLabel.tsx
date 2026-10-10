/**
 * MicroLabel — §7.2 / §15.1
 * 0.75rem uppercase, tracking 0.16em, grey-metal, weight 600.
 * 24px burgundy rule to the left. Numbering was removed site-wide (round 2, ask 9);
 * the `number` prop is accepted for backwards compatibility but is not rendered.
 * Used as eyebrows for sections and card groups.
 */

interface MicroLabelProps {
  children: React.ReactNode;
  number?: string | number;
  showRule?: boolean;
  className?: string;
  tone?: 'light' | 'dark';
}

export default function MicroLabel({
  children,
  showRule = false, /* labels read as plain text; the rule is opt-in */
  className = '',
  tone = 'light',
}: MicroLabelProps) {
  const isDark = tone === 'dark';
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
            background: isDark ? 'var(--rose)' : 'var(--burgundy)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: isDark ? 'var(--rose-pale)' : 'var(--muted)',
          fontWeight: 600,
          fontFamily: 'var(--font-archivo, sans-serif)',
        }}
      >
        {children}
      </span>
    </div>
  );
}
