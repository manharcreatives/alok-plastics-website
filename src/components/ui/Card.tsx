/**
 * Card — §15.1
 * surface + 1px grey-warm + 2px radius + lit top edge (§3 rule 9).
 * Variants:
 *   plain    — default surface card
 *   drawing  — crop marks at corners (drawing-sheet aesthetic)
 *   feature  — burgundy bg, white text
 *   tint     — blush bg, burgundy-tinted top edge
 *
 * CSS classes in ui.css handle hover lift + shadows.
 */

import '@/styles/ui.css';
import type { ElementType } from 'react';

export type CardVariant = 'plain' | 'drawing' | 'feature' | 'tint';

interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  as?: ElementType;
}

/* Crop mark L-shape for drawing variant */
function CropMark({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const top = pos.startsWith('t');
  const left = pos.endsWith('l');
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        [top ? 'top' : 'bottom']: 5,
        [left ? 'left' : 'right']: 5,
        width: 12,
        height: 12,
        borderTop: top ? `1px solid var(--grey-metal)` : 'none',
        borderBottom: !top ? `1px solid var(--grey-metal)` : 'none',
        borderLeft: left ? `1px solid var(--grey-metal)` : 'none',
        borderRight: !left ? `1px solid var(--grey-metal)` : 'none',
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    />
  );
}

const PADDING_MAP = {
  none: 0,
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
};

export default function Card({
  variant = 'plain',
  padding = 'md',
  className = '',
  children,
  style,
  as: Tag = 'div' as ElementType,
}: CardProps) {
  const classes = [
    'card',
    `card--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      className={classes}
      style={{ padding: PADDING_MAP[padding], ...style }}
    >
      {variant === 'drawing' && (
        <>
          <CropMark pos="tl" />
          <CropMark pos="tr" />
          <CropMark pos="bl" />
          <CropMark pos="br" />
        </>
      )}
      {children}
    </Tag>
  );
}
