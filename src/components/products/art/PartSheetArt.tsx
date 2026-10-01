/**
 * PartSheetArt — part page hero. The part's pictogram large on a drawing sheet with centre-lines
 * and dimension lines (no values). Parts without a pictogram get an honest "photo to come" slot —
 * never a pictogram of a different part.
 */
import { D } from '@/components/page/art/artCss';
import { MATERIAL_LABELS } from '@/content/products';
import type { Product } from '@/content/types';
import { DimH, DimV, PictoG, Reg, SHEET_CSS, SheetDefs, fitPicto, hasPictogram } from './PictoG';

export default function PartSheetArt({ product }: { product: Product }) {
  const slug = hasPictogram(product.slug) ? product.slug : null;
  const cx = 280;
  const cy = 230;
  const m = slug
    ? fitPicto(slug, cx, cy, 280)
    : { left: cx - 140, right: cx + 140, top: cy - 100, bottom: cy + 100, w: 280, h: 200, x: 0, y: 0, size: 0 };
  return (
    <>
      <style>{SHEET_CSS}</style>
      <svg className="pa-svg pa-sheet" viewBox="0 0 640 600" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
        <SheetDefs id="ps" />
        <rect x="64" y="58" width="560" height="520" fill="var(--surface-alt)" stroke="var(--grey-warm)" className="pa-fade" style={D(0)} />
        <g transform="translate(40 30)">
          <g className="pa-fade" style={D(120)}>
            <rect width="560" height="520" fill="url(#ps-lit)" stroke="var(--grey-warm)" />
            <rect x="14" y="14" width="532" height="492" fill="url(#ps-grid)" stroke="var(--grey-metal)" strokeWidth="1" />
            <path d="M14 14L50 14L14 50Z" fill="var(--blush)" stroke="none" />
            {[[14, 14], [546, 14], [14, 506], [546, 506]].map(([px, py]) => <Reg key={`${px}${py}`} x={px} y={py} r={6} />)}
          </g>
          <path d={`M${cx} ${m.top - 60}V${m.bottom + 60}M${m.left - 60} ${cy}H${m.right + 60}`} stroke="var(--grey-metal)" strokeWidth="1" strokeDasharray="14 4 2 4" fill="none" pathLength={1} className="pa-draw" style={D(500)} />
          <path d={`M${m.left} ${m.top - 4}V${m.top - 40}M${m.right} ${m.top - 4}V${m.top - 40}M${m.left - 4} ${m.top}H${m.left - 44}M${m.left - 4} ${m.bottom}H${m.left - 44}M${m.left} ${m.bottom + 4}V${m.bottom + 44}M${m.right} ${m.bottom + 4}V${m.bottom + 44}`} stroke="var(--grey-warm)" strokeWidth="1" fill="none" />
          <DimH x1={m.left} x2={m.right} y={m.top - 32} className="pa-draw" style={D(700)} />
          <DimV y1={m.top} y2={m.bottom} x={m.left - 36} className="pa-draw" style={D(900)} />
          <DimH x1={m.left} x2={m.right} y={m.bottom + 36} className="pa-draw" style={D(1000)} />
          {slug ? (
            <g className="pa-fade" style={D(400)}>
              <PictoG name={slug} x={m.x} y={m.y} size={m.size} stroke={1.8} color="var(--burgundy)" />
            </g>
          ) : (
            <g className="pa-fade" style={D(400)}>
              <rect x={m.left} y={m.top} width={m.w} height={m.h} fill="none" stroke="var(--grey-metal)" strokeDasharray="6 6" />
              <text x={cx} y={cy + 3} textAnchor="middle" className="pa-mono" fontSize="10" fill="var(--muted)">PHOTO TO COME</text>
            </g>
          )}
          <text x="34" y="490" className="pa-mono" fontSize="8" fill="var(--grey-metal)">NOT TO SCALE</text>
          <text x="470" y="490" textAnchor="end" className="pa-mono" fontSize="8" fill="var(--muted)">{product.material ? MATERIAL_LABELS[product.material].toUpperCase() : 'ALOK PLASTICS'}</text>
          <path d="M514 490l16-16m-6 0h6v6" stroke="var(--burgundy)" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </>
  );
}
