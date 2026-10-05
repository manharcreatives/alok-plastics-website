import type { MachineId, MaterialId, Product, ProductGroup } from './types';

// Alok Plastics — Product catalogue data
// Sources: §6.1 (taxonomy), §6.2 (catalogue data)
// All catalogue prices are stored but NOT shown at launch (site.showPrices = false)
// Products with group: null are unpublished until client confirms their group

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
    tagline: 'Spare parts for commercial kitchen equipment.',
    description: 'Tell us the part and the equipment it belongs to, and we will confirm availability and quote.',
    anchorParts: [],
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

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  // ── Door, sliding and sealing parts ────────────────────────────────────────

  {
    slug: 'f-bush',
    name: 'F-Bush',
    group: '02',
    machine: 'TODO', // TODO(client): which machines use this part
    material: 'nylon',
    variants: [],     // TODO(client): sizes/variants from catalogue
    catalogPrice: { amount: 10, unit: 'pc' }, // catalogue price — not shown (showPrices: false)
    sku: undefined,   // TODO(client)
    hsn: undefined,   // TODO(client)
    moq: undefined,   // TODO(client)
    packing: undefined, // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A nylon sliding bush for display counter door channels, reducing friction and ensuring smooth door travel.',
    images: [
      { src: '/catalogue/spares/page-003-004.jpg', alt: 'F-Bush nylon sliding bush, Alok Plastics', w: 700, h: 900 },
    ],
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
    images: [
      { src: '/catalogue/spares/page-005-006.jpg', alt: 'Connecting Bush, Alok Plastics', w: 1000, h: 1000 },
      { src: '/catalogue/spares/page-005-007.jpg', alt: 'Connecting Bush nylon variant, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'door-lock',
    name: 'Door Lock',
    group: '02',
    machine: ['display-counter', 'deep-freezer'],
    material: undefined, // TODO(client): confirm material from catalogue
    variants: [],        // TODO(client): variants/sizes
    // COPY: drafted, needs client approval
    summary: 'A locking mechanism for display counter and deep freezer doors.',
    images: [
      { src: '/catalogue/spares/page-012-017.jpg', alt: 'Door Lock chrome handle latch, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'hinge',
    name: 'Hinge',
    group: '02',
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
    group: '02',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A combined handle and lock component.',
    images: [
      { src: '/catalogue/spares/page-006-008.jpg', alt: 'Handle Lock latch mechanism, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'bracket-handle',
    name: 'Bracket Handle',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A bracket-style handle for equipment doors and panels.',
    images: [
      { src: '/catalogue/spares/page-007-009.jpg', alt: 'Bracket Handle recessed pull handles in three sizes, Alok Plastics', w: 700, h: 900 },
      { src: '/catalogue/spares/page-007-010.jpg', alt: 'Bracket Handle showing weight variants, Alok Plastics', w: 700, h: 900 },
    ],
    published: true,
  },

  {
    slug: 'ss-kabja',
    name: 'SS Kabja',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: 'ss',  // SS = stainless steel implied — TODO(client): confirm
    variants: [],    // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A stainless steel hinge (kabja) for equipment doors.',
    images: [
      { src: '/catalogue/spares/page-019-024.jpg', alt: 'SS Kabja 12 Gauge Heavy Duty stainless steel hinge, Alok Plastics', w: 750, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'l-type-hinge',
    name: 'L-Type Hinge',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],    // TODO(client): sizes
    // COPY: drafted, needs client approval
    summary: 'An L-type hinge for door and panel applications.',
    images: [
      { src: '/catalogue/spares/page-014-019.jpg', alt: 'L-Type Hinge stainless steel pivot pair, Alok Plastics', w: 1000, h: 800 },
    ],
    published: true,
  },

  {
    slug: 'u-type-door-spring',
    name: 'U-Type Door Spring',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A U-type spring for self-closing door mechanisms.',
    images: [
      { src: '/catalogue/spares/page-017-022.jpg', alt: 'U-Type Door Spring wire spring with helical coils, Alok Plastics', w: 700, h: 900 },
    ],
    published: true,
  },

  {
    slug: 'l-hinge-door-spring',
    name: 'L-Hinge Door Spring',
    group: '02',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A spring mechanism for L-type hinged doors.',
    images: [
      { src: '/catalogue/spares/page-020-025.jpg', alt: 'L-Hinge Door Spring complete assembly with coil spring, Alok Plastics', w: 1000, h: 700 },
    ],
    published: true,
  },

  // ── Water, drain and vent parts ──────────────────────────────────────────────────

  {
    slug: 'float-valve',
    name: 'Float Valve',
    group: '01',
    machine: ['water-cooler'],
    material: 'nylon',
    variants: [],
    catalogPrice: { amount: 180, unit: 'set' }, // catalogue price — not shown
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A nylon float valve that controls the water level inside water coolers and dispensers.',
    images: [
      { src: '/catalogue/spares/page-008-011.jpg', alt: 'Float Valve nylon components: ball, valve body and rod, Alok Plastics', w: 1000, h: 1000 },
      { src: '/catalogue/spares/page-001-000.jpg', alt: 'Float Valve rubber ball float with valve assembly, Alok Plastics', w: 640, h: 480 },
    ],
    published: true,
  },

  {
    slug: 'push-cock',
    name: 'Push Cock',
    group: '01',
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
    images: [
      { src: '/catalogue/spares/page-011-015.jpg', alt: 'Push Cock chrome tap heavy duty, Alok Plastics', w: 1000, h: 1000 },
      { src: '/catalogue/spares/page-011-016.jpg', alt: 'Push Cock chrome tap light duty, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'waste-pipe',
    name: 'Waste Pipe',
    group: '01',
    machine: ['water-cooler', 'display-counter'],
    material: 'ppcp',
    variants: [],
    catalogPrice: { amount: 20, unit: 'pc' }, // catalogue price — not shown
    sku: undefined,   // TODO(client)
    // COPY: drafted, needs client approval
    summary: 'A PPCP waste pipe for draining overflow water from water coolers and display counters.',
    images: [
      { src: '/catalogue/spares/page-009-012.jpg', alt: 'Waste Pipe flexible corrugated drain pipe, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'waste-coupling',
    name: 'Waste Coupling',
    group: '01',
    machine: 'TODO', // TODO(client)
    material: undefined, // TODO(client)
    variants: [],
    // COPY: drafted, needs client approval
    summary: 'A coupling connector for waste pipe assemblies.',
    images: [
      { src: '/catalogue/spares/page-013-018.jpg', alt: 'Waste Coupling chrome drain assembly, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  // ── Ventilation and levelling parts ────────────────────────────────────────

  {
    slug: 'ventilation-jalli',
    name: 'Ventilation Jalli',
    group: '01',
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
    images: [
      { src: '/catalogue/spares/page-004-005.jpg', alt: 'Ventilation Jalli white louvered grille, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  {
    slug: 'adjustable-leg-insert',
    name: 'Adjustable Leg Insert',
    group: '01',
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
    images: [
      { src: '/catalogue/spares/page-002-003.jpg', alt: 'Adjustable Leg Insert HDPE nylon levelling foot, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: true,
  },

  // ── Group 04: Sealing ────────────────────────────────────────────────────────

  {
    slug: 'gasket',
    name: 'Gasket',
    group: '02',
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
    images: [
      { src: '/catalogue/spares/page-010-013.jpg', alt: 'Three Core Plug Indian 3-pin power cord, Alok Plastics', w: 1000, h: 1000 },
      { src: '/catalogue/spares/page-010-014.jpg', alt: 'Three Core Plug with ring terminals, Alok Plastics', w: 1000, h: 1000 },
    ],
    published: false,    // not shown until group confirmed
  },

  {
    slug: 'puf-chemical',
    name: 'PUF Chemical',
    group: null,         // TODO(client): confirm group assignment and description
    machine: 'TODO',
    material: undefined,
    variants: [],
    images: [
      { src: '/catalogue/spares/page-018-023.jpg', alt: 'PUF Chemical POL and ISO two-component drums, Alok Plastics', w: 850, h: 640 },
    ],
    published: false,
  },

  {
    slug: 'bright-chrome',
    name: 'Bright Chrome',
    group: null,         // TODO(client): confirm group assignment and description
    machine: 'TODO',
    material: undefined,
    variants: [],
    images: [
      { src: '/catalogue/spares/page-021-026.jpg', alt: 'Bright Chrome spray paint 318, Alok Plastics', w: 750, h: 1000 },
      { src: '/catalogue/spares/page-022-027.jpg', alt: 'Bright Chrome aerosol lacquer, Alok Plastics', w: 750, h: 1000 },
    ],
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
  if (p.custom) return `/products/item/?s=${encodeURIComponent(p.slug)}`;
  const built = getProduct(p.slug) ?? p;
  const g = built.group ? getGroup(built.group) : undefined;
  return g ? `/products/${g.slug}/${p.slug}/` : '/products/';
};

/** Known machines only — returns [] when machine fit is unconfirmed. */
export const knownMachines = (p: Product): MachineId[] =>
  Array.isArray(p.machine) ? p.machine : [];
