/**
 * Pictogram component — §7.6, §4.1, §6.2
 * Custom engineering-style pictograms drawn from scratch.
 * Spec: SVG, 24/32/48 sizes, 1.5px stroke, squared caps/joins, currentColor.
 * No Lucide/Tabler glyphs — all paths drawn to represent the actual parts.
 *
 * 10 Part pictograms + 7 Industry pictograms + 3 Machine pictograms = 20 total.
 */

import type { SVGProps } from 'react';
import { extraPictos, type ExtraPictoName } from '@/components/products/art/extraPictos';

export type PictogramSize = 24 | 32 | 48;

export type PictogramName =
  /* Parts (10) */
  | 'f-bush'
  | 'connecting-bush'
  | 'door-lock'
  | 'hinge'
  | 'float-valve'
  | 'push-cock'
  | 'waste-pipe'
  | 'ventilation-jalli'
  | 'adjustable-leg-insert'
  | 'gasket'
  /* Industries (7) */
  | 'oem'
  | 'engineering'
  | 'automotive'
  | 'electrical'
  | 'gas-kitchen'
  | 'agriculture'
  | 'packaging'
  /* Machines (5) */
  | 'water-cooler'
  | 'display-counter'
  | 'deep-freezer'
  | 'gas-stove'
  | 'commercial-kitchen';

interface PictogramProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** A brand pictogram, or any catalogue part drawn in products/art/extraPictos (same grammar). */
  name: PictogramName | ExtraPictoName;
  size?: PictogramSize;
  title?: string;
}

const STROKE = 1.5;
const CAP = 'square' as const;
const JOIN = 'miter' as const;

