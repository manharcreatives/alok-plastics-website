import type { JourneyMarker } from './types';

// Alok Plastics — Journey timeline
// Verbatim from §5.7 — do not edit without client approval

export const journeyMarkers: JourneyMarker[] = [
  {
    year: '1998',
    title: 'The Beginning',
    line: 'Alok Plastics begins its manufacturing journey with a focus on serving industrial and B2B customers.',
    isFuture: false,
  },
  {
    // TODO(client): verify — decade-level narrative; no specific facts claimed beyond 'long-term customer relationships'
    year: '2000s',
    title: 'Building Customer Relationships',
    line: 'The company grows through consistent manufacturing, reliable service, and long-term customer relationships.',
    isFuture: false,
  },
  {
    // TODO(client): verify — 'strengthens manufacturing capabilities' and 'different parts of India' are narrative, not backed by a stated fact
    year: '2010s',
    title: 'Expanding Reach',
    line: 'Alok Plastics strengthens its manufacturing capabilities and expands its customer base across different parts of India.',
    isFuture: false,
  },
  {
    // 20 Cr+ delivered is a verified proof point (site.ts proof). TODO(client): confirm the '2020s' decade placement of the milestone
    year: '2020s',
    title: '20+ Crore Products Delivered',
    line: 'The company reached the milestone of 20 crore+ successfully delivered products, with deliveries continuing.',
    isFuture: false,
    stat: { value: 20, suffix: 'Cr+', label: 'products delivered' }, // verified proof point (§5.5) — runs the odometer
  },
  {
    // TODO(client): verify — 'plastic and steel products' product-range claim and 'across India' (Pan Bharat network is verified)
    year: 'Today',
    title: 'Serving India',
    line: 'Alok Plastics continues to serve B2B customers across India with plastic and steel products, focusing on quality, reliability, and trust.',
    isFuture: false,
  },
  {
    // TODO(client): verify — expansion plans are forward-looking; confirm client is happy to state them publicly
    year: 'The Future',
    title: 'Expanding Production',
    line: 'The next phase includes plans to expand the production house, increase manufacturing capabilities, and serve growing customer requirements.',
    isFuture: true,
  },
];

// The USP chain steps — §5.8
// COPY: one-line descriptions drafted, need client approval
export const uspChain = [
  {
    step: 1,
    label: 'Understand',
    // COPY: drafted, needs client approval
    description: 'You share the part, quantity and use — we listen before we quote.',
  },
  {
    step: 2,
    label: 'Develop',
    // COPY: drafted, needs client approval
    description: 'We select the material and process to match your specification.',
  },
  {
    step: 3,
    label: 'Manufacture',
    // COPY: drafted, needs client approval
    description: 'Parts are moulded to your requirement, using automatic moulding machines.',
  },
  {
    step: 4,
    label: 'Supply',
    // COPY: drafted, needs client approval
    description: 'We dispatch to you through our Pan Bharat delivery network.',
  },
  {
    step: 5,
    label: 'Repeat',
    // COPY: drafted, needs client approval
    description: 'Consistent quality means you reorder with confidence, every time.',
  },
];

// The USP pull-quote — verbatim from §5.8
export const uspPullQuote = {
  quote: 'We don\'t measure success by the order we deliver. We measure it by the orders that keep coming back.',
  attribution: '— Alok Plastics',
};
