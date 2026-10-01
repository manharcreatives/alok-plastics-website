/**
 * IndustryScenes — hand-authored engineering-sheet illustrations (Round 2, ask 11).
 *
 * No photographs exist yet, so each industry gets a drawn, recognisable scene:
 * grey-metal / grey-warm line work, top-lit faces (surface -> surface-alt), and a
 * single burgundy accent per scene. A real photo (Industry.image) replaces the
 * scene automatically — see IndustriesBento.
 *
 * Rules honoured: no gear / droplet / snowflake clichés (§3.2), colours via tokens
 * only, decorative (aria-hidden). Honest: these depict a *kind* of application, not
 * a claim about a specific customer or product.
 */

import type { ReactNode } from 'react';

export type SceneId =
  | 'oem'
  | 'engineering'
  | 'automotive'
  | 'electrical'
  | 'gas-kitchen'
  | 'agriculture'
  | 'packaging';

const LINE = 'var(--grey-metal)';
const FINE = 'var(--grey-warm)';
const BURG = 'var(--burgundy)';

/* ── Shared frame: top-light band, blueprint ticks, gradients ─────────────── */
function Frame({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid meet"
      className="ind-art-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--surface)' }} />
          <stop offset="1" style={{ stopColor: 'var(--surface-alt)' }} />
        </linearGradient>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--burgundy-bright)' }} />
          <stop offset="0.45" style={{ stopColor: 'var(--burgundy)' }} />
          <stop offset="1" style={{ stopColor: 'var(--burgundy-deep)' }} />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--surface)', stopOpacity: 0.85 }} />
          <stop offset="1" style={{ stopColor: 'var(--surface)', stopOpacity: 0 }} />
        </linearGradient>
        <pattern id={`${id}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(44)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={FINE} strokeWidth="1" />
        </pattern>
      </defs>
      {/* top light: a soft 44-degree band falling from the upper left */}
      <path d="M-300 -60H190L-70 260H-300Z" fill={`url(#${id}-l)`} stroke="none" />
      <g
        fill="none"
        stroke={LINE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

/** Polar offset, rounded so server and client render identical markup. */
const pt = (c: number, r: number, deg: number, sin = false) =>
  Math.round((c + r * (sin ? Math.sin : Math.cos)((deg * Math.PI) / 180)) * 100) / 100;

const face = (id: string) => `url(#${id}-f)`;
const metal = (id: string) => `url(#${id}-m)`;

function Ground({ id, y = 168, x1 = -600, x2 = 920 }: { id: string; y?: number; x1?: number; x2?: number }) {
  return (
    <>
      <rect x={x1} y={y} width={x2 - x1} height={200 - y - 6} fill={`url(#${id}-h)`} stroke="none" opacity="0.8" />
      <path d={`M${x1} ${y}H${x2}`} stroke={LINE} strokeWidth="1.5" />
    </>
  );
}

/** Dimension line with end caps — engineering furniture, one per scene. */
function Dim({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g stroke={FINE} strokeWidth="1">
      <path d={`M${x1} ${y}H${x2}M${x1} ${y - 4}V${y + 4}M${x2} ${y - 4}V${y + 4}`} />
    </g>
  );
}

/* ── 1 · OEM & Manufacturing — an assembly line, parts repeating ──────────── */
function Oem() {
  const id = 'sc-oem';
  return (
    <Frame id={id}>
      {/* overhead gantry rail + trolley + hoist */}
      <path d="M-600 30H920M-600 36H920" stroke={FINE} />
      <path d="M40 30V14M280 30V14" stroke={FINE} />
      <rect x="190" y="36" width="32" height="12" fill={face(id)} />
      <path d="M206 48V72" />
      <path d="M200 72H212M206 72V78" />
      {/* conveyor */}
      <rect x="22" y="118" width="276" height="12" fill={face(id)} />
      <path d="M22 118H298" stroke="var(--surface)" strokeWidth="1" transform="translate(0 -1)" />
      <circle cx="30" cy="124" r="9" fill={face(id)} />
      <circle cx="290" cy="124" r="9" fill={face(id)} />
      <circle cx="30" cy="124" r="2" fill={LINE} stroke="none" />
      <circle cx="290" cy="124" r="2" fill={LINE} stroke="none" />
      {[70, 110, 150, 190, 230].map((x) => (
        <path key={x} d={`M${x} 130V136`} stroke={FINE} />
      ))}
      {[48, 156, 264].map((x) => (
        <path key={x} d={`M${x} 136V168M${x - 14} 168H${x + 14}`} />
      ))}
      <path d="M22 136H298" stroke={FINE} strokeDasharray="2 5" />
      {/* parts on the belt: bush, flanged bush, burgundy moulded part, ghost of the next */}
      <rect x="52" y="90" width="26" height="28" fill={face(id)} />
      <path d="M58 90V118M72 90V118" stroke={FINE} />
      <path d="M52 90H78" stroke="var(--surface)" transform="translate(0 -1)" />
      <path d="M104 118V102H112V92H132V102H140V118Z" fill={face(id)} />
      <path d="M116 92V118M128 92V118" stroke={FINE} />
      <path d="M170 118V100Q170 92 178 92H204Q212 92 212 100V118Z" fill={metal(id)} stroke={BURG} />
      <path d="M176 99H206" stroke="var(--rose-pale)" strokeWidth="1.5" opacity="0.8" />
      <path d="M180 118V108M202 118V108" stroke="var(--burgundy-night)" opacity="0.5" />
      <path d="M244 118V100Q244 92 252 92H270Q278 92 278 100V118Z" strokeDasharray="3 4" opacity="0.7" />
      <Dim x1={170} x2={212} y={80} />
      <Ground id={id} />
    </Frame>
  );
}

/* ── 2 · Engineering & Machinery — a lathe turning a part ─────────────────── */
function Engineering() {
  const id = 'sc-eng';
  return (
    <Frame id={id}>
      {/* bed and legs */}
      <rect x="26" y="132" width="268" height="14" fill={face(id)} />
      <path d="M26 132H294" stroke="var(--surface)" transform="translate(0 -1)" />
      <rect x="44" y="146" width="40" height="22" fill={face(id)} />
      <rect x="236" y="146" width="40" height="22" fill={face(id)} />
      {/* headstock */}
      <rect x="34" y="68" width="68" height="64" fill={face(id)} />
      <path d="M34 68H102" stroke="var(--surface)" transform="translate(0 -1)" />
      <path d="M46 82H90M46 92H78" stroke={FINE} />
      <circle cx="84" cy="116" r="6" fill={face(id)} />
      {/* chuck */}
      <rect x="102" y="76" width="14" height="48" fill={face(id)} />
      <path d="M102 88H116M102 100H116M102 112H116" stroke={FINE} />
      {/* workpiece being turned — burgundy accent */}
      <rect x="116" y="90" width="78" height="20" fill={metal(id)} stroke={BURG} />
      <rect x="194" y="94" width="34" height="12" fill={metal(id)} stroke={BURG} />
      <path d="M120 93H190" stroke="var(--rose-pale)" strokeWidth="1.5" opacity="0.7" />
      {/* tailstock */}
      <rect x="236" y="82" width="36" height="50" fill={face(id)} />
      <path d="M236 82H272" stroke="var(--surface)" transform="translate(0 -1)" />
      <path d="M236 94V106L228 100Z" fill={face(id)} />
      {/* carriage and tool */}
      <rect x="150" y="122" width="66" height="10" fill={face(id)} />
      <rect x="164" y="112" width="26" height="10" fill={face(id)} />
      <path d="M170 112L176 108L182 112" fill={face(id)} />
      <path d="M178 108V110" stroke={BURG} strokeWidth="2" />
      {/* centre line (dash-dot) */}
      <path d="M-600 100H920" stroke={FINE} strokeDasharray="10 3 2 3" />
      <Dim x1={116} x2={228} y={58} />
      <Ground id={id} />
    </Frame>
  );
}

/* ── 3 · Automotive — a car in side elevation ─────────────────────────────── */
function Automotive() {
  const id = 'sc-auto';
  return (
    <Frame id={id}>
      <path
        d="M34 142V122Q34 110 48 108L88 100Q104 76 140 72H198Q228 74 244 98L274 104Q290 108 290 126V142H256A24 24 0 0 0 208 142H122A24 24 0 0 0 74 142Z"
        fill={face(id)}
      />
      {/* glasshouse */}
      <path d="M104 98Q116 80 142 78H168V100Z" fill="var(--surface)" />
      <path d="M176 78H196Q218 80 230 100H176Z" fill="var(--surface)" />
      <path d="M168 78V100M176 78V100" />
      {/* door seams, handle, mirror */}
      <path d="M168 100V140M104 100V140" stroke={FINE} />
      <path d="M180 110H196M118 110H134" />
      <path d="M96 96L88 98V104L98 102Z" fill={face(id)} />
      {/* belt-line stripe + lamps: the single burgundy accent */}
      <path d="M40 120H282" stroke={BURG} strokeWidth="3" />
      <rect x="276" y="110" width="10" height="7" fill={BURG} stroke="none" />
      <rect x="36" y="110" width="8" height="7" fill={BURG} stroke="none" />
      {/* wheels */}
      {[98, 232].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="142" r="22" fill="var(--surface)" />
          <circle cx={cx} cy="142" r="22" stroke={FINE} strokeWidth="4" strokeDasharray="7 4" />
          <circle cx={cx} cy="142" r="13" fill={face(id)} />
          <circle cx={cx} cy="142" r="4" fill={LINE} stroke="none" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={pt(cx, 8, a)}
              cy={pt(142, 8, a, true)}
              r="1.2"
              fill={LINE}
              stroke="none"
            />
          ))}
        </g>
      ))}
      <Dim x1={74} x2={256} y={176} />
      <Ground id={id} y={164} />
    </Frame>
  );
}

