import type { JourneyMarker } from './types';

// Alok Plastics — Journey timeline
// Verbatim from §5.7 — do not edit without client approval

export const journeyMarkers: JourneyMarker[] = [
  {
    year: '1998',
    title: 'The Beginning',
    line: 'Founded in Chandigarh with a clear purpose: make reliable plastic parts for the businesses that keep India\'s appliances running.',
    isFuture: false,
  },
  {
    // Figures, title and line supplied by the project owner (not in §5.7). Same metric as the
    // 2020s proof point: cumulative products delivered, in crore. TODO(client): confirm before launch.
    year: '2000s',
    title: '5+ Crore Products Delivered',
    line: '5 crore+ precision parts delivered across northern markets. Establishing our baseline for high-volume, reliable supply.',
    isFuture: false,
    stat: { value: 5, suffix: 'Cr+', label: 'products delivered' },
  },
  {
    // Supplied by the project owner, as above. TODO(client): confirm before launch.
    year: '2010s',
    title: '12+ Crore Products Delivered',
    line: '12 crore+ components delivered as we adopted automatic injection moulding, scaling our footprint to a pan-India customer base.',
    isFuture: false,
    stat: { value: 12, suffix: 'Cr+', label: 'products delivered' },
  },
  {
    // 20 Cr+ delivered is a verified proof point (site.ts proof). TODO(client): confirm the '2020s' decade placement
    year: '2020s',
    title: '20+ Crore Products Delivered',
    line: '20 crore+ parts delivered, and counting. The milestone that proved consistent manufacturing builds real trust.',
    isFuture: false,
    stat: { value: 20, suffix: 'Cr+', label: 'products delivered' }, // verified proof point (§5.5) — runs the odometer
  },
  {
    // TODO(client): verify
    year: 'Today',
    title: 'Serving India',
    line: 'Serving OEMs, dealers and distributors across India. 70%+ repeat customers. Still based in Chandigarh, still answering the phone.',
    isFuture: false,
  },
  {
    // TODO(client): verify expansion plans before publishing
    year: 'The Future',
    title: 'Expanding Production',
    line: 'Expanding the production floor: more machines, more capacity, to serve the businesses already waiting.',
    isFuture: true,
  },
];

// The USP chain steps — §5.8
// COPY: one-line descriptions drafted, need client approval
export const uspChain = [
  {
    step: 1,
    label: 'Understand',
    description: 'Send us a drawing, photo or sample. We ask the right questions before we quote.',
  },
  {
    step: 2,
    label: 'Develop',
    // TODO(client): confirm "quote within 24 hours" is accurate
    description: 'We pick the right material for your use case and get a quote back to you within 24 hours.',
  },
  {
    step: 3,
    label: 'Manufacture',
    description: 'Your parts run on automatic moulding machines, with consistent dimensions batch after batch.',
  },
  {
    step: 4,
    label: 'Supply',
    description: 'We dispatch across India, from Delhi to Chennai and Chandigarh to Kolkata. Tell us your deadline.',
  },
  {
    step: 5,
    label: 'Repeat',
    description: '70% of our orders are reorders. Once you find a supplier you can count on, you come back.',
  },
];

// The USP pull-quote — verbatim from §5.8
export const uspPullQuote = {
  quote: 'We don\'t measure success by the order we deliver. We measure it by the orders that keep coming back.',
  attribution: 'Aalok Kumar, CEO, Alok Plastics',
};
