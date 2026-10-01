import type { SiteConfig } from './types';

// Alok Plastics — Site configuration
// All TODO(client) values must be provided before launch — see docs/client-questions.md

export const site: SiteConfig = {
  name: 'Alok Plastics',

  tagline: {
    // LOCKED — §2.7. विश्वय is the approved brand spelling; do not "correct" it
    devanagari: 'भारते शिल्पितम्, विश्वय निर्मितम्',
    english: 'Crafted in Bharat, made for the world.',
  },

  domain: 'https://alokplastics.com',
  foundingYear: 1998,

  owners: [
    { name: 'Gopal Kumar', title: 'Owner' },
    { name: 'Aalok Kumar', title: 'CEO' },
  ],

  contact: {
    address: 'Plot No-06, Industrial Area Phase II, Ram Darbar',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160003',
    country: 'India',
    phone: null,       // TODO(client): phone number
    whatsapp: null,    // TODO(client): WhatsApp number — single source for ALL WhatsApp links in the site
    email: null,       // TODO(client): enquiry email address
    mapsUrl: null,     // TODO(client): Google Maps place URL or embed URL
    gstin: null,       // TODO(client): GSTIN
    geo: null,         // TODO(client): { lat, lng } of the unit — JSON-LD omits geo until set
  },

  // B2B pricing varies by quantity — show "Get a Quote" not list prices
  // TODO(client): confirm whether list prices may be shown publicly
  showPrices: false,

  hero: {
    media: {
      mode: 'ambient',   // 'auto' | 'video' | 'poster' | 'ambient'
      // 'auto' → video if sources exist + device qualifies; else poster; else ambient
      video: {
        webm: null,        // TODO(client): supply footage → /media/hero.webm
        mp4: null,         // TODO(client): /media/hero.mp4
        mobileMp4: null,   // TODO(client): optional ≤800KB mobile version
      },
      poster: null,        // TODO(client): /media/hero-poster.jpg — see docs/hero-video-brief.md
      tone: 'light',       // 'light' = colour logo in navbar; 'dark' = bright logo
    },
    eyebrow: '01 — EST. 1998 · CHANDIGARH',
    headline: ['The small parts that', 'keep big machines running.'],
    sub: 'Moulded plastic and steel spare parts for water coolers, display counters and deep freezers — float valves, F-bushes, connecting bushes, ventilation jalli and more, in nylon, HDPE, PPCP and brass.',
    ctas: {
      primary: 'Enquire Now',
      secondary: 'WhatsApp Us',
      tertiary: 'Browse products',
    },
  },

  // Proof points — verbatim from §5.5, the ONLY numbers allowed
  proof: [
    {
      value: '20 Cr+',
      label: 'Products successfully delivered',
      isNumeric: true,
      numericValue: 20,
    },
    {
      value: '70%+',
      label: 'Repeat customers',
      isNumeric: true,
      numericValue: 70,
    },
    {
      value: '1998',
      label: 'Manufacturing since',
      isNumeric: true,
      numericValue: 1998,
    },
    {
      value: '100%',
      label: 'Commitment to quality & trust',
      isNumeric: true,
      numericValue: 100,
    },
    {
      value: 'Pan Bharat',
      label: 'Delivery network',
      isNumeric: false,
    },
    {
      value: 'Quarter-on-Quarter',
      label: 'Production growth',
      isNumeric: false,
    },
    {
      value: 'Automatic Moulding Machines',
      label: 'Consistent quality & faster production',
      isNumeric: false,
    },
  ],

  analytics: {
    ga4Id: null,  // TODO(client): GA4 measurement ID — script loads only when set
  },

  social: {
    instagram: null,  // TODO(client)
    linkedin: null,   // TODO(client)
    facebook: null,   // TODO(client)
    youtube: null,    // TODO(client)
  },
};

/* ── Contact formatting helpers (no values invented — read from site.contact) ── */

type Contact = SiteConfig['contact'];

/** "Chandigarh — 160003" — city/state de-duplicated when equal (case-insensitive). */
export function formatCityLine(c: Contact = site.contact): string {
  const sameAsCity = !c.state || c.state.trim().toLowerCase() === c.city.trim().toLowerCase();
  const place = sameAsCity ? c.city : `${c.city}, ${c.state}`;
  return c.pincode ? `${place} \u2014 ${c.pincode}` : place;
}

/** Two display lines: street address, then "City[, State] — PIN, Country". */
export function formatAddressLines(c: Contact = site.contact): [string, string] {
  const line2 = c.country ? `${formatCityLine(c)}, ${c.country}` : formatCityLine(c);
  return [c.address, line2];
}

/** Single-string address, e.g. for aria-labels or plain-text fallbacks. */
export function formatAddress(c: Contact = site.contact): string {
  return formatAddressLines(c).join(', ');
}

/** tel: href with spaces/punctuation stripped (keeps leading +). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
