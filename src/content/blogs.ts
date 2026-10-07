// Alok Plastics — Blog content
// Five practical guides for refrigeration / cooler assemblers, repair technicians, dealers and
// kitchen-equipment makers. HONESTY RULES: only catalogue products and materials, no prices, no
// statistics, no standards numbers, no claims about Alok beyond src/content/site.ts. Material
// notes stay at the level of widely known, generic facts. Open client confirmations live in
// docs/client-questions.md.
//
// Inline markup inside any text string:  [label](/internal/path/)  and  **bold**.

export type BlogBlock =
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'callout'; title: string; text: string }
  | { t: 'table'; caption: string; head: string[]; rows: string[][] };

export type BlogFaq = { q: string; a: string };

export type BlogArt = 'float-valve' | 'display-counter' | 'materials' | 'deep-freezer' | 'custom';

export type BlogPost = {
  slug: string;
  /** H1 and card title. 60 characters or fewer, keyword first. */
  title: string;
  /** Full <title>, brand included, 60 characters or fewer. */
  metaTitle: string;
  /** 155 characters or fewer. */
  metaDescription: string;
  excerpt: string;
  category: string;
  tags: string[];
  /** ISO date, YYYY-MM-DD. */
  publishDate: string;
  readMinutes: number;
  author: string;
  /** 16:9 photo (1600x900) layered over the drawn placeholder. Generated later. */
  cover: string;
  coverAlt: string;
  art: BlogArt;
  body: BlogBlock[];
  faq: BlogFaq[];
  related: string[];
};

export const BLOG_AUTHOR = 'Alok Plastics Team';

