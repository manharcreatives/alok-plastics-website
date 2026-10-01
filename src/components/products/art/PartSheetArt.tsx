/**
 * PartSheetArt: part page hero. A drawing sheet for THIS part: the part's own pictogram drawn large
 * inside a viewport with centre lines, crop marks and dimension leaders (letters W / H only; sizes are
 * "on request", never invented), a material callout, the machine-fit row (only machines confirmed in
 * the catalogue), the part's place inside its group, and a title block. The gallery below keeps the
 * product photo slot and the size table; this sheet is the drawing, not a copy of them.
 */
import { D } from '@/components/page/art/artCss';
import { MACHINE_LABELS, MATERIAL_LABELS, knownMachines, productsByGroup } from '@/content/products';
import type { Product, ProductGroup } from '@/content/types';
import { DimH, DimV, PictoG, Reg, SHEET_CSS, SheetDefs, fitPicto, hasPictogram, wrapLabel } from './PictoG';

const CELL = 44;
const GAP = 6;

export default function PartSheetArt({ product, group }: { product: Product; group: ProductGroup }) {
  const machines = knownMachines(product).slice(0, 3);
  const all = productsByGroup(group.id).filter(p => hasPictogram(p.slug) || p.slug === product.slug);
  const idx = Math.max(0, all.findIndex(p => p.slug === product.slug));
  const start = all.length > 6 ? Math.max(0, Math.min(idx - 2, all.length - 6)) : 0;
  const row = all.slice(start, start + 6);
  const own = hasPictogram(product.slug);
  const big = own ? fitPicto(product.slug as never, 190, 164, 150) : null;
  const material = product.material ? MATERIAL_LABELS[product.material].toUpperCase() : null;
  const nameLines = wrapLabel(product.name, 20).slice(0, 2);
  const pad = String(all.length).padStart(2, '0');
  const num = String(idx + 1).padStart(2, '0');

  return (
    <>
      <style>{SHEET_CSS}</style>
      <svg className="pa-svg pa-sheet" viewBox="0 0 640 600" preserveAspectRatio="xMidYMid meet" role="presentation" focusable="false">
        <SheetDefs id="ps" />
        <rect x="64" y="58" width="560" height="520" fill="var(--surface-alt)" stroke="var(--grey-warm)" className="pa-fade" style={D(0)} />
        <g transform="translate(40 30)">
          <g className="pa-fade" style={D(120)}>
            <rect width="560" height="520" fill="url(#ps-lit)" stroke="var(--grey-warm)" />
            <rect x="14" y="14" width="532" height="492" fill="url(#ps-grid)" stroke="var(--grey-metal)" strokeWidth="1" />
            <path d="M14 14L50 14L14 50Z" fill="var(--blush)" stroke="none" />
            {[[14, 14], [546, 14], [14, 506], [546, 506]].map(([px, py]) => <Reg key={`${px}${py}`} x={px} y={py} r={6} />)}
          </g>

          {/* header strip */}
          <g className="pa-fade" style={D(300)}>
            <text x="60" y="40" className="pa-mono" fontSize="14" fill="var(--burgundy)" fontWeight="700">{`SHEET ${num} / ${pad}`}</text>
            <text x="526" y="40" textAnchor="end" className="pa-mono" fontSize="13" fill="var(--muted)">{group.name.toUpperCase()}</text>
          </g>

          {/* drawing viewport */}
          <g className="pa-fade" style={D(400)}>
            <rect x="32" y="56" width="496" height="226" fill="var(--surface)" stroke="var(--grey-warm)" />
            <path d="M32 64V56H40M520 56H528V64M528 274V282H520M40 282H32V274" fill="none" stroke="var(--burgundy)" strokeWidth="1.5" />
            <path d="M44 164H336M190 66V272" stroke="var(--grey-warm)" strokeWidth="1" strokeDasharray="8 4 2 4" fill="none" />
          </g>
          {big ? (
            <>
              <PictoG name={product.slug as never} x={big.x} y={big.y} size={big.size} stroke={2} color="var(--burgundy)" className="pa-fade" style={D(600)} />
              {/* construction box + dimension leaders (letters only: sizes are on request) */}
              <rect x={big.left} y={big.top} width={big.w} height={big.h} fill="none" stroke="var(--grey-metal)" strokeWidth="1" strokeDasharray="3 4" className="pa-fade" style={D(900)} />
              <DimH x1={big.left} x2={big.right} y={big.bottom + 24} className="pa-draw" style={D(1000)} />
              <DimV y1={big.top} y2={big.bottom} x={big.right + 28} className="pa-draw" style={D(1100)} />
              <g className="pa-fade" style={D(1300)}>
                <text x={(big.left + big.right) / 2} y={big.bottom + 20} textAnchor="middle" className="pa-mono" fontSize="14" fill="var(--burgundy)" fontWeight="700">W</text>
                <text x={big.right + 40} y={(big.top + big.bottom) / 2 + 5} className="pa-mono" fontSize="14" fill="var(--burgundy)" fontWeight="700">H</text>
              </g>
            </>
          ) : (
            <text x="190" y="170" textAnchor="middle" className="pa-mono" fontSize="14" fill="var(--grey-metal)">DRAWING TO FOLLOW</text>
          )}
          <g className="pa-fade" style={D(1200)}>
            <path d="M344 66V272" stroke="var(--grey-warm)" strokeWidth="1" fill="none" />
            <text x="360" y="92" className="pa-mono" fontSize="13" fill="var(--muted)">MATERIAL</text>
            <text x="360" y="118" className="pa-mono" fontSize="18" fill="var(--ink)" fontWeight="700">{material ?? 'ON REQUEST'}</text>
            <path d="M360 140H512" stroke="var(--grey-warm)" strokeWidth="1" />
            <text x="360" y="166" className="pa-mono" fontSize="13" fill="var(--muted)">SIZE W × H</text>
            <text x="360" y="190" className="pa-mono" fontSize="14" fill="var(--ink)" fontWeight="700">ON REQUEST</text>
            <path d="M360 212H512" stroke="var(--grey-warm)" strokeWidth="1" />
            <text x="360" y="238" className="pa-mono" fontSize="13" fill="var(--muted)">SAMPLE / DRAWING</text>
            <text x="360" y="260" className="pa-mono" fontSize="13" fill="var(--burgundy)" fontWeight="700">SHARE WITH QUOTE</text>
          </g>

          {/* machine fit: confirmed machines only */}
          <g>
            <text x="32" y="321" className="pa-mono pa-fade" fontSize="14" fill="var(--burgundy)" fontWeight="700" style={D(700)}>FITS</text>
            {machines.length > 0 ? machines.map((m, i) => {
              const x = 82 + i * 148;
              const f = fitPicto(m, x + 24, 316, 28);
              return (
                <g key={m} className="pa-fade" style={D(800 + i * 120)}>
                  <rect x={x} y={296} width="140" height="40" fill="var(--surface)" stroke="var(--grey-warm)" />
                  <PictoG name={m} x={f.x} y={f.y} size={f.size} stroke={1.5} color="var(--grey-metal)" />
                  <text x={x + 46} y={321} className="pa-mono" fontSize="12" style={{ letterSpacing: '0.02em' }} fill="var(--ink)">{MACHINE_LABELS[m].toUpperCase()}</text>
                </g>
              );
            }) : (
              <text x="82" y="321" className="pa-mono pa-fade" fontSize="13" fill="var(--muted)" style={D(800)}>MACHINE FIT: TELL US YOUR MODEL</text>
            )}
          </g>

          {/* place in group */}
          <g className="pa-fade" style={D(1000)}>
            <text x="32" y="374" className="pa-mono" fontSize="13" fill="var(--muted)">IN GROUP</text>
            {row.map((p, i) => {
              const self = p.slug === product.slug;
              const x = 124 + i * (CELL + GAP);
              const has = hasPictogram(p.slug);
              const f = has ? fitPicto(p.slug as never, x + CELL / 2, 368, 26) : null;
              return (
                <g key={p.slug}>
                  <rect x={x} y={346} width={CELL} height={CELL} fill={self ? 'var(--blush)' : 'var(--surface)'} stroke={self ? 'var(--burgundy)' : 'var(--grey-warm)'} strokeWidth={self ? 1.5 : 1} />
                  {f && has && <PictoG name={p.slug as never} x={f.x} y={f.y} size={f.size} stroke={1.5} color={self ? 'var(--burgundy)' : 'var(--grey-metal)'} />}
                </g>
              );
            })}
          </g>

          {/* title block */}
          <g className="pa-fade" style={D(1400)}>
            <rect x="32" y="418" width="496" height="74" fill="var(--surface)" stroke="var(--grey-metal)" strokeWidth="1.25" />
            <path d="M372 418V492M32 440H372" stroke="var(--grey-warm)" strokeWidth="1" />
            <text x="46" y="434" className="pa-mono" fontSize="12" fill="var(--burgundy)" fontWeight="700">ALOK PLASTICS</text>
            {nameLines.map((l, k) => (
              <text key={l} x="46" y={460 + k * 18} className="pa-mono" fontSize="15" fill="var(--ink)" fontWeight="700">{l.toUpperCase()}</text>
            ))}
            <text x="386" y="434" className="pa-mono" fontSize="12" fill="var(--muted)">NOT TO SCALE</text>
            <text x="386" y="458" className="pa-mono" fontSize="12" fill="var(--muted)">REV TBD</text>
            <path d="M492 482l24-24m-9 0h9v9" stroke="var(--burgundy)" strokeWidth="1.5" fill="none" />
          </g>
        </g>
      </svg>
    </>
  );
}
