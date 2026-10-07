// Alok Plastics — Content type definitions
// All content is sourced from src/content/*.ts — never hardcode in components

export type ProductGroupId = '01' | '02' | '03' | '04' | '05';
export type MachineId = 'water-cooler' | 'display-counter' | 'deep-freezer' | 'gas-stove' | 'commercial-kitchen';
export type MaterialId = 'nylon' | 'hdpe' | 'ppcp' | 'brass' | 'ss' | 'cast-iron';
export type BuyerType = 'oem' | 'dealer' | 'distributor' | 'repair-workshop' | 'other';
export type LogoVariant = 'color' | 'white' | 'bright';
export type HeroMediaMode = 'auto' | 'video' | 'poster' | 'ambient';

// ─── Products ───────────────────────────────────────────────────────────────

export type ProductVariant = {
  label: string;
  note?: string;
  price?: number;                     // catalogue list price for this variant — stored, not shown while showPrices=false
};

export type ProductImage = {
  src: string;
  alt: string;
  w: number;
  h: number;
};

export type ProductPrice = {
  amount: number;
  unit: 'pc' | 'set' | 'kg' | 'inch';   // as printed in the catalogue (Rs. x/pc, /set, /kg, per inch)
};

/** One printed catalogue spec that is not a variant (weight, plate thickness...). Shown on the part page. */
export type ProductSpec = {
  label: string;
  value: string;
};

export type Availability = 'in-stock' | 'out-of-stock' | 'on-request';
export type ProductStatus = 'active' | 'inactive' | 'archived';

export type Product = {
  slug: string;
  name: string;
  group: ProductGroupId | null;
  machine: MachineId[] | 'TODO';
  material?: MaterialId;
  variants?: ProductVariant[];
  catalogPrice?: ProductPrice;      // printed-catalogue list price — stored, never shown or used for sorting/cart
  catalogNote?: string;             // internal: printed price text that could not be mapped to a variant. Never rendered
  specs?: ProductSpec[];            // printed catalogue specs that are not variants (weight, application...)
  photo?: string;                   // override of the product photo path; default is /images/products/<slug>.webp (see productPhoto)
  price?: number;                   // INR, ONLY from the admin (runtime products.json). Absent = "Price on request"
  availability?: Availability;      // admin-set only; absent + no stock = "On request"
  stock?: number;                   // integer 0..100000, admin-set only
  keywords?: string[];              // admin search tags
  brand?: string;
  featured?: boolean;
  status?: ProductStatus;           // inactive/archived = not listable
  sku?: string;                     // TODO(client) for most products
  hsn?: string;                     // TODO(client)
  moq?: string;                     // TODO(client)
  packing?: string;                 // TODO(client)
  summary?: string;                 // COPY: drafted, needs client approval
  description?: string;             // longer copy; set at runtime via admin products.json
  fitment?: string;                 // which machines or models it fits; set at runtime via admin products.json
  custom?: boolean;                 // created in the admin panel; has no static page (see /products/item/)
  images: ProductImage[];
  published: boolean;
};

export type ProductGroup = {
  id: ProductGroupId;
  name: string;
  slug: string;
  tagline: string;                  // COPY: drafted, needs client approval
  description: string;              // COPY: drafted, needs client approval
  anchorParts: string[];            // slugs of the anchor parts shown on home
};

// ─── Industries ──────────────────────────────────────────────────────────────

export type Industry = {
  id: string;
  name: string;
  slug: string;
  line: string;                     // verbatim from §5.9
  pictogram: string;                // pictogram component name
  scene?: string;                   // drawn illustration id (src/components/art/IndustryScenes.tsx)
  image?: IndustryImage;            // TODO(client): real photo — when set it replaces the drawn scene automatically
};

export type IndustryImage = {
  src: string;                      // e.g. /images/industries/automotive.jpg
  alt: string;
  w: number;
  h: number;
};

export type IndustriesConfig = {
  industries: Industry[];
  logos: string[];                  // empty until client supplies customer logos
};

// ─── Journey ─────────────────────────────────────────────────────────────────

export type JourneyMarker = {
  year: string;                     // '1998', '2000s', 'Today', 'The Future', etc.
  title: string;
  line: string;
  isFuture?: boolean;               // drawn dashed — not yet reached
  stat?: { value: number; suffix: string; label: string }; // verified proof number shown with an odometer
};

// ─── Navigation ──────────────────────────────────────────────────────────────

export type NavLink = {
  label: string;
  href: string;
};

export type NavGroupColumn = {
  groupId: ProductGroupId;
  groupName: string;
  slug: string;
  parts: { name: string; slug: string; pictogram: string }[];
};

export type NavigationConfig = {
  primary: NavLink[];
  productColumns: NavGroupColumn[];
  footer: NavLink[];
  legal: NavLink[];
};

// ─── Career ──────────────────────────────────────────────────────────────────

export type CareerTeam = {
  id: string;
  name: string;
  description: string;
};

export type CareerRole = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  published: boolean;
};

export type CareerConfig = {
  culture: string;
  teams: CareerTeam[];
  openRoles: CareerRole[];          // empty at launch
};

// ─── Site config ─────────────────────────────────────────────────────────────

export type HeroMediaConfig = {
  mode: HeroMediaMode;
  video: {
    webm: string | null;
    mp4: string | null;
    mobileMp4: string | null;
  };
  poster: string | null;
  /** Generated 16:9 photograph layered under the video, over the placeholder art. Renders nothing until the file exists. */
  photo?: string | null;
  tone: 'light' | 'dark';
};

export type ProofPoint = {
  value: string;                    // e.g. '20 Cr+'
  label: string;                    // e.g. 'Products successfully delivered'
  isNumeric: boolean;               // true = odometer animation on the number; false = reveal only
  numericValue?: number;            // the extracted number for counting (20, 70, 1998, 100)
};

export type ContactInfo = {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string | null;
  phone2?: string | null;
  whatsapp: string | null;          // TODO(client) — single source for all WhatsApp links
  email: string | null;             // TODO(client)
  mapsUrl: string | null;           // TODO(client)
  gstin: string | null;             // TODO(client)
  geo?: { lat: number; lng: number } | null; // TODO(client): from the Google Maps place — omitted from JSON-LD while null
};

export type SiteConfig = {
  name: string;
  tagline: {
    devanagari: string;
    english: string;
  };
  domain: string;
  foundingYear: number;
  owners: { name: string; title: string }[];
  contact: ContactInfo;
  showPrices: boolean;              // false at launch — §6.4
  hero: {
    media: HeroMediaConfig;
    eyebrow: string;
    headline: string[];
    /** Phrase inside `headline` that carries the gradient accent */
    headlineAccent?: string;
    sub: string;
    ctas: {
      primary: string;
      tertiary: string;
    };
    /** Spec rail: engineered detail strip under the CTAs */
    rail: {
      facts: string[];
      index: string[];
    };
  };
  proof: ProofPoint[];
  analytics: {
    ga4Id: string | null;           // TODO(client) — loads only when set
  };
  social: {
    instagram: string | null;       // TODO(client)
    linkedin: string | null;        // TODO(client)
    facebook: string | null;        // TODO(client)
    youtube: string | null;         // TODO(client)
  };
};
