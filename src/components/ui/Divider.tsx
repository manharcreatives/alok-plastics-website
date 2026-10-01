/**
 * Divider — §15.1
 * Default: 1px --grey-cloud horizontal rule.
 * Diagonal: 2px --grey-warm, slightly rotated (folded-sheet edge, §3 rule 9).
 * Optional label: text centered on the rule.
 */

import '@/styles/ui.css';

interface DividerProps {
  variant?: 'default' | 'diagonal';
  label?: string;
  className?: string;
}

export default function Divider({ variant = 'default', label, className = '' }: DividerProps) {
  if (label) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          margin: 'var(--space-lg) 0',
        }}
        role="separator"
      >
        <span style={{ flex: 1, height: 1, background: 'var(--grey-cloud)' }} />
        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--muted)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--grey-cloud)' }} />
      </div>
    );
  }

  return (
    <hr
      className={`divider${variant === 'diagonal' ? ' divider--diagonal' : ''} ${className}`.trim()}
      role="separator"
    />
  );
}
