import type { MachineId, MaterialId, Product, ProductGroup, ProductVariant } from './types';

// Alok Plastics — Product catalogue data
// Sources (client-supplied, the source of truth): "Water cooler and deepfreezer spare parts" catalogue and the
// "Commercial Gas Stoves" catalogue (plus catalogue screenshots for the burner / valve parts).
// See docs/catalogue-reconciliation.md for the page-by-page reconciliation.
// All catalogue prices are stored but NOT shown at launch (site.showPrices = false).
// Product photos: /images/products/<slug>.webp (1:1, 1200x1200), layered over the pictogram placeholder.
// The old catalogue page crops are no longer used in the UI, so `images` stays [] (kept for runtime/admin uploads).

// ─── Product Groups ───────────────────────────────────────────────────────────

export const productGroups: ProductGroup[] = [
  {
    id: '01',
    name: 'Water Cooler spare parts',
    slug: 'water-cooler-spare-parts',
    tagline: 'Valves, taps, drain and levelling parts for water coolers.',
    description: 'Float valves, push cocks, waste pipes, couplings, ventilation jalli and adjustable leg inserts for water coolers and dispensers.',
    anchorParts: ['float-valve', 'push-cock', 'waste-pipe'],
  },
  {
    id: '02',
    name: 'Deep freezer & Display counter Parts',
    slug: 'deep-freezer-display-counter-parts',
    tagline: 'Parts that keep doors sliding, closing and sealing.',
    description: 'Sliding bushes, locks, hinges, springs and gaskets for the doors of display counters and deep freezers.',
    anchorParts: ['f-bush', 'door-lock', 'hinge', 'gasket'],
  },
  {
    id: '03',
    name: 'Commercial Kitchen Spare parts',
    slug: 'commercial-kitchen-spare-parts',
    tagline: 'Burners, valves and stoves for commercial kitchens.',
    description: 'Jumbo and canteen burners, ring burners, brass canteen valves, pilot burners, gas adaptors and puffer plates, along with stainless steel commercial cooking stoves and bhattis.',
    anchorParts: ['jumbo-heavy-burner', 'brass-canteen-nojal-valve', 'pilot-burner'],
  },
  {
    id: '04',
    name: 'Caster wheel',
    slug: 'caster-wheel',
    tagline: 'Caster wheels for equipment and trolleys.',
    description: 'Share the size and load requirement and we will confirm availability and quote.',
    anchorParts: [],
  },
  {
    id: '05',
    name: 'On demand Customized Products',
    slug: 'on-demand-customized-products',
    tagline: 'Share a sample, drawing or photo and we will develop and supply it.',
    description: 'Parts made to your sample or drawing, from mould development to supply.',
    anchorParts: [],
  },
];

// ─── Helpers for the data below ───────────────────────────────────────────────

/** One variant: label as printed, optional printed note, optional catalogue price (stored, not shown). */
const v = (label: string, price?: number, note?: string): ProductVariant => ({
  label,
  ...(note ? { note } : {}),
  ...(price !== undefined ? { price } : {}),
});

