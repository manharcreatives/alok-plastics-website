/**
 * GroupBlueprintArt — group page hero. The group's own part pictograms at large scale on a
 * drawing sheet: one hero part with centre-lines and dimension lines (no invented values),
 * the rest as smaller views with their catalogue names. Decorative (aria-hidden by PageHero).
 */
import { D } from '@/components/page/art/artCss';
import { MATERIAL_LABELS, productsByGroup } from '@/content/products';
import type { ProductGroup } from '@/content/types';
import { DimH, DimV, PictoG, Reg, SHEET_CSS, SheetDefs, fitPicto, hasPictogram, wrapLabel } from './PictoG';

export default function GroupBlueprintArt({ group }: { group: ProductGroup }) {
  const parts = productsByGroup(group.id).filter(p => hasPictogram(p.slug));
  const [main, ...rest] = parts;
  const side = rest.slice(0, 3);
  const cx = side.length ? 190 : 280;
  const cy = 230;
  const m = main && hasPictogram(main.slug) ? fitPicto(main.slug, cx, cy, side.length ? 230 : 300) : null;
  const mat = main?.material ? MATERIAL_LABELS[main.material].toUpperCase() : null;

  return (
    <>
      <style>{SHEET_CSS}</style>
      <svg className="pa-svg pa-sheet" viewBox="0 0 640 600" preserveAspectRatio="xMaxYMid meet" role="presentation" focusable="false">
        <SheetDefs id="gb" />
        <rect x="64" y="58" width="560" height="520" fill="var(--surface-alt)" stroke="var(--grey-warm)" className="pa-fade" style={D(0)} />
        <g transform="translate(40 30)">
          <g className="pa-fade" style={D(120)}>
            <rect width="560" height="520" fill="url(#gb-lit)" stroke="var(--grey-warm)" />
            <rect x="14" y="14" width="532" height="492" fill="url(#gb-grid)" stroke="var(--grey-metal)" strokeWidth="1" />
            <path d="M14 14L50 14L14 50Z" fill="var(--blush)" stroke="none" />
            {[[14, 14], [546, 14], [14, 506], [546, 506]].map(([x, y]) => <Reg key={`${x}${y}`} x={x} y={y} r={6} />)}
          </g>

          {m && main && hasPictogram(main.slug) && (
            <g>
              <path d={`M${cx} ${m.top - 56}V${m.bottom + 56}M${m.left - 56} ${cy}H${m.right + 56}`} stroke="var(--grey-metal)" strokeWidth="1" strokeDasharray="14 4 2 4" fill="none" pathLength={1} className="pa-draw" style={D(500)} />
              <path d={`M${m.left} ${m.top - 4}V${m.top - 38}M${m.right} ${m.top - 4}V${m.top - 38}M${m.left - 4} ${m.top}H${m.left - 38}M${m.left - 4} ${m.bottom}H${m.left - 38}`} stroke="var(--grey-warm)" strokeWidth="1" fill="none" />
              <DimH x1={m.left} x2={m.right} y={m.top - 30} className="pa-draw" style={D(700)} />
              <DimV y1={m.top} y2={m.bottom} x={m.left - 30} className="pa-draw" style={D(900)} />
              <g className="pa-fade" style={D(400)}>
                <PictoG name={main.slug} x={m.x} y={m.y} size={m.size} stroke={1.8} color="var(--burgundy)" />
              </g>
              {mat && (
                <g className="pa-fade" style={D(1200)}>
                  <circle cx={m.right - 6} cy={m.top + m.h * 0.2} r="3" fill="var(--burgundy)" />
                  <path d={`M${m.right - 6} ${m.top + m.h * 0.2}L${m.right + 30} ${m.top + m.h * 0.2 - 36}H${m.right + 76}`} stroke="var(--burgundy)" strokeWidth="1" fill="none" />
                  <text x={m.right + 34} y={m.top + m.h * 0.2 - 42} className="pa-mono" fontSize="12" fill="var(--burgundy)" fontWeight="700">{mat}</text>
                </g>
              )}
            </g>
          )}

          {side.map((p, i) => {
            if (!hasPictogram(p.slug)) return null;
            const bx = 372;
            const by = 96 + i * 120;
            const f = fitPicto(p.slug, bx + 32, by + 44, 44);
            const lines = wrapLabel(p.name, 10);
            return (
              <g key={p.slug} className="pa-fade" style={D(900 + i * 150)}>
                <rect x={bx} y={by} width="160" height="88" fill="var(--surface)" stroke="var(--grey-warm)" strokeDasharray="3 5" />
                <PictoG name={p.slug} x={f.x} y={f.y} size={f.size} stroke={1.4} color="var(--grey-metal)" />
                {lines.map((l, k) => (
                  <text key={l} x={bx + 64} y={by + 34 + k * 15} className="pa-mono" fontSize="12" style={{ letterSpacing: '0.02em' }} fill="var(--muted)">{l}</text>
                ))}
                {p.material && <text x={bx + 64} y={by + 34 + lines.length * 15} className="pa-mono" fontSize="12" style={{ letterSpacing: '0.02em' }} fill="var(--grey-metal)">{MATERIAL_LABELS[p.material].toUpperCase()}</text>}
              </g>
            );
          })}

          <text x="34" y="456" className="pa-mono" fontSize="14" fill="var(--burgundy)" fontWeight="700">{main ? main.name.toUpperCase() : ''}</text>
          <text x="34" y="474" className="pa-mono" fontSize="12" fill="var(--muted)">{group.name.toUpperCase()}</text>
          <text x="34" y="492" className="pa-mono" fontSize="12" fill="var(--grey-metal)">NOT TO SCALE</text>
          <path d="M514 490l16-16m-6 0h6v6" stroke="var(--burgundy)" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </>
  );
}