/* ── 4 · Electrical & Electronics — a DIN-rail distribution board ─────────── */
function Electrical() {
  const id = 'sc-elec';
  const mods = [0, 1, 2, 3, 4, 5];
  return (
    <Frame id={id}>
      <rect x="26" y="22" width="268" height="150" fill="var(--surface)" />
      <rect x="32" y="28" width="256" height="138" stroke={FINE} />
      {/* DIN rail */}
      <path d="M38 92H282M38 100H282" />
      {Array.from({ length: 22 }, (_, i) => (
        <path key={i} d={`M${46 + i * 11} 94V98`} stroke={FINE} />
      ))}
      {/* breaker modules straddling the rail */}
      {mods.map((i) => {
        const x = 50 + i * 38;
        const on = i === 2;
        return (
          <g key={i}>
            <rect x={x} y="62" width="34" height="68" fill={face(id)} />
            <path d={`M${x} 62H${x + 34}`} stroke="var(--surface)" transform="translate(0 -1)" />
            <rect x={x + 8} y="70" width="18" height="16" fill={on ? metal(id) : 'var(--surface)'} stroke={on ? BURG : LINE} />
            <rect x={x + 12} y={on ? 72 : 78} width="10" height="6" fill={on ? 'var(--rose-pale)' : face(id)} stroke="none" opacity={on ? 0.9 : 1} />
            <path d={`M${x + 6} 108H${x + 28}`} stroke={FINE} />
            <circle cx={x + 17} cy="56" r="2" fill={LINE} stroke="none" />
            <circle cx={x + 17} cy="136" r="2" fill={LINE} stroke="none" />
            <path d={`M${x + 17} 54V34`} stroke={on ? BURG : LINE} strokeWidth={on ? 2 : 1.25} />
            <path d={`M${x + 17} 138V146`} stroke={on ? BURG : LINE} strokeWidth={on ? 2 : 1.25} />
          </g>
        );
      })}
      {/* cable trunking along the bottom: slotted duct */}
      <rect x="38" y="146" width="244" height="14" fill={face(id)} />
      {Array.from({ length: 30 }, (_, i) => (
        <path key={i} d={`M${46 + i * 8} 150V156`} stroke={FINE} />
      ))}
      <Ground id={id} y={178} />
    </Frame>
  );
}

