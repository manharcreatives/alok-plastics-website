/**
 * Drawing-sheet primitives shared by the products / industries hero artwork.
 * Pure SVG, tokens only, no data of their own. Server-safe.
 */
import type { CSSProperties } from 'react';
import { pictogramPaths, type PictogramName } from '@/components/brand/Pictogram';
import { extraPictos, isExtraPicto } from './extraPictos';

/** Any part slug that has a drawn pictogram (brand set or the extra part set). */
export type PartPictoName = PictogramName | keyof typeof extraPictos;

/** Drawn bounding box of each pictogram inside its 48-unit box: [x, y, w, h] (measured once with getBBox). */
export const PICTO_BOX: Partial<Record<PictogramName, [number, number, number, number]>> = {
  'f-bush': [8, 6, 26, 36], 'connecting-bush': [4, 18, 40, 12], 'door-lock': [10, 16, 36, 24], hinge: [8, 8, 32, 32],
  'float-valve': [6, 2, 36, 32], 'push-cock': [6, 10, 36, 32], 'waste-pipe': [6, 14, 36, 20], 'ventilation-jalli': [8, 8, 32, 32],
  'adjustable-leg-insert': [12, 14, 24, 30], gasket: [6, 6, 36, 36],
  'water-cooler': [10, 8, 28, 34], 'display-counter': [6, 14, 36, 28], 'deep-freezer': [6, 14, 36, 28],
};

/**
 * Place a pictogram so its DRAWN artwork (not its 48-unit box) is centred on (cx, cy) and its longest side
 * measures `longest` units. Returns the group origin + size and the absolute drawn rectangle.
 */
export function fitPicto(name: PartPictoName, cx: number, cy: number, longest: number) {
  const [bx, by, bw, bh] = (isExtraPicto(name) ? extraPictos[name].box : PICTO_BOX[name as PictogramName]) ?? [0, 0, 48, 48];
  const s = longest / Math.max(bw, bh);
  const w = bw * s;
  const h = bh * s;
  return {
    x: cx - (bx + bw / 2) * s,
    y: cy - (by + bh / 2) * s,
    size: 48 * s,
    left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2, w, h,
  };
}

/** Wrap a label into short lines for tiny sheet captions. */
export function wrapLabel(text: string, max = 12): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.toUpperCase().split(' ')) {
    if (line && (line + ' ' + word).length > max) { out.push(line); line = word; } else { line = line ? `${line} ${word}` : word; }
  }
  if (line) out.push(line);
  return out;
}

/** Mobile sizing for the sheet artwork inside PageHero's art slot. */
export const SHEET_CSS = `
@media (max-width: 767px) { .ph__art > .pa-sheet { max-height: 250px; margin-left: auto; margin-right: auto; } }
`;

export function hasPictogram(slug: string): slug is PartPictoName {
  return slug in pictogramPaths || isExtraPicto(slug);
}

/** A brand pictogram drawn as an SVG group at an arbitrary scale (stroke stays a true px width). */
export function PictoG({
  name, x, y, size, stroke = 1.5, color = 'currentColor', className, style,
}: {
  name: PartPictoName; x: number; y: number; size: number; stroke?: number;
  color?: string; className?: string; style?: CSSProperties;
}) {
  const def = isExtraPicto(name) ? extraPictos[name] : pictogramPaths[name as PictogramName];
  if (!def) return null;
  const s = size / 48;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none"
      stroke={color}
      strokeWidth={stroke / s}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      style={style}
    >
      {def.paths.map((d, i) => <path key={i} d={d} />)}
    </g>
  );
}

/** Horizontal dimension line with architectural end ticks. */
export function DimH({ x1, x2, y, className, style, color = 'var(--grey-metal)' }: {
  x1: number; x2: number; y: number; className?: string; style?: CSSProperties; color?: string;
}) {
  return (
    <path
      d={`M${x1} ${y}H${x2}M${x1} ${y - 6}V${y + 6}M${x2} ${y - 6}V${y + 6}M${x1 - 4} ${y + 4}L${x1 + 4} ${y - 4}M${x2 - 4} ${y + 4}L${x2 + 4} ${y - 4}`}
      fill="none" stroke={color} strokeWidth="1" pathLength={1} className={className} style={style}
    />
  );
}

/** Vertical dimension line with architectural end ticks. */
export function DimV({ y1, y2, x, className, style, color = 'var(--grey-metal)' }: {
  y1: number; y2: number; x: number; className?: string; style?: CSSProperties; color?: string;
}) {
  return (
    <path
      d={`M${x} ${y1}V${y2}M${x - 6} ${y1}H${x + 6}M${x - 6} ${y2}H${x + 6}M${x - 4} ${y1 + 4}L${x + 4} ${y1 - 4}M${x - 4} ${y2 + 4}L${x + 4} ${y2 - 4}`}
      fill="none" stroke={color} strokeWidth="1" pathLength={1} className={className} style={style}
    />
  );
}

/** Crosshair register mark. */
export function Reg({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return <path d={`M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}`} stroke="var(--grey-warm)" strokeWidth="1" fill="none" />;
}

/** Shared sheet backdrop defs: minor grid + top-lit sheet gradient. */
export function SheetDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="var(--grey-cloud)" strokeWidth="0.75" />
      </pattern>
      <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--surface)" />
        <stop offset="1" stopColor="var(--canvas)" />
      </linearGradient>
    </defs>
  );
}
