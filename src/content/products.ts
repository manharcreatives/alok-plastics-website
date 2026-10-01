import type { MachineId, MaterialId, Product, ProductGroup } from './types';

// Alok Plastics — Product catalogue data
// Sources: §6.1 (taxonomy), §6.2 (catalogue data)
// All catalogue prices are stored but NOT shown at launch (site.showPrices = false)
// Products with group: null are unpublished until client confirms their group

// ─── Product Groups ───────────────────────────────────────────────────────────

export const productGroups: ProductGroup[] = [
  {
    id: '01',
    name: 'Sliding & Door Systems',
    slug: 'sliding-door-systems',
    // COPY: drafted, needs client approval
    tagline: 'Parts that keep doors moving and closing smoothly.',
    // COPY: drafted, needs client approval
    description: 'Bushes, locks, hinges and springs for the sliding and hinged doors of display counters, deep freezers and industrial enclosures.',
    anchorParts: ['f-bush', 'connecting-bush', 'door-lock', 'hinge'],
  },
  {
    id: '02',
    name: 'Water Control',
    slug: 'water-control',
    // COPY: drafted, needs client approval
    tagline: 'Parts that manage water flow inside coolers and dispensers.',
    // COPY: drafted, needs client approval
    description: 'Float valves, push cocks and waste pipes for water coolers, dispensers and related equipment.',
    anchorParts: ['float-valve', 'push-cock', 'waste-pipe'],
  },
  {
    id: '03',
    name: 'Ventilation & Levelling',
    slug: 'ventilation-levelling',
    // COPY: drafted, needs client approval
    tagline: 'Parts that keep equipment breathing and standing level.',
    // COPY: drafted, needs client approval
    description: 'Ventilation jalli for airflow and adjustable leg inserts for levelling coolers, counters and freezers on uneven surfaces.',
    anchorParts: ['ventilation-jalli', 'adjustable-leg-insert'],
  },
  {
    id: '04',
    name: 'Sealing',
    slug: 'sealing',
    // COPY: drafted, needs client approval
    tagline: 'Parts that seal and protect against leaks and heat loss.',
    // COPY: drafted, needs client approval
    description: 'Gaskets for sealing refrigeration compartments, door frames and water-tight joints.',
    anchorParts: ['gasket'],
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  // ── Group 01: Sliding & Door Systems ────────────────────────────────────────

  {
    slug: 'f-bush',
    name: 'F-Bush',
    group: '01',
    machine: 'TODO', // TODO(client): which machines use this part
    material: 'nylon',
    variants: [],     // TODO(client): sizes/variants from catalogue
    price: { amount: 10, unit: 'pc' }, // catalogue price — not shown (showPrices: false)
    sku: undefined,   // TODO(client)
    hsn: undefined,   // TODO(client)
    moq: undefined,   // TODO(client)
    packing: undefined, // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A nylon sliding bush for display counter door channels, reducing friction and ensuring smooth door travel.',
    images: [], // TODO(client): product photos
    published: true,
  },

  {
    slug: 'connecting-bush',
    name: 'Connecting Bush',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: 'brass', // brass and nylon variants exist
    variants: [
      { label: '2"' },
      { label: '2.5"' },
      { label: '3"' },
      { label: 'Nylon variant', note: 'Available in nylon as an alternative to brass' },
    ],
    price: undefined, // TODO(client): variant-wise prices from catalogue
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A connecting bush available in brass and nylon, used to join pipes and fittings in water cooler and deep freezer systems.',
    images: [],
    published: true,
  },

  {
    slug: 'door-lock',
    name: 'Door Lock',
    group: '01',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // TODO(client): confirm material from catalogue
    variants: [],        // TODO(client): variants/sizes
    // COPY: drafted, needs client approval
    summary: 'A locking mechanism for display counter and deep freezer doors.',
    images: [],
    published: true,
  },

  {
    slug: 'hinge',
    name: 'Hinge',
    group: '01',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // TODO(client): confirm material
    variants: [],        // TODO(client): L-Type and other types
    // COPY: drafted, needs client approval
    summary: 'Hinges for the doors of display counters and deep freezers.',
    images: [],
    published: true,
  },

  {
    slug: 'handle-lock',
    name: 'Handle Lock',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A combined handle and lock component.',
    images: [],
    published: true,
  },

  {
    slug: 'bracket-handle',
    name: 'Bracket Handle',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A bracket-style handle for equipment doors and panels.',
    images: [],
    published: true,
  },

  {
    slug: 'ss-kabja',
    name: 'SS Kabja',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: 'ss',  // SS = stainless steel implied — TODO(client): confirm
    variants: [],    // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A stainless steel hinge (kabja) for equipment doors.',
    images: [],
    published: true,
  },

  {
    slug: 'l-type-hinge',
    name: 'L-Type Hinge',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],    // TODO(client): sizes
    // COPY: drafted, needs client approval
    summary: 'An L-type hinge for door and panel applications.',
    images: [],
    published: true,
  },

  {
    slug: 'u-type-door-spring',
    name: 'U-Type Door Spring',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A U-type spring for self-closing door mechanisms.',
    images: [],
    published: true,
  },

  {
    slug: 'l-hinge-door-spring',
    name: 'L-Hinge Door Spring',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A spring mechanism for L-type hinged doors.',
    images: [],
    published: true,
  },

  // ── Group 02: Water Control ──────────────────────────────────────────────────

  {
    slug: 'float-valve',
    name: 'Float Valve',
    group: '02',
    machine: ['water-cooler'],
    material: 'nylon',
    variants: [],
    price: { amount: 180, unit: 'set' }, // catalogue price — not shown
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A nylon float valve that controls the water level inside water coolers and dispensers.',
    images: [],
    published: true,
  },

  {
    slug: 'push-cock',
    name: 'Push Cock',
    group: '02',
    machine: ['water-cooler'],
    material: 'brass',
    variants: [
      { label: 'Light' },
      { label: 'Heavy' },
    ],
    price: undefined, // TODO(client): listed prices from catalogue
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A brass push-type tap for water dispensing on water coolers. Available in light and heavy duty.',
    images: [],
    published: true,
  },

  {
    slug: 'waste-pipe',
    name: 'Waste Pipe',
    group: '02',
    machine: ['water-cooler', 'display-counter'],
    material: 'ppcp',
    variants: [],
    price: { amount: 20, unit: 'pc' }, // catalogue price — not shown
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A PPCP waste pipe for draining overflow water from water coolers and display counters.',
    images: [],
    published: true,
  },

  {
    slug: 'waste-coupling',
    name: 'Waste Coupling',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A coupling connector for waste pipe assemblies.',
    images: [],
    published: true,
  },

  // ── Group 03: Ventilation & Levelling ────────────────────────────────────────

  {
    slug: 'ventilation-jalli',
    name: 'Ventilation Jalli',
    group: '03',
    machine: ['water-cooler', 'display-counter', 'deep-freezer'],
    material: 'ppcp',
    variants: [
      { label: 'RS 60' },
      { label: 'RS 75' },
      { label: 'RS 80' },
      { label: 'RS 130' },
    ],
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A PPCP ventilation grille that fits water coolers, display counters and deep freezers to allow airflow while keeping out debris.',
    images: [],
    published: true,
  },

  {
    slug: 'adjustable-leg-insert',
    name: 'Adjustable Leg Insert',
    group: '03',
    machine: ['water-cooler', 'display-counter', 'deep-freezer'],
    material: 'hdpe',
    variants: [
      { label: '1" Round' },
      { label: '1" Square' },
      { label: '1.25" Round' },
      { label: '1.25" Square' },
      { label: '1.5" Round' },
      { label: '1.5" Square' },
      { label: '1.75" Round' },
      { label: '1.75" Square' },
      { label: '2" Round' },
      { label: '2" Square' },
    ],
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'An HDPE adjustable insert for equipment legs, allowing fine height adjustment and protecting floors. Available in round and square tube sections, five sizes.',
    images: [],
    published: true,
  },

  // ── Group 04: Sealing ────────────────────────────────────────────────────────

  {
    slug: 'gasket',
    name: 'Gasket',
    group: '04',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // TODO(client): confirm material from catalogue
    variants: [],        // TODO(client): sizes and types
    // COPY: drafted, needs client approval
    summary: 'A door gasket that seals the frame of display counters and deep freezers, preventing heat exchange and moisture ingress.',
    images: [],
    published: true,
  },

  // ── Unconfirmed items — published: false until group confirmed ────────────────

  {
    slug: 'three-core-plug',
    name: 'Three Core Plug',
    group: null,         // TODO(client): confirm group assignment
    machine: 'TODO',
    material: undefined, // TODO(client)
    variants: [],
    images: [],
    published: false,    // not shown until group confirmed
  },

  {
    slug: 'puf-chemical',
    name: 'PUF Chemical',
    group: null,         // TODO(client): confirm group assignment and description
    machine: 'TODO',
    material: undefined,
    variants: [],
    images: [],
    published: false,
  },

  {
    slug: 'bright-chrome',
    name: 'Bright Chrome',
    group: null,         // TODO(client): confirm group assignment and description
    machine: 'TODO',
    material: undefined,
    variants: [],
    images: [],
    published: false,
  },
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
};

export const MACHINE_LABELS: Record<MachineId, string> = {
  'water-cooler': 'Water cooler',
  'display-counter': 'Display counter',
  'deep-freezer': 'Deep freezer',
};

export const getGroupBySlug = (slug: string) =>
  productGroups.find(g => g.slug === slug);

/** Canonical path for a published, grouped product (trailing slash). */
export const productPath = (p: Product): string => {
  const g = p.group ? getGroup(p.group) : undefined;
  return g ? `/products/${g.slug}/${p.slug}/` : '/products/';
};

/** Known machines only — returns [] when machine fit is unconfirmed. */
export const knownMachines = (p: Product): MachineId[] =>
  Array.isArray(p.machine) ? p.machine : [];