/* ── 5 · Gas & Kitchen Equipment — a cylinder feeding a cooking range ─────── */
function GasKitchen() {
  const id = 'sc-gas';
  return (
    <Frame id={id}>
      {/* cylinder + regulator */}
      <rect x="38" y="66" width="52" height="100" rx="14" fill={face(id)} />
      <path d="M38 96H90M38 134H90" stroke={FINE} />
      <rect x="38" y="104" width="52" height="22" fill={metal(id)} stroke={BURG} />
      <path d="M56 66V54H72V66" fill={face(id)} />
      <rect x="52" y="44" width="24" height="10" fill={face(id)} />
      <path d="M64 44V36" />
      {/* hose to the range */}
      <path d="M76 49Q104 40 112 80T124 112" stroke={BURG} strokeWidth="2" />
      {/* range body */}
      <rect x="120" y="92" width="176" height="74" fill={face(id)} />
      <rect x="116" y="84" width="184" height="10" fill={face(id)} />
      <path d="M116 83H300" stroke="var(--surface)" />
      {/* burners and a pot on one */}
      <ellipse cx="160" cy="84" rx="20" ry="3.5" fill="var(--surface)" />
      <ellipse cx="250" cy="84" rx="20" ry="3.5" fill="var(--surface)" />
      {[-12, -6, 0, 6, 12].map((dx) => (
        <path key={dx} d={`M${250 + dx} 82V79`} stroke={BURG} strokeWidth="1.5" />
      ))}
      <path d="M144 83L148 48H178L182 83Z" fill={face(id)} />
      <path d="M142 56H134M184 56H192" />
      <path d="M150 48Q163 42 176 48" />
      {/* knobs */}
      {[140, 176, 212, 248].map((x) => (
        <g key={x}>
          <circle cx={x} cy="104" r="6" fill={face(id)} />
          <path d={`M${x} 104V99`} />
        </g>
      ))}
      {/* oven door */}
      <rect x="132" y="116" width="152" height="42" fill="var(--surface)" />
      <rect x="146" y="124" width="124" height="26" stroke={FINE} />
      <path d="M144 120H272" strokeWidth="2.5" />
      <path d="M132 166V172M284 166V172" />
      <Ground id={id} y={172} />
    </Frame>
  );
}

