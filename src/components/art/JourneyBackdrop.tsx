/**
 * JourneyBackdrop — the drawn, atmospheric set behind the Journey roadmap (ask 12).
 * Three layers, all SVG/CSS, no photograph:
 *   1. a blueprint grid that fades out from the top light,
 *   2. light rays falling from the top,
 *   3. a layered factory-roofline: sawtooth north-light roofs whose slopes run at 44deg
 *      (the A-peak angle from the logo). The nearest layer is --surface-alt, so the
 *      silhouette *is* the section's bottom edge and hands over to the next section.
 * Purely decorative (aria-hidden); static, server-renderable.
 */

const ANGLE = Math.tan((44 * Math.PI) / 180); // slope run -> rise at 44deg

/** Sawtooth: slope up at 44deg, drop vertically — a factory north-light roof. */
function sawtooth(width: number, tooth: number, base: number, offset = 0) {
  const rise = Math.round(tooth * ANGLE);
  let d = `M${-tooth + offset} 340V${base}`;
  for (let x = -tooth + offset; x < width + tooth; x += tooth) {
    d += `L${x + tooth} ${base - rise}V${base}`;
  }
  return `${d}V340Z`;
}

/** A few chimneys / ventilators standing on the roofs. */
function stacks(items: [number, number, number, number][]) {
  return items.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />);
}

export default function JourneyBackdrop() {
  return (
    <div className="jrn-bg" aria-hidden="true">
      <style>{`
        .jrn-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .jrn-bg-grid { position: absolute; inset: 0;
          background-image:
            linear-gradient(to right, rgba(115,113,113,.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(115,113,113,.08) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, var(--ink) 0%, transparent 78%);
          mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, var(--ink) 0%, transparent 78%); }
        .jrn-bg-rays { position: absolute; top: 0; left: 0; width: 100%; height: min(72%, 760px); display: block; }
        .jrn-bg-roof { position: absolute; left: 0; bottom: 0; width: 100%; height: max(150px, 21.25vw); display: block; }
      `}</style>
      <div className="jrn-bg-grid" />

      {/* light falling from the top */}
      <svg className="jrn-bg-rays" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMin slice" focusable="false">
        <defs>
          <linearGradient id="jrn-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--surface)', stopOpacity: 0.95 }} />
            <stop offset="0.6" style={{ stopColor: 'var(--surface)', stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: 'var(--surface)', stopOpacity: 0 }} />
          </linearGradient>
          <radialGradient id="jrn-sun" cx="0.5" cy="0" r="0.6">
            <stop offset="0" style={{ stopColor: 'var(--surface)', stopOpacity: 0.9 }} />
            <stop offset="1" style={{ stopColor: 'var(--surface)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <rect width="1600" height="420" fill="url(#jrn-sun)" />
        {[
          [980, 1130, 1500, 1720],
          [1180, 1270, 1180, 1380],
          [560, 660, 120, 380],
          [740, 790, 640, 780],
          [1380, 1450, 1790, 1860],
        ].map(([a, b, c, d], i) => (
          <path key={i} d={`M${a} -20L${b} -20L${d} 700L${c} 700Z`} fill="url(#jrn-ray)" opacity={0.5 - i * 0.05} />
        ))}
      </svg>

      {/* factory roofline: far -> near */}
      <svg className="jrn-bg-roof" viewBox="0 0 1600 340" preserveAspectRatio="xMidYMax slice" focusable="false">
        <g fill="var(--grey-cloud)">
          <path d={sawtooth(1600, 200, 214, 40)} />
          {stacks([[300, 118, 14, 70], [1010, 100, 16, 90], [1400, 128, 12, 60]])}
        </g>
        <g fill="var(--grey-warm)" opacity="0.55">
          <path d={sawtooth(1600, 150, 256, 0)} />
          {stacks([[520, 152, 16, 84], [1230, 140, 18, 100]])}
        </g>
        <path d={sawtooth(1600, 150, 256, 0)} fill="none" stroke="var(--surface)" strokeWidth="1" opacity="0.7" transform="translate(0 -1)" />
        {/* near layer = the next section's colour */}
        <path d={sawtooth(1600, 110, 306, 70)} fill="var(--surface-alt)" />
        <path d={sawtooth(1600, 110, 306, 70)} fill="none" stroke="var(--surface)" strokeWidth="1.5" opacity="0.9" transform="translate(0 -1)" />
        {/* the one burgundy note: a lit glazing strip on a single tooth */}
        <rect x="860" y="200" width="10" height="106" fill="var(--grey-warm)" />
        <rect x="860" y="200" width="10" height="5" fill="var(--burgundy)" />
      </svg>
    </div>
  );
}
