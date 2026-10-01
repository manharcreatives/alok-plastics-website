/**
 * Extra part pictograms for the catalogue parts that brand/Pictogram.tsx does not cover.
 * Same grammar as the brand set: 48-unit box, squared caps/joins, stroke set by the renderer
 * (1.5px). Generic, honest shapes of the kind of part named. They show the type of part, not the
 * client's exact product. Replaced automatically when a real photo is added.
 */
export type ExtraPictoName =
  | 'handle-lock'
  | 'bracket-handle'
  | 'ss-kabja'
  | 'l-type-hinge'
  | 'u-type-door-spring'
  | 'l-hinge-door-spring'
  | 'waste-coupling';

export const extraPictos: Record<ExtraPictoName, { title: string; paths: string[]; box: [number, number, number, number] }> = {
  /* pull handle sitting on a lock plate with a key cylinder */
  'handle-lock': {
    title: 'Handle Lock',
    paths: [
      'M 6 22 L 42 22 L 42 38 L 6 38 Z',
      'M 12 22 L 12 12 L 30 12 L 30 22',
      'M 36 30 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      'M 36 28 L 36 32',
      'M 10 30 L 24 30',
    ],
    box: [6, 12, 36, 26],
  },
  /* bar handle standing off its surface on two brackets */
  'bracket-handle': {
    title: 'Bracket Handle',
    paths: [
      'M 6 12 L 42 12 L 42 18 L 6 18 Z',
      'M 12 18 L 12 34 M 36 18 L 36 34',
      'M 6 34 L 18 34 L 18 40 L 6 40 Z',
      'M 30 34 L 42 34 L 42 40 L 30 40 Z',
    ],
    box: [6, 12, 36, 28],
  },
  /* stainless butt hinge: tall knuckled barrel between two leaves */
  'ss-kabja': {
    title: 'SS Kabja',
    paths: [
      'M 6 12 L 20 12 L 20 36 L 6 36 Z',
      'M 28 12 L 42 12 L 42 36 L 28 36 Z',
      'M 20 8 L 28 8 L 28 40 L 20 40 Z',
      'M 20 16 L 28 16 M 20 24 L 28 24 M 20 32 L 28 32',
      'M 11 18 L 15 18 M 11 30 L 15 30 M 33 18 L 37 18 M 33 30 L 37 30',
    ],
    box: [6, 8, 36, 32],
  },
  /* L-shaped leaf with the pin barrel at the bend */
  'l-type-hinge': {
    title: 'L-Type Hinge',
    paths: [
      'M 8 6 L 20 6 L 20 28 L 42 28 L 42 40 L 8 40 Z',
      'M 12 11 L 16 11 M 12 17 L 16 17',
      'M 28 32 L 28 36 M 36 32 L 36 36',
      'M 14 34 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
    ],
    box: [8, 6, 34, 34],
  },
  /* U-shaped wire spring: two straight arms with a zig-zag coil */
  'u-type-door-spring': {
    title: 'U-Type Door Spring',
    paths: [
      'M 12 8 L 12 26 M 36 8 L 36 26',
      'M 8 8 L 16 8 M 32 8 L 40 8',
      'M 12 26 L 16 38 L 20 26 L 24 38 L 28 26 L 32 38 L 36 26',
    ],
    box: [8, 8, 32, 30],
  },
  /* torsion-style spring: one coil with two arms at 90 degrees */
  'l-hinge-door-spring': {
    title: 'L-Hinge Door Spring',
    paths: [
      'M 14 28 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0',
      'M 14 28 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
      'M 6 28 L 6 6 L 12 6',
      'M 14 36 L 42 36 L 42 42',
    ],
    box: [6, 6, 36, 36],
  },
  /* sleeve joining two pipe ends */
  'waste-coupling': {
    title: 'Waste Coupling',
    paths: [
      'M 14 12 L 34 12 L 34 36 L 14 36 Z',
      'M 18 12 L 18 36 M 30 12 L 30 36',
      'M 4 19 L 14 19 M 4 29 L 14 29 M 34 19 L 44 19 M 34 29 L 44 29',
      'M 4 24 L 44 24',
    ],
    box: [4, 12, 40, 24],
  },
};

export function isExtraPicto(slug: string): slug is ExtraPictoName {
  return slug in extraPictos;
}