export const blogPosts: BlogPost[] = [
  /* ─────────────────────────────────────────────────────────────── 1 */
  {
    slug: 'water-cooler-float-valve-overflow-leakage',
    title: 'Water Cooler Float Valve: Choosing & Fixing Overflow',
    metaTitle: 'Water Cooler Float Valve: Fix Overflow | Alok Plastics',
    metaDescription:
      'Water cooler overflowing or leaking? See how the float valve, push cock and waste pipe work, how to find the faulty part and what to send to order.',
    excerpt:
      'Overflow and leakage are the most common reasons a water cooler comes back to the workshop. Here is how to find the faulty part quickly and order the right replacement.',
    category: 'Water cooler parts',
    tags: ['water cooler spare parts', 'float valve', 'push cock', 'waste pipe', 'water cooler leakage'],
    publishDate: '2026-09-08',
    readMinutes: 5,
    author: BLOG_AUTHOR,
    cover: '/images/blog/water-cooler-float-valve-overflow-leakage.webp',
    coverAlt: 'Float valve and tap fittings of a water cooler on a workshop bench',
    art: 'float-valve',
    body: [
      {
        t: 'p',
        text: 'A water cooler that overflows, drips or leaves a pool under the cabinet is one of the most common repair calls for technicians and dealers. The good news is that the fault almost always sits in one of three small parts: the **float valve** at the inlet, the **push cock** at the tap, or the **waste pipe** at the drain. Knowing which one is responsible saves time on site and avoids replacing parts that were never the problem.',
      },
      { t: 'h2', text: 'Where water cooler leakage really comes from' },
      {
        t: 'p',
        text: 'Start from the symptom, not from the part. Water shows up in different places depending on what has failed.',
      },
      {
        t: 'ul',
        items: [
          '**Water spills from the top or overflow outlet:** the tank is filling past its normal level. Suspect the float valve.',
          '**Water drips from the tap after it is released:** suspect the push cock.',
          '**Water collects below the cabinet or around the drain:** suspect the waste pipe, the waste coupling or a joint between them.',
        ],
      },
      {
        t: 'table',
        caption: 'Quick diagnosis by symptom',
        head: ['What you see', 'Likely part', 'First thing to check'],
        rows: [
          ['Tank keeps filling, water overflows', 'Float valve', 'Lift the float by hand: does the inlet stop?'],
          ['Tap drips after use', 'Push cock', 'Does it close fully when released?'],
          ['Pool under the cooler, tap and tank dry', 'Waste pipe or coupling', 'Look for cracks, loose joints or a blocked run'],
          ['Water level never reaches normal', 'Float valve or supply', 'Is the valve opening fully? Is the supply on?'],
        ],
      },
      { t: 'h2', text: 'Overflow: check the float valve first' },
      {
        t: 'p',
        text: 'A float valve controls the water level inside a water cooler or dispenser. As the tank fills, the float rises and closes the inlet; as water is drawn off, the float drops and the inlet opens again. Our catalogue lists the [float valve](/products/water-cooler-spare-parts/float-valve/) in nylon, supplied as a set with the float ball, valve body and rod.',
      },
      { t: 'p', text: 'To find out whether the float valve is the cause, work through these steps with the supply switched on and the tank lid open.' },
      {
        t: 'ol',
        items: [
          'Watch the tank fill and note where the float sits when the water stops rising, or whether it stops at all.',
          'Lift the float ball gently by hand. If the inflow stops when the float is raised, the valve itself can still shut off, and the problem is the float position, a bent rod or a float that is not moving freely.',
          'If water keeps flowing even with the float fully raised, the valve body or its sealing surface is worn or dirty, and the set needs replacing.',
          'Check that the float and rod move without touching the tank wall or other fittings.',
          'Look at the rod and float ball for cracks or water inside the float, which stops it from rising properly.',
        ],
      },
      {
        t: 'callout',
        title: 'Replace the set, not one piece',
        text: 'Because the float, rod and valve body work together, replacing the complete set is usually faster and more reliable than mixing an old float with a new valve body.',
      },
      { t: 'h2', text: 'How to choose the right float valve' },
      {
        t: 'p',
        text: 'Float valves look similar but are not always interchangeable. Before ordering, compare the replacement against the old one on these points.',
      },
      {
        t: 'ul',
        items: [
          '**Inlet connection:** the way the valve fits the tank and the supply line must match.',
          '**Rod length and float size:** they set the water level, so they should suit the depth and layout of the tank.',
          '**Material:** our catalogue float valve is nylon, a common choice for plastic fittings that sit in contact with water.',
          '**Quantity and repeat use:** workshops that service many coolers often keep a small stock of sets.',
        ],
      },
      {
        t: 'p',
        text: 'If you are unsure, send us the old valve or a clear photo with the cooler details. We will confirm what is available and quote. Measurements and fitment details that are not in the catalogue are confirmed per enquiry, not assumed.',
      },
      { t: 'h2', text: 'Dripping tap: the push cock' },
      {
        t: 'p',
        text: 'The push cock is the tap the user presses to draw water. A tap that keeps dripping after release has usually lost its seal inside, or is not returning fully. Our [push cock](/products/water-cooler-spare-parts/push-cock/) is made in brass and listed in light and heavy variants. Heavy variants are generally the better match for busy, high-use locations, while light variants suit lighter use. Match the variant to the way the cooler is used and to the fitting you are replacing.',
      },
      { t: 'h2', text: 'Water under the cooler: waste pipe and coupling' },
      {
        t: 'p',
        text: 'If the tank and tap are dry but water still appears below the cabinet, follow the drain run. The [waste pipe](/products/water-cooler-spare-parts/waste-pipe/) in our catalogue is made in PPCP, and the [waste coupling](/products/water-cooler-spare-parts/waste-coupling/) joins the run to the drain connection. Check for hairline cracks, a coupling that has loosened, or a partial blockage that makes water back up and find another way out.',
      },
      { t: 'h2', text: 'What to send us for a replacement' },
      {
        t: 'ul',
        items: [
          'The old part, or two or three clear photos from different sides.',
          'The part name, if you know it, and the cooler it came from.',
          'The size that matters, measured with a scale or calliper if you have one.',
          'The quantity you need now, and whether it will repeat.',
        ],
      },
      {
        t: 'p',
        text: 'Send these through the [enquiry form](/enquiry/) or call us from the [contact page](/contact/). You can also browse the full range of [water cooler spare parts](/products/water-cooler-spare-parts/).',
      },
    ],
    faq: [
      {
        q: 'Why does my water cooler keep overflowing?',
        a: 'Overflow usually means the float valve is not shutting off the inlet. Lift the float by hand: if the inflow stops, the float or rod position needs correcting; if water keeps flowing, the valve body is worn or dirty and the set should be replaced.',
      },
      {
        q: 'Is the float valve sold as a set?',
        a: 'Yes. Our catalogue lists the float valve as a set, with the float ball, valve body and rod, made in nylon.',
      },
      {
        q: 'Which push cock variants are available?',
        a: 'The push cock is made in brass and is listed in light and heavy variants. Tell us how the cooler is used and we will help you match the variant.',
      },
      {
        q: 'Can I send a photo instead of the part?',
        a: 'Yes. Clear photos from several sides, along with the cooler details and the size that matters, are enough to start. We confirm availability and quote after reviewing them.',
      },
    ],
    related: ['display-counter-sliding-door-parts-guide', 'hdpe-nylon-ppcp-brass-cooler-spare-parts'],
  },

  /* ─────────────────────────────────────────────────────────────── 2 */
  {
    slug: 'display-counter-sliding-door-parts-guide',
    title: 'Display Counter Sliding Door Problems: Parts Guide',
    metaTitle: 'Display Counter Sliding Door Parts | Alok Plastics',
    metaDescription:
      'Sticking or loose display counter doors? A practical guide to the F-bush, door lock, hinges, door springs and gasket, and when to replace each one.',
    excerpt:
      'A display counter door that sticks, rattles or will not seal usually points to a small, replaceable part. This guide explains the F-bush, lock, hinges, springs and gasket.',
    category: 'Display counter parts',
    tags: ['display counter spare parts', 'F-bush', 'door lock', 'hinges', 'gasket', 'sliding door'],
    publishDate: '2026-09-17',
    readMinutes: 5,
    author: BLOG_AUTHOR,
    cover: '/images/blog/display-counter-sliding-door-parts-guide.webp',
    coverAlt: 'Sliding glass door of a display counter with its bush, lock and hinge hardware',
    art: 'display-counter',
    body: [
      {
        t: 'p',
        text: 'The doors of a display counter are opened and closed many times a day, so their small parts take more wear than almost anything else on the machine. When a door becomes stiff, noisy, loose or will not seal, the cause is rarely the glass or the frame. It is usually one of five small parts: the **F-bush**, the **door lock**, the **hinges**, the **door spring** or the **gasket**. This guide explains what each part does, how wear shows up and what to check before you order.',
      },
      { t: 'h2', text: 'F-bush: the part that decides how smoothly the door slides' },
      {
        t: 'p',
        text: 'The [F-bush](/products/deep-freezer-display-counter-parts/f-bush/) is the display counter sliding door bush. In our catalogue it is made in nylon. It sits in the door channel and carries the door as it slides, so a worn one shows up as a door that drags, jumps or rattles in the track.',
      },
      {
        t: 'ul',
        items: [
          'The door feels rough or needs a push to start moving.',
          'You can hear a scraping or clicking sound along the channel.',
          'The door sits lower on one side or no longer lines up with the frame.',
          'The bush looks flattened, chipped or visibly shortened compared with a new one.',
        ],
      },
      {
        t: 'p',
        text: 'Always replace bushes in pairs or as a full set for the door. A single new bush next to a worn one leaves the door uneven.',
      },
      { t: 'h2', text: 'Door lock and handle: security and alignment' },
      {
        t: 'p',
        text: 'The [door lock](/products/deep-freezer-display-counter-parts/door-lock/) holds the door closed and secures the contents, and the [handle lock](/products/deep-freezer-display-counter-parts/handle-lock/) and [bracket handle](/products/deep-freezer-display-counter-parts/bracket-handle/) are the parts the user actually touches. Lock faults are often misdiagnosed. A lock that will not engage may simply be out of line because the door has dropped, which brings you back to the bush. Check the door alignment first, then test the lock on its own.',
      },
      { t: 'h2', text: 'Hinges and door springs: swing doors and self-closing action' },
      {
        t: 'p',
        text: 'Where the counter or freezer has a hinged door, hinges and springs control how it swings and closes. Our catalogue includes the general [hinge](/products/deep-freezer-display-counter-parts/hinge/), the [L-type hinge](/products/deep-freezer-display-counter-parts/l-type-hinge/), the [SS Kabja](/products/deep-freezer-display-counter-parts/ss-kabja/), the [U-type door spring](/products/deep-freezer-display-counter-parts/u-type-door-spring/) and the [L-hinge door spring](/products/deep-freezer-display-counter-parts/l-hinge-door-spring/).',
      },
      {
        t: 'ul',
        items: [
          '**Door will not stay closed or closes slowly:** check the spring first, then the hinge.',
          '**Door sags or is hard to line up:** look for a loose, bent or worn hinge.',
          '**Door squeaks or binds as it swings:** check for a hinge pin that has worn or a hinge leaf that has bent.',
        ],
      },
      {
        t: 'p',
        text: 'Hinge and spring styles differ, so the shape of the old part matters. Send a photo of both the part and the place where it mounts.',
      },
      { t: 'h2', text: 'Gasket: the seal that is easy to forget' },
      {
        t: 'p',
        text: 'The [gasket](/products/deep-freezer-display-counter-parts/gasket/) seals the door against the frame of display counters and deep freezers, helping keep the cold in and moisture out. A gasket that has hardened, split or flattened lets air through, so the machine works harder to hold temperature. Run your hand around the closed door and look for gaps, cracks, or sections that no longer spring back.',
      },
      {
        t: 'callout',
        title: 'Seal problems can look like a door problem',
        text: 'A door that will not close flush, or a gasket that seems loose, can be caused by a worn bush or hinge letting the door sit off-square. Fix alignment before you replace the gasket, otherwise the new gasket will wear unevenly.',
      },
      { t: 'h2', text: 'A simple order of checks' },
      {
        t: 'ol',
        items: [
          'Open and close the door slowly and listen. Note where it sticks or rattles.',
          'Check the F-bushes and channel for wear, dirt or damage.',
          'Check the hinges and springs, if fitted, for play, bending or weakness.',
          'Check the lock and handle once the door sits true.',
          'Inspect the gasket around the whole door edge last.',
        ],
      },
      {
        t: 'table',
        caption: 'Symptom and likely part',
        head: ['Symptom', 'Likely part'],
        rows: [
          ['Door drags or jumps in the channel', 'F-bush'],
          ['Door will not latch or lock', 'Door lock, or a door out of alignment'],
          ['Door sags or will not close by itself', 'Hinge or door spring'],
          ['Cold air escapes at the door edge', 'Gasket, or door alignment'],
        ],
      },
      { t: 'h2', text: 'How to order the right part' },
      {
        t: 'p',
        text: 'Most of these parts come in several shapes, and the catalogue does not list every machine fitment, so the quickest route is to send what you have. A photo of the old part, the machine it came from and the size that matters is enough to begin, and we confirm availability and quote.',
      },
      {
        t: 'p',
        text: 'Browse the full range of [deep freezer and display counter parts](/products/deep-freezer-display-counter-parts/), then use the [enquiry form](/enquiry/) or the [contact page](/contact/) to send your requirement.',
      },
    ],
    faq: [
      {
        q: 'What does an F-bush do in a display counter?',
        a: 'The F-bush is the sliding door bush. It sits in the door channel and carries the door as it slides. In our catalogue it is made in nylon.',
      },
      {
        q: 'Why will my display counter door not close properly?',
        a: 'Common causes are a worn F-bush that lets the door sit off-square, a weak door spring, a worn hinge or a hardened gasket. Check alignment first, then the spring and hinge, then the gasket.',
      },
      {
        q: 'Should I replace bushes one at a time?',
        a: 'It is better to replace them as a set for the door. A single new bush beside a worn one leaves the door uneven.',
      },
      {
        q: 'Which hinge and spring types do you list?',
        a: 'The catalogue includes hinge, L-type hinge, SS Kabja, U-type door spring and L-hinge door spring. Send a photo of the old part and we will help you match it.',
      },
    ],
    related: ['deep-freezer-door-gasket-hinge-replacement-guide', 'water-cooler-float-valve-overflow-leakage'],
  },

  /* ─────────────────────────────────────────────────────────────── 3 */
  {
    slug: 'hdpe-nylon-ppcp-brass-cooler-spare-parts',
    title: 'HDPE vs Nylon vs PPCP vs Brass: Cooler Spare Parts',
    metaTitle: 'HDPE vs Nylon vs PPCP vs Brass Parts | Alok Plastics',
    metaDescription:
      'Which material for which part? A plain-language guide to HDPE, nylon, PPCP, brass and stainless steel in cooler, display counter and freezer spare parts.',
    excerpt:
      'Why is a float valve nylon and a push cock brass? A plain-language look at where each material is used in cooler, display counter and deep freezer spare parts.',
    category: 'Materials guide',
    tags: ['HDPE', 'nylon', 'PPCP', 'brass', 'cooler spare parts materials', 'plastic spare parts India'],
    publishDate: '2026-09-26',
    readMinutes: 5,
    author: BLOG_AUTHOR,
    cover: '/images/blog/hdpe-nylon-ppcp-brass-cooler-spare-parts.webp',
    coverAlt: 'Moulded nylon, HDPE and PPCP parts beside brass fittings on a neutral surface',
    art: 'materials',
    body: [
      {
        t: 'p',
        text: 'When you buy spare parts for water coolers, display counters and deep freezers, the material matters as much as the shape. A bush, a pipe, a tap and a levelling foot all work in different conditions, and each is made from the material that suits that job. This guide explains, in general terms, where **nylon**, **HDPE**, **PPCP**, **brass** and **stainless steel** are used and why. It is meant to help you choose and to read a catalogue with more confidence. It is not a technical datasheet, and it does not replace the specification of the machine you are repairing.',
      },
      { t: 'h2', text: 'Why material choice matters for spare parts' },
      {
        t: 'p',
        text: 'Spare parts live in demanding places. Some touch water all day, some slide against a channel thousands of times, some carry the weight of the machine, and some sit in cold, damp air. A part in the wrong material can wear early, crack, swell or corrode, and the cooler comes back for repair. Matching the material to the job is one of the simplest ways to reduce repeat repairs.',
      },
      { t: 'h2', text: 'Nylon: moving and wearing parts' },
      {
        t: 'p',
        text: 'Nylon is a widely used engineering plastic for parts that rub, slide or carry a moving load, because it is tough and has a naturally smooth surface. In our catalogue, the [F-bush](/products/deep-freezer-display-counter-parts/f-bush/), the [float valve](/products/water-cooler-spare-parts/float-valve/) and the nylon variant of the [connecting bush](/products/water-cooler-spare-parts/connecting-bush/) are made in nylon. One general point worth knowing: nylon can take up some moisture over time, so for any wet application it is worth confirming the design with the part you are replacing.',
      },
      { t: 'h2', text: 'HDPE: tough, simple, durable shapes' },
      {
        t: 'p',
        text: 'HDPE, or high-density polyethylene, is a tough, lightweight plastic known for good resistance to many common chemicals and to moisture. It is often chosen for simple, robust parts that take knocks and sit on or near the floor. Our [adjustable leg insert](/products/water-cooler-spare-parts/adjustable-leg-insert/) is made in HDPE and is listed in round and square sections in five sizes, from 1 inch to 2 inches.',
      },
      { t: 'h2', text: 'PPCP: pipes, grilles and stiff moulded parts' },
      {
        t: 'p',
        text: 'PPCP is polypropylene copolymer, a plastic that is widely used for moulded parts that need to hold their shape while still tolerating a knock. In our catalogue, the [waste pipe](/products/water-cooler-spare-parts/waste-pipe/) and the [ventilation jalli](/products/water-cooler-spare-parts/ventilation-jalli/) are made in PPCP. Both are shaped parts that are not under moving load, which is where this kind of plastic works well.',
      },
      { t: 'h2', text: 'Brass: taps and threaded fittings' },
      {
        t: 'p',
        text: 'Brass is a metal alloy that has long been used for taps, valves and threaded fittings because it machines well, holds a thread and resists corrosion in contact with water. Our [push cock](/products/water-cooler-spare-parts/push-cock/) is brass, and the [connecting bush](/products/water-cooler-spare-parts/connecting-bush/) is listed in brass with a nylon alternative. Where a part is threaded, takes repeated tightening or is a tap that is used hundreds of times, brass is the common choice.',
      },
      { t: 'h2', text: 'Stainless steel: hinges that carry load' },
      {
        t: 'p',
        text: 'Stainless steel is chosen where strength and corrosion resistance matter, such as door hinges that carry weight and face moisture. Our catalogue includes the [SS Kabja](/products/deep-freezer-display-counter-parts/ss-kabja/) for this kind of use.',
      },
      {
        t: 'table',
        caption: 'Materials in our catalogue, at a glance',
        head: ['Material', 'Where it appears in our catalogue', 'Typical role'],
        rows: [
          ['Nylon', 'F-Bush, Float Valve, Connecting Bush (nylon variant)', 'Sliding and moving parts, water-contact fittings'],
          ['HDPE', 'Adjustable Leg Insert', 'Tough, floor-level, load-bearing shapes'],
          ['PPCP', 'Waste Pipe, Ventilation Jalli', 'Pipes and grilles that must keep their shape'],
          ['Brass', 'Push Cock, Connecting Bush', 'Taps and threaded fittings'],
          ['Stainless steel', 'SS Kabja', 'Hinges and load-carrying hardware'],
        ],
      },
      {
        t: 'callout',
        title: 'This is a guide, not a specification',
        text: 'Material behaviour depends on the design, the grade and the use. If you are replacing a part on a specific machine, the safest approach is to match the old part, or tell us the application and we will confirm what suits.',
      },
      { t: 'h2', text: 'How to choose when you are unsure' },
      {
        t: 'ol',
        items: [
          '**Start from the job:** does the part slide, hold water, carry weight, seal or move air?',
          '**Match the original:** if the existing part is brass or nylon, replace it like for like unless you have a reason to change.',
          '**Think about the environment:** is the part wet, cold, or exposed to cleaning chemicals?',
          '**Check what is offered:** some parts, such as the connecting bush, come in more than one material. Ask which variant suits your assembly.',
          '**Ask before substituting:** if you want a different material from the original, confirm the choice with us first.',
        ],
      },
      { t: 'h2', text: 'Buying in more than one material' },
      {
        t: 'p',
        text: 'Assemblers and dealers who stock parts for several machines usually need a mix of materials in one order. You can list everything in a single enquiry, and we confirm availability and quote part by part. Start with the [water cooler spare parts](/products/water-cooler-spare-parts/) and the [deep freezer and display counter parts](/products/deep-freezer-display-counter-parts/), then send your list through the [enquiry form](/enquiry/).',
      },
    ],
    faq: [
      {
        q: 'Which material is used for the float valve?',
        a: 'Our catalogue float valve is made in nylon, supplied as a set with the float ball, valve body and rod.',
      },
      {
        q: 'What does PPCP stand for?',
        a: 'PPCP is polypropylene copolymer. In our catalogue it is used for the waste pipe and the ventilation jalli.',
      },
      {
        q: 'Why is the push cock made in brass?',
        a: 'Brass is a long-established material for taps and threaded fittings because it holds a thread and resists corrosion in contact with water. Our push cock is brass, in light and heavy variants.',
      },
      {
        q: 'Can I ask for a different material from the one listed?',
        a: 'Some parts, such as the connecting bush, are listed in more than one material. For anything else, tell us the application and your requirement and we will confirm what is possible.',
      },
    ],
    related: ['water-cooler-float-valve-overflow-leakage', 'custom-plastic-moulded-parts-sample-to-supply'],
  },

  /* ─────────────────────────────────────────────────────────────── 4 */
  {
    slug: 'deep-freezer-door-gasket-hinge-replacement-guide',
    title: 'Deep Freezer Door Gasket & Hinge: When to Replace',
    metaTitle: 'Deep Freezer Gasket & Hinge Replacement | Alok Plastics',
    metaDescription:
      'Frost at the door or a door that will not close? Learn the signs a deep freezer gasket or hinge needs replacing, what to measure and what to send to order.',
    excerpt:
      'Frost around the door, a lid that will not stay shut or a compressor that never rests can all point to a worn gasket or hinge. Here is how to tell, and how to order correctly.',
    category: 'Deep freezer parts',
    tags: ['deep freezer spare parts', 'freezer door gasket', 'freezer hinge', 'door spring', 'how to order spare parts'],
    publishDate: '2026-10-02',
    readMinutes: 5,
    author: BLOG_AUTHOR,
    cover: '/images/blog/deep-freezer-door-gasket-hinge-replacement-guide.webp',
    coverAlt: 'Close view of a deep freezer door edge showing the gasket and hinge',
    art: 'deep-freezer',
    body: [
      {
        t: 'p',
        text: 'A deep freezer depends on one thing above all: a door that closes fully and seals all the way round. When the **gasket** hardens or the **hinge** wears, the door stops doing that, and the machine pays for it in frost, wasted effort and unreliable cooling. This guide helps technicians, dealers and freezer owners recognise the signs, find out which part is responsible and order the correct replacement the first time.',
      },
      { t: 'h2', text: 'Signs the gasket needs replacing' },
      {
        t: 'p',
        text: 'The [gasket](/products/deep-freezer-display-counter-parts/gasket/) is the flexible seal between the door and the cabinet. It works by being slightly compressed when the door is shut, so wear shows up as a loss of that contact.',
      },
      {
        t: 'ul',
        items: [
          '**Frost or ice** building up along the door edge or inside the opening.',
          '**Moisture or water** around the door after it has been closed for some time.',
          '**Visible damage:** cracks, splits, flattened sections or a gasket that has hardened and no longer springs back.',
          '**A gasket that has pulled out** of its channel or has shrunk and left a gap at the corners.',
          '**The compressor running for long periods** without the cabinet holding temperature.',
        ],
      },
      {
        t: 'callout',
        title: 'A simple seal check',
        text: 'Close the door on a strip of paper and try to pull it out. Try this at several points around the door. If the paper slides out easily at any spot, the seal is weak there. Note which corner or side it is, because that tells you whether the gasket or the door alignment is at fault.',
      },
      { t: 'h2', text: 'Signs the hinge needs replacing' },
      {
        t: 'p',
        text: 'Hinges carry the weight of the door and set where it sits. Our catalogue includes the general [hinge](/products/deep-freezer-display-counter-parts/hinge/), the [L-type hinge](/products/deep-freezer-display-counter-parts/l-type-hinge/) and the [SS Kabja](/products/deep-freezer-display-counter-parts/ss-kabja/), along with the [U-type door spring](/products/deep-freezer-display-counter-parts/u-type-door-spring/) and the [L-hinge door spring](/products/deep-freezer-display-counter-parts/l-hinge-door-spring/) that help the door close.',
      },
      {
        t: 'ul',
        items: [
          'The door sags, or one side sits lower than the other.',
          'The door does not close on its own, or does not stay shut.',
          'There is visible play or looseness in the hinge when you move the door.',
          'The hinge is bent, rusted or has a cracked mounting point.',
          'The door scrapes the frame or the gasket seats unevenly all the way round.',
        ],
      },
      { t: 'h2', text: 'Gasket or hinge: which one first?' },
      {
        t: 'p',
        text: 'The two problems feed each other. A sagging hinge lets the gasket wear unevenly, and a worn gasket can make a good door look badly aligned. Check the hinge and door position before you fit a new gasket. If the door sits true and the gasket is damaged or hardened, replace the gasket. If the door is off-square, fix or replace the hinge first, then reassess the seal.',
      },
      {
        t: 'table',
        caption: 'What the pattern tells you',
        head: ['Pattern', 'More likely'],
        rows: [
          ['Frost or gap along one side only', 'Hinge or door alignment'],
          ['Frost or damage all the way round', 'Gasket'],
          ['Door will not stay shut by itself', 'Hinge or door spring'],
          ['Gasket worn at the hinge side first', 'Hinge play loading the gasket unevenly'],
        ],
      },
      { t: 'h2', text: 'What to measure before you order' },
      {
        t: 'p',
        text: 'Replacement parts need to match the old ones. A few simple measurements save an exchange later.',
      },
      {
        t: 'ul',
        items: [
          '**Gasket:** the total length of the run, the width of the gasket and the shape of its cross-section. A clear photo of a cut end is very helpful.',
          '**Hinge:** the overall length, the width of each leaf, the spacing between the mounting holes and the hole size.',
          '**Door spring:** the overall length and the type (U-type or L-hinge), plus a photo of how it is fitted.',
          '**Machine:** the freezer type and any marking on it, even if you are not sure it will help.',
        ],
      },
      { t: 'h2', text: 'What to send us' },
      {
        t: 'p',
        text: 'You do not need exact drawings to begin. Any one of these is enough to start the conversation.',
      },
      {
        t: 'ol',
        items: [
          '**The old part itself**, or a clean section of it.',
          '**Clear photos** from the front, side and the mounting point, with a scale or ruler beside the part.',
          '**Measurements** for the points above, if you can take them.',
          '**Quantity,** and whether you expect to reorder.',
          '**Where you are** and when you need it.',
        ],
      },
      {
        t: 'p',
        text: 'Send these through the [enquiry form](/enquiry/) or call us via the [contact page](/contact/). We confirm availability and quote. Where the catalogue does not list a specific size or shape, we will say so instead of guessing. You can see the whole range under [deep freezer and display counter parts](/products/deep-freezer-display-counter-parts/).',
      },
      { t: 'h2', text: 'Keep a small stock if you service many freezers' },
      {
        t: 'p',
        text: 'Dealers and service workshops that handle many deep freezers often find that gaskets, hinges and springs are the parts they reach for most. Keeping a small stock of the shapes you meet most often saves a second visit. If you want to plan that stock, list the parts and expected quantities in one enquiry.',
      },
    ],
    faq: [
      {
        q: 'How do I know if my deep freezer gasket is worn out?',
        a: 'Look for frost or moisture at the door edge, cracks or hardened sections, gaps at the corners and a compressor that runs for long periods. A paper strip closed in the door that pulls out easily at some point shows a weak seal there.',
      },
      {
        q: 'Should I replace the gasket or the hinge first?',
        a: 'Check the hinge and door alignment first. A sagging hinge makes the gasket wear unevenly. If the door sits true and the gasket is damaged, replace the gasket.',
      },
      {
        q: 'What should I send to order a gasket or hinge?',
        a: 'Send the old part or clear photos with a ruler beside it, the key measurements, the quantity you need and your location. We confirm availability and quote.',
      },
      {
        q: 'Do you list door springs as well?',
        a: 'Yes. The catalogue includes the U-type door spring and the L-hinge door spring, alongside hinges, the L-type hinge and the SS Kabja.',
      },
    ],
    related: ['display-counter-sliding-door-parts-guide', 'custom-plastic-moulded-parts-sample-to-supply'],
  },

  /* ─────────────────────────────────────────────────────────────── 5 */
  {
    slug: 'custom-plastic-moulded-parts-sample-to-supply',
    title: 'Custom Plastic Moulded Parts: Sample to Supply Guide',
    metaTitle: 'Custom Plastic Moulded Parts Guide | Alok Plastics',
    metaDescription:
      'Need a plastic part that is not in any catalogue? See how custom moulded parts go from sample or drawing to supply, and what to share with a manufacturer.',
    excerpt:
      'If the part you need is not in a catalogue, a manufacturer can develop it from your sample or drawing. Here is the sample-to-supply path and the information that speeds it up.',
    category: 'Custom parts',
    tags: ['custom plastic parts', 'moulded plastic components', 'OEM plastic parts', 'on demand products', 'plastic parts manufacturer Chandigarh'],
    publishDate: '2026-10-05',
    readMinutes: 6,
    author: BLOG_AUTHOR,
    cover: '/images/blog/custom-plastic-moulded-parts-sample-to-supply.webp',
    coverAlt: 'A sample plastic part beside a technical drawing and a calliper on a workshop table',
    art: 'custom',
    body: [
      {
        t: 'p',
        text: 'Every assembler and repair business eventually hits the same wall: a part that is broken, discontinued or simply not available from any catalogue. Often the machine around it is sound, and the missing piece is a small moulded plastic part. This is where a manufacturer that can develop parts on demand becomes useful. This guide explains how custom plastic moulded parts generally go from sample to regular supply, and what information to share so the process moves quickly.',
      },
      { t: 'h2', text: 'When a custom part makes sense' },
      {
        t: 'ul',
        items: [
          '**The part is not available anywhere,** or the original supplier no longer makes it.',
          '**You use the same part regularly,** so a one-time development effort is worth it.',
          '**You are an assembler or OEM** that needs a part made to your own design.',
          '**A catalogue part nearly fits,** but needs a different size, shape or feature.',
        ],
      },
      {
        t: 'p',
        text: 'If a similar part already exists, check the catalogue first. You can browse our [water cooler spare parts](/products/water-cooler-spare-parts/) and [deep freezer and display counter parts](/products/deep-freezer-display-counter-parts/). If your part is different, the [on demand customised products](/products/on-demand-customized-products/) group is the place to start.',
      },
      { t: 'h2', text: 'The path from sample to supply' },
      {
        t: 'p',
        text: 'The details differ from part to part, but moulded plastic parts generally move through the same stages. Treat this as a general outline. Exact steps, timing and costs depend on the part, and we confirm them for your requirement.',
      },
      {
        t: 'ol',
        items: [
          '**Enquiry:** you describe the part and send a sample, drawing or photo.',
          '**Review:** the manufacturer studies the part, the way it is used and what it needs to fit with, and confirms whether it can be made.',
          '**Specification:** the key dimensions, material and any special features are agreed so that both sides are describing the same part.',
          '**Mould development:** for a moulded part, a mould is made to the agreed shape.',
          '**Trial and approval:** early parts are made and checked against the sample or drawing, and adjusted if needed.',
          '**Regular production:** once the part is approved, it is made in the quantities you need.',
          '**Supply and repeat orders:** the part is dispatched, and later orders can follow the same approved specification.',
        ],
      },
      {
        t: 'callout',
        title: 'Parts made to your sample or drawing',
        text: 'Our on demand group covers parts made to your sample or drawing, from mould development to supply. Moulding runs on automatic moulding machines from our Chandigarh unit. Tell us what you need and we will confirm how it can be done for your part.',
      },
      { t: 'h2', text: 'What information to share' },
      {
        t: 'p',
        text: 'The more complete the first message, the faster the first answer. You do not need a finished drawing, but these points make a real difference.',
      },
      {
        t: 'ul',
        items: [
          '**A sample,** even if it is broken or worn. Tell us which side or feature is most important.',
          '**A drawing or sketch,** with the dimensions that matter to you marked.',
          '**Photos** from several angles, with a ruler or scale in the picture.',
          '**Where the part is used:** the machine or assembly, and what it fits with or moves against.',
          '**Material preference,** if you have one, or what the original is made from if you know.',
          '**Colour or finish,** if it matters for the application.',
          '**Quantity,** both for the first order and, if you can estimate it, the repeat requirement.',
          '**Problems with the current part,** such as where it breaks or wears. This helps improve the next version.',
        ],
      },
      { t: 'h2', text: 'Sample, drawing or photo: which is best?' },
      {
        t: 'p',
        text: 'A physical sample is the most useful starting point, because it shows the real shape, wall thickness and fit in a way a photograph cannot. A drawing is the next best, particularly when the dimensions are marked. A photo alone can start the conversation, but expect follow-up questions about sizes. If you can send more than one of these, send them all.',
      },
      { t: 'h2', text: 'Questions to ask any manufacturer' },
      {
        t: 'ul',
        items: [
          'Can you confirm the material for this part and why it suits the use?',
          'How will you check the finished part against my sample or drawing?',
          'What do you need from me to start, and what will you confirm in writing?',
          'How are repeat orders handled once the part is approved?',
          'What is the process for changes, if the first version needs adjusting?',
        ],
      },
      {
        t: 'p',
        text: 'Ask the same questions of every manufacturer you speak to. Clear, specific answers are a good sign of a supplier you can plan around.',
      },
      { t: 'h2', text: 'Start with a short message' },
      {
        t: 'p',
        text: 'The easiest way to begin is to send what you have. Use the [enquiry form](/enquiry/) to attach photos and details, or reach us from the [contact page](/contact/). If you only have a broken part and a rough idea of its use, that is a perfectly good start. We will tell you what else we need.',
      },
    ],
    faq: [
      {
        q: 'Can you make a plastic part from my sample?',
        a: 'Our on demand group covers parts made to your sample or drawing, from mould development to supply. Send the sample or photos with the use and quantity, and we will confirm how it can be done for your part.',
      },
      {
        q: 'Do I need a drawing to start?',
        a: 'No. A sample, a clear photo with a scale, or a rough sketch with the key dimensions is enough to begin. A drawing helps, but it is not required to start the conversation.',
      },
      {
        q: 'What information speeds up a custom part enquiry?',
        a: 'The sample or drawing, where the part is used, the material and colour you want, the quantity for the first order and the expected repeat requirement.',
      },
      {
        q: 'Where are parts made?',
        a: 'Alok Plastics is based in Chandigarh Industrial Area Phase II, and has been manufacturing since 1998 using automatic moulding machines.',
      },
    ],
    related: ['hdpe-nylon-ppcp-brass-cooler-spare-parts', 'deep-freezer-door-gasket-hinge-replacement-guide'],
  },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */

export const BLOGS_PATH = '/blogs/';
export const blogPath = (slug: string): string => `/blogs/${slug}/`;

export const blogsByDate = (): BlogPost[] =>
  [...blogPosts].sort((a, b) => b.publishDate.localeCompare(a.publishDate));

export const getBlog = (slug: string): BlogPost | undefined => blogPosts.find(p => p.slug === slug);

export const blogCategories = (): string[] => [...new Set(blogsByDate().map(p => p.category))];

export function relatedBlogs(post: BlogPost, max = 2): BlogPost[] {
  const picked = post.related.map(getBlog).filter((p): p is BlogPost => !!p);
  if (picked.length >= max) return picked.slice(0, max);
  const rest = blogsByDate().filter(p => p.slug !== post.slug && !picked.includes(p));
  return [...picked, ...rest].slice(0, max);
}

/** Newer / older neighbour in date order (for the prev / next block). */
export function blogNeighbours(slug: string): { newer?: BlogPost; older?: BlogPost } {
  const list = blogsByDate();
  const i = list.findIndex(p => p.slug === slug);
  return { newer: i > 0 ? list[i - 1] : undefined, older: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}

/** Strip inline markup: [label](href) → label, **bold** → bold. */
export const stripMarkup = (s: string): string =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');

export function blockText(b: BlogBlock): string {
  switch (b.t) {
    case 'ul':
    case 'ol':
      return b.items.map(stripMarkup).join(' ');
    case 'table':
      return [b.caption, ...b.head, ...b.rows.flat()].join(' ');
    case 'callout':
      return `${b.title}. ${stripMarkup(b.text)}`;
    default:
      return stripMarkup(b.text);
  }
}

export const blogPlainText = (post: BlogPost): string =>
  [...post.body.map(blockText), ...post.faq.map(f => `${f.q} ${stripMarkup(f.a)}`)].join(' ');

export const blogWordCount = (post: BlogPost): number =>
  post.body.map(blockText).join(' ').split(/\s+/).filter(Boolean).length;

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const blogHeadings = (post: BlogPost): { id: string; text: string }[] =>
  post.body.filter((b): b is Extract<BlogBlock, { t: 'h2' }> => b.t === 'h2').map(b => ({ id: slugify(b.text), text: b.text }));

export const formatBlogDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
