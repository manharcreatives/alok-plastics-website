/**
 * PartPicto: the drawn pictogram for a catalogue part. Brand pictograms come from
 * brand/Pictogram.tsx (read-only); the remaining parts use the matching 1.5px squared-stroke
 * drawings in art/extraPictos.ts. Stroke is a true pixel width (non-scaling), so a card icon and a
 * large gallery icon carry the same line weight.
 */
import Pictogram, { pictogramPaths, type PictogramName } from '@/components/brand/Pictogram';
import { extraPictos, isExtraPicto } from './art/extraPictos';

export function pictogramFor(slug: string): string | null {
  return slug in pictogramPaths || isExtraPicto(slug) ? slug : null;
}

export default function PartPicto({ slug, size = 48, className, strokePx = 1.5 }: { slug: string; size?: 24 | 32 | 48; className?: string; strokePx?: number }) {
  if (isExtraPicto(slug)) {
    const def = extraPictos[slug];
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokePx}
        strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" className={className}>
        {def.paths.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" />)}
      </svg>
    );
  }
  if (slug in pictogramPaths) {
    return <Pictogram name={slug as PictogramName} size={size} className={className} strokeWidth={strokePx} />;
  }
  return null;
}