/* ── 6 · Agriculture & Equipment — a tractor in a furrowed field ──────────── */
function Agriculture() {
  const id = 'sc-agri';
  return (
    <Frame id={id}>
      {/* chassis + hood (burgundy) */}
      <path d="M96 128H238L246 142" />
      <path d="M130 102H244Q256 102 258 114V130H132Z" fill={metal(id)} stroke={BURG} />
      <path d="M138 107H240" stroke="var(--rose-pale)" strokeWidth="1.5" opacity="0.7" />
      <path d="M248 112V126M252 112V126M256 112V126" stroke="var(--burgundy-night)" opacity="0.55" />
      {/* exhaust */}
      <path d="M218 102V68H224V102" fill={face(id)} />
      <path d="M216 68H226" />
      {/* cab */}
      <path d="M68 112V52Q68 46 74 46H120Q126 46 126 52V112" fill={face(id)} />
      <rect x="76" y="54" width="42" height="36" fill="var(--surface)" />
      <path d="M96 54V90" stroke={FINE} />
      <path d="M62 46H132" strokeWidth="2" />
      {/* rear wheel, big */}
      <circle cx="96" cy="128" r="38" fill="var(--surface)" />
      <circle cx="96" cy="128" r="38" stroke={FINE} strokeWidth="6" strokeDasharray="9 5" />
      <circle cx="96" cy="128" r="26" fill={face(id)} />
      <circle cx="96" cy="128" r="9" fill="var(--surface)" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle
          key={a}
          cx={pt(96, 17, a)}
          cy={pt(128, 17, a, true)}
          r="1.6"
          fill={LINE}
          stroke="none"
        />
      ))}
      <path d="M52 112A46 46 0 0 1 134 106" stroke="none" />
      {/* front wheel */}
      <circle cx="246" cy="148" r="18" fill="var(--surface)" />
      <circle cx="246" cy="148" r="18" stroke={FINE} strokeWidth="4" strokeDasharray="6 4" />
      <circle cx="246" cy="148" r="10" fill={face(id)} />
      <circle cx="246" cy="148" r="3" fill={LINE} stroke="none" />
      {/* hitch */}
      <path d="M56 140H34L26 150" />
      {/* furrows */}
      <path d="M-600 166H920" strokeWidth="1.5" />
      {[0, 1, 2].map((r) => (
        <path
          key={r}
          d={Array.from({ length: 70 }, (_, i) => `M${-300 + i * 22 + (r % 2) * 10} ${172 + r * 6}l8 -4`).join('')}
          stroke={FINE}
        />
      ))}
    </Frame>
  );
}

