// About page copy — verbatim from docs/MASTER_PROMPT.md §5.2–§5.4, §5.6, §5.12.
// Kept here (not in a component body) so it can move to a CMS later.

export const brandIdea =
  'Alok means light. Our logo shows two burgundy ribbons holding a silver-grey core, because we make the small, strong parts that hold coolers, display counters and freezers together. Burgundy is our strength, grey is our metal, and our line, crafted in Bharat, made for the world, says where we come from and where we are going.';

/** §5.6 — paragraphs; `strong` segments are the source's bold phrases. */
export const story: { text: string; strong?: string[] }[] = [
  { text: 'Established in 1998, Alok Plastics began its manufacturing journey with a simple belief: good products build business, but trust builds long-term relationships.', strong: ['trust builds long-term relationships'] },
  { text: 'Starting with a focus on serving industrial and B2B customers, the company gradually grew through consistent manufacturing, dependable service, and an understanding of what businesses truly need from a manufacturing partner — quality, competitive pricing, reliable supply, and timely delivery.', strong: ['quality, competitive pricing, reliable supply, and timely delivery'] },
  { text: 'Over the years, Alok Plastics expanded its capabilities and customer reach across India. Today, we manufacture plastic components using moulds and plastic granules and continue to serve businesses across the country. With 20 crore+ products successfully delivered and ongoing, our journey reflects the trust our customers have placed in us.', strong: ['20 crore+ products successfully delivered and ongoing'] },
  { text: 'But our journey is far from complete. We are continuously working to expand our production capabilities, create more employment opportunities, adopt responsible manufacturing practices, and build partnerships with leading companies in India and global markets.' },
  { text: 'For us, growth is not only about producing more. It is about building better products, stronger relationships, and lasting trust.', strong: ['building better products, stronger relationships, and lasting trust'] },
];

export const vision =
  'To build Alok Plastics into a globally recognized Indian manufacturing brand, growing our capabilities, our people, and our partnerships while becoming trusted for turning customer requirements into the right solutions and responsible manufacturing.';

export const mission =
  'To combine manufacturing expertise, practical problem-solving, and customer collaboration to deliver plastic and steel solutions through consistent manufacturing, responsive service, and lasting trust.';

/* The "We don't just mould plastic. We mould possibilities." line (§5.4) is set once, on Home (TrustQuote). */
export const coreValues: { title: string; note?: string }[] = [
  { title: 'Less waste. More value.', note: 'Smarter manufacturing.' },
  { title: 'Social employment', note: 'Creating employment opportunities and supporting local talent.' },
];
