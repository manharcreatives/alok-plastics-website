/**
 * CatalogueSheetArt — /products hero. A drawn "parts catalogue sheet": the ten real part
 * pictograms laid out on a drawing grid with callout leaders (material labels come from the
 * catalogue data), register marks, and a title block. Decorative only (aria-hidden by PageHero).
 */
import { D } from '@/components/page/art/artCss';
import { MATERIAL_LABELS, getProduct } from '@/content/products';
import type { PictogramName } from '@/components/brand/Pictogram';
import { DimH, PictoG, Reg, SHEET_CSS, SheetDefs, fitPicto, wrapLabel } from './PictoG';

const CELL_W = 123;
const CELL_H = 124;
const X0 = 34;
const Y0 = 44;

/** Row-major, 4 columns. The last row holds two parts + the title block. */
const ORDER: PictogramName[] = [
  'f-bush', 'connecting-bush', 'door-lock', 'hinge',
  'float-valve', 'push-cock', 'waste-pipe', 'ventilation-jalli',
  'adjustable-leg-insert', 'gasket',
];
const CALLOUTS = new Set<PictogramName>(['f-bush', 'float-valve', 'push-cock', 'ventilation-jalli']);

export default function CatalogueSheetArt() {
  return (
    <>
    <style>{SHEET_CSS}</style>
    <svg className="pa-svg pa-sheet" viewBox="0 0 640 600" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
      <SheetDefs id="cs" />
      {/* a second sheet underneath, offset like a stacked drawing */}
      <rect x="64" y="58" width="560" height="520" fill="var(--surface-alt)" stroke="var(--grey-warm)" className="pa-fade" style={D(0)} />
      <g transform="translate(40 30)" className="pa-fade" style={D(150)}>
        <rect width="560" height="520" fill="url(#cs-lit)" stroke="var(--grey-warm)" />
        <rect x="14" y="14" width="532" height="492" fill="url(#cs-grid)" stroke="var(--grey-metal)" strokeWidth="1" />
        <path d="M14 14L50 14L14 50Z" fill="var(--blush)" stroke="none" />
        <g stroke="var(--grey-warm)" strokeWidth="1" strokeDasharray="3 5" fill="none">
          {[1, 2, 3].map(c => <path key={`v${c}`} d={`M${X0 + c * CELL_W} ${Y0}V${Y0 + 3 * CELL_H}`} />)}
          {[1, 2].map(r => <path key={`h${r}`} d={`M${X0} ${Y0 + r * CELL_H}H${X0 + 4 * CELL_W}`} />)}
        </g>
        {[0, 1, 2, 3, 4].flatMap(c => [0, 1, 2, 3].map(r => <Reg key={`${c}-${r}`} x={X0 + c * CELL_W} y={Y0 + r * CELL_H} r={4} />))}
      </g>

      <g transform="translate(40 30)">
        {ORDER.map((name, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const cx = X0 + col * CELL_W + CELL_W / 2;
          const cy = Y0 + row * CELL_H + CELL_H / 2 - 8;
          const prod = getProduct(name);
          const callout = CALLOUTS.has(name);
          const mat = prod?.material ? MATERIAL_LABELS[prod.material].toUpperCase() : null;
          const accent = callout ? 'var(--burgundy)' : 'var(--grey-metal)';
          return (
            <g key={name} className="pa-fade" style={D(500 + i * 90)}>
              <PictoG name={name} {...(({ x, y, size }) => ({ x, y, size }))(fitPicto(name, cx, cy, 50))} stroke={1.4} color={accent} />
              {wrapLabel(prod?.name ?? name, 13).map((l, k) => (
                <text key={l} x={cx} y={cy + 46 + k * 14} textAnchor="middle" className="pa-mono" fontSize="12" style={{ letterSpacing: '0.02em' }} fill="var(--muted)">{l}</text>
              ))}
              {callout && mat && (
                <g>
                  <circle cx={cx + 26} cy={cy - 26} r="2.2" fill="var(--burgundy)" />
                  <path d={`M${cx + 26} ${cy - 26}L${cx + 40} ${cy - 40}H${cx + 48}`} fill="none" stroke="var(--burgundy)" strokeWidth="1" pathLength={1} className="pa-draw" style={D(1100 + i * 90)} />
                  <text x={cx + 50} y={cy - 37} className="pa-mono" fontSize="12" style={{ letterSpacing: 0 }} fill="var(--burgundy)">{mat}</text>
                </g>
              )}
            </g>
          );
        })}

        {/* title block occupies the last two cells of row three */}
        <g transform={`translate(${X0 + 2 * CELL_W} ${Y0 + 2 * CELL_H})`} className="pa-fade" style={D(1300)}>
          <rect width={2 * CELL_W} height={CELL_H} fill="var(--surface)" stroke="var(--grey-metal)" strokeWidth="1.25" />
          <path d={`M0 36H${2 * CELL_W}M${CELL_W + 40} 36V${CELL_H}M0 80H${CELL_W + 40}`} stroke="var(--grey-warm)" strokeWidth="1" fill="none" />
          <text x="14" y="24" className="pa-mono" fontSize="13" fill="var(--burgundy)" fontWeight="700">ALOK PLASTICS</text>
          <text x="14" y="55" className="pa-mono" fontSize="12" fill="var(--muted)">SPARE PARTS</text>
          <text x="14" y="70" className="pa-mono" fontSize="12" fill="var(--muted)">CATALOGUE</text>
          <text x="14" y="106" className="pa-mono" fontSize="12" fill="var(--muted)">CHANDIGARH</text>
          <text x={CELL_W + 52} y="55" className="pa-mono" fontSize="12" fill="var(--muted)">NOT TO</text>
          <text x={CELL_W + 52} y="70" className="pa-mono" fontSize="12" fill="var(--muted)">SCALE</text>
          <path d={`M${2 * CELL_W - 28} ${CELL_H - 14}l16-16m-6 0h6v6`} stroke="var(--burgundy)" strokeWidth="1.5" fill="none" />
        </g>

        <DimH x1={X0} x2={X0 + 4 * CELL_W} y={Y0 + 3 * CELL_H + 22} className="pa-draw" style={D(1500)} />
        <text x={X0} y={Y0 + 3 * CELL_H + 46} className="pa-mono" fontSize="12" fill="var(--grey-metal)">WATER COOLER · DISPLAY COUNTER · DEEP FREEZER</text>
      </g>
    </svg>
    </>
  );
}