/* ── 7 · Packaging & Specialized — a strapped, wrapped pallet of cartons ──── */
function Packaging() {
  const id = 'sc-pack';
  const box = (x: number, y: number, w: number, h: number, extra?: ReactNode) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={h} fill={face(id)} />
      <path d={`M${x} ${y + 8}H${x + w}`} stroke={FINE} />
      <path d={`M${x + w / 2} ${y}V${y + 8}`} stroke={FINE} />
      <path d={`M${x} ${y}H${x + w}`} stroke="var(--surface)" transform="translate(0 -1)" />
      {extra}
    </g>
  );
  return (
    <Frame id={id}>
      {/* pallet */}
      <rect x="56" y="152" width="208" height="8" fill={face(id)} />
      {[56, 150, 248].map((x) => (
        <rect key={x} x={x} y="160" width="16" height="8" fill={face(id)} />
      ))}
      {/* lower row */}
      {box(62, 108, 66, 44)}
      {box(128, 108, 66, 44, (
        <>
          <path d="M148 128H174M148 134H170M148 140H174" stroke={LINE} />
        </>
      ))}
      {box(194, 108, 66, 44)}
      {/* upper row, stacked in a brick bond */}
      {box(95, 64, 66, 44, (
        <>
          <path d="M120 96V84M120 84L116 88M120 84L124 88M130 96V84M130 84L126 88M130 84L134 88" stroke={LINE} />
        </>
      ))}
      {box(161, 64, 66, 44)}
      {/* strapping — burgundy accent */}
      <path d="M62 130H260" stroke={BURG} strokeWidth="2.5" />
      <rect x="156" y="126" width="9" height="8" fill="var(--surface)" stroke={BURG} />
      <path d="M118 64V108M204 64V108" stroke={BURG} strokeWidth="2.5" />
      {/* stretch wrap sheen */}
      <path d="M62 152L116 108M100 152L154 108M62 108L112 64" stroke="var(--surface)" strokeWidth="3" opacity="0.7" />
      <Dim x1={62} x2={260} y={182} />
      <Ground id={id} y={168} />
    </Frame>
  );
}

const SCENES: Record<SceneId, () => ReactNode> = {
  oem: Oem,
  engineering: Engineering,
  automotive: Automotive,
  electrical: Electrical,
  'gas-kitchen': GasKitchen,
  agriculture: Agriculture,
  packaging: Packaging,
};

