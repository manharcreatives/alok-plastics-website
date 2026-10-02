// Alok Plastics — Content type definitions
// All content is sourced from src/content/*.ts — never hardcode in components

export type ProductGroupId = '01' | '02' | '03' | '04';
export type MachineId = 'water-cooler' | 'display-counter' | 'deep-freezer';
export type MaterialId = 'nylon' | 'hdpe' | 'ppcp' | 'brass' | 'ss';
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
  unit: 'pc' | 'set';
};

export type Product = {
  slug: string;
  name: string;
  group: ProductGroupId | null;
  machine: MachineId[] | 'TODO';
  material?: MaterialId;
  variants?: ProductVariant[];
  price?: ProductPrice;             // stored but not shown while showPrices=false
  sku?: string;                     // TODO(client) for most products
  hsn?: string;                     // TODO(client)
  moq?: string;                     // TODO(client)
  packing?: string;                 // TODO(client)
  summary?: string;                 // COPY: drafted, needs client approval
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
  phone: string | null;             // TODO(client)
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
    sub: string;
    ctas: {
      primary: string;
      tertiary: string;
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
