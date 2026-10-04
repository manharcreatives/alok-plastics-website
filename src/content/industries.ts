import type { Industry, IndustriesConfig, IndustryImage } from './types';

// Alok Plastics — Industries content
// Verbatim from §5.9 — do not edit the line text without client approval
// Each industry shows a drawn scene (`scene`). When the client supplies a real photo, add
//   image: { src: '/images/industries/<slug>.jpg', alt: '…', w: 1200, h: 750 }
// and it replaces the drawn scene automatically. TODO(client): industry photos.

const industries: Industry[] = [
  {
    id: 'oem-manufacturing',
    name: 'OEM & Manufacturing',
    slug: 'oem-manufacturing',
    line: 'Components for OEMs, production lines and manufacturing businesses.',
    pictogram: 'oem',
    scene: 'oem',
  },
  {
    id: 'engineering-machinery',
    name: 'Engineering & Machinery',
    slug: 'engineering-machinery',
    line: 'Parts for industrial machinery, engineering products and equipment.',
    pictogram: 'engineering',
    scene: 'engineering',
  },
  {
    id: 'automotive',
    name: 'Automotive',
    slug: 'automotive',
    line: 'Plastic components for automotive and auto-component applications.',
    pictogram: 'automotive',
    scene: 'automotive',
  },
  {
    id: 'electrical-electronics',
    name: 'Electrical & Electronics',
    slug: 'electrical-electronics',
    line: 'Components for electrical products and industrial electrical applications.',
    pictogram: 'electrical',
    scene: 'electrical',
  },
  {
    id: 'gas-kitchen',
    name: 'Gas & Kitchen Equipment',
    slug: 'gas-kitchen',
    line: 'Components for gas equipment, commercial kitchens and related products.',
    pictogram: 'gas-kitchen',
    scene: 'gas-kitchen',
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Equipment',
    slug: 'agriculture',
    line: 'Components used in agricultural equipment and machinery.',
    pictogram: 'agriculture',
    scene: 'agriculture',
  },
  {
    id: 'packaging',
    name: 'Packaging & Specialized Applications',
    slug: 'packaging',
    line: 'Components for packaging systems and specialized industrial requirements.',
    pictogram: 'packaging',
    scene: 'packaging',
  },
];

export const industriesConfig: IndustriesConfig = {
  industries,
  // Customer logos — empty until client supplies them with permission to publish
  // When logos are provided, add them here as paths: ['/images/logos/client-name.svg']
  logos: [],
};

// The core market (primary product market) — leads the Products section
export const coreMarket = {
  name: 'Water Coolers · Display Counters · Deep Freezers',
  description: 'The primary market: spare parts for water coolers, display counters and deep freezers across India.',
  machines: ['water-cooler', 'display-counter', 'deep-freezer'] as const,
  // Optional photo for the core-market tile. When set it fades in over the line drawing once
  // it has loaded; until then (or if it fails) the drawing shows. TODO(client): photo.
  image: null as IndustryImage | null,
};
