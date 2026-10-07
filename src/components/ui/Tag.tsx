/**
 * Tag — §15.1
 * Inline label for materials, machines, categories.
 * Variants: default (blush + burgundy), muted, material
 * 2px radius, 0.6875rem micro type, uppercase.
 * Material preset: NYLON · HDPE · PPCP · BRASS · SS · CAST IRON
 */

import '@/styles/ui.css';

export type TagVariant = 'default' | 'muted' | 'material';

export type MaterialName = 'nylon' | 'hdpe' | 'ppcp' | 'brass' | 'ss' | 'cast-iron';

const MATERIAL_LABELS: Record<MaterialName, string> = {
  nylon: 'Nylon',
  hdpe: 'HDPE',
  ppcp: 'PPCP',
  brass: 'Brass',
  ss: 'SS',
  'cast-iron': 'Cast iron',
};

interface TagProps {
  children?: React.ReactNode;
  variant?: TagVariant;
  material?: MaterialName;
  className?: string;
}

export default function Tag({
  children,
  variant = 'default',
  material,
  className = '',
}: TagProps) {
  const isMaterial = variant === 'material' || material !== undefined;
  const resolvedVariant = isMaterial ? 'material' : variant;

  const label = material ? MATERIAL_LABELS[material] : children;

  return (
    <span
      className={`tag tag--${resolvedVariant} ${className}`.trim()}
    >
      {isMaterial && (
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--grey-metal)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
}