/* Each path is drawn on a 48×48 grid and scaled via transform for 24/32 */
const paths: Record<PictogramName, { paths: string[]; title: string }> = {
  /* ── Parts ──────────────────────────────────────────────────────── */

  'f-bush': {
    title: 'F-Bush',
    paths: [
      /* Outer cylinder */
      'M 14 10 L 34 10 L 34 38 L 14 38 Z',
      /* Flange rim — the F in F-bush */
      'M 8 16 L 14 16 L 14 32 L 8 32 Z',
      /* Inner bore */
      'M 18 10 L 18 38 M 30 10 L 30 38',
      /* Centre axis line (dashed) */
      'M 24 6 L 24 42',
    ],
  },

  'connecting-bush': {
    title: 'Connecting Bush',
    paths: [
      /* Two cylinders connected */
      'M 10 18 L 22 18 L 22 30 L 10 30 Z',
      'M 26 18 L 38 18 L 38 30 L 26 30 Z',
      /* Connecting pin */
      'M 22 22 L 26 22 M 22 26 L 26 26',
      /* Centre axis */
      'M 4 24 L 44 24',
    ],
  },

  'door-lock': {
    title: 'Door Lock',
    paths: [
      /* Lock body — rectangular */
      'M 10 16 L 38 16 L 38 40 L 10 40 Z',
      /* Lock bolt extending right */
      'M 38 26 L 46 26 L 46 32 L 38 32',
      /* Keyhole */
      'M 22 24 L 22 34 M 22 26 Q 24 22 26 26 L 26 34',
      /* Mounting hole */
      'M 14 20 L 16 20 L 16 22 L 14 22 Z M 34 20 L 36 20 L 36 22 L 34 22 Z',
    ],
  },

  'hinge': {
    title: 'Hinge',
    paths: [
      /* Left leaf */
      'M 8 8 L 22 8 L 22 40 L 8 40 Z',
      /* Right leaf */
      'M 26 8 L 40 8 L 40 40 L 26 40 Z',
      /* Pin barrel */
      'M 22 12 L 26 12 L 26 36 L 22 36 Z',
      /* Mounting holes */
      'M 12 14 L 18 14 M 12 20 L 18 20 M 12 34 L 18 34',
      'M 30 14 L 36 14 M 30 20 L 36 20 M 30 34 L 36 34',
    ],
  },

  'float-valve': {
    title: 'Float Valve',
    paths: [
      /* Valve body */
      'M 14 20 L 30 20 L 30 34 L 14 34 Z',
      /* Inlet pipe */
      'M 6 27 L 14 27',
      /* Outlet pipe */
      'M 30 27 L 38 27',
      /* Float arm */
      'M 22 20 L 22 14 L 36 8',
      /* Float ball */
      'M 36 8 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      /* Valve stem */
      'M 22 28 L 22 32',
    ],
  },

  'push-cock': {
    title: 'Push Cock',
    paths: [
      /* Body cylinder */
      'M 10 16 L 38 16 L 38 32 L 10 32 Z',
      /* Push button top */
      'M 18 10 L 30 10 L 30 16 L 18 16 Z',
      /* Outlet port bottom */
      'M 22 32 L 22 42 L 26 42 L 26 32',
      /* Centre line */
      'M 6 24 L 42 24',
    ],
  },

  'waste-pipe': {
    title: 'Waste Pipe',
    paths: [
      /* Pipe cylinder — long horizontal */
      'M 6 18 L 42 18 L 42 30 L 6 30 Z',
      /* Flanged end left */
      'M 6 14 L 6 34',
      /* Flanged end right */
      'M 42 14 L 42 34',
      /* Centre bore line */
      'M 10 24 L 38 24',
      /* Pipe wall thickness indicators */
      'M 10 18 L 10 30 M 38 18 L 38 30',
    ],
  },

  'ventilation-jalli': {
    title: 'Ventilation Jalli',
    paths: [
      /* Frame */
      'M 8 8 L 40 8 L 40 40 L 8 40 Z',
      /* Grid lines vertical */
      'M 16 8 L 16 40 M 24 8 L 24 40 M 32 8 L 32 40',
      /* Grid lines horizontal */
      'M 8 16 L 40 16 M 8 24 L 40 24 M 8 32 L 40 32',
    ],
  },

  'adjustable-leg-insert': {
    title: 'Adjustable Leg Insert',
    paths: [
      /* Outer cup */
      'M 12 14 L 36 14 L 36 34 Q 36 40 30 40 L 18 40 Q 12 40 12 34 Z',
      /* Inner adjustable foot */
      'M 18 34 L 18 44 M 30 34 L 30 44',
      /* Adjustment notches */
      'M 18 44 L 30 44',
      'M 16 38 L 32 38',
      /* Thread indicator lines */
      'M 14 20 L 34 20 M 14 24 L 34 24 M 14 28 L 34 28',
    ],
  },

  'gasket': {
    title: 'Gasket',
    paths: [
      /* Outer ring */
      'M 24 24 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0',
      /* Inner ring (bore) */
      'M 24 24 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0',
      /* Bolt holes × 4 */
      'M 24 8 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
      'M 24 40 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
      'M 8 24 m 0 -2 a 2 2 0 1 0 0 4 a 2 2 0 1 0 0 -4',
      'M 40 24 m 0 -2 a 2 2 0 1 0 0 4 a 2 2 0 1 0 0 -4',
    ],
  },

  /* ── Industries ─────────────────────────────────────────────────── */

  'oem': {
    title: 'OEM & Manufacturing',
    paths: [
      /* Factory profile */
      'M 6 38 L 6 20 L 14 20 L 14 14 L 22 14 L 22 20 L 30 20 L 30 14 L 38 14 L 38 38 Z',
      /* Smokestack */
      'M 30 14 L 30 8 L 34 8 L 34 14',
      /* Window/machine symbol */
      'M 10 26 L 18 26 L 18 32 L 10 32 Z M 26 26 L 34 26 L 34 32 L 26 32 Z',
      /* Ground line */
      'M 4 38 L 44 38',
    ],
  },

  'engineering': {
    title: 'Engineering & Machinery',
    paths: [
      /* Gear outer */
      'M 24 24 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0',
      /* Gear inner hub */
      'M 24 24 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      /* Gear teeth (simplified as notches) */
      'M 24 6 L 24 10 M 38 12 L 35 15 M 42 24 L 38 24 M 38 36 L 35 33 M 24 42 L 24 38 M 10 36 L 13 33 M 6 24 L 10 24 M 10 12 L 13 15',
    ],
  },

  'automotive': {
    title: 'Automotive',
    paths: [
      /* Vehicle side profile */
      'M 6 30 L 10 22 L 16 18 L 32 18 L 40 22 L 42 30 L 42 34 L 6 34 Z',
      /* Windshield */
      'M 18 18 L 14 24 L 34 24 L 30 18 Z',
      /* Wheel front */
      'M 34 34 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      /* Wheel rear */
      'M 14 34 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
    ],
  },

  'electrical': {
    title: 'Electrical & Electronics',
    paths: [
      /* Lightning bolt / circuit symbol */
      'M 28 8 L 20 26 L 26 26 L 20 40 L 34 20 L 27 20 Z',
      /* Component box */
      'M 8 16 L 18 16 L 18 32 L 8 32 Z',
      /* Connection lines */
      'M 18 24 L 20 24',
    ],
  },

  'gas-kitchen': {
    title: 'Gas & Kitchen Equipment',
    paths: [
      /* Burner ring */
      'M 24 24 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0',
      'M 24 24 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0',
      /* Flame tips × 4 */
      'M 24 12 Q 22 8 24 6 Q 26 8 24 12',
      'M 36 24 Q 40 22 42 24 Q 40 26 36 24',
      'M 24 36 Q 22 40 24 42 Q 26 40 24 36',
      'M 12 24 Q 8 22 6 24 Q 8 26 12 24',
      /* Knob */
      'M 24 24 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
    ],
  },

  'agriculture': {
    title: 'Agriculture & Equipment',
    paths: [
      /* Tractor wheel */
      'M 20 28 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0',
      'M 20 28 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0',
      /* Tractor body */
      'M 30 24 L 38 24 L 42 30 L 42 36 L 36 36 L 36 34 L 30 34 Z',
      /* Exhaust pipe */
      'M 36 24 L 36 18 L 38 18',
      /* Small front wheel */
      'M 38 36 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
    ],
  },

  'packaging': {
    title: 'Packaging & Specialized Applications',
    paths: [
      /* Box outline — open flaps */
      'M 10 22 L 24 16 L 38 22 L 38 40 L 10 40 Z',
      /* Box back top edge */
      'M 10 22 L 10 40',
      /* Box top flap left */
      'M 10 22 L 17 14',
      /* Box top flap right */
      'M 38 22 L 31 14',
      /* Flap centre line */
      'M 17 14 L 31 14',
      /* Vertical centre fold */
      'M 24 16 L 24 40',
      /* Horizontal band */
      'M 10 32 L 38 32',
    ],
  },

  /* ── Machines ───────────────────────────────────────────────────── */

  'water-cooler': {
    title: 'Water Cooler',
    paths: [
      /* Cabinet */
      'M 10 14 L 38 14 L 38 42 L 10 42 Z',
      /* Water tank (top) */
      'M 16 8 L 32 8 L 32 14 L 16 14 Z',
      /* Tap / faucet */
      'M 18 28 L 26 28 L 26 32 L 22 32 L 22 38 L 18 38 Z',
      /* Cooler grille (right side) */
      'M 30 20 L 36 20 M 30 24 L 36 24 M 30 28 L 36 28',
      /* Drip tray */
      'M 14 38 L 34 38 L 34 42 L 14 42 Z',
    ],
  },

  'display-counter': {
    title: 'Display Counter',
    paths: [
      /* Counter base */
      'M 6 32 L 42 32 L 42 42 L 6 42 Z',
      /* Counter top with glass panel */
      'M 6 32 L 6 14 L 42 14 L 42 32',
      /* Glass display front */
      'M 10 16 L 38 16 L 38 30 L 10 30 Z',
      /* Shelf inside */
      'M 12 24 L 36 24',
      /* Door handle */
      'M 22 28 L 26 28',
    ],
  },

  'deep-freezer': {
    title: 'Deep Freezer',
    paths: [
      /* Cabinet (chest style, wider than tall) */
      'M 6 20 L 42 20 L 42 42 L 6 42 Z',
      /* Lid */
      'M 6 14 L 42 14 L 42 20 L 6 20 Z',
      /* Lid hinge */
      'M 8 14 L 8 20 M 40 14 L 40 20',
      /* Condensation coil indicator */
      'M 10 26 Q 14 24 18 26 Q 22 28 26 26 Q 30 24 34 26',
      /* Lid handle */
      'M 18 17 L 30 17',
      /* Temperature indicator */
      'M 36 26 L 36 38 M 34 38 L 38 38',
    ],
  },

  'gas-stove': {
    title: 'Gas Stove',
    paths: [
      /* Burner head and pan rim */
      'M 14 22 L 34 22',
      /* Flame ticks */
      'M 18 18 L 18 14 M 24 18 L 24 10 M 30 18 L 30 14',
      /* Stove body */
      'M 8 22 L 40 22 L 40 38 L 8 38 Z',
      /* Control knobs */
      'M 14 30 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
      'M 24 30 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
      'M 34 30 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
      /* Legs */
      'M 12 38 L 12 43 M 36 38 L 36 43',
    ],
  },

  'commercial-kitchen': {
    title: 'Commercial Kitchen',
    paths: [
      /* Stock pot */
      'M 12 14 L 36 14 L 36 30 L 12 30 Z',
      /* Lid line and knob */
      'M 10 14 L 38 14 M 22 10 L 26 10',
      /* Pot handles */
      'M 7 20 L 12 20 M 36 20 L 41 20',
      /* Flames */
      'M 18 38 L 20 34 L 22 38 M 26 38 L 28 34 L 30 38',
      /* Stove base */
      'M 10 41 L 38 41',
    ],
  },
};

export default function Pictogram({
  name,
  size = 24,
  title,
  className,
  ...props
}: PictogramProps) {
  const def = (paths as Record<string, { paths: string[]; title: string }>)[name] ?? (extraPictos as Record<string, { paths: string[]; title: string }>)[name];
  if (!def) return null;

  const scale = size / 48;
  const id = `picto-${name}-title`;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE / scale}
      strokeLinecap={CAP}
      strokeLinejoin={JOIN}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={title ? id : undefined}
      aria-hidden={!title || undefined}
      className={className}
      {...props}
    >
      {title && <title id={id}>{title}</title>}
      {def.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export { paths as pictogramPaths };
export type { PictogramProps };
