/**
 * Extra part pictograms for the catalogue parts that brand/Pictogram.tsx does not cover.
 * Same grammar as the brand set: 48-unit box, squared caps/joins, stroke set by the renderer
 * (1.5px). Generic, honest shapes of the kind of part named. They show the type of part, not the
 * client's exact product. They stay as the placeholder under the product photo (PhotoBg), which covers
 * them once /images/products/<slug>.webp exists.
 */
export type ExtraPictoName =
  | 'handle-lock'
  | 'bracket-handle'
  | 'ss-kabja'
  | 'l-type-hinge'
  | 'u-type-door-spring'
  | 'l-hinge-door-spring'
  | 'waste-coupling'
  | 'three-core-plug'
  | 'puf-chemical'
  | 'bright-chrome'
  | 'jumbo-lite-burner'
  | 'jumbo-heavy-burner'
  | 'delux-canteen-heavy-with-ring'
  | 'jumbo-canteen-heavy-with-ring'
  | 'korian-ring-burner-3pcs-set'
  | 'brass-canteen-nojal-valve'
  | 'brass-canteen-valve-3-8-nut'
  | 'pilot-burner'
  | 'hp-adaptor-ci-nojal'
  | 'ss-puffer-plate'
  | 'ss-square-lite'
  | 'ss-square-heavy'
  | 'ss-square-heavy-extra-height'
  | 'ss-round-casting'
  | 'ss-round-stove'
  | 'ss-bhatti-twin-burner'
  | 'ss-bhatti-twin-burner-shelf'
  | 'ss-bhatti-round-extra-heavy'
  | 'ss-dosa-bhatti'
  | 'ss-chapati-bhatti';

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

  /* ── newly catalogued parts (water cooler / deep freezer extras and the commercial kitchen range) ── */
  /* three-pin plug body with its cable */
  'three-core-plug': {
    title: 'Three Core Plug',
    paths: [
      'M 10 20 L 30 20 L 30 38 L 10 38 Z',
      'M 14 20 L 14 10',
      'M 26 20 L 26 10',
      'M 20 20 L 20 6',
      'M 20 38 L 20 43 L 34 43 L 34 30 L 42 30',
    ],
    box: [10, 6, 32, 37],
  },
  /* two drums, one taller than the other (two components) */
  'puf-chemical': {
    title: 'PUF Chemical',
    paths: [
      'M 6 12 L 22 12 L 22 40 L 6 40 Z',
      'M 26 18 L 42 18 L 42 40 L 26 40 Z',
      'M 6 18 L 22 18',
      'M 6 34 L 22 34',
      'M 26 24 L 42 24',
      'M 26 34 L 42 34',
    ],
    box: [6, 12, 36, 28],
  },
  /* aerosol can with a spray */
  'bright-chrome': {
    title: 'Bright Chrome',
    paths: [
      'M 16 18 L 32 18 L 32 42 L 16 42 Z',
      'M 16 18 L 20 12 L 28 12 L 32 18',
      'M 21 6 L 27 6 L 27 12 L 21 12 Z',
      'M 16 26 L 32 26',
      'M 16 36 L 32 36',
      'M 36 9 L 40 7',
      'M 36 13 L 42 13',
      'M 36 17 L 40 19',
    ],
    box: [16, 6, 26, 36],
  },
  /* round burner head on a straight pipe */
  'jumbo-lite-burner': {
    title: 'Jumbo Lite Burner',
    paths: [
      'M 6 24 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0',
      'M 11 24 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      'M 24 21 L 43 21 L 43 27 L 24 27 Z',
      'M 38 21 L 38 27',
      'M 15 17 L 15 19',
      'M 15 29 L 15 31',
      'M 8 24 L 10 24',
      'M 20 24 L 22 24',
    ],
    box: [6, 15, 37, 18],
  },
  /* heavier burner head with a thicker pipe */
  'jumbo-heavy-burner': {
    title: 'Jumbo Heavy Burner',
    paths: [
      'M 4 24 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0',
      'M 11 24 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      'M 1 24 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0',
      'M 29 19 L 43 19 L 43 29 L 29 29 Z',
      'M 38 19 L 38 29',
      'M 15 17 L 15 19',
      'M 15 29 L 15 31',
      'M 8 24 L 10 24',
      'M 20 24 L 22 24',
    ],
    box: [1, 10, 42, 28],
  },
  /* pan ring over a burner head on legs and a pipe */
  'delux-canteen-heavy-with-ring': {
    title: 'Delux Canteen Heavy With Ring',
    paths: [
      'M 6 10 L 42 10 L 42 14 L 6 14 Z',
      'M 12 10 L 13 6 L 18 6 L 19 10',
      'M 29 10 L 30 6 L 35 6 L 36 10',
      'M 16 14 L 32 14 L 32 20 L 16 20 Z',
      'M 20 17 L 22 17',
      'M 26 17 L 28 17',
      'M 16 20 L 12 32',
      'M 32 20 L 36 32',
      'M 21 20 L 27 20 L 27 42 L 21 42 Z',
    ],
    box: [6, 6, 36, 36],
  },
  /* wider ring and flared legs */
  'jumbo-canteen-heavy-with-ring': {
    title: 'Jumbo Canteen Heavy With Ring',
    paths: [
      'M 4 9 L 44 9 L 44 13 L 4 13 Z',
      'M 10 9 L 11 5 L 17 5 L 18 9',
      'M 30 9 L 31 5 L 37 5 L 38 9',
      'M 14 13 L 34 13 L 34 20 L 14 20 Z',
      'M 18 16 L 20 16',
      'M 24 16 L 26 16',
      'M 28 16 L 30 16',
      'M 14 20 L 8 36',
      'M 34 20 L 40 36',
      'M 5 36 L 11 36',
      'M 37 36 L 43 36',
      'M 21 20 L 27 20 L 27 44 L 21 44 Z',
    ],
    box: [4, 5, 40, 39],
  },
  /* three concentric rings with three feed pipes */
  'korian-ring-burner-3pcs-set': {
    title: 'Korian Ring Burner 3pcs Set',
    paths: [
      'M 8 20 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0',
      'M 13 20 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0',
      'M 18 20 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      'M 11 36 L 15 36 L 15 44 L 11 44 Z',
      'M 22 38 L 26 38 L 26 44 L 22 44 Z',
      'M 33 36 L 37 36 L 37 44 L 33 44 Z',
      'M 11 34 L 13 38',
      'M 37 34 L 35 38',
    ],
    box: [8, 4, 32, 40],
  },
  /* knob, stem, body and a barbed nozzle outlet */
  'brass-canteen-nojal-valve': {
    title: 'Brass Canteen Nojal Valve',
    paths: [
      'M 14 6 L 34 6 L 34 12 L 14 12 Z',
      'M 24 12 L 24 20',
      'M 18 20 L 30 20 L 30 34 L 18 34 Z',
      'M 21 34 L 27 34 L 27 43 L 21 43 Z',
      'M 30 25 L 42 25',
      'M 30 30 L 42 30',
      'M 42 23 L 42 32',
      'M 37 23 L 37 32',
    ],
    box: [14, 6, 28, 37],
  },
  /* knob, stem, body and a threaded nut outlet */
  'brass-canteen-valve-3-8-nut': {
    title: 'Brass Canteen Valve 3/8 Nut',
    paths: [
      'M 14 6 L 34 6 L 34 12 L 14 12 Z',
      'M 24 12 L 24 20',
      'M 18 20 L 30 20 L 30 34 L 18 34 Z',
      'M 21 34 L 27 34 L 27 43 L 21 43 Z',
      'M 30 24 L 36 24 L 36 32 L 30 32 Z',
      'M 36 26 L 42 26',
      'M 36 29 L 42 29',
      'M 36 32 L 42 32',
    ],
    box: [14, 6, 28, 37],
  },
  /* tube, knurled collar, hex nut and threaded base */
  'pilot-burner': {
    title: 'Pilot Burner (Full Brass)',
    paths: [
      'M 20 4 L 28 4 L 28 26 L 20 26 Z',
      'M 16 26 L 32 26 L 32 32 L 16 32 Z',
      'M 18 29 L 30 29',
      'M 14 32 L 34 32 L 34 38 L 14 38 Z',
      'M 18 38 L 30 38 L 30 44 L 18 44 Z',
      'M 18 41 L 30 41',
    ],
    box: [14, 4, 20, 40],
  },
  /* adaptor body with a lever, rim and a nipple outlet */
  'hp-adaptor-ci-nojal': {
    title: 'HP Adaptor CI Nojal',
    paths: [
      'M 10 22 L 34 22 L 34 36 L 10 36 Z',
      'M 6 36 L 38 36 L 38 41 L 6 41 Z',
      'M 34 25 L 44 25 L 44 31 L 34 31 Z',
      'M 40 25 L 40 31',
      'M 10 22 L 8 12 L 14 12 L 16 22',
      'M 16 29 L 28 29',
    ],
    box: [6, 12, 38, 29],
  },
  /* flat plate with rows of capsule pegs */
  'ss-puffer-plate': {
    title: 'SS Puffer Plate with SS Capsule',
    paths: [
      'M 6 38 L 14 24 L 42 24 L 34 38 Z',
      'M 20 24 L 20 14',
      'M 28 24 L 28 14',
      'M 36 24 L 36 14',
      'M 16 36 L 16 28',
      'M 24 36 L 24 28',
      'M 32 36 L 32 28',
    ],
    box: [6, 14, 36, 24],
  },
  /* low square stove: top frame, pan supports, short legs */
  'ss-square-lite': {
    title: 'Stainless Steel Square Lite',
    paths: [
      'M 6 18 L 42 18 L 42 22 L 6 22 Z',
      'M 10 18 L 12 11 L 19 11 L 17 18',
      'M 38 18 L 36 11 L 29 11 L 31 18',
      'M 9 22 L 9 30',
      'M 39 22 L 39 30',
      'M 6 30 L 12 30',
      'M 36 30 L 42 30',
      'M 18 22 L 30 22 L 30 26 L 18 26 Z',
      'M 24 26 L 24 28',
    ],
    box: [6, 11, 36, 19],
  },
  /* square stove on taller legs with a cross rail */
  'ss-square-heavy': {
    title: 'Stainless Steel Square Heavy',
    paths: [
      'M 6 18 L 42 18 L 42 22 L 6 22 Z',
      'M 10 18 L 12 11 L 19 11 L 17 18',
      'M 38 18 L 36 11 L 29 11 L 31 18',
      'M 9 22 L 9 36',
      'M 39 22 L 39 36',
      'M 6 36 L 12 36',
      'M 36 36 L 42 36',
      'M 18 22 L 30 22 L 30 26 L 18 26 Z',
      'M 24 26 L 24 34',
      'M 9 30 L 39 30',
    ],
    box: [6, 11, 36, 25],
  },
  /* square stove on the tallest legs */
  'ss-square-heavy-extra-height': {
    title: 'Stainless Steel Square Heavy (Extra Height)',
    paths: [
      'M 6 18 L 42 18 L 42 22 L 6 22 Z',
      'M 10 18 L 12 11 L 19 11 L 17 18',
      'M 38 18 L 36 11 L 29 11 L 31 18',
      'M 9 22 L 9 41',
      'M 39 22 L 39 41',
      'M 6 41 L 12 41',
      'M 36 41 L 42 41',
      'M 18 22 L 30 22 L 30 26 L 18 26 Z',
      'M 24 26 L 24 39',
      'M 9 32 L 39 32',
    ],
    box: [6, 11, 36, 30],
  },
  /* round body with chunky cast pan supports */
  'ss-round-casting': {
    title: 'Stainless Steel Round Casting',
    paths: [
      'M 6 16 L 42 16 L 42 20 L 6 20 Z',
      'M 10 9 L 17 9 L 17 16 L 10 16 Z',
      'M 31 9 L 38 9 L 38 16 L 31 16 Z',
      'M 8 20 L 8 32',
      'M 40 20 L 40 32',
      'M 8 32 L 40 32',
      'M 6 23 L 2 23 L 2 27 L 6 27',
      'M 42 23 L 46 23 L 46 27 L 42 27',
      'M 8 32 L 12 32 L 12 40 L 8 40 Z',
      'M 36 32 L 40 32 L 40 40 L 36 40 Z',
      'M 21 32 L 27 32 L 27 38 L 21 38 Z',
      'M 20 25 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
    ],
    box: [2, 9, 44, 31],
  },
  /* round body with a slim steel ring */
  'ss-round-stove': {
    title: 'Stainless Steel Round Stove',
    paths: [
      'M 6 16 L 42 16 L 42 20 L 6 20 Z',
      'M 10 16 L 12 9 L 17 9 L 16 16',
      'M 38 16 L 36 9 L 31 9 L 32 16',
      'M 8 20 L 8 32',
      'M 40 20 L 40 32',
      'M 8 32 L 40 32',
      'M 6 23 L 2 23 L 2 27 L 6 27',
      'M 42 23 L 46 23 L 46 27 L 42 27',
      'M 8 32 L 12 32 L 12 40 L 8 40 Z',
      'M 36 32 L 40 32 L 40 40 L 36 40 Z',
      'M 21 32 L 27 32 L 27 38 L 21 38 Z',
      'M 20 25 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
    ],
    box: [2, 9, 44, 31],
  },
  /* long body with two burner wells and a flat plate */
  'ss-bhatti-twin-burner': {
    title: 'Stainless Steel Bhatti (Twin Burner)',
    paths: [
      'M 4 18 L 44 18 L 44 26 L 4 26 Z',
      'M 6 18 L 8 12 L 14 12 L 13 18',
      'M 42 18 L 40 12 L 34 12 L 35 18',
      'M 18 16 L 30 16 L 30 18 L 18 18 Z',
      'M 8 26 L 8 34',
      'M 40 26 L 40 34',
      'M 11 26 L 15 26 L 15 30 L 11 30 Z',
      'M 33 26 L 37 26 L 37 30 L 33 30 Z',
    ],
    box: [4, 12, 40, 22],
  },
  /* the same bhatti on a tall stand with a lower shelf */
  'ss-bhatti-twin-burner-shelf': {
    title: 'Stainless Steel Bhatti (Twin Burner, Shelf)',
    paths: [
      'M 4 18 L 44 18 L 44 26 L 4 26 Z',
      'M 6 18 L 8 12 L 14 12 L 13 18',
      'M 42 18 L 40 12 L 34 12 L 35 18',
      'M 18 16 L 30 16 L 30 18 L 18 18 Z',
      'M 8 26 L 8 40',
      'M 40 26 L 40 40',
      'M 11 26 L 15 26 L 15 30 L 11 30 Z',
      'M 33 26 L 37 26 L 37 30 L 33 30 Z',
      'M 8 33 L 40 33',
      'M 8 37 L 40 37',
    ],
    box: [4, 12, 40, 28],
  },
  /* round ring body on four tall legs */
  'ss-bhatti-round-extra-heavy': {
    title: 'Stainless Steel Bhatti (Round, Extra Heavy)',
    paths: [
      'M 8 14 L 40 14 L 40 18 L 8 18 Z',
      'M 12 7 L 18 7 L 18 14 L 12 14 Z',
      'M 30 7 L 36 7 L 36 14 L 30 14 Z',
      'M 10 18 L 10 28',
      'M 38 18 L 38 28',
      'M 10 28 L 38 28',
      'M 6 28 L 10 28 L 10 41 L 6 41 Z',
      'M 38 28 L 42 28 L 42 41 L 38 41 Z',
      'M 21 28 L 27 28 L 27 36 L 21 36 Z',
    ],
    box: [6, 7, 36, 34],
  },
  /* wide flat plate on a body with three control knobs */
  'ss-dosa-bhatti': {
    title: 'Stainless Steel Dosa Bhatti',
    paths: [
      'M 6 13 L 42 13 L 42 18 L 6 18 Z',
      'M 8 18 L 40 18 L 40 30 L 8 30 Z',
      'M 13.5 24 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0',
      'M 21.5 24 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0',
      'M 29.5 24 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0',
      'M 10 30 L 10 38',
      'M 38 30 L 38 38',
      'M 7 38 L 13 38',
      'M 35 38 L 41 38',
      'M 40 24 L 44 24',
    ],
    box: [6, 13, 38, 25],
  },
  /* flat plate beside a puffer section, with two control knobs */
  'ss-chapati-bhatti': {
    title: 'Stainless Steel Chapati Bhatti',
    paths: [
      'M 6 15 L 28 15 L 28 20 L 6 20 Z',
      'M 8 20 L 42 20 L 42 30 L 8 30 Z',
      'M 32 20 L 32 11',
      'M 36 20 L 36 11',
      'M 40 20 L 40 11',
      'M 10.5 25 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0',
      'M 18.5 25 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0',
      'M 10 30 L 10 38',
      'M 40 30 L 40 38',
      'M 7 38 L 13 38',
      'M 37 38 L 43 38',
    ],
    box: [6, 11, 37, 27],
  },
};

export function isExtraPicto(slug: string): slug is ExtraPictoName {
  return slug in extraPictos;
}