export default function IndustryScene({ scene }: { scene: string }) {
  const Scene = SCENES[scene as SceneId];
  return Scene ? <Scene /> : null;
}

/* ── Core market: water cooler · display counter · deep freezer ───────────────
 * Drawn on burgundy, so strokes are white / rose-pale; --rose is the one accent. */
export function CoreMarketScene() {
  const W = 'var(--surface)';
  return (
    <svg
      viewBox="0 0 480 230"
      preserveAspectRatio="xMidYMax meet"
      className="ind-art-svg ind-art-core"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="core-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--surface)', stopOpacity: 0.16 }} />
          <stop offset="1" style={{ stopColor: 'var(--surface)', stopOpacity: 0 }} />
        </linearGradient>
        <pattern id="core-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(44)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={W} strokeOpacity="0.16" strokeWidth="1" />
        </pattern>
      </defs>
      <g fill="none" stroke={W} strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* water cooler: bottle on top of a tall cabinet */}
        <g>
          <path d="M82 6H114Q124 6 124 18V52H72V18Q72 6 82 6Z" fill="url(#core-l)" />
          <path d="M86 52V60H110V52" />
          <path d="M72 30H124" strokeOpacity="0.35" />
          <rect x="56" y="60" width="84" height="144" fill={W} fillOpacity="0.05" />
          <rect x="68" y="76" width="60" height="46" strokeOpacity="0.5" />
          <path d="M80 92V104M110 92V104" stroke="var(--rose)" strokeWidth="3" strokeOpacity="1" />
          <path d="M72 124H124" strokeOpacity="0.5" />
          <rect x="66" y="132" width="64" height="62" strokeOpacity="0.5" />
          <path d="M76 140H120" strokeOpacity="0.35" />
        </g>
        {/* display counter: glass front with shelves of small parts */}
        <g>
          <rect x="172" y="104" width="160" height="100" fill={W} fillOpacity="0.05" />
          <path d="M172 104L184 84H320L332 104" />
          <rect x="182" y="112" width="140" height="62" strokeOpacity="0.55" />
          <path d="M182 142H322" strokeOpacity="0.55" />
          {[196, 222, 248, 274, 300].map((x, i) => (
            <rect key={x} x={x} y={i % 2 ? 122 : 124} width="14" height={i % 2 ? 14 : 12} strokeOpacity="0.7" />
          ))}
          {[196, 230, 264, 298].map((x) => (
            <rect key={x} x={x} y="154" width="18" height="12" strokeOpacity="0.7" />
          ))}
          <path d="M252 112V174" strokeOpacity="0.4" />
          <path d="M184 86L196 106M320 86L308 106" strokeOpacity="0.4" />
          <path d="M182 184H322M182 192H322" strokeOpacity="0.4" strokeDasharray="2 5" />
        </g>
        {/* deep freezer: chest with lid and handle */}
        <g>
          <rect x="360" y="130" width="104" height="74" fill={W} fillOpacity="0.05" />
          <path d="M356 130H468V116Q468 110 462 110H362Q356 110 356 116Z" fill="url(#core-l)" />
          <path d="M392 120H432" stroke="var(--rose)" strokeWidth="3" strokeOpacity="1" />
          <path d="M370 110V104M454 110V104" strokeOpacity="0.6" />
          <rect x="372" y="146" width="80" height="44" strokeOpacity="0.4" />
          <circle cx="440" cy="168" r="4" strokeOpacity="0.7" />
        </g>
        {/* floor */}
        <path d="M24 204H456" strokeWidth="1.5" />
        <rect x="24" y="206" width="432" height="8" fill="url(#core-h)" stroke="none" />
        <path d="M172 218H332M360 218H464M56 218H140" strokeOpacity="0.2" strokeDasharray="2 5" />
      </g>
    </svg>
  );
}