/** Gasket profile codes exactly as printed on the two gasket sheets of the water cooler catalogue (pages 15 and 16). */
const GASKET_PROFILES = [
  'KMG II', 'CRG I', 'HOSHIZAKI', 'BIG II', 'BIG III', 'LWCG', 'CRG II', 'LMG', 'SNMG', 'LN PROFILE I',
  'LWCG O', 'SR SOFT', 'ALTG', 'BMG', 'NF PROFILE', 'HLMG II', 'ARG IV', 'BIG VI', 'BSP 372', 'R PROFILE',
  'BMG II', 'CRG III', 'LN PROFILE III', 'LWCG O III', 'ARE PROFILE II',
  'BIG IV', 'BIG V', 'GNMG IV', 'GNMG V', 'LN PROFILE II', 'DD PROFILE', 'ARG', 'ARG II', 'ARE III',
  'AMX', 'AMX II', 'AMX III', 'MMG', 'SRG', 'ST SOFT', 'ARE PROFILE', 'DF 15', 'NF PROFILE II', 'GDR PROFILE',
  'DOOR BRUSH', 'BSP 368', 'BSP 369',
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  // ══ Group 02: Deep freezer & Display counter parts ═══════════════════════════

  {
    slug: 'f-bush',
    name: 'F-Bush',
    group: '02',
    machine: 'TODO', // TODO(client): which machines use this part
    material: 'nylon',
    variants: [],
    catalogPrice: { amount: 10, unit: 'pc' }, // catalogue p.3: Rs. 10/pc (not shown: showPrices false)
    // COPY: drafted, needs client approval
    summary: 'A nylon sliding bush for display counter door channels, reducing friction and ensuring smooth door travel.',
    specs: [{ label: 'Use', value: 'Display counter sliding door bush' }],
    images: [],
    published: true,
  },

  {
    slug: 'door-lock',
    name: 'Door Lock',
    group: '02',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // not printed
    // catalogue p.12 (titled "Handle Lock"): chrome handle latch, sold as "Door lock big" and "Door lock small"
    variants: [v('Door lock big', 260), v('Door lock small', 160)],
    // COPY: drafted, needs client approval
    summary: 'A chrome handle latch for display counter and deep freezer doors, in big and small sizes.',
    images: [],
    published: true,
  },

  {
    slug: 'hinge',
    name: 'Hinge',
    group: '02',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // TODO(client): no catalogue page; see L-Type Hinge and SS Kabja for the printed hinges
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'Hinges for the doors of display counters and deep freezers.',
    images: [],
    published: true,
  },

  {
    slug: 'handle-lock',
    name: 'Handle Lock',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'nylon',
    variants: [],
    catalogPrice: { amount: 70, unit: 'pc' }, // catalogue p.6: RS. 70/pc
    // COPY: drafted, needs client approval
    summary: 'A nylon handle lock with a lever handle and a four-hole mounting plate.',
    images: [],
    published: true,
  },

  {
    slug: 'bracket-handle',
    name: 'Bracket Handle',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'ppcp',
    // catalogue p.7: sizes with prices
    variants: [v('3 Inch', 15), v('4 Inch', 20), v('5 Inch', 30), v('6 Inch', 35)],
    // COPY: drafted, needs client approval
    summary: 'A PPCP bracket-style pull handle in four sizes, from 3 to 6 inch.',
    images: [],
    published: true,
  },

  {
    slug: 'ss-kabja',
    name: 'SS Kabja 202',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'ss',
    // catalogue p.19: Size 3 Inch | 24 Rs, Size 4 Inch | 32 Rs. "12 Gauge Heavy Duty" is printed on the catalogue sheet.
    variants: [v('3 Inch', 24), v('4 Inch', 32)],
    // COPY: drafted, needs client approval
    specs: [{ label: 'Duty', value: '12 gauge heavy duty' }],
    summary: 'A stainless steel SS Kabja 202 hinge in 3 inch and 4 inch sizes.',
    images: [],
    published: true,
  },

  {
    slug: 'l-type-hinge',
    name: 'L-Type Hinge',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'ss',
    variants: [],     // TODO(client): sizes
    catalogPrice: { amount: 95, unit: 'pc' }, // catalogue p.14: Rs. 95/pc
    // COPY: drafted, needs client approval
    summary: 'A stainless steel L-type hinge, supplied as a pivot pair for door and panel applications.',
    images: [],
    published: true,
  },

  {
    slug: 'u-type-door-spring',
    name: 'U-Type Door Spring',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'ss',
    variants: [],
    catalogPrice: { amount: 100, unit: 'pc' }, // catalogue p.17: Rs. 100/pc
    // COPY: drafted, needs client approval
    summary: 'A stainless steel U-type wire spring with a coil at each end, for self-closing door mechanisms.',
    images: [],
    published: true,
  },

  {
    slug: 'l-hinge-door-spring',
    name: 'L-Hinge Door Spring',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'ss',
    variants: [],
    catalogPrice: { amount: 249, unit: 'pc' }, // catalogue p.20: Rs. 249/pc
    // COPY: drafted, needs client approval
    summary: 'A stainless steel L-hinge door spring set: L-shaped hinge plates, pin and coil spring.',
    images: [],
    published: true,
  },

  {
    slug: 'gasket',
    name: 'Gasket',
    group: '02',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // TODO(client): not printed
    // catalogue pp.15-16: profile codes as printed (no sizes or prices are printed for gaskets)
    variants: GASKET_PROFILES.map(code => v(code)),
    specs: [{ label: 'Finishing', value: 'Machine jointing & finishing' }],
    // COPY: drafted, needs client approval
    summary: 'Door gaskets in a wide range of profiles for display counters and deep freezers. Send a sample or the profile code for a quote.',
    images: [],
    published: true,
  },

  {
    slug: 'puf-chemical',
    name: 'PUF Chemical',
    group: '02', // provisional: TODO(client) confirm group (catalogue p.18 does not say where it is used)
    machine: 'TODO',
    material: undefined,
    // catalogue p.18: "Polyol & Isocyanate", Rs. 270/kg, shown as a POL drum and an ISO drum
    variants: [v('Polyol (POL)'), v('Isocyanate (ISO)')],
    catalogPrice: { amount: 270, unit: 'kg' },
    // COPY: drafted, needs client approval
    summary: 'PUF chemical supplied as two components, Polyol (POL) and Isocyanate (ISO).',
    images: [],
    published: true,
  },

  {
    slug: 'bright-chrome',
    name: 'Bright Chrome',
    group: '02', // provisional: TODO(client) confirm group (catalogue pp.21-22 do not say where it is used)
    machine: 'TODO',
    material: undefined,
    // catalogue p.21: 318 Bright Chrome spray paint Rs. 110/pc; p.22: Bright Chrome acrylic lacquer aerosol Rs. 120/pc
    variants: [v('318 Bright Chrome spray paint', 110), v('Bright Chrome acrylic lacquer aerosol', 120)],
    // COPY: drafted, needs client approval
    summary: 'Bright Chrome finish in an aerosol can, listed as 318 spray paint and as an acrylic lacquer.',
    images: [],
    published: true,
  },

  // ══ Group 01: Water Cooler spare parts ═══════════════════════════════════════

  {
    slug: 'connecting-bush',
    name: 'Connecting Bush',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: 'brass', // brass and nylon variants exist
    // catalogue p.5: Available in 2", 2.5" and 3"; brass Rs. 200/pc, plastic (nylon) Rs. 190/pc
    variants: [
      v('Brass connecting bush', 200, 'Available in 2", 2.5" and 3"'),
      v('Plastic (nylon) connecting bush', 190, 'Available in 2", 2.5" and 3"'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A connecting bush in brass or nylon, available in 2, 2.5 and 3 inch sizes.',
    images: [],
    published: true,
  },

  {
    slug: 'float-valve',
    name: 'Float Valve',
    group: '01',
    machine: ['water-cooler'],
    material: 'nylon',
    variants: [],
    catalogPrice: { amount: 180, unit: 'set' }, // catalogue p.8: Rs. 180/set (not shown)
    // COPY: drafted, needs client approval
    summary: 'A nylon float valve that controls the water level inside water coolers and dispensers.',
    images: [],
    published: true,
  },

  {
    slug: 'push-cock',
    name: 'Push Cock',
    group: '01',
    machine: ['water-cooler'],
    material: 'brass',
    // catalogue p.11: Anti-Leak Seal, Material Brass; Light Rs. 280/pc, Heavy Rs. 300/pc
    variants: [v('Light', 280), v('Heavy', 300)],
    // COPY: drafted, needs client approval
    summary: 'A brass push-type tap with an anti-leak seal for water dispensing on water coolers, in light and heavy versions.',
    images: [],
    published: true,
  },

  {
    slug: 'waste-pipe',
    name: 'Waste Pipe',
    group: '01',
    machine: ['water-cooler', 'display-counter'],
    material: 'ppcp',
    variants: [],
    catalogPrice: { amount: 20, unit: 'pc' }, // catalogue p.9: Rs. 20/pc (not shown)
    // COPY: drafted, needs client approval
    summary: 'A PPCP waste pipe for draining overflow water from water coolers and display counters.',
    images: [],
    published: true,
  },

  {
    slug: 'waste-coupling',
    name: 'Waste Coupling',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: 'ss',
    variants: [],
    catalogPrice: { amount: 60, unit: 'pc' }, // catalogue p.13: RS 60/pc
    // COPY: drafted, needs client approval
    summary: 'A stainless steel waste coupling for waste pipe assemblies.',
    images: [],
    published: true,
  },

  {
    slug: 'three-core-plug',
    name: 'Three Core Plug',
    group: '01', // provisional: TODO(client) confirm group (catalogue p.10)
    machine: 'TODO',
    material: undefined,
    // catalogue p.10: 2.5 Meters = Rs 160, 3 Meters = Rs 200 (3-pin plug with cable; one end open, one end with ring terminals)
    variants: [v('2.5 Meters', 160), v('3 Meters', 200)],
    // COPY: drafted, needs client approval
    summary: 'A three core plug with cable, supplied in 2.5 and 3 metre lengths.',
    images: [],
    published: true,
  },

  {
    slug: 'ventilation-jalli',
    name: 'Ventilation Jalli',
    group: '01',
    machine: ['water-cooler', 'display-counter', 'deep-freezer'],
    material: 'ppcp',
    // catalogue p.4: sizes with prices (the earlier "RS 60 / RS 75 ..." labels were prices, not sizes)
    variants: [
      v('11" x 11"', 60),
      v('14" x 14"', 75),
      v('14" x 17"', 80),
      v('18.5" x 10"', 130),
    ],
    // COPY: drafted, needs client approval
    summary: 'A PPCP ventilation grille in four sizes for water coolers, display counters and deep freezers.',
    images: [],
    published: true,
  },

  {
    slug: 'adjustable-leg-insert',
    name: 'Adjustable Leg Insert',
    group: '01',
    machine: ['water-cooler', 'display-counter', 'deep-freezer'],
    material: 'hdpe',
    variants: [
      v('1" Round'), v('1" Square'),
      v('1.25" Round'), v('1.25" Square'),
      v('1.5" Round'), v('1.5" Square'),
      v('1.75" Round'), v('1.75" Square'),
      v('2" Round'), v('2" Square'),
    ],
    catalogPrice: { amount: 12, unit: 'pc' }, // catalogue p.2: RS. 12/pc (not shown)
    // COPY: drafted, needs client approval
    summary: 'An HDPE adjustable insert for hollow steel legs, with an adjustable foot for fine height adjustment. Round and square, five sizes.',
    images: [],
    published: true,
  },

  // ══ Group 03: Commercial Kitchen spare parts ═════════════════════════════════
  // Source: "Commercial Gas Stoves" catalogue + burner/valve catalogue screenshots (see docs/catalogue-reconciliation.md).
  // Stove sizes are printed without a unit (e.g. 10x10x6); stored exactly as printed.

  {
    slug: 'jumbo-lite-burner',
    name: 'Jumbo Lite Burner',
    group: '03',
    machine: ['gas-stove'],
    material: undefined, // not printed
    variants: [],
    catalogPrice: { amount: 490, unit: 'pc' }, // screenshot p.16: Price Rs. 490.00
    packing: '8 pcs',
    moq: '8 pcs',
    fitment: '18x18 size heavy SS & MS commercial stove (bhatti)',
    specs: [{ label: 'Weight', value: '4 kg approx.' }],
    // COPY: drafted, needs client approval
    summary: 'A jumbo lite gas burner for 18x18 size heavy SS and MS commercial stoves (bhatti), packed 8 pcs.',
    keywords: ['gas burner', 'bhatti burner', 'commercial stove'],
    images: [],
    published: true,
  },

  {
    slug: 'jumbo-heavy-burner',
    name: 'Jumbo Heavy Burner',
    group: '03',
    machine: ['gas-stove'],
    material: undefined, // not printed
    variants: [],
    catalogPrice: { amount: 540, unit: 'pc' }, // screenshot p.16: Price Rs. 540.00
    packing: '8 pcs',
    fitment: '18x18 MS & SS bhatti (commercial stove)',
    specs: [{ label: 'Weight', value: '4.5 kg' }],
    // COPY: drafted, needs client approval
    summary: 'A jumbo heavy gas burner for 18x18 MS and SS bhatti (commercial stoves), packed 8 pcs.',
    keywords: ['gas burner', 'bhatti burner', 'commercial stove'],
    images: [],
    published: true,
  },

  {
    slug: 'delux-canteen-heavy-with-ring',
    name: 'Delux Canteen Heavy With Ring',
    group: '03',
    machine: ['gas-stove'],
    material: undefined, // not printed
    variants: [],
    // screenshot p.32: "Price Rs. 1060.00/1105.00" (two prices, no label saying what each is for)
    catalogNote: 'Price Rs. 1060.00/1105.00 as printed; the two prices are not labelled.',
    packing: 'Canteen 6 pcs & ring 10 pcs',
    specs: [{ label: 'Weight', value: '9.25 kg approx. with ring' }],
    // COPY: drafted, needs client approval
    summary: 'A delux heavy canteen gas burner supplied with its pan ring, about 9.25 kg with the ring.',
    keywords: ['canteen burner', 'gas burner', 'commercial stove'],
    images: [],
    published: true,
  },

  {
    slug: 'jumbo-canteen-heavy-with-ring',
    name: 'Jumbo Canteen Heavy With Ring',
    group: '03',
    machine: ['gas-stove'],
    material: undefined, // not printed
    variants: [],
    // screenshot p.32 (continued): "Price Rs. 1532.00/1582.00", the rest of the card is cut off in the supplied screenshot
    catalogNote: 'Price Rs. 1532.00/1582.00 as printed; the two prices are not labelled. Lines below the price were cut off in the supplied screenshot.',
    specs: [{ label: 'Weight', value: '12.5 kg approx.' }],
    // COPY: drafted, needs client approval
    summary: 'A jumbo heavy canteen gas burner supplied with its pan ring, about 12.5 kg.',
    keywords: ['canteen burner', 'gas burner', 'commercial stove'],
    images: [],
    published: true,
  },

  {
    slug: 'korian-ring-burner-3pcs-set',
    name: 'Korian Ring Burner 3pcs Set',
    group: '03',
    machine: ['gas-stove'],
    material: undefined, // not printed
    // screenshot p.6: Price 8"-1550, 14"-2750, 21"-4000; Wt. 8"-7.5kg, 14"-12.5kg, 21"-20kg; set price Rs.8300
    variants: [
      v('8" ring', 1550, 'Weight 7.5 kg'),
      v('14" ring', 2750, 'Weight 12.5 kg'),
      v('21" ring', 4000, 'Weight 20 kg'),
    ],
    catalogPrice: { amount: 8300, unit: 'set' },
    packing: 'Packing charge extra',
    // COPY: drafted, needs client approval
    summary: 'A Korian ring burner supplied as a set of three rings: 8, 14 and 21 inch.',
    keywords: ['ring burner', 'gas burner'],
    images: [],
    published: true,
  },

  {
    slug: 'brass-canteen-nojal-valve',
    name: 'Brass Canteen Nojal Valve',
    group: '03',
    machine: ['gas-stove'],
    material: 'brass',
    // screenshot p.4: Price Rs. 87.00/98.00/114.00; Available in 65gm/75gms/85gms; Packing 25 pcs Pouch, MOQ-100 Pcs.
    // The three prices are matched to the three weights in the order printed (to be confirmed by the client).
    variants: [v('65 gm', 87), v('75 gm', 98), v('85 gm', 114)],
    packing: '25 pcs pouch',
    moq: '100 pcs',
    // COPY: drafted, needs client approval
    summary: 'A brass canteen valve with a nojal (nozzle) outlet and a red knob, in 65, 75 and 85 gm weights.',
    keywords: ['canteen valve', 'gas valve', 'nojal'],
    images: [],
    published: true,
  },

  {
    slug: 'brass-canteen-valve-3-8-nut',
    name: 'Brass Canteen Valve 3/8 Nut',
    group: '03',
    machine: ['gas-stove'],
    material: 'brass',
    // screenshot p.4 (continued): Price Rs. 87.00/98.00/114.00; Weight 65gms/75gm/85gm; Packing 25 Pcs Pouch, MOQ-100 pcs
    variants: [v('65 gm', 87), v('75 gm', 98), v('85 gm', 114)],
    packing: '25 pcs pouch',
    moq: '100 pcs',
    // COPY: drafted, needs client approval
    summary: 'A brass canteen valve with a 3/8 nut outlet and a red knob, in 65, 75 and 85 gm weights.',
    keywords: ['canteen valve', 'gas valve'],
    images: [],
    published: true,
  },

  {
    slug: 'pilot-burner',
    name: 'Pilot Burner (Full Brass)',
    group: '03',
    machine: ['gas-stove'],
    material: 'brass',
    // screenshot p.14: Lite / Medium / Heavy shown; "Price Rs. 105.00/132.00" (two prices for three types);
    // "Lite-68gm, Medium-90gm" in the caption vs 65 / 85 / 95 gm on the photo. Not matched to variants.
    variants: [v('Lite'), v('Medium'), v('Heavy')],
    catalogNote: 'Price Rs. 105.00/132.00 as printed (two prices for three types). Caption: Lite-68gm, Medium-90gm. Photo label: Lite 65gm, Medium 85gm, Heavy 95gm.',
    packing: '100 pcs pouch',
    moq: '100 pcs',
    // COPY: drafted, needs client approval
    summary: 'A full brass pilot burner in lite, medium and heavy types, packed 100 pcs per pouch.',
    keywords: ['pilot burner', 'gas burner'],
    images: [],
    published: true,
  },

  {
    slug: 'hp-adaptor-ci-nojal',
    name: 'HP Adaptor CI Nojal',
    group: '03',
    machine: ['gas-stove'],
    material: 'cast-iron', // "CI" in the printed name, read as cast iron (to be confirmed)
    variants: [],
    catalogPrice: { amount: 97, unit: 'pc' }, // screenshot p.14: Price Rs. 97.00
    packing: '200 pcs',
    specs: [{ label: 'Weight', value: '190 gm' }],
    // COPY: drafted, needs client approval
    summary: 'An HP adaptor with a CI nojal, 190 gm each, packed 200 pcs.',
    keywords: ['gas adaptor', 'LPG adaptor', 'nojal'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-puffer-plate',
    name: 'SS Puffer Plate with SS Capsule',
    group: '03',
    machine: ['gas-stove'],
    material: 'ss',
    // screenshot p.7: Available sizes 10x15, 10x18, 10x22, 12x12, 12x15, 12x18, 12x24; Price Rs 6.50 per Inch;
    // "Making 3mm Plate with Heavy Duty" (the rest of the card is cut off in the supplied screenshot)
    variants: [v('10x15'), v('10x18'), v('10x22'), v('12x12'), v('12x15'), v('12x18'), v('12x24')],
    catalogPrice: { amount: 6.5, unit: 'inch' },
    specs: [{ label: 'Plate', value: '3 mm plate, heavy duty' }],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel puffer plate with SS capsules, made on a 3 mm heavy duty plate in seven sizes.',
    keywords: ['puffer plate', 'chapati bhatti'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-square-lite',
    name: 'Stainless Steel Square Lite',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.2-3
    variants: [
      v('10x10x6 Lite', 755, 'Weight 2.8 kg, double buff'),
      v('12x12x7 Lite', 870, 'Weight 3.4 kg, double buff'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel square commercial cooking stove, Lite series, in 10x10x6 and 12x12x7 sizes.',
    keywords: ['commercial cooking stove', 'gas stove', 'bhatti'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-square-heavy',
    name: 'Stainless Steel Square Heavy',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.4-5
    variants: [
      v('10x10x8 Heavy', 860, 'Weight 3.26 kg, double buff'),
      v('12x12x8.5 Heavy', 1005, 'Weight 4 kg, double buff'),
      v('15x15x9.5 Heavy', 1505, 'Weight 6.35 kg, double buff'),
      v('18x18x10 Heavy', 2080, 'Weight 8.9 kg, double buff'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel square commercial cooking stove, Heavy series, in four sizes from 10x10x8 to 18x18x10.',
    keywords: ['commercial cooking stove', 'gas stove', 'bhatti'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-square-heavy-extra-height',
    name: 'Stainless Steel Square Heavy (Extra Height)',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.6-7 (page 6 is titled "Stainless Steel Square Heavy"; the price sheet says "Extra Hight")
    variants: [
      v('12x12x12 Heavy', 1205, 'Weight 4.5 kg, double buff, extra height'),
      v('15x15x15 Heavy', 1990, 'Weight 7 kg, double buff, extra height'),
      v('18x18x18 Heavy', 2795, 'Weight 7 kg, double buff, extra height'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel square commercial cooking stove, Heavy series with extra height, in three sizes up to 18x18x18.',
    keywords: ['commercial cooking stove', 'gas stove', 'bhatti'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-round-casting',
    name: 'Stainless Steel Round Casting',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.8-9
    variants: [
      v('10x10x8', 950, 'Weight 4.5 kg, double buff, casting iron heavy ring'),
      v('12x12x9', 1110, 'Weight 5.6 kg, double buff, casting iron heavy ring'),
      v('15x15x10', 1570, 'Weight 8.3 kg, double buff, casting iron heavy ring'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel round commercial cooking stove with a casting iron heavy ring, in three sizes.',
    keywords: ['commercial cooking stove', 'gas stove', 'bhatti'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-round-stove',
    name: 'Stainless Steel Round Stove',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.10-11
    variants: [
      v('10x10x8', 1060, 'Weight 3.3 kg, double buff, heavy stainless steel ring'),
      v('12x12x9', 1200, 'Weight 4.2 kg, double buff, heavy stainless steel ring'),
      v('15x15x10', 1665, 'Weight 6.45 kg, double buff, heavy stainless steel ring'),
      v('18x18x11', 2285, 'Weight 9 kg, double buff, heavy stainless steel ring'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel round commercial cooking stove with a heavy stainless steel ring, in four sizes.',
    keywords: ['commercial cooking stove', 'gas stove', 'bhatti'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-bhatti-twin-burner',
    name: 'Stainless Steel Bhatti (Twin Burner)',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.12-13 (printed title "Stainless Steel Bhatti"; the suffix tells the three bhatti pages apart)
    variants: [
      v('10x30x8 Heavy', 2720, 'Weight 9 kg, double buff'),
      v('12x36x9 Heavy', 3300, 'Weight 11 kg, double buff'),
      v('15x45x10 Heavy', 4485, 'Weight 16 kg, double buff'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel bhatti with two burners and a flat plate between them, in three heavy sizes.',
    keywords: ['commercial cooking stove', 'bhatti', 'gas stove'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-bhatti-twin-burner-shelf',
    name: 'Stainless Steel Bhatti (Twin Burner, Shelf)',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.14-15 (printed title "Stainless Steel Bhatti"; price sheet: "Without fittings packing 1ps Loose Packing")
    variants: [
      v('10x30x18 Heavy', 3175, 'Weight 7 kg, double buff, without fittings, packing 1 pc loose'),
      v('12x36x24 Heavy', 3740, 'Weight 12 kg, double buff, without fittings, packing 1 pc loose'),
      v('15x45x30 Heavy', 5100, 'Weight 18 kg, double buff, without fittings, packing 1 pc loose'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A stainless steel bhatti with two burners, a flat plate and a lower shelf on a tall stand, in three heavy sizes.',
    keywords: ['commercial cooking stove', 'bhatti', 'gas stove'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-bhatti-round-extra-heavy',
    name: 'Stainless Steel Bhatti (Round, Extra Heavy)',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue pp.18-19 (printed title "Stainless Steel Bhatti"). The "5year Guarantee" printed against the SS ring
    // sizes is NOT shown on the site until the client confirms its terms (docs/client-questions.md).
    variants: [
      v('10x10x8.5 Extra Heavy, heavy casting ring', 1110, 'Weight 5.25 kg'),
      v('12x12x9.5 Extra Heavy, heavy casting ring', 1305, 'Weight 6.5 kg'),
      v('15x15x10.5 Extra Heavy, heavy casting ring', 1810, 'Weight 9.5 kg'),
      v('10x10x8.5 Extra Heavy, heavy SS ring', 1220, 'Weight 4.2 kg'),
      v('12x12x9.5 Extra Heavy, heavy SS ring', 1415, 'Weight 5 kg'),
      v('15x15x10.5 Extra Heavy, heavy SS ring', 1905, 'Weight 7.7 kg'),
    ],
    // COPY: drafted, needs client approval
    summary: 'A round stainless steel bhatti with a heavy casting ring or a heavy SS ring, in three extra heavy sizes.',
    keywords: ['commercial cooking stove', 'bhatti', 'gas stove'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-dosa-bhatti',
    name: 'Stainless Steel Dosa Bhatti',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue p.16: Size 19X36X12 Heavy; Heavy 304 SS, 10mm Plate, 3RV Burner; Packing Frame 2pcs & Plate Single-Single; Rs 8830
    variants: [v('19x36x12 Heavy', 8830, 'Heavy 304 SS, 10 mm plate, 3RV burner')],
    packing: 'Frame 2 pcs & plate single-single',
    // COPY: drafted, needs client approval
    summary: 'A heavy 304 stainless steel dosa bhatti with a 10 mm plate and a 3RV burner, size 19x36x12.',
    keywords: ['dosa bhatti', 'commercial cooking stove'],
    images: [],
    published: true,
  },

  {
    slug: 'ss-chapati-bhatti',
    name: 'Stainless Steel Chapati Bhatti',
    group: '03',
    machine: ['commercial-kitchen'],
    material: 'ss',
    // Gas stove catalogue p.17: Size 19X36X12 Heavy; SS Puffer Plate, 10mm MS Plate, 2RV Burner; Packing Frame 2Pcs & Plate Single-Single; Rs 9570
    variants: [v('19x36x12 Heavy', 9570, 'SS puffer plate, 10 mm MS plate, 2RV burner')],
    packing: 'Frame 2 pcs & plate single-single',
    // COPY: drafted, needs client approval
    summary: 'A stainless steel chapati bhatti with an SS puffer plate, a 10 mm MS plate and a 2RV burner, size 19x36x12.',
    keywords: ['chapati bhatti', 'commercial cooking stove'],
    images: [],
    published: true,
  },

  // Group 04 (Caster wheel) and group 05 (On demand Customized Products): no products supplied yet. See docs/client-questions.md.
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const publishedProducts = products.filter(p => p.published);

export const productsByGroup = (groupId: string) =>
  publishedProducts.filter(p => p.group === groupId);

export const getProduct = (slug: string) =>
  products.find(p => p.slug === slug);

export const getGroup = (id: string) =>
  productGroups.find(g => g.id === id);

// ─── Page helpers (added for /products routes — no data changes) ──────────────


export const MATERIAL_LABELS: Record<MaterialId, string> = {
  nylon: 'Nylon',
  hdpe: 'HDPE',
  ppcp: 'PPCP',
  brass: 'Brass',
  ss: 'SS',
  'cast-iron': 'Cast iron',
};

export const MACHINE_LABELS: Record<MachineId, string> = {
  'water-cooler': 'Water cooler',
  'display-counter': 'Display counter',
  'deep-freezer': 'Deep freezer',
  'gas-stove': 'Gas stove',
  'commercial-kitchen': 'Commercial kitchen',
};

export const getGroupBySlug = (slug: string) =>
  productGroups.find(g => g.slug === slug);

/** Canonical path for a published, grouped product (trailing slash). */
export const productPath = (p: Product): string => {
  if (p.custom) return `/products/item/?s=${encodeURIComponent(p.slug)}`;
  const built = getProduct(p.slug) ?? p;
  const g = built.group ? getGroup(built.group) : undefined;
  return g ? `/products/${g.slug}/${p.slug}/` : '/products/';
};

/** Known machines only — returns [] when machine fit is unconfirmed. */
export const knownMachines = (p: Product): MachineId[] =>
  Array.isArray(p.machine) ? p.machine : [];

/**
 * Product photo path (1:1, 1200x1200 webp), layered over the pictogram placeholder with PhotoBg.
 * Convention: /images/products/<slug>.webp. The file may not exist yet; PhotoBg then renders nothing.
 * Products created in the admin panel (`custom`) have no static photo: they use uploaded images only.
 */
export const productPhoto = (p: Pick<Product, 'slug' | 'photo' | 'custom'>): string | null =>
  p.custom ? null : (p.photo ?? `/images/products/${p.slug}.webp`);
