# ALOK PLASTICS — MASTER BUILD PROMPT v2.0
### For Claude Code (VS Code terminal). Paste this entire file as ONE prompt, or save it as `docs/MASTER_PROMPT.md` in the repo root and run: `claude "Read docs/MASTER_PROMPT.md and execute it from Phase 0."`

---

## HOW TO READ THIS PROMPT

This prompt is long on purpose. It is the single source of truth for the build. Read it **completely** before writing a single file. Then:

1. Save a copy to `docs/MASTER_PROMPT.md` (if it is not already there). Every sub-agent is told to read it.
2. Execute the phases in §21 **in order**. Inside a phase, parallelise using the agent team in §20.
3. Every phase ends with the **Quality Loop** in §22. A phase is not done until its loop exits clean.
4. When this prompt says **LOCKED**, do not reinterpret it. When it says **ELASTIC**, you may make the call — and you must write down why in `docs/decisions.md`.
5. When something is missing, write `TODO(client): <what is needed>` in code and add it to `docs/client-questions.md`. **Never invent.**

Priority order when two rules conflict:
**Honesty (§19) > Accessibility (§17) > Brand lock (§2) > Performance (§16) > Motion & delight (§9–§12) > everything else.**

---

## 0. ROLE

You are a senior art director who has shipped Awwwards-calibre work, and you build what you art-direct. You also run a small team of specialist sub-agents (§20) and you are accountable for their output.

Build the production marketing website for **Alok Plastics** — a Chandigarh B2B manufacturer (est. **1998**) of moulded plastic and steel components, best known for spare parts for **water coolers, display counters and deep freezers**: float valves, F-bushes, connecting bushes, ventilation jalli, adjustable leg inserts, waste pipes, door locks, hinges, gaskets and push cocks, in materials such as **nylon, HDPE, PPCP and brass**. Buyers are OEMs, dealers, distributors, repair workshops and equipment businesses across India.

Real files. Real components. A dev server you start and verify. Screenshots you actually look at. Not a mockup, not a template.

**The bar:** the logo is an engineered object — burgundy ribbons folded around a silver-grey core, sharp diagonals, light catching folded metal. A visitor must feel this site was *made by the same mind that made that logo*. If any screen reads as a generic SaaS template, a ThemeForest corporate theme, or "AI-generated landing page", you have failed regardless of Lighthouse scores.

**The brand idea in one line (from the approved Brand Philosophy v1.0):**
> *The small parts that keep big machines running.* Alok (आलोक) means **light**. The brand's job is to bring these essential parts into the light: visible, trusted, easy to choose.

Everything — preloader, hero, cards, motion — is an expression of **light revealing precise parts**.

---

## 1. SOURCE DOCUMENTS & CORRECTIONS

### 1.1 Source hierarchy (highest wins)
1. **Brand Colour Guide v1.0** (Manhar Creatives, 1 Oct 2026) — colours, ratios, logo-on-colour rules.
2. **Brand Story & Logo Philosophy v1.0** (Manhar Creatives, 1 Oct 2026) — name meaning, logo anatomy, tagline, voice.
3. **Requirements v1 — Web — Alok Plastics** (client document) — company facts, vision, mission, values, keywords/proof, story, journey, culture, USP, industries, pan-India line.
4. **Client product catalogue** ("Water cooler and deepfreezer spare parts" PDF) — product names, materials, sizes, variants.
5. **SRS v1.0** (Manhar Creatives, 19 Sep 2026) — page list, navigation, enquiry journey, future admin panel.
6. This prompt.

If a file exists in the repo under `/brand`, `/content/source` or `/docs/source`, read it. If it does not, use the facts transcribed in §5 and §6 of this prompt — they were copied from those documents.

### 1.2 Corrections — already resolved, do not re-open
| Issue | Wrong / old | **Correct (LOCKED)** |
|---|---|---|
| Tagline Devanagari | any other spelling (e.g. शिष्पतेम्, निर्मातम्) | **भारते शिल्पितम्, विश्वय निर्मितम्** — copy this exact Unicode string. `विश्वय` is the approved brand spelling; do not "correct" it. |
| Tagline English | "Crafted **from** Bharat, **Built for** the World" (old requirements doc) | **Crafted in Bharat, made for the world.** |
| Old logo | Blue circular "AP" badge with India map (in requirements PDF) | **Retired.** Only the burgundy/silver ALOK wordmark is used. Never show the blue badge anywhere. |
| Old visiting card | "Alok Plastic", Plot No. 28, old phone numbers | **Ignore entirely.** Name is always **Alok Plastics** (with the s). Address is Plot No-06 (§5). Phone/email are `TODO(client)`. |
| Theme | SRS v1.0 said "dark theme" | **Superseded.** Brand Colour Guide v1.0 locks a **LIGHT** theme. Dark is only used as small accents. |
| Font name | "Noto Sans Devanagri" | **Noto Sans Devanagari** |
| City in micro-labels | "CHANDIGARIH" | **CHANDIGARH** |
| Industries section | SRS said "logos only, no text" | No client logos have been supplied. Use the **7 industry verticals as text** (§5.9). Build the component so customer logos can be added later via config (`industries.logos: []`). |

### 1.3 How the name is written
- In running text: **Alok Plastics**. In capitals (ALOK PLASTICS) only where it mimics the logo.
- Always **Plastics**, never "Alok Plastic".
- Pronounced "AA-lok".

---

## 2. BRAND LOCK — non-negotiable

### 2.1 Colour tokens (LOCKED — exact HEX from Brand Colour Guide v1.0)
Put these in `src/styles/tokens.css` and mirror them in Tailwind v4 `@theme`. **No hex value may appear anywhere else in `src/`** (enforced by a lint script in Phase 1).

```css
:root{
  /* Primary & secondary */
  --burgundy:#581C25;          /* Alok Burgundy — THE primary */
  --grey-metal:#737171;        /* Metal Grey — the logo's second colour */

  /* Burgundy support shades */
  --burgundy-night:#2E0A0F;    /* very dark panels, deep shadows (rare) */
  --burgundy-deep:#3E131A;     /* button hover, gradient end, dark footer strip */
  --burgundy-bright:#8A2C38;   /* link hover, highlights, charts */
  --rose:#C35A61;              /* accent on dark backgrounds, small highlights */
  --rose-pale:#E3B5B8;         /* text accent on burgundy, soft outlines */
  --pink-soft:#F3DFE0;         /* tags, hover panels */
  --blush:#FAF1F1;             /* callout boxes, note panels, secondary btn hover */

  /* Light surfaces */
  --surface:#FFFFFF;           /* cards, forms, product photo backgrounds */
  --canvas:#F8F7F7;            /* Soft White — MAIN CANVAS */
  --surface-alt:#F1EEEF;       /* Light Grey — alternate sections, table stripes */
  --mist:#ECE7E8;              /* Mist Grey — header bar, input backgrounds */
  --grey-cloud:#E1DBDC;        /* Cloud Grey — soft borders and dividers */
  --grey-warm:#D8D4D0;         /* Warm Silver — fine lines, card borders */
  --silver:#909090;            /* Silver Grey — DECORATION ONLY, never text */

  /* Text */
  --ink:#1E1115;               /* headings & key text (warm near-black) */
  --body:#4A3D40;              /* paragraphs */
  --muted:#6B5F62;             /* helper text, placeholders, footnotes */

  /* Functional — never brand colours */
  --whatsapp:#0F7B6C;          /* WhatsApp buttons & links ONLY */
  --success:#2E7D32;  --warning:#8A5A00;  --error:#B3261E;  --info:#1F5F8B; /* form/status only */

  /* Derived (only these two derived values are allowed) */
  --metal-gradient: linear-gradient(175deg,#2E0A0F 0%,#581C25 32%,#8A2C38 58%,#C9A0A4 100%);
  --silver-gradient: linear-gradient(180deg,#6E6C6C 0%,#8F8D8D 45%,#BDBBBB 100%);
}
```
`#C9A0A4`, `#6E6C6C`, `#8F8D8D`, `#BDBBBB` exist **only inside these two gradients** (they reproduce the logo's top-lit highlight). They may not be used as standalone colours.

### 2.2 Colour usage map (LOCKED — from the colour guide's "which colour goes where" table)
| Where | Background | Text | Accent / logo |
|---|---|---|---|
| Page canvas | `--canvas` | `--ink` headings, `--body` text | colour logo |
| Header (solid state) | `--mist` or `--canvas`, line `--grey-warm` | `--ink` | colour logo |
| Category cards / enquiry banner / footer | `--burgundy` | `#FFF` | white logo, `--rose-pale` small text |
| Product cards | `--surface`, border `--grey-warm` | `--ink` names, `--body` details | burgundy for links |
| Primary button | `--burgundy` → hover `--burgundy-deep` | white | — |
| Secondary button | `--surface`, 1px `--burgundy` border | `--burgundy` | hover bg `--blush` |
| WhatsApp button | `--whatsapp` | white | WhatsApp only |
| Links | — | `--burgundy` | hover `--burgundy-bright` |
| Form field | `--surface`, border `--grey-warm` | `--ink`, placeholder `--muted` | focus border `--burgundy` |
| Tag / badge | `--blush` | `--burgundy` | — |

### 2.3 Proportion (LOCKED)
~**61%** light surfaces (Soft White + pale greys) · ~**28%** burgundy · ~**11%** grey, text and photos.
- Light is the default state. Every page starts on `--canvas` or `--surface`.
- Burgundy appears in **a few strong blocks**: buttons, the enquiry banner, the footer, one feature block per page, small accents. **Maximum one burgundy block per viewport.**
- **One burgundy shade per block.** Don't mix `--burgundy`, `--burgundy-deep` and `--burgundy-bright` inside one block (the metal gradient on a single word/rule is the only exception).
- Grey is the helper — lines, icons, captions. Grey is never a headline colour and never a button colour.

### 2.4 Forbidden (LOCKED)
- Pure black `#000000` for text or backgrounds.
- Blue, orange, cyan, purple, neon, teal (except `--whatsapp`), or any green as a brand colour. Green = WhatsApp + form success only.
- A full page of burgundy. Two burgundy sections adjacent.
- Glassmorphism anywhere except the navbar + mobile drawer (§9). Aurora gradients, mesh blobs, sparkles, "liquid glass", 3D blobs, gradient text in purple/blue, emoji icons.
- Recolouring, stretching, skewing, re-drawing, outlining, shadowing, or animating the *shape* of the logo. (Animating its **reveal** — clip/mask/stroke/light — is allowed in the preloader, see §10; the final resting state must be pixel-identical to the master.)
- Flags, tricolour gradients, Ashoka Chakra, globe-with-pins clichés. The brand doc explicitly rejects flag colours: "No flag colours and no clichés."
- Inventing any fact not in §5–§6 (see §19).

### 2.5 Contrast pairs (from the colour guide — verify on the rendered page)
| Text on background | Ratio | Use |
|---|---|---|
| Ink on Soft White | 17.1 | headings |
| Body on Soft White | 9.7 | paragraphs |
| Burgundy on Soft White | 12.2 | links, highlights |
| White on Burgundy | 13.1 | buttons, banners, footer |
| Pale Rose on Burgundy | 7.2 | small accents on burgundy |
| Muted on Soft White | 5.7 | helper text |
| Metal Grey on Soft White | **4.5 — minimum pass** | captions & micro-labels only, never paragraphs |
| White on WhatsApp Green | 5.2 | WhatsApp button |
| Silver on Soft White | **3.0 — FAIL** | never text, decoration only |
| Rose on Night Burgundy | 4.3 | large headings on very dark panels only |

### 2.6 Logo usage (LOCKED)
- **Light backgrounds** (Soft White, White, light greys) → full-colour logo (burgundy ribbons + silver core, gradients).
- **Burgundy backgrounds** → all-white logo. The colour logo disappears on burgundy — never use it there.
- **Black / dark photos / dark video frames** → "bright" logo for dark backgrounds.
- **Any other colour** → don't place the logo on it; use a white panel.
- Clear space = height of the "P" in PLASTICS on all sides. Minimum width: 120px (full lockup), 72px (ALOK only, no PLASTICS — allowed only in the compact navbar and favicon contexts).
- The tagline goes **below or beside** the logo, **never inside** it.

### 2.7 Tagline (LOCKED)
```
भारते शिल्पितम्, विश्वय निर्मितम्
Crafted in Bharat, made for the world.
```
- Large sizes: first half (`भारते शिल्पितम्,`) in `--burgundy`, second half (`विश्वय निर्मितम्`) in `--grey-metal` — exactly as on the brand cover and LinkedIn cover.
- Small sizes (< 20px): whole line in `--ink`.
- English line always beneath, in `--body` (on light) or `--rose-pale` (on burgundy). Never replace the Devanagari with the English.
- Markup: `<p lang="sa">…</p>` for the Sanskrit line (BCP-47 `sa` = Sanskrit; script is implied Devanagari), `<p lang="en">` for English.
- Decorative hairlines with fade ends may flank the Devanagari line (like the brand documents): `—— भारते शिल्पितम्, विश्वय निर्मितम् ——`.

---

## 3. DESIGN LANGUAGE — derived from the logo, not borrowed from a template

This is the most important section. Every rule traces to a specific feature of the ALOK wordmark (Brand Philosophy §03 "The logo, piece by piece"). Follow it literally. When in doubt, look at the logo.

| # | Logo feature | What it means (brand doc) | System rule |
|---|---|---|---|
| 1 | **The A** — burgundy ribbon folded into a **peak** | Rising, growth; a roof that protects; folded-sheet look of formed material | **Diagonal cuts.** Hero exit, section dividers, card corners, image masks use `clip-path` diagonals echoing the A's peak angle (**≈ 44–46°**). Use a straight rectangle only where a diagonal would hurt readability. |
| 2 | **L + O** — silver-grey block where two letters **lock** like a chain link / bracket | Connection and strength; the catalogue is full of parts that join and hold | **Strict binary: BURGUNDY *or* SILVER-GREY, never equal weight.** Burgundy = brand / strength / action. Grey = engineering / metadata / lines. Also: **interlocking layouts** — cards that key into each other with stepped edges (see Rheinmetall reference in §4). |
| 3 | **The K** — burgundy arm sweeping **up-and-right** to a sharp point | Forward movement and reach: the brand looks outward | **All forward motion points up-and-right (↗).** Arrow icons, progress rails, timeline growth, image reveal direction, scroll cue, hover nudges (`translate(2px,-2px)`). Never a plain → arrow. Never ↓ for "next". |
| 4 | **PLASTICS** — wide-spaced, **squared** metallic grey | Stability and precision; technical lettering; calm, corporate, international | **Micro-labels:** uppercase, 12px, `letter-spacing:.16em`, squared caps, `--grey-metal`. Every section opens with a numbered technical callout: `02 — PRODUCTS`. These are the voice of the page. |
| 5 | **The light effect** — dark-to-light shading across every shape | Light catching polished metal or a moulded surface: the name Alok made visible | **Top-lit metallic gradient**, light always from the top: `--metal-gradient` (175°). Apply to key words, rules, numerals, card top-edges, and the preloader. Never left-to-right, never bottom-up — that contradicts the logo. |
| 6 | Structure: **burgundy · grey · burgundy** — two strong outer letters frame a steady core | Balance | **Framed-core compositions.** Key sections place a calm grey/white core between two burgundy accents (e.g. a rule left, a CTA right). |
| 7 | Shape: **wide and low** | Stable, grounded; fits headers, labels, stamps | **Wide, short proportions.** Landscape sections. Never a tall skinny hero. Content sections: `min-height` only when content justifies it; max visual height `min(88svh, 780px)` except the pinned Journey section. |
| 8 | Heavy strokes, **sharp angles**, squared-cut letters | Industrial, engineered | `border-radius: 2px` maximum. Pill-shaped cards banned. Circles only for counter dots, map pins, the WhatsApp FAB. **Exception:** the floating glass navbar is a pill (§9). |
| 9 | Folded-sheet construction | Formed material | Cards and sections carry a single 1px lit top edge (`inset 0 1px 0 rgba(255,255,255,.9)` on white; `rgba(88,28,37,.12)` on tint). Section breaks can be 2px diagonal rules like a folded sheet edge. |
| 10 | Two materials — burgundy is the brand, grey is the metal | Identity + engineering working together | Photography: products on **white or warm-grey** sets, hard top light, crisp shadow; burgundy appears as a set element, not a colour filter. |

### 3.1 Technical-drawing furniture (engineering credibility)
Restrained — **one or two per section, never decorative noise**:
- Corner crop marks (L-shaped 10px hairlines) on primary cards.
- Crosshair `+` register marks at section corners (8px, 1px `--grey-warm`).
- Measurement rules with end caps (`|—————|`) under stat numbers, labelled in micro-type (e.g. `Ø`, `mm` only when a real dimension is shown).
- A faint 8px grid in section backgrounds at 3% opacity (`--grey-metal`), masked with a radial fade so it never touches text edges.
- Drawing-sheet title blocks: a small bordered info box (like an engineering drawing's title block) for product spec tables: `PART · MATERIAL · VARIANTS · DRG NO.` (DRG NO. = SKU when the client provides it; otherwise omit the row — do not invent codes).

**Result:** the site should feel like an engineering drawing that got a pulse. Precise, machined, warm, light. Not a landing page.

### 3.2 The anti-generic checklist (the slop filter)
Reject any output that has:
- A centred hero with a gradient blob behind it.
- Three equal feature cards with icon-on-top, title, two lines of text.
- Purple/blue anything. Inter-only typography with no display face.
- Rounded-2xl cards with soft drop shadows everywhere.
- "Trusted by" logo strips with fake logos.
- Testimonials from invented people.
- Stock-photo smiling businesspeople, handshake photos, gears/cogwheel icons, water-droplet or snowflake icons (the brand doc explicitly rejects droplet/snowflake/gear symbols).
- Lorem ipsum or placeholder copy that looks like real copy.
- Emoji. Lucide icons used as decoration with no meaning.
- Every section the same height with the same padding and the same reveal (fade-up 20px). **Vary rhythm and reveals deliberately.**

---

## 4. DESIGN RESEARCH — references, findings, and your own research task

### 4.1 What was already studied (findings to apply)
These sites were reviewed in a browser before this prompt was written. Take the **pattern**, never the look, colours or copy.

| Reference | What it does well | Apply to Alok as |
|---|---|---|
| **igus.eu** ("motion plastics" — the closest real-world peer: an engineering-plastics component brand) | A thin **utility bar** above the header with B2B promises + tools ("Ready to ship…", "Download CAD", calculator). A prominent **search by article number**. Product categories as **horizontal tab chips** with **product cut-outs on pure white**. A "**Your way to the right component**" block that splits the buyer into two paths (standard product vs custom manufacture). | (a) A 32px **utility bar** in `--mist`: `Since 1998 · Pan-Bharat dispatch · WhatsApp: TODO(client)` (only verified claims). (b) A **part finder** search (client-side, Fuse.js) over the product data. (c) Product cut-outs on `--surface` with a crisp contact shadow. (d) A **two-path block**: "I need a catalogue part" → Products / "I need a part made to my requirement" → Enquiry — this is the USP "From Requirement to Repeat Supply" made useful. |
| **formlabs.com** | Hero as a **contained panel** inset from the page edges instead of full-bleed; product cards with tiny uppercase **category tags** above the name; one hot accent colour used only on CTAs. | Inner-page heroes use an **inset panel** (16–24px from viewport edges, 2px radius) so the canvas frames them like a sheet in a drawing. Micro-tags above product names (`NYLON`, `HDPE`, `PPCP`, `BRASS`). Burgundy as the single action colour. |
| **rheinmetall.com** | A full-width **stat band**: big light-weight numerals, labels beneath, **vertical hairline dividers** between stats. **Stepped/offset block edges** where a coloured block and an image block interlock at different heights. | Proof strip uses **odometer-style rolling digits** + vertical hairline dividers + measurement end-caps. Interlocking stepped edges between sections — the visual equivalent of the L+O chain link. |
| **teenage.engineering** | Utilitarian, **pictogram-led navigation**; a strict typographic system; the product is the hero; nothing decorative that isn't functional. | A custom **part-pictogram icon set** (1.5px stroke, squared terminals) drawn from the actual parts: bush, valve, jalli grid, leg insert, pipe, lock, hinge, gasket, push cock. Use them in the mega-menu and product groups. No generic icon library glyphs for products. |
| **Brand documents themselves** | Numbered section headers (`01 The foundation`), wide-tracked uppercase micro-labels in burgundy, burgundy table headers, Blush callout boxes with a 4px burgundy left rule, tagline flanked by fading hairlines. | These ARE the house style. The website must look like the same family as the PDFs: numbered sections, micro-labels, Blush callouts, burgundy-header spec tables. |

### 4.2 Your research task (Phase 0 — Agent: `design-researcher`)
Do your own focused research before designing, with Playwright (Chromium is available; use `executablePath` if needed) or any browser MCP you have:

1. Capture **desktop 1440 + mobile 390** screenshots of 8–12 references into `.research/<site>/` (gitignored):
   - Industrial/component peers: igus.eu, misumi (any regional site), essentracomponents.com, würth industry, a premium Indian manufacturer of your choice.
   - Award-level corporate/industrial: browse Awwwards (categories *Industrial*, *Architecture*, *Corporate*), Godly, Land-book, SiteInspire, Mobbin (web) — pick sites with strong typographic systems, restrained colour, real product photography.
   - Preloaders: find 3 sites with **logo-construction** preloaders (not spinners, not fades) and record frame-by-frame what happens (use Playwright `page.screenshot` every 100ms for the first 4s, or a video recording).
2. Write `docs/design-research.md`: for each reference → *what pattern*, *why it works*, *how Alok adapts it within §2–§3*, *what we must NOT copy*. End with a 10-line "design principles for Alok" summary.
3. Produce **3 moodboard directions** as a single static page `/_lab/directions` (dev-only route, `noindex`, excluded from build) showing the hero + one product card + the proof strip in each direction:
   - **A. "Drawing Sheet"** — technical-drawing furniture forward, grid, crop marks, mono micro-type.
   - **B. "Polished Metal"** — light, metallic gradients, specular sweeps, product macro photography forward.
   - **C. "Folded Ribbon"** — diagonal clip-paths and folded burgundy ribbons as the dominant graphic device.
   Then **recommend one (or a blend)** with reasons, record it in `docs/decisions.md`, and continue with it. (The default expectation is a **B+A blend with C used for transitions** — override only with a clear reason.)

**Rule:** research informs patterns. It never introduces a new colour, typeface, or claim.

---

## 5. CONTENT — source of truth (LOCKED)

Wire every string to typed content files — `src/content/site.ts`, `src/content/products.ts`, `src/content/industries.ts`, `src/content/journey.ts`, `src/content/navigation.ts`. **No copy hardcoded in components.** Content files are plain TypeScript objects with types in `src/content/types.ts`, so they can later be swapped for a CMS / the admin panel (SRS future scope) without touching components.

### 5.1 Company
- **Name:** Alok Plastics · **Entity:** Manufacturer · **Established:** 1998
- **Address:** Plot No-06, Industrial Area Phase II, Ram Darbar, Chandigarh 160003, India
- **Owner:** Mr. Gopal Kumar · **CEO:** Mr. Aalok Kumar
- **Phone / WhatsApp / Email / Google Maps link / GSTIN / social URLs:** `TODO(client)` — placeholder values in `site.ts`, each marked `// TODO(client)`. The WhatsApp number must be a single config value that every WhatsApp link reads from.
- Domain: `https://alokplastics.com`

### 5.2 Vision
To build Alok Plastics into a globally recognized Indian manufacturing brand, growing our capabilities, our people, and our partnerships while becoming trusted for turning customer requirements into the right solutions and responsible manufacturing.

### 5.3 Mission
To combine manufacturing expertise, practical problem-solving, and customer collaboration to deliver plastic and steel solutions through consistent manufacturing, responsive service, and lasting trust.

### 5.4 Core values
1. **We don't just mould plastic. We mould possibilities.**
2. **Less waste. More value.** — Smarter manufacturing.
3. **Social employment** — Creating employment opportunities and supporting local talent.

### 5.5 Proof points / keywords (verbatim from the client's requirements — the ONLY numbers allowed)
| Value | Label |
|---|---|
| **20 Cr+** | Products successfully delivered |
| **70%+** | Repeat customers |
| **Since 1998** | Manufacturing experience |
| **Pan Bharat** | Delivery network |
| **Quarter-on-Quarter** | Production growth |
| **100%** | Commitment to quality & trust |
| **Automatic Moulding Machines** | Consistent quality & faster production |
| **Top-Notch** | Quality commitment |
| **Trusted** | B2B manufacturing partner |

Count-up animations only on true numerics (20, 70, 1998, 100). "Quarter-on-Quarter", "Pan Bharat", "Top-Notch", "Trusted" are words — reveal them, don't count them.

### 5.6 Story — *Built on Manufacturing. Grown on Trust.*
Established in 1998, Alok Plastics began its manufacturing journey with a simple belief: good products build business, but **trust builds long-term relationships**.
Starting with a focus on serving industrial and B2B customers, the company gradually grew through consistent manufacturing, dependable service, and an understanding of what businesses truly need from a manufacturing partner — **quality, competitive pricing, reliable supply, and timely delivery**.
Over the years, Alok Plastics expanded its capabilities and customer reach across India. Today, we manufacture plastic components using moulds and plastic granules and continue to serve businesses across the country. With **20 crore+ products successfully delivered and ongoing**, our journey reflects the trust our customers have placed in us.
But our journey is far from complete. We are continuously working to expand our production capabilities, create more employment opportunities, adopt responsible manufacturing practices, and build partnerships with leading companies in India and global markets.
For us, growth is not only about producing more. It is about **building better products, stronger relationships, and lasting trust**.

### 5.7 Journey
| Marker | Title | Line |
|---|---|---|
| `1998` | The Beginning | Alok Plastics begins its manufacturing journey with a focus on serving industrial and B2B customers. |
| `2000s` | Building Customer Relationships | The company grows through consistent manufacturing, reliable service, and long-term customer relationships. |
| `2010s` | Expanding Reach | Alok Plastics strengthens its manufacturing capabilities and expands its customer base across different parts of India. |
| `2020s` | 20+ Crore Products Delivered | The company reached the milestone of 20 crore+ successfully delivered products, with deliveries continuing. |
| `Today` | Serving India | Alok Plastics continues to serve B2B customers across India with plastic and steel products, focusing on quality, reliability, and trust. |
| `The Future` | Expanding Production | The next phase includes plans to expand the production house, increase manufacturing capabilities, and serve growing customer requirements. |

### 5.8 USP — *From Requirement to Repeat Supply.*
We don't just manufacture plastic components — we build reliable, repeatable supply partnerships.
**Understand → Develop → Manufacture → Supply → Repeat**
> "We don't measure success by the order we deliver. We measure it by the orders that keep coming back."

The five steps have **no descriptions in the source**. You may write **one short functional line per step** describing the *buyer's* action (e.g. "Understand — you share the part, quantity and use."). Mark these lines `// COPY: drafted, needs client approval` and list them in `docs/client-questions.md`. Do not claim turnaround times, tolerances, capacities or certifications.

### 5.9 Industries — *Built for the industries that build India.*
| Industry | Line |
|---|---|
| OEM & Manufacturing | Components for OEMs, production lines and manufacturing businesses. |
| Engineering & Machinery | Parts for industrial machinery, engineering products and equipment. |
| Automotive | Plastic components for automotive and auto-component applications. |
| Electrical & Electronics | Components for electrical products and industrial electrical applications. |
| Gas & Kitchen Equipment | Components for gas equipment, commercial kitchens and related products. |
| Agriculture & Equipment | Components used in agricultural equipment and machinery. |
| Packaging & Specialized Applications | Components for packaging systems and specialized industrial requirements. |

Plus the core market from the catalogue and brand doc: **Water coolers · Display counters · Deep freezers** — this is the primary product market and leads the Products section; the 7 industries above are the wider reach.

### 5.10 Pan-India
*From Chandigarh to every corner of India.* From a single component to thousands of parts for a production line — we manufacture for businesses that build.
No list of cities/states is supplied → the map shows **Chandigarh as the origin** and **unlabelled dispatch arcs** to India's broad regions. Do not label specific cities as "customers" or "delivery points". `TODO(client): list of states/cities served` if they want labels.

### 5.11 Culture — Joyful, Supportive, Trustworthy
At Alok Plastics, we believe a strong company is built by strong people. We aim to create a joyful, supportive, and trustworthy working environment where every team member feels valued and respected.
Teams: **Product Development** (working closely with factory operations to develop and improve products) · **Sales** (building customer relationships and expanding B2B reach) · **Social Media & Marketing** (strengthening brand presence, connecting with new audiences) · **Tech Developers** (supporting technology, digital systems, and the company's growing digital needs).
We encourage teamwork, learning, responsibility, and continuous improvement — giving people opportunities to develop their skills, take ownership of their work, and grow alongside the company. As we expand, our goal is to build not just a larger manufacturing business, but a workplace where people enjoy working, grow together, and take pride in what they create.

### 5.12 Brand idea & 30-second answer (About page)
"Alok means light. Our logo shows two burgundy ribbons holding a silver-grey core, because we make the small, strong parts that hold coolers, display counters and freezers together. Burgundy is our strength, grey is our metal, and our line, crafted in Bharat, made for the world, says where we come from and where we are going."

### 5.13 Voice (from Brand Philosophy §08)
| The brand is… | In words |
|---|---|
| Professional | Short, clear sentences. No slang. Tidy layouts. |
| Reliable | Facts from the catalogue: size, material, use. No exaggeration. |
| Technical | Correct part names and sizes. Exact values only when verified. |
| Proud but humble | Mention Bharat with pride and let the quality speak. |
| Helpful | Every page leads to a next step: **Enquire Now · WhatsApp Us · Get a Quote.** |

---

## 6. PRODUCTS — taxonomy & data (LOCKED structure, data from catalogue only)

### 6.1 Taxonomy — group by what the part DOES inside a machine
That is how a dealer or repair shop actually searches. The first group is the anchor: F-bushes and connecting bushes are literally the logo's silver-grey chain link.

| # | Group | Anchor parts (home page) | Home card |
|---|---|---|---|
| 01 | **Sliding & Door Systems** | F-Bushes · Connecting Bushes · Door Locks · Hinges | **2× width — the anchor** |
| 02 | **Water Control** | Float Valves · Push Cocks · Waste Pipes | standard |
| 03 | **Ventilation & Leveling** | Ventilation Jalli · Adjustable Leg Inserts | standard |
| 04 | **Sealing** | Gaskets | standard |

### 6.2 Full catalogue data (`src/content/products.ts`)
Other catalogue items exist (Handle Lock, Bracket Handle, SS Kabja, L-Type Hinges, U-Type Door Spring, L-Hinge Door Spring, Waste Coupling, Three Core Plug, PUF Chemical, Bright Chrome, …). Put **every** catalogue item in the data file:
- Items that clearly belong to a group: Handle Lock, Bracket Handle, SS Kabja, L-Type Hinges, U-Type Door Spring, L-Hinge Door Spring → **01**; Waste Coupling → **02**.
- Items that don't clearly fit (Three Core Plug, PUF Chemical, Bright Chrome, any other) → `group: null, published: false // TODO(client): confirm group`. They do **not** render until confirmed.

Data model:
```ts
type Product = {
  slug: string;              // 'float-valve'
  name: string;              // 'Float Valve'
  group: '01'|'02'|'03'|'04'|null;
  machine: ('water-cooler'|'display-counter'|'deep-freezer')[] | 'TODO';
  material?: string;         // only if in catalogue, e.g. 'Nylon'
  variants?: { label: string; note?: string }[];  // sizes/types exactly as catalogue
  price?: { amount: number; unit: 'pc'|'set' };   // catalogue price — stored, NOT displayed at launch (§6.4)
  sku?: string; hsn?: string; moq?: string; packing?: string;   // all TODO(client)
  summary?: string;          // one line, drafted, flagged '// COPY: needs approval'
  images: { src: string; alt: string; w: number; h: number }[]; // TODO(client) photos
  published: boolean;
};
```
Known catalogue facts (use exactly, nothing more):
- **Adjustable Leg Insert** — Round & Square shapes · sizes 1", 1.25", 1.5", 1.75", 2" · **HDPE**
- **F-Bush** — Display counter sliding door bush · **Nylon** · catalogue price Rs. 10/pc
- **Ventilation Jalli** — sizes RS 60, RS 75, RS 80, RS 130 (multiple dimensional variants in catalogue) · **PPCP**
- **Connecting Bush** — Brass and plastic/nylon variants · sizes 2", 2.5", 3" · variant-wise prices in catalogue
- **Float Valve** — **Nylon** · Rs. 180/set
- **Waste Pipe** — **PPCP** · Rs. 20/pc
- **Push Cocks** — Light / Heavy variants · **Brass** · listed prices in catalogue
- Gaskets, hinges, springs, door locks — names only unless the catalogue file in the repo gives more. Missing material → omit the field (render nothing), and log `TODO(client)`.

If the catalogue PDF is in the repo (`/content/source/catalogue.pdf`), extract the remaining items/variants from it with `pdftotext`/visual reading and reconcile — list every reconciliation in `docs/catalogue-reconciliation.md`.

### 6.3 Product card (home) — anatomy
Group number micro-label (`01`) · group name in Archivo 600 · the parts as a `--grey-metal` list with hairline dividers · one line on what the group does in the machine · part pictograms (§4.1) · `View parts ↗` link. No prices, no stock status, no invented specs.

### 6.4 Prices
Catalogue prices are stored in data but **not shown at launch** (`site.showPrices = false`). B2B pricing varies by quantity; the CTA is **Get a Quote**. `TODO(client): confirm whether list prices should be public.`

---

## 7. TYPE, GRID & SPACING (LOCKED unless marked ELASTIC)

### 7.1 Typefaces (self-hosted via `next/font/google` or `next/font/local` — no runtime Google Fonts request)
- **Display / headings:** **Archivo** (variable: `wght` 500–800, `wdth` 62–125). H1 and preloader words use the **expanded width** (`font-variation-settings: "wdth" 125` — this is "Archivo Expanded"; do not load a separate family if the variable axis is available). Squared terminals, industrial, wide by nature — a direct echo of PLASTICS.
- **Body / UI:** **Inter** (variable), 16–18px. Enable `font-feature-settings: "ss01","cv11"` for a more technical look.
- **Devanagari:** **Noto Sans Devanagari** 500/600/700, subset `devanagari` only, used for the tagline and आलोक.
- **Numerals:** `font-variant-numeric: tabular-nums lining-nums` on every stat, table, counter and price.
- **Mono micro-detail (ELASTIC):** `JetBrains Mono` or `IBM Plex Mono` at 11–12px for drawing-sheet details (coordinates, DRG labels, the preloader percentage). Max one mono usage per section.
- Fallbacks with `size-adjust` / `adjustFontFallback` so CLS ≈ 0.

### 7.2 Type scale (fluid)
```
display   clamp(2.75rem, 7vw, 5.5rem)   / 1.02  tracking -0.03em  wght 650  wdth 125
h1-inner  clamp(2.25rem, 5vw, 4rem)     / 1.05  tracking -0.025em wght 650  wdth 112
h2        clamp(2rem, 4vw, 3.5rem)      / 1.06  tracking -0.02em  wght 600
h3        clamp(1.375rem, 2vw, 1.75rem) / 1.15                     wght 600
lead      1.25rem   / 1.5   --body  wght 400
body      1.0625rem / 1.65  --body  (max-width 68ch)
small     0.9375rem / 1.55  --muted
micro     0.75rem   / 1     uppercase  tracking .16em  --grey-metal  wght 600
tagline-dev  clamp(1.5rem, 3.2vw, 3rem)  Noto Sans Devanagari 600  line-height 1.5 (Devanagari needs room for matras)
```

### 7.3 Grid
`max-width: 1360px`, 12 columns, gutter 32px desktop / 24px tablet / 20px mobile, page padding `clamp(20px, 5vw, 64px)`. Breakpoints: 375 · 768 · 1024 · 1280 · 1440 · 1920 (test ultrawide: content stays at 1360, backgrounds go full-bleed).

### 7.4 Spacing — base 4px, the "everything is connected" rule
| Token | px | Use |
|---|---|---|
| `--space-xs` | 8 | hairline gap inside a group |
| `--space-sm` | 16 | label ↔ its value |
| `--space-md` | 24 | sibling cards |
| `--space-lg` | 40 | padding inside a content block |
| `--space-xl` | 72 | between two groups inside one section |
| `--section-y` | 120 desktop / 80 tablet / 56 mobile | section padding |

**Coupling rule:** things that belong together sit **8–16px** apart. Things that don't belong together sit **≥40px** apart. **Never 28–36px** — ambiguous spacing is what makes a page feel unconsidered. Only token values allowed (lint check in Phase 1).

### 7.5 Vertical rhythm
Sections alternate `--canvas` → `--surface-alt` → `--canvas` → `--surface`. One section per run may go burgundy. **Never two burgundy sections adjacent** (the enquiry banner and footer are both burgundy → separate them with a 1px `--burgundy-deep` hairline and a diagonal step, or make the footer `--burgundy-night` strip only at the bottom bar; record the choice in `docs/decisions.md`).

### 7.6 Iconography
- Custom **part pictograms** (§4.1), SVG, 24/32/48 sizes, 1.5px stroke, squared caps/joins, `currentColor`.
- UI icons: **Phosphor (Light/Regular)** or **Tabler** — one set only, recoloured via `currentColor`. Arrow icon is always the ↗ variant.
- WhatsApp: official glyph, white on `--whatsapp`.

---

## 8. INFORMATION ARCHITECTURE & PAGES

### 8.1 Navigation (from SRS v1.0, LOCKED)
Primary: **Home · About · Products ▾ · Industries · Career · Contact** + CTA **Get a Quote** (burgundy) + **WhatsApp** icon button (green).
- **Products ▾** opens a **mega-panel** (solid `--surface`, never glass): 4 group columns (01–04) with part pictograms and part links + a right-hand feature tile "Need a part made to your requirement? → Enquire".
- Footer nav adds: Privacy Policy · Terms & Conditions · Refund Policy · Sitemap.

### 8.2 Routes to build (real pages, not stubs)
| Route | Purpose | Ends with |
|---|---|---|
| `/` | Flagship (§13) | Enquiry section |
| `/about` | Story, brand idea (आलोक = light), vision, mission, values, journey (full), leadership names (no photos unless supplied), culture teaser | Enquire / WhatsApp |
| `/products` | All 4 groups, part finder search, filter by machine (cooler / counter / freezer) and material | Get a Quote |
| `/products/[group]` | e.g. `/products/sliding-door-systems` — group intro + part grid | Get a Quote |
| `/products/[group]/[part]` | Product detail template: gallery, title-block spec table, variants, machine fit, related parts, sticky enquiry bar | Enquire / WhatsApp prefilled with the part |
| `/industries` | 7 verticals + core market; "requirement to repeat supply" process | Enquire |
| `/career` | Culture (§5.11), four teams, open roles list from config (empty state: "No open roles right now — send your CV to TODO(client)") | Apply / Contact |
| `/contact` | Address, map embed (lazy, click-to-load for performance/privacy), phone, email, WhatsApp, enquiry form | — |
| `/enquiry` (or `/get-a-quote`) | Full bulk-enquiry form (§14) | Submit / WhatsApp |
| `/privacy`, `/terms`, `/refund` | Layout + headings only; body = `TODO(client): legal text` notice. **Do not write legal text.** | Contact |
| `/not-found` | Branded 404 with part finder + home link | Home |
| `/_lab/*` | Dev-only: swatches, type specimen, components gallery, directions. Excluded from production build & sitemap. | — |

Blog (SRS: listing + 5 SEO articles) is **out of this build**; leave the content model and route group ready (`src/content/blog/`) but do not invent articles.

### 8.3 Every page
Skip link → utility bar → navbar → `<main id="main">` → page → enquiry CTA band → footer. Floating WhatsApp FAB bottom-right (mobile + desktop), hidden while the enquiry form is in view. Breadcrumbs on all inner pages (with `BreadcrumbList` JSON-LD).

---

## 9. GLASS NAVBAR (LOCKED rule: glass in ONE place only)

The client asked for a **glassmorphism navbar over a video hero**. Not a glass website.

- **Navbar is glass. Mobile drawer is glass.** Everything else is **flat**: solid fills, solid hairline borders, solid cards. Mega-panels are solid `--surface`.
- Verify with `grep -rn "backdrop-filter" src/` → **two files maximum** (navbar, drawer). A third is a gate failure.
- Glass in one place reads as intentional premium. Glass everywhere reads as a template.

### 9.1 Spec
```css
.glass-nav{
  position: fixed; top: 16px; left: 50%; translate: -50% 0;
  width: min(1360px, calc(100% - 32px)); height: 64px;
  background: rgba(255,255,255,.55);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
          backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255,255,255,.65);
  border-radius: 999px;            /* the pill is the ONE exception to the 2px rule */
  box-shadow: 0 4px 24px rgba(30,17,21,.06), inset 0 1px 0 rgba(255,255,255,.9);
  transform: translateZ(0);
  transition: background-color .45s ease, box-shadow .45s ease, border-color .45s ease, border-radius .45s ease, top .45s ease, width .45s ease;
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))){
  .glass-nav{ background: rgba(248,247,247,.94); border-color: rgba(30,17,21,.08); }
}
```
(These rgba values are allowed: they are white/ink alpha of tokens. Express them as `color-mix(in srgb, var(--surface) 55%, transparent)` where possible.)

Mandatory details and why:
- **`saturate(180%)`** — blur alone desaturates; saturate restores the video colour bleeding through. This is the difference between glass and a blurry div.
- **`-webkit-backdrop-filter`** — Safari/iOS need the prefix, otherwise iPhone gets a flat grey box.
- **1px light border + inset top highlight** — gives the glass thickness. On light, a light border, never dark.
- Blur 10–20px, target 14px. Under 8 looks like nothing; over 24 stutters on mobile.
- **Never animate `backdrop-filter`.** Animate background-color, box-shadow, border-color only.
- The glass element must be a **sibling** of the hero media, not nested inside a filtered/transformed/`overflow:hidden` wrapper (that kills the backdrop). If the hero is pinned, the nav stays outside the pin.
- Max 3 `backdrop-filter` elements in any viewport; the navbar is 1.

### 9.2 States (the transition is a design beat)
1. **Over hero (top, scrollY < 40):** floating pill, glass, logo = colour version if the frame behind is light; bright-on-dark version if the hero media is dark (detect with a `data-hero-tone="light|dark"` attribute set from config per video/poster; do not compute per-frame).
2. **Scrolled past hero:** over ~400ms the pill **docks**: `top 16→0`, `width → 100%`, `border-radius 999 → 0`, background becomes solid `--canvas` at 96%, gains a `--grey-warm` hairline bottom border and the 1px lit top edge. Backdrop-filter may remain but background is near-opaque. Use one GSAP timeline scrubbed by a ScrollTrigger on the hero's end (`toggleActions`, not scrub — it snaps between two designed states).
3. **Scrolling down fast past 600px:** nav hides (`translateY(-100%)`); **scrolling up:** reappears. Never hides while focus is inside it or a panel is open.
4. **Active link:** 2px burgundy underline that draws from left with a 45° cut end (the A's angle).
5. **Utility bar** (32px, `--mist`) sits above the nav only at the very top of the page and scrolls away with the page; it never stacks under the floating pill.

### 9.3 Behaviour & accessibility
- Logo version per background (§2.6). Logo links to `/` with `aria-label="Alok Plastics — Home"`.
- Mega-panel: opens on hover-intent (150ms delay) **and** click/Enter/Space; `aria-expanded`, `aria-controls`; Esc closes and returns focus; arrow keys move between columns.
- **Mobile (< 1024px):** compact pill with logo + WhatsApp + menu button (44×44). Drawer slides in from the right along a **diagonal clip-path** (the K angle), glass background, focus trap, `inert` on the rest of the page, body scroll lock (`data-lenis-prevent` + Lenis `stop()`), Esc / overlay click closes. Drawer content: nav accordion for Products, big CTAs (Get a Quote, WhatsApp, Call), the tagline at the bottom.
- **Skip-to-content** link is the first tab stop, visible on focus.

---

## 10. THE PRELOADER — "Light reveals the mark" (signature moment, high priority)

### 10.1 Intent
Not a spinner. Not a fade. Not a slide-in from left/right. **An international-grade construction sequence**: the ALOK wordmark is *engineered* in front of the visitor and *lit*, the Sanskrit line is *inscribed*, and then the mark becomes the navbar logo as the page opens through the logo's own diagonal. It tells the brand story in ~3 seconds: **Alok = light · precise parts · crafted in Bharat, made for the world.**

### 10.2 Step 1 — convert the logo into a component (Agent: `brand-systems`)
1. Look for vector masters in the repo first: `/brand/**/*.svg|ai|pdf|eps` (the Brand Folder Guide, document 01, lists the master files). Use the **Primary — light background** file.
2. If only the PNG is available (`/brand/alok-logo-primary.png`, 1920×1920, the user-supplied file), **vectorise** it:
   - Crop to the artwork, upscale 2× with sharp, then trace with **vtracer** (colour mode, `--mode polygon` for straight edges, then smooth) or **potrace** per colour layer (burgundy layer, grey layer, PLASTICS layer).
   - Hand-clean in code: straighten every diagonal to its true angle, make parallel edges exactly parallel, snap squared corners, remove trace noise. Keep node counts low.
   - Split into **separate, named `<path>`/`<g>` elements**: `#A-ribbon` (with its inner fold as `#A-fold`), `#LO-core`, `#K-arm-upper`, `#K-arm-lower`, `#plastics-P`, `#plastics-L`, … `#plastics-S2`.
   - Recreate the shading with SVG `<linearGradient>`s that are **top-lit** and match the PNG: burgundy ribbons `#2E0A0F → #581C25 → #8A2C38`, core `#6E6C6C → #8F8D8D → #BDBBBB` top to bottom (these are the §2.1 gradient stops).
   - **Fidelity test:** render the SVG at 1920px and pixel-diff against the PNG (pixelmatch). Target ≥ 97% match on the alpha mask; eyeball overlay at 400%. Save the diff to `.screenshots/logo/diff.png`. If < 97%, iterate. **The resting state must be indistinguishable from the master.**
3. Produce: `src/components/brand/Logo.tsx` with props `variant: 'color' | 'white' | 'bright'`, `lockup: 'full' | 'mark'`, `title`, and `animated?: boolean` (exposes refs to each part for GSAP). Also export static SVG files to `/public/brand/` and generate favicon set + `apple-touch-icon` + OG image (logo on `--canvas` with tagline) via a script.
4. **Never** re-draw or "improve" the logo. Tracing is a faithful conversion, not a redesign. If tracing quality is doubtful, log `TODO(client): please send vector logo (SVG/AI)` and still ship the best faithful trace.

### 10.3 Step 2 — the sequence (timings are targets; total ≤ 3.4s, hard cap 4.0s)
Stage: full-viewport overlay `position:fixed; inset:0; z-index:100`, background `--canvas`. Composition centred-optically (logo block sits 4% above true centre). Wide and low, like the logo.

| t (ms) | Beat | What happens | Technique |
|---|---|---|---|
| 0–250 | **The sheet** | A faint 8px drawing grid fades in (3% → 0 at edges, radial mask). Four `+` register marks draw at the corners of an invisible frame around the logo. A thin measurement rule with end caps draws under where the logo will be. Bottom-left micro-label `ALOK PLASTICS · EST. 1998 · CHANDIGARH`, bottom-right a mono counter `000`. | SVG strokes `stroke-dashoffset`, GSAP |
| 150–1250 | **Construction** | **A:** the burgundy ribbon is *drawn* as a 1px outline along its fold (stroke draw), then **filled from the base up** (clip-path inset from bottom → 0), like material being formed. **L+O core:** two grey halves slide in along the 45° diagonal from opposite sides and **lock** (2px overshoot, `back.out(1.4)` — a mechanical click, no bounce beyond that). **K:** the upper arm **extends up-and-right** from the joint to its sharp point (clip-path reveal along the arm's axis), lower arm follows 80ms later. | GSAP timeline, clip-path polygons computed from path bounding boxes |
| 1100–1600 | **The light** (the signature beat) | A soft specular **light band** (white → transparent, 18% opacity, 45° — the A angle) sweeps once across the whole wordmark **from lower-left to upper-right** (the K's direction), and as it passes each shape its gradient "switches on" from flat to its top-lit metallic shading. This is the name "Alok = light" made literal. | SVG `<mask>` with an animated `<linearGradient>` / or a `mix-blend-mode: soft-light` overlay clipped to the logo shape |
| 1300–1800 | **PLASTICS** | Letters rise from behind a hairline baseline (each masked, 40ms stagger), and the tracking **tightens** from 0.9em to the logo's exact spacing — reading as letters being set by a machine. | per-letter `<g>` transforms; final positions must equal the master |
| 1650–2500 | **The inscription** | Under the logo, at large display size (`clamp(1.75rem, 4vw, 3.25rem)`), the Sanskrit tagline is *inscribed*: first the **shirorekha** (the horizontal headline bar that tops Devanagari letters) draws as one continuous `--burgundy` hairline from left to right across the full line width; then the glyphs **hang down from it** (clip-path revealed top → bottom, word by word): `भारते शिल्पितम्,` in burgundy, `विश्वय निर्मितम्` in metal grey. Flanking fade-end hairlines draw outward. Then `Crafted in Bharat, made for the world.` appears beneath in micro-caps tracking .24em, `--body`. | Measure the actual text box; the drawn bar is a separate element aligned to the font's headline height (tune `top` per font metrics); glyph reveal via `clip-path: inset(0 0 100% 0)` → `inset(0)` |
| 0–2500 | **Iconic words (background layer)** | Behind everything, at 6% opacity, an oversized single line in Archivo Expanded 800, `-0.04em`, cropped by the viewport edges: **आलोक — LIGHT** (Devanagari in Noto Sans Devanagari 700). It drifts 2–3% up-and-right during the sequence. It is texture, not text to read → `aria-hidden`. | CSS + GSAP, `will-change: transform` set/cleared |
| 0–2600 | **Real progress** | The mono counter `000 → 100` and a 1px burgundy progress line along the measurement rule reflect **real** loading: fonts (`document.fonts.ready`), the hero poster image (`decode()`), the hero video's `canplay` *if* video is enabled on this device, and critical above-the-fold images. Progress is the max of real progress and a minimum choreography timeline, so it never jumps backwards and never finishes before the choreography. | Promise-based loader in `src/lib/preload.ts` |
| 2600–3400 | **The exit — "the page opens through the logo"** | (1) The tagline and furniture fall away (opacity + 8px). (2) The logo performs a **FLIP shared-element transition** into the navbar logo slot (scale + translate, 700ms, `expo.inOut`); the real navbar logo is hidden until the moment of handoff, then swapped — no double logo. (3) Simultaneously the overlay **splits along the A/K diagonal**: two panels with 45° clip-path edges part — the lower-left shard moves down-left, the upper-right shard moves **up-right** — revealing the hero already painted beneath. A 1px burgundy seam glows on the split edges for 200ms. (4) Hero headline begins its own entrance as the panels clear. | GSAP Flip plugin; two `clip-path: polygon()` panels |

### 10.4 Rules
- **Never blocks content for SEO/LCP:** the page (including the hero poster and H1) is server-rendered **beneath** the overlay. The overlay is a client component mounted by an inline script decision so it paints immediately without hydration delay (avoid a flash of the page first: put a tiny inline `<script>` in `<head>` that adds `html.is-preloading` when the preloader should run; CSS shows the overlay from first paint when that class exists).
- **Once per session:** `sessionStorage['alok:preloaded']` (wrapped in try/catch). Internal navigations never show it. A repeat visit within the session gets no preloader.
- **Skippable:** any click, key press, or `Esc` fast-forwards the timeline to the exit (`tl.timeScale(4)` then exit). Provide a visually small but accessible "Skip intro" button bottom-centre (`aria-label`).
- **Hard cap:** if assets aren't ready by 4.0s, exit anyway; the hero handles late media gracefully.
- **Reduced motion:** no construction, no sweep, no split. Show the static logo + tagline for 500ms, then a 250ms opacity crossfade. (A fade is acceptable *only* here.)
- **Save-Data / slow connection** (`navigator.connection.effectiveType` in `['slow-2g','2g']` or `saveData`): skip the preloader entirely.
- **Accessibility:** overlay has `role="status"`, `aria-live="polite"`, `aria-label="Loading Alok Plastics"`; announces "Loaded" at the end; the page behind is `inert` while it runs; focus goes to the skip link (not lost) after exit.
- **Performance:** only `transform`, `opacity`, `clip-path` animated. No layout properties. Total preloader JS ≤ 12 KB gzipped beyond GSAP. GSAP + Flip are loaded once and reused by the site.
- **No CLS:** the navbar logo slot has fixed dimensions before the FLIP.

### 10.5 Deliverables
`src/components/preloader/Preloader.tsx`, `preloader.timeline.ts`, `preloader.css`, `src/lib/preload.ts`, a dev route `/_lab/preloader` with **Replay**, **Slow-mo ×0.25**, **Reduced-motion** and **Step through beats** controls, and a recorded video/GIF of the final sequence in `.screenshots/preloader/` (Playwright `recordVideo`).

---

## 11. HERO — video-ready, video-optional

The client wants a video hero. **The video will be added later.** Build the hero so it is complete and beautiful **without** the video today, and becomes a video hero by changing one config value.

### 11.1 Config
```ts
// src/content/site.ts
hero: {
  media: {
    mode: 'auto',                 // 'auto' | 'video' | 'poster' | 'ambient'
    video: { webm: null, mp4: null, mobileMp4: null }, // e.g. '/media/hero.webm' — TODO(client): supply footage
    poster: '/media/hero-poster.jpg',                  // TODO(client)/generated — see 11.4
    tone: 'light',                // 'light' | 'dark' — drives navbar logo version & scrim strength
  },
  eyebrow: '01 — EST. 1998 · CHANDIGARH',
  headline: ['The small parts that', 'keep big machines running.'],
  sub: 'Moulded plastic and steel spare parts for water coolers, display counters and deep freezers — float valves, F-bushes, connecting bushes, ventilation jalli and more, in nylon, HDPE, PPCP and brass.',
  ctas: { primary: 'Enquire Now', secondary: 'WhatsApp Us', tertiary: 'Browse products' },
}
```
`mode: 'auto'` → video if sources exist **and** the device qualifies (≥768px, fine pointer, no reduced motion, no Save-Data); else poster if it exists; else **ambient**.

### 11.2 `HeroMedia` component — three render modes
1. **Video mode**
```html
<video class="hero__video" autoplay muted loop playsinline preload="metadata"
       poster="/media/hero-poster.jpg" aria-hidden="true" tabindex="-1"
       width="1920" height="1080">
  <source src="/media/hero.webm" type="video/webm">
  <source src="/media/hero.mp4"  type="video/mp4">
</video>
```
- `muted` (autoplay with audio is blocked), `playsinline` (or iOS goes full-screen), `preload="metadata"` — **never `auto`**; the **poster is the LCP element**, never the video. `aria-hidden` (decorative).
- Inject the `<video>` **after** first paint / after the preloader starts (client-side) so it never competes with LCP; the SSR markup is the poster `<img>` (`fetchpriority="high"`, explicit size).
- Pause when off-screen (`IntersectionObserver`), pause on `visibilitychange`.
- No autoplay below 768px or on coarse pointers → poster (or `mobileMp4` only if the client later supplies a tiny ≤ 800KB version and you've measured it).
- A small **pause/play** control (WCAG 2.2.2 — moving content > 5s must be pausable), bottom-right, 44×44, glass-free (solid `--surface` at 80%).
2. **Poster mode** — the poster as a full-bleed `next/image` with a very slow Ken Burns (scale 1 → 1.04 over 20s, transform only; disabled under reduced motion).
3. **Ambient mode (default today, no assets yet)** — a **code-generated, on-brand, lightweight** background so the hero is never empty:
   - Base `--canvas` → `--surface-alt` vertical wash.
   - The 8px technical grid at 3%.
   - A very slow **light sweep**: a soft 45° white band (opacity ≤ 0.35) travelling lower-left → upper-right every 9s across a large, cropped, **outlined** ALOK A-peak + K-arm silhouette rendered in `--grey-warm` 1px strokes (drawing-sheet style) — light catching the mark.
   - Optional: 6–9 **part silhouettes** (from the pictogram set, stroke only, `--grey-warm`) floating with tiny parallax on pointer move (desktop only, ≤ 6px).
   - Must be ≤ 6 KB, CSS/SVG only, no canvas/WebGL, and pause when off-screen.
   - With ambient (light) media, the glass navbar still reads as glass because the grid + sweep pass behind it — verify in screenshots.

### 11.3 Scrim (video/poster modes)
Raw footage behind white type is unreadable. Multi-stop gradient, not a flat overlay:
- A soft dark band concentrated **lower-left** where the type sits, fading to nothing **top-right** so the bright region breathes: e.g. `radial-gradient(120% 90% at 0% 100%, rgba(30,17,21,.55) 0%, rgba(30,17,21,.25) 45%, transparent 75%)`. Keep total darkening ≤ ~45% at the text zone.
- Second layer: `--burgundy` at 8–12% with `mix-blend-mode: overlay` — ties burgundy into the footage without recolouring it.
- Do not blur the scrim. Verify headline contrast against the **brightest** frame (extract frames with ffmpeg every 0.5s and test the text-zone luminance; record the worst ratio in `docs/qa.md`).
- Grain: a 3–5% `feTurbulence` SVG grain over the hero (static, not animated) — kills banding, adds a filmic quality.
- In **ambient** mode the hero is light → text is `--ink`, no scrim, colour logo in nav. In **dark video** mode → text white, bright logo in nav. The type colour is driven by `hero.media.tone`.

### 11.4 The video brief (write it to `docs/hero-video-brief.md` for the client/shoot)
Bright, warm, high-key, slow. Morning light through a clean moulding hall; plastic granules pouring; a mould opening; a freshly moulded part lifted out catching a highlight; hands checking a float valve; parts in a neat crate. **Not** a moody dark factory with lens flares. The video is a supporting actor — low contrast, never fighting the headline. 8–12s source, 1080p, 24–30fps, no audio. The lower-left third should stay calm (that's where the type sits). If AI-generated footage is used, it must look like a real Indian moulding unit, with no fake signage or fake brand names.

Encoding pipeline (`scripts/encode-hero.sh`):
```bash
# seamless boomerang loop (forward + reverse) — mathematically seamless
ffmpeg -i raw.mp4 -vf "scale=1920:-2,fps=25" -an -t 6 trimmed.mp4
ffmpeg -i trimmed.mp4 -filter_complex "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[out]" \
  -map "[out]" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart -an public/media/hero.mp4
ffmpeg -i public/media/hero.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an public/media/hero.webm
ffmpeg -ss 1 -i public/media/hero.mp4 -frames:v 1 -q:v 3 public/media/hero-poster.jpg   # then convert to AVIF/WebP with sharp
```
Budgets: **mp4 ≤ 2.5 MB, webm ≤ 1.5 MB**, ≤ 12s, 1080p max, no audio track. (If scroll-scrubbing is ever wanted instead of looping, re-encode all-intra `-g 1` — pick one mode; never mix.)

### 11.5 Hero content & layout
- Full-bleed, **`100svh`** (never `100vh` — mobile Safari toolbar jump), min-height 640px, max-height 1000px.
- Type block **left-aligned, sitting low-left** (bottom 14vh, left = page padding). Centred reads as a template.
- **Eyebrow micro-label:** `01 — EST. 1998 · CHANDIGARH` with a 24px burgundy rule before it.
- **H1:** "The small parts that keep big machines running." — display size, Archivo Expanded. The phrase *big machines* gets the metal gradient (text `background-clip: text`, top-lit) — the only gradient text on the page.
- **Sub:** one sentence of what they make, in plain words (buyers read sizes and materials on phones, in workshops).
- **Tagline:** Devanagari line + English beneath, small (20–24px), with the fading hairlines.
- **CTAs (max two buttons):** primary **Enquire Now** (burgundy, white) · secondary **WhatsApp Us** (`--whatsapp`, white, WhatsApp glyph). Tertiary as a plain underlined text link: *Browse products ↗*. Three buttons is a wall.
- **Right side (desktop ≥1280):** a "**spec tag**" floating at lower-right — a small drawing-sheet title block with live micro-data: `SINCE 1998 · 20 CR+ PARTS DELIVERED · PAN BHARAT` (proof values only). Optional; cut if it crowds the video.
- **Scroll cue:** bottom-left under the CTAs, a 1px vertical rule with a travelling burgundy dot and micro-label `SCROLL`; **disappears after first scroll** (a permanent bouncing arrow is a tell). Respects reduced motion (static).
- **Exit:** the hero's bottom edge is a **diagonal clip-path** (A-peak angle, ~4–6vw drop from left to right) into the next section, with a 2px `--grey-warm` folded-sheet rule along the cut.
- **Entrance (after preloader):** headline lines rise from behind a mask line by line (SplitText lines, 90ms stagger, `expo.out`, 900ms); eyebrow rule draws; CTAs fade-up 12px; media scrim fades in. Without preloader (repeat visit) the same entrance runs on load, shortened to 600ms.

### 11.6 Below the hero: the values ribbon (from SRS: "values scrolling ribbon directly below the hero")
A 56px band on `--surface` with a slow marquee (pauses on hover/focus, `aria-hidden` duplicate track, a real list for screen readers): `We don't just mould plastic. We mould possibilities ◆ Less waste. More value ◆ Social employment ◆ Since 1998 ◆ Pan Bharat delivery ◆ Crafted in Bharat, made for the world ◆`. Separators are tiny 45° burgundy diamonds. Direction: right-to-left motion (text travels left = the eye reads forward). Static, wrapped list under reduced motion.

---

## 12. SCROLL & MOTION SYSTEM

### 12.1 The one correct wiring (Lenis + GSAP)
```ts
// src/lib/motion.ts  (client only)
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(ScrollTrigger, SplitText, Flip);   // GSAP 3.13+: all plugins free (incl. SplitText)

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
ScrollTrigger.config({ ignoreMobileResize: true });

export let lenis: Lenis | null = null;
if (!prefersReduced) {
  lenis = new Lenis({ duration: 1.2, smoothWheel: true });   // touch is NOT smoothed (keeps native address-bar collapse)
  lenis.on('scroll', ScrollTrigger.update);                    // ScrollTrigger follows Lenis
  gsap.ticker.add((t) => lenis!.raf(t * 1000));                // ONE shared loop (seconds → ms)
  gsap.ticker.lagSmoothing(0);                                  // no catch-up jitter
}
document.fonts.ready.then(() => ScrollTrigger.refresh());
```
Three things people get wrong:
1. **Never** add a standalone `requestAnimationFrame` loop for Lenis. Two loops = desync.
2. `gsap.ticker` gives **seconds**; `lenis.raf()` wants **milliseconds** → ×1000.
3. `lagSmoothing(0)` is mandatory.

Also: `data-lenis-prevent` on modals, drawers, the mega-panel and any native-scroll island. Under reduced motion **do not instantiate Lenis at all.** `ScrollTrigger.refresh()` after fonts and known-size media load. Kill/revert all GSAP contexts on route change (`gsap.context()` + `useGSAP` from `@gsap/react` with cleanup). Anchor links use `lenis.scrollTo` with header offset.

### 12.2 Motion vocabulary (vary deliberately — not everything fades up)
| Name | Use | Spec |
|---|---|---|
| **Mask rise** | headings | SplitText lines, `yPercent 110 → 0` inside an overflow mask, 900ms `expo.out`, 80ms stagger |
| **Draw** | rules, dividers, register marks, timeline paths | `stroke-dashoffset` or `scaleX` from origin left, 700ms `power3.inOut` |
| **Diagonal wipe** | images, cards | `clip-path: polygon()` revealing **lower-left → upper-right** (the K direction), 1000ms `expo.inOut` |
| **Lock** | interlocking cards (L+O) | two elements slide 24px along 45° and meet, `back.out(1.4)` (one mechanical click) |
| **Light sweep** | product hover, proof numerals, CTA hover | 45° soft white band crosses once, 700ms; never loops on hover |
| **Odometer** | numerals | per-digit vertical rolling columns (`tabular-nums`), 1400ms, `once: true` |
| **Nudge** | arrow icons on hover | `translate(2px,-2px)` 200ms (↗) |
Easing set: `expo.out`, `expo.inOut`, `power3.inOut`, `back.out(1.4)` — nothing else. Durations: 200 / 400 / 700 / 900 / 1200 ms only.

### 12.3 Rules
- Animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. Never `height:auto`, `top/left`, `filter`, `backdrop-filter`.
- `autoAlpha` instead of opacity+visibility; `force3D: true`; set and clear `will-change`.
- One staggered timeline per section instead of N tweens; `once: true` on non-repeating reveals.
- `gsap.matchMedia()` per breakpoint and for reduced motion.
- Micro-interactions (button press, menu toggle) use `motion` (Framer Motion's successor package `motion`) or CSS — **never** for scroll.
- Content is visible without JS (progressive enhancement): initial hidden states are set by JS, not CSS, except where the preloader class guards them.

---

## 13. HOME PAGE — section-by-section component specs

Every section must earn its height. If content doesn't fill it honestly, cut it. **Do not invent content to justify a section.** Each section starts with a numbered micro-label `0X — NAME`.

### S1 · Hero — see §11.

### S2 · Values ribbon — see §11.6.

### S3 · Proof strip — `ProofStrip.tsx`  (bg `--canvas`, 8px grid at 3%)
- Layout: 4 primary stats in a row (desktop), 2×2 (tablet), 2×2 (mobile): **20 Cr+** products delivered · **70%+** repeat customers · **1998** since · **100%** commitment to quality & trust. Beneath, a secondary row of 3 word-stats in micro-type with hairline dividers: `PAN BHARAT — delivery network` · `QUARTER-ON-QUARTER — production growth` · `AUTOMATIC MOULDING MACHINES — consistent quality & faster production`.
- Each stat: numeral in Archivo Expanded 600, `clamp(3rem,6vw,5rem)`, **metal gradient** (top-lit) · unit suffix (`Cr+`, `%+`) in a smaller weight aligned to the cap height · label in `--body` 15px · a measurement rule with end caps under the numeral (draws on reveal).
- Vertical 1px `--grey-warm` dividers between stats (Rheinmetall pattern) with `+` register marks where dividers meet the top/bottom rules.
- Corner crop marks on the strip as a whole (one set, not per stat).
- Motion: **odometer** roll on first view (`once: true`), 120ms stagger; light sweep across the numerals after the roll lands. Reduced motion: final values, no roll.
- Screen readers get the final value text (`aria-label="20 crore plus products delivered"`); the animated digits are `aria-hidden`.

### S4 · Products — `ProductGroups.tsx`  (bg `--surface-alt`)
- Header: `02 — PRODUCTS` · H2 "Parts for water coolers, display counters and deep freezers." · lead line · right-aligned link *All products ↗*.
- **Machine switch** (segmented control, squared, 2px radius): `All · Water Coolers · Display Counters · Deep Freezers` — filters which parts are highlighted inside the group cards (dims non-matching parts to 35%). Only enable a machine filter if the `machine` data for the parts is filled; otherwise hide the control and log `TODO(client): which parts fit which machine`.
- **Bento of 4 group cards** on a 12-col grid: **01 spans 6 cols × 2 rows (anchor, 2× width)**; 02, 03, 04 share the remaining space with **stepped/interlocking edges** (cards of different heights that key into each other — the L+O lock).
- Card anatomy: `--surface` · 1px `--grey-warm` border · 2px radius · 1px lit top edge · corner crop marks (01 and 02 only) · group number micro-label `01` + a 24px burgundy rule · group name H3 · one line on what the group does in a machine (drafted, flagged for approval) · part list (`--grey-metal`, hairline dividers, each part with its pictogram and a ↗ that appears on hover) · product cut-out image area (aspect 4:3, `--surface` set, contact shadow) — `TODO(client)` photos → until then show the **pictogram at 96px in `--grey-warm` strokes on a drawing-sheet grid** (honest placeholder, not a fake photo) · footer link `View parts ↗`.
- **Glare** on 01 and 02 only: a cursor-tracked soft light spot (radial, 12% white, `mix-blend-mode: soft-light`) clipped to the card — "light catching polished metal". Desktop fine-pointer only.
- **Expand in place:** clicking a card (or Enter) expands it inline to show the full part list with materials (from data) and two CTAs (*View group ↗*, *Get a quote*) — using GSAP Flip on the grid, no page jump, focus moves to the expanded region heading, Esc collapses. URL hash updates (`#products-01`).
- **Two-path block** beneath the bento (igus pattern): left `--surface` tile "**I need a catalogue part** — browse by group, material or machine → Products ↗"; right `--burgundy` tile (the section's one burgundy block) "**I need a part made to my requirement** — share a sample, drawing or photo → Enquire ↗". Interlocking stepped edge between them.

### S5 · USP — `RequirementToRepeat.tsx`  (bg `--canvas`)
- `03 — HOW WE WORK` · H2 "From Requirement to Repeat Supply." · lead "We don't just manufacture plastic components — we build reliable, repeatable supply partnerships."
- **The chain:** five nodes **Understand → Develop → Manufacture → Supply → Repeat** placed on a rising diagonal (**up-and-right**, each node 24–32px higher than the previous on desktop; vertical stack on mobile). Nodes are squared 2px tiles with step number micro-label and a one-line drafted description (flagged). Connectors are **chain-link segments** (two interlocking rounded-rect outlines — the L+O motif) that **draw** on scroll, scrubbed (`scrub: 0.6`) from node 1 to 5. The final connector loops from **Repeat back to Understand** as a thin arc — the repeat-supply idea made visual.
- Ending: the pull-quote set large (h2 size) in Archivo, with the words *orders that keep coming back* in the metal gradient, attributed only as "— Alok Plastics" (no invented person).
- Reduced motion: chain fully drawn, no scrub.

### S6 · Industries — `IndustriesBento.tsx`  (bg `--surface`)
- `04 — INDUSTRIES` · H2 "Built for the industries that build India."
- **Asymmetric bento**, not 7 equal boxes: one large tile for the **core market (Water coolers · Display counters · Deep freezers)** in `--burgundy` (this section's single burgundy block, white text, white pictograms); 7 industry tiles in mixed sizes (2 wide, 5 standard), `--surface` with `--grey-warm` borders.
- Each tile: custom line pictogram (drawn for that industry — no gear icons, see slop filter), industry name, and on hover/focus a **one-line application note** (the verbatim line from §5.9) revealed by a diagonal wipe. On touch: the line is always visible.
- `industries.logos: []` config → if the client later supplies customer logos, a grayscale logo marquee appears under the bento (hidden while empty — never fake logos).

### S7 · Journey — `JourneyOrbit.tsx`  (bg `--canvas` → `--surface-alt`, **the emotional peak**)
- `05 — OUR JOURNEY` · H2 "Built on Manufacturing. Grown on Trust."
- **Pinned scrollytelling** (desktop ≥1024): the section pins for ~250vh. A **radial/orbital timeline**: a large arc (≈ 220°) drawn in `--grey-warm` hairline with tick marks like a dial/gauge; the six markers (1998, 2000s, 2010s, 2020s, Today, The Future) sit on the arc. Scroll rotates the dial so the active marker reaches the **upper-right** position (growth direction ↗); the active marker turns burgundy, its year shows huge in Archivo Expanded with the metal gradient, and its title + line appear in a title-block panel beside it.
- A progress needle (burgundy, 2px) sweeps the arc; the arc segment behind it fills `--burgundy` (only the line, not an area).
- **"The Future"** marker is drawn dashed (not yet reached), the dial continues past it as a faint dotted arc out of frame — the story isn't finished.
- The **2020s** step triggers the odometer for **20 Cr+**.
- Mobile/tablet & reduced motion: a vertical timeline with a left rail, markers as squared nodes, no pin.
- Component source: search the 21st.dev catalogue for *Radial Orbital Timeline* (§15.3) as a starting point; rebuild it to these specs and tokens.

### S8 · Pan-India — `PanIndiaMap.tsx`  (bg `--surface-alt`)
- `06 — PAN BHARAT` · H2 "From Chandigarh to every corner of India." · the line from §5.10.
- An accurate **India outline** as an SVG (use an open-licensed, simplified official-boundary source such as Natural Earth / datameet — boundary must be the **official Government of India depiction**; check the source licence and note it in `docs/credits.md`). Stroke `--grey-metal` 1px, fill `--surface`, the 8px dot grid inside the outline only.
- **One burgundy pulse at Chandigarh** (a 6px dot + a slow expanding ring, 3s, max 2 rings). Unlabelled dispatch arcs (`--grey-metal`, 1px, dashed) draw outward from Chandigarh to ~8 broad regional points on scroll, then a soft light dot travels along each once. No city labels (§5.10). No globe, no flag colours.
- Side panel: three short lines: *Single component or a production line's worth* · *Pan Bharat delivery network* · *Dispatch from Chandigarh* — all verbatim-derived.

### S9 · Culture teaser — `CultureTeaser.tsx`  (bg `--canvas`, optional on home; full on /career)
- `07 — PEOPLE` · H2 "Joyful. Supportive. Trustworthy." · four team tiles (Product Development, Sales, Social Media & Marketing, Tech Developers) with their one line each · link *Careers ↗*. No stock photos of people; if no real team photos (`TODO(client)`), use typographic tiles. Cut this section from the home page if it makes the page too long — record the decision.

### S10 · Trust — `TrustQuote.tsx`  (bg `--surface`)
- The verified USP pull-quote set very large, OR the core value "We don't just mould plastic. We mould possibilities." — pick one (don't repeat S5's quote twice on the same page; record which).
- **No fabricated testimonials.** Leave `// TODO(client): real testimonials → TestimonialsColumns` with the component built but hidden while `testimonials: []`.

### S11 · Enquiry — `EnquirySection.tsx`  (full-bleed `--burgundy`, the one big burgundy moment of the page)
- `08 — ENQUIRE` in `--rose-pale` · H2 white "Tell us the part. We'll take it from there." (drafted, flag) · short form (§14) on a white `--surface` panel inset with a diagonal top-left corner cut · beside it: WhatsApp block (green button with prefilled message), call link, address, response note `TODO(client): typical reply time`.
- Diagonal top edge entering the section (A-peak), white logo watermark at 4% in a corner (all-white version only).

### S12 · Footer — `Footer.tsx`  (`--burgundy` main, `--burgundy-night` bottom bar)
- Top: white logo (full lockup) + tagline on burgundy: Devanagari first half in white, second half in `--rose-pale` (the burgundy/grey split of §2.7 is not readable on burgundy, so it becomes white/pale-rose) + English line in `--rose-pale`.
- Columns: Products (4 groups) · Company (About, Industries, Career, Contact) · Contact (address, phone, email, WhatsApp — TODO values) · Legal (Privacy, Terms, Refund).
- Bottom bar (`--burgundy-night`, separated by a 1px `--burgundy-deep` hairline): © {year} Alok Plastics · "Crafted in Bharat, made for the world." · credit "Website by Manhar Creatives" linking to manharcreatives.com.
- Social icons only for URLs that exist in config (hide empty ones).
- Small text in `--rose-pale` (7.2:1). Links white, underline on hover.

### S13 · Floating WhatsApp FAB
56px circle `--whatsapp`, white glyph, bottom-right 20px, `aria-label="Chat with Alok Plastics on WhatsApp"`, opens `https://wa.me/<number>?text=<encoded prefill>`. Hides when the enquiry section/form is in view and while the mobile drawer is open. Entrance after 1.2s, no bouncing, no pulsing.

---

## 14. ENQUIRY & WHATSAPP SYSTEM

### 14.1 Hosting reality (read before building forms)
The client's **Hostinger Premium** plan serves static files + PHP; it does **not** run Node.js (SRS v1.0 §12.2). Therefore:
- Build the site as a **static export** (`next.config.ts → output: 'export'`, `images.unoptimized: true` with pre-optimised AVIF/WebP via a sharp script, `trailingSlash: true`). No server actions, no API routes, no ISR, no middleware.
- Form submission goes to a tiny **PHP endpoint** `public/api/enquiry.php` (validates, rate-limits by IP+time, honeypot, sends email via PHP `mail()`/SMTP config in a non-public `config.php`, returns JSON). Include it in the repo; document deployment in `docs/deploy-hostinger.md`.
- **WhatsApp is the primary channel and must work even if email fails:** after successful validation, offer "Also send on WhatsApp" with the same data prefilled.
- Keep the architecture ready for SRS future scope (Node hosting upgrade → admin panel, cart, OTP). Don't build those now.
- If a Hostinger Business/Cloud plan with Node is confirmed later, switching off static export must be a config change, not a rewrite — note it in `docs/decisions.md`.

### 14.2 Fields
Short form (home/footer band): Name* · Phone* (Indian mobile, 10 digits, optional +91) · Product / requirement* (combobox from product data + "Custom part") · Quantity (number + unit select: pcs/sets) · Message · honeypot · consent line.
Full bulk form (`/enquiry`): Product(s) (multi-select with quantity per line) · Company name · Name* · Phone* · Email · City / State · GSTIN (optional; validate format `^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`) · Buyer type (OEM / Dealer / Distributor / Repair workshop / Other) · Attachment note ("Send drawing/photo on WhatsApp") · Message.
- Validation: Zod schema shared by client and mirrored in PHP. Inline errors on blur and on submit, `--error` text + icon, never colour alone. `aria-invalid`, `aria-describedby`, error summary at top on submit with links to fields.
- States: idle · submitting (button shows progress, disabled) · success (`--success`, summary of what was sent, WhatsApp follow-up button) · error (`--error`, retry + WhatsApp fallback). Status region `aria-live="polite"`.
- Product pages prefill the product field; the WhatsApp link from a product page prefills: `Hello Alok Plastics, I'd like a quote for: <Product> (<variant>) — Qty: <n>. Name: … City: …`.
- Field styling: `--surface`, 1px `--grey-warm`, 2px radius, 48px height, label above (never placeholder-as-label), focus = 2px `--burgundy` ring with 2px offset.
- Track (privacy-safe, consent-aware): `enquiry_submit`, `whatsapp_click` (with `source` = hero/fab/product/footer), `phone_click`, `quote_cta_click` → `dataLayer` pushes; GA4/GTM IDs are `TODO(client)`, script loads only when the ID exists.

---

## 15. COMPONENT LIBRARY (build in `src/components/ui/`, document in `/_lab/components`)

### 15.1 Primitives — every one with all states: default · hover · focus-visible · active · disabled · loading (where relevant)
| Component | Spec |
|---|---|
| `Button` primary | `--burgundy` bg, white text, 48px (44 min on mobile), padding 0 24px, 2px radius, Inter 600 15px, ↗ icon. Hover → `--burgundy-deep` + light sweep once + icon nudge. Active → translateY(1px). Focus → 2px `--burgundy` ring, 2px offset (on burgundy bg the ring is white). |
| `Button` secondary | `--surface`, 1px `--burgundy` border, `--burgundy` text; hover `--blush`. |
| `Button` on-burgundy | white bg, `--burgundy` text; hover `--pink-soft`. |
| `Button` whatsapp | `--whatsapp` bg, white text + glyph; hover darkens via `color-mix(in srgb, var(--whatsapp) 88%, var(--ink))`. |
| `TextLink` | `--burgundy`, underline 1px offset 3px, hover `--burgundy-bright` + ↗ nudge. |
| `MicroLabel` | §7.2 micro + optional number + 24px rule. |
| `SectionHeader` | MicroLabel + H2 + optional lead + optional right-aligned link; consistent 16px label→heading, 24px heading→lead. |
| `Tag` | `--blush` bg, `--burgundy` text, micro type, 2px radius. Material tags: NYLON / HDPE / PPCP / BRASS. |
| `Card` | `--surface`, 1px `--grey-warm`, 2px radius, lit top edge; variants: `plain`, `drawing` (crop marks), `feature` (burgundy). |
| `SpecTable` | drawing-sheet title-block style: burgundy header row with white micro text, rows striped `--canvas`, tabular numbers, `<th scope>`. |
| `Callout` | `--blush` bg, 4px `--burgundy` left rule, micro heading — exactly like the brand PDFs. |
| `Divider` | 1px `--grey-cloud`; `diagonal` variant (2px, 45° folded edge). |
| `RegisterMark`, `CropMarks`, `MeasureRule`, `GridBackdrop` | technical furniture (§3.1), all `aria-hidden`. |
| `Pictogram` | the custom part/industry icon set (§4.1, §7.6). |
| `Odometer` | rolling digits, tabular, reduced-motion safe, SR label. |
| `Marquee` | CSS-transform marquee, pause on hover/focus/reduced motion, duplicate track `aria-hidden`. |
| `Accordion` | FAQ/products mobile; `button[aria-expanded]` + region; GSAP height via Flip or `grid-template-rows: 0fr→1fr` (not height:auto tween). |
| `Combobox` | accessible (ARIA 1.2 pattern) product picker for forms. |
| `Breadcrumbs` | micro type, `/` separators in `--silver` (decoration), current page `aria-current`. |
| `Tagline` | the Devanagari + English pair with size variants `lg | md | sm` and colour rules (§2.7). |
| `Logo` | §10.2. |

### 15.2 Product detail template (`/products/[group]/[part]`)
Gallery (main image 1:1 on `--surface` + thumbs; zoom on click with a solid lightbox, `data-lenis-prevent`) · H1 part name · material tags · **SpecTable** (Part · Group · Material · Variants/Sizes · Fits: water cooler/display counter/deep freezer · SKU (only if provided)) · "What it does" line (flagged copy) · quantity stepper + **Get a Quote** + **WhatsApp** (prefilled) · sticky mobile bottom bar with both CTAs · related parts (same group) · breadcrumb · `Product` JSON-LD **without** price/offers while `showPrices=false`, **without** aggregateRating/reviews ever.

### 15.3 External component catalogues — pull, don't reinvent (then rebuild to our tokens)
If the 21st.dev Magic MCP is available, use it to *search* for starting points; otherwise skip — every component above is specified well enough to build from scratch.
```bash
# optional, if the user has an API key
export API_KEY_21ST="sk_..."          # https://21st.dev — never commit the key
claude mcp add magic --scope user --env API_KEY=$API_KEY_21ST -- npx -y @21st-dev/magic@latest
# then verify inside Claude Code with /mcp
```
| Search term | Used for |
|---|---|
| Radial Orbital Timeline | S7 Journey (top priority) |
| Bento Grid | S4 Products, S6 Industries |
| Glare Card | S4 cards 01–02 |
| Layout Grid / expandable cards | S4 expand-in-place |
| World Map / dotted map | S8 (replace world with India; arcs pattern only) |
| Marquee | S2 values ribbon |
| Number ticker / odometer | S3 |
| Testimonials Columns | S10 (hidden until real testimonials) |
**Recolour every pulled component to §2 tokens** — these libraries ship cyan/purple/dark defaults, which are banned. **Reject on sight:** Aurora, Sparkles, Meteors, Liquid Glass, Glassmorphism cards, Spotlight beams on dark, neon gradients, anything that fills a viewport with dark. Remove any dependency a pulled component drags in that we don't need (check bundle impact).

---

## 16. PERFORMANCE BUDGETS

This is a B2B site for people on ₹12,000 Android phones over 4G, standing in a shop or workshop. **That is the device you optimise for** (Lighthouse mobile, Moto G Power throttling).

| Metric | Budget |
|---|---|
| LCP (mobile) | **< 2.0 s** — LCP element is the hero **poster/H1**, never the video, never the preloader |
| CLS | **≈ 0** (< 0.02) — explicit `width/height` or `aspect-ratio` on every image, the video and the logo slot; font fallbacks with size-adjust |
| INP | < 200 ms |
| Total page weight (excl. video) | **< 1.5 MB** home; < 900 KB inner pages |
| JS (gzipped, first load) | < 170 KB home incl. GSAP/Lenis; < 120 KB inner pages |
| Fonts | ≤ 4 files preloaded (Archivo var, Inter var, Noto Sans Devanagari subset, mono subset if used) |
| Images | AVIF + WebP, responsive `srcset`, lazy below the fold, `decoding="async"` |
| Hero video | mp4 ≤ 2.5 MB, webm ≤ 1.5 MB, injected after first paint |
| FPS | 60 fps on mid-range mobile during scroll; no long tasks > 50 ms during the preloader |

- `backdrop-filter` is the most expensive thing on the page — budget it explicitly (navbar only, never animated).
- GSAP plugins imported per-route (dynamic import for Flip/SplitText where only one section uses them).
- Third-party scripts (analytics, map) load after consent/interaction. The Google Map is click-to-load.
- Run `@next/bundle-analyzer` once per phase from Phase 4 on; record numbers in `docs/qa.md`.

---

## 17. ACCESSIBILITY (WCAG 2.2 AA floor)

A B2B buyer may be on a keyboard, a screen reader, a small phone in bright sunlight, or older eyes.
- Skip link first. Semantic landmarks (`header`, `nav`, `main`, `footer`), **one `h1` per page**, logical heading order.
- `lang="en"` on `<html>`; `lang="sa"` on the Sanskrit tagline; `lang="hi"`/`sa` on आलोक as appropriate.
- Full keyboard operability: mega-menu, drawer (focus trap + `inert` background), product expand, timeline (arrow keys step markers when focused), forms, lightbox.
- Visible `:focus-visible` rings (2px `--burgundy`, 2px offset; white on burgundy). Never `outline: none` without replacement.
- Touch targets ≥ 44×44 px. No horizontal scroll at 320px.
- Contrast measured against **actual rendered** backgrounds, including over the brightest video frame. Metal Grey only for captions/micro-labels; Silver never for text.
- **Reduced motion (`prefers-reduced-motion: reduce`): no Lenis, no parallax, no odometers, no marquee motion, no video autoplay, no pinned sections, no preloader construction.** The site must be complete and usable fully static. Test it.
- Moving content > 5s has pause controls (video, marquee pauses on hover/focus and has a pause toggle).
- Images: meaningful `alt` (product name + material + view), decorative `alt=""`. Pictograms paired with text.
- Forms: labels, `autocomplete` attributes (`name`, `tel`, `email`, `organization`, `address-level2`), error summary, `aria-live` status.
- Run axe-core (Playwright `@axe-core/playwright`) on every route; zero serious/critical violations.

---

## 18. SEO + GEO (generative engine optimisation)

- Next.js Metadata API per route: unique `<title>` (≤ 60 chars, pattern `<Part> | <Group> — Alok Plastics, Chandigarh`), meta description (≤ 155 chars, factual), canonical, OG + Twitter cards (generated OG images with logo + tagline on `--canvas`), `robots`, `sitemap.xml`, `robots.txt` (static-export compatible generation).
- **JSON-LD:**
  - `Organization` + `Manufacturer`-style details: name, url, logo, `foundingDate: "1998"`, address (PostalAddress: Plot No-06, Industrial Area Phase II, Ram Darbar, Chandigarh, 160003, IN), `founder`/`employee` roles only as stated (Owner: Gopal Kumar; CEO: Aalok Kumar — use `employee` with `jobTitle`, don't misuse `founder` unless the client confirms), `sameAs` only for real profiles (TODO), `slogan: "Crafted in Bharat, made for the world."`.
  - `LocalBusiness` for the Chandigarh unit (phone/geo/opening hours = `TODO(client)`; omit fields until provided).
  - `WebSite` (+ `SearchAction` pointing to the part finder `/products/?q=`).
  - `BreadcrumbList` on inner pages; `Product` on part pages (name, image, material, category, brand = Alok Plastics) — **no offers/prices while hidden, never aggregateRating or review.**
  - `FAQPage` only if real FAQ content is approved (otherwise none).
- **GEO:** clear entity statements in plain sentences on About and Home ("Alok Plastics is a Chandigarh-based manufacturer, established in 1998, of moulded plastic and steel spare parts for water coolers, display counters and deep freezers."), consistent NAP everywhere, product pages answer "what is it / what material / which machine / what sizes" in short factual lines, semantic HTML tables for specs, `llms.txt` at the root summarising the company and linking key pages (factual only).
- 301 redirect map from the existing WordPress URLs (`docs/redirects.md` + `.htaccess` rules for Hostinger) — `TODO(client)`: export of current URLs / sitemap of alokplastics.com. Crawl the live site if accessible to build the map.
- Image filenames descriptive (`float-valve-nylon-water-cooler.avif`).
- No keyword stuffing, no hidden text, no fake reviews, no doorway location pages.

---

## 19. HONESTY RULE (absolute)

This is a real manufacturer, a real address, real people.
- Every number, name, date and claim comes from §5–§6. Nothing else.
- **Not allowed without written client confirmation:** certifications (ISO, BIS, etc.), tolerances, capacities, machine counts, client names or logos, testimonials, review counts, ratings, years other than those given, delivery times, cities served, "No. 1 / leading / best" claims, export claims (the vision mentions global ambition — say "made for the world" as the tagline, never "we export to X countries").
- Drafted functional copy (step descriptions, group one-liners, section intros) is allowed **only** when it restates catalogue/requirements facts in plain words, and it must be flagged `// COPY: drafted, needs client approval` and listed in `docs/client-questions.md`.
- Missing data → `TODO(client)` in code + entry in `docs/client-questions.md` + the UI renders nothing (or an honest empty state), never a fake value.
- A shorter honest site beats a longer invented one, every time.

---

## 20. THE AGENT TEAM — divide all work across sub-agents

You (the main session) are the **Orchestrator / Art Director**. You plan, assign, integrate, and judge. You do not hand-write every file yourself — you delegate to sub-agents with clear, file-scoped briefs, then review their output against this prompt.

### 20.1 Create the agents (Phase 0)
Create these files under `.claude/agents/`. Each is a Markdown file with YAML frontmatter (`name`, `description`, `tools`, optional `model`) followed by its system prompt. Every agent's prompt must start with: *"Read docs/MASTER_PROMPT.md sections <list> before doing anything. Honesty rule §19 and brand lock §2 are absolute. Only edit the files you own. Report back with: files changed, decisions made, open questions, and self-check results."*

| Agent (`name`) | Owns (write access) | Reads | Job |
|---|---|---|---|
| `design-researcher` | `.research/**`, `docs/design-research.md`, `src/app/_lab/directions/**` | §3, §4 | Reference capture with Playwright, pattern analysis, 3 directions, recommendation |
| `brand-systems` | `src/styles/**`, `src/components/brand/**`, `public/brand/**`, `scripts/logo-*`, `src/app/_lab/swatches/**`, `src/app/_lab/type/**` | §2, §3, §7, §10.2 | Tokens, Tailwind theme, fonts, logo vectorisation + `Logo` component, favicons/OG, pictogram set |
| `content-architect` | `src/content/**`, `docs/client-questions.md`, `docs/catalogue-reconciliation.md` | §1, §5, §6, §19 | Typed content model & all copy, catalogue extraction, TODO register |
| `motion-engineer` | `src/lib/motion.ts`, `src/lib/preload.ts`, `src/components/preloader/**`, `src/hooks/use*Motion*.ts`, `src/app/_lab/preloader/**` | §10, §12 | Lenis+GSAP wiring, reduced-motion gate, preloader, motion utilities |
| `hero-nav-engineer` | `src/components/layout/Header*`, `Nav*`, `Drawer*`, `UtilityBar*`, `src/components/hero/**`, `scripts/encode-hero.sh`, `docs/hero-video-brief.md` | §9, §11 | Glass navbar, drawer, mega-panel, HeroMedia (video/poster/ambient), values ribbon |
| `ui-builder` | `src/components/ui/**`, `src/app/_lab/components/**` | §3, §7, §15 | Primitive component library with all states |
| `sections-builder` | `src/components/sections/**`, `src/app/(site)/page.tsx` | §13 | Home sections S3–S12 |
| `pages-builder` | `src/app/(site)/**` except home page, `src/components/product/**` | §8, §15.2 | Inner pages + product templates |
| `forms-integrations` | `src/components/forms/**`, `src/lib/validation/**`, `public/api/**`, `src/lib/whatsapp.ts`, `src/lib/analytics.ts`, `docs/deploy-hostinger.md` | §14 | Enquiry forms, PHP endpoint, WhatsApp deep links, analytics events |
| `seo-geo` | `src/lib/seo/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `public/llms.txt`, `docs/redirects.md`, `public/.htaccess` | §18 | Metadata, JSON-LD, sitemap, redirects, GEO |
| `qa-auditor` (read-only + `tests/**`, `docs/qa.md`, `.screenshots/**`) | `tests/**`, `docs/qa.md` | §16, §17, §25 | Playwright screenshots, axe, Lighthouse CI, grep gates, bundle sizes, reduced-motion pass |
| `design-critic` (read-only) | `docs/critique/**` | §2, §3, §3.2, §4 | Brutal art-direction review of screenshots against the logo-derived system and the slop filter; scores each section 1–10 with specific fixes |

Tools: researchers/critics get `Read, Grep, Glob, Bash, WebFetch` (+ browser tools if present); builders get `Read, Write, Edit, Grep, Glob, Bash`. Use the strongest available model for `design-critic`, `motion-engineer` and the orchestrator.

### 20.2 How to run them
- **Parallelise only across disjoint file ownership.** Two agents never edit the same file in the same wave. If a change crosses ownership, the orchestrator does it or sequences it.
- Shared contracts first: `brand-systems` (tokens) and `content-architect` (types) must finish before builders start; builders import, never redefine.
- Each wave = up to 4 agents in parallel. After each wave the orchestrator: runs `npm run typecheck && npm run lint && npm run build`, reviews diffs, then sends screenshots to `design-critic`.
- Agents report in a fixed format; the orchestrator logs each report in `docs/agent-log.md` (agent · phase · files · decisions · open questions).
- If an agent's output violates §2/§3/§19, send it back with the exact rule number. Don't silently patch it.
- Keep a living `docs/decisions.md` (ADR-lite: decision · options considered · why · date).

---

## 21. PHASES (execute in order)

Each phase lists: **goal · agents · tasks · exit criteria**. Every phase ends with the Quality Loop (§22) using that phase's check-list.

### Phase 0 — Setup, research & team (orchestrator, design-researcher, content-architect)
1. Save this prompt to `docs/MASTER_PROMPT.md`. Create `docs/` files: `decisions.md`, `client-questions.md`, `agent-log.md`, `qa.md`.
2. Scaffold: `npx create-next-app@latest alok-plastics --ts --app --tailwind --eslint --src-dir --import-alias "@/*"` (Next.js 15+, React 19, Tailwind v4). Use `pnpm` if available. Initialise git, add `.gitignore` entries for `.research/`, `.screenshots/`.
3. Install: `gsap @gsap/react lenis motion zod fuse.js clsx` · dev: `@playwright/test @axe-core/playwright @lhci/cli pixelmatch pngjs sharp @next/bundle-analyzer prettier prettier-plugin-tailwindcss`. Vectorising tools if needed: `vtracer` (cargo/pip) or `potrace`.
4. Create the 12 agents (§20.1).
5. Optional skills/MCP (only if available — verify the source before installing; never run unknown install scripts blindly): Anthropic's official `frontend-design` skill (`/plugin marketplace add anthropics/skills`, then install it), Playwright MCP for browser screenshots, 21st.dev Magic MCP (§15.3). Read any installed `SKILL.md` before building.
6. `design-researcher`: §4.2. `content-architect`: content model + all §5–§6 content + TODO register (in parallel).
7. Put the client's logo PNG at `/brand/alok-logo-primary.png` (it should already be in the repo; if not, ask the user for it and stop that track).
**Exit:** repo builds; agents exist; `docs/design-research.md` + direction chosen; content files typed and complete; client-questions list started.

### Phase 1 — Brand foundation (brand-systems, ui-builder starts after tokens)
Tokens (§2.1), Tailwind v4 `@theme` mapping, fonts (§7.1), type scale, spacing tokens, grid utilities, technical furniture components, `/_lab/swatches` (every colour, hex, contrast ratio computed live) and `/_lab/type` (specimen incl. Devanagari tagline). **Logo vectorisation + `Logo` component** (§10.2) with the fidelity test. Pictogram set (all 10 anchor parts + 7 industries + 3 machines). Lint scripts: `scripts/check-hex.mjs` (fails on any hex outside `tokens.css`), `scripts/check-spacing.mjs` (fails on arbitrary Tailwind spacing values outside tokens), `scripts/check-glass.mjs` (fails if `backdrop-filter` appears in > 2 files), `scripts/check-forbidden.mjs` (`#000`, `100vh`, `lorem`, `ipsum`, `rounded-full` outside allowed files, banned component names).
**Exit:** swatches match the colour guide exactly; logo diff ≥ 97%; scripts wired into `npm run lint`.

### Phase 2 — Motion core & preloader (motion-engineer)
`src/lib/motion.ts` (§12.1), reduced-motion gate, `useGSAP` patterns, route-change cleanup. Then the **preloader** (§10) with the `/_lab/preloader` controls and a recorded video.
**Exit:** smooth scroll verified on a long test page; preloader passes all §10.4 rules; reduced-motion and Save-Data paths verified; no long tasks > 50 ms.

### Phase 3 — Glass navbar + hero (hero-nav-engineer)
Utility bar, glass navbar with docking states, mega-panel, mobile drawer, `HeroMedia` with **ambient mode** (default) + poster + video modes (test video mode with a placeholder clip generated by ffmpeg `testsrc2`/colour bars **only locally — never ship it**), scrim, grain, hero content and entrance, values ribbon, `docs/hero-video-brief.md`, `scripts/encode-hero.sh`. Build and verify **alone first** — this area has the most failure modes. Screenshot over light frames, dark frames, ambient mode, at 375/768/1440.
**Exit:** glass verified on Chrome + Safari (WebKit via Playwright) + Firefox fallback; `grep` shows ≤ 2 files with backdrop-filter; hero LCP is the poster/H1; headline contrast checked against the brightest frame.

### Phase 4 — UI library (ui-builder)
All primitives in §15.1 with every state, shown on `/_lab/components`.
**Exit:** every component keyboard-operable, axe-clean, on tokens only.

### Phase 5 — Home sections (sections-builder; can split into 2 agents: S3–S6 and S7–S13)
Build S3–S13 per §13. Wire the content files. Implement motions from §12.2 — vary them per section (record which motion each section uses in a table in `docs/decisions.md` to prove variety).
**Exit:** full home page at 375/768/1024/1440/1920; design-critic score ≥ 8/10 on every section; no section uses invented content.

### Phase 6 — Enquiry & WhatsApp (forms-integrations)
§14 in full, including the PHP endpoint, shared validation, states, prefilled WhatsApp messages, analytics events, `docs/deploy-hostinger.md`.
**Exit:** form tested: valid submit, each invalid field, network failure, honeypot, double-submit; PHP endpoint tested locally with `php -S`; WhatsApp links open correctly on mobile.

### Phase 7 — Inner pages (pages-builder)
About, Products (+ finder, filters), group pages, product detail template (generate all published parts statically via `generateStaticParams`), Industries, Career, Contact, Enquiry, legal shells, 404.
**Exit:** every page ends in a real next step; no `#` links; no dead links (`linkinator` or Playwright crawl); breadcrumbs everywhere.

### Phase 8 — SEO / GEO (seo-geo)
§18 in full + `llms.txt` + redirect map + `.htaccess` (HTTPS, trailing slash, 301s, caching headers for `/_next/static` 1 year immutable, `/media` 30 days, gzip/brotli if available).
**Exit:** Rich Results Test-valid JSON-LD (validate locally with `schema-dts` types + structured-data linter), sitemap lists all routes, no `_lab` routes in the export.

### Phase 9 — Hardening & verification (qa-auditor + design-critic + orchestrator)
Full §25 gate run. Lighthouse CI (mobile + desktop) on Home, Products, a Product page, About, Contact. Playwright visual snapshots at 375/768/1440. axe on every route. Reduced-motion full pass. Bundle report. Cross-browser (Chromium, WebKit, Firefox). Real-device check note for the user (Android mid-range + iPhone).
**Exit:** all gates green; `docs/qa.md` contains the **actual numbers**.

### Phase 10 — Handover
`npm run build` → static `out/` folder. Write `README.md` (run, build, deploy to Hostinger via File Manager/FTP or Git, where to change content, how to add the hero video, how to add products), `docs/client-questions.md` (final, grouped and prioritised), `docs/decisions.md`, and a short `docs/CHANGELOG.md`. Do **not** deploy anywhere without the user's explicit go-ahead.

---

## 22. THE QUALITY LOOP — run at the end of EVERY phase (and for every major component)

After completing a phase's tasks, **FOLLOW THIS LOOP EXACTLY:**

1. **CREATE / GENERATE** → Complete the phase's tasks (via the assigned agents).
2. **QUALITY CHECK** → Run the phase's check-list below (automated checks first, then screenshots, then the design-critic review).
3. **SELF-CRITIQUE** → List every issue found, tagged **CRITICAL / MAJOR / MINOR**, each with the rule number it breaks (e.g. "§2.3 two burgundy blocks in one viewport at 1440 — CRITICAL").
4. **AUTO-FIX** → Fix each issue (assign back to the owning agent with the exact rule and evidence).
5. **RE-REVIEW** → Re-run the *full* check-list (not just the fixed items) to verify fixes didn't break anything else. Compare screenshots before/after.
6. **FINAL OUTPUT** → A production-ready deliverable for that phase + a checklist with ✅/❌ for every item, written to `docs/loop-log/phase-<n>.md`.

**Stop after 3–5 iterations OR when there are zero CRITICAL issues (and no MAJOR issues on brand lock, honesty or accessibility).** If CRITICAL issues remain after 5 iterations, stop, document them, and ask the user before continuing.

Severity definitions:
- **CRITICAL** — violates §2 brand lock, §19 honesty, breaks build/lint/types, an accessibility blocker (keyboard trap, missing labels, contrast fail on text), layout broken at any breakpoint, console errors, LCP > 3s.
- **MAJOR** — reads generic (fails §3.2 slop filter), wrong spacing tokens, motion not reduced-motion-safe, performance budget miss, design-critic score < 7.
- **MINOR** — polish (easing feel, optical alignment, copy rhythm).

### 22.1 Phase-specific QUALITY CHECK lists
| Phase | Check |
|---|---|
| 0 Research | ≥ 8 references captured at 2 sizes; each has pattern/why/adapt/don't-copy; 3 directions rendered; recommendation justified against §3 |
| 1 Brand | All 24 colour tokens + 2 gradients match HEX exactly; contrast table reproduced live; `check-hex`, `check-spacing`, `check-glass`, `check-forbidden` pass; logo pixel-diff ≥ 97% and resting state identical; tagline Unicode string byte-identical to §2.7; Devanagari renders (no tofu, matras not clipped) |
| 2 Motion | One rAF loop only (grep `requestAnimationFrame`); ×1000 + `lagSmoothing(0)`; Lenis absent under reduced motion; preloader ≤ 3.4s (cap 4.0s), skippable, once/session, Save-Data skip, FLIP handoff without a double logo, no CLS, no long tasks; recorded video looks international-grade (critic ≥ 9/10) |
| 3 Nav+Hero | Glass spec (saturate, -webkit-, border, inset highlight, sibling of media); ≤ 2 backdrop-filter files; docking transition designed; drawer focus trap + inert; `100svh`; poster is LCP; video attrs exact; off-screen pause; no autoplay < 768px/coarse; ambient mode lightweight (≤ 6 KB) and paused off-screen; headline contrast on brightest frame recorded |
| 4 UI | Every state exists; focus rings visible; 44px targets; tokens only; axe clean on `/_lab/components` |
| 5 Home | Section order & specs per §13; one burgundy block per viewport; no adjacent burgundy sections; coupling rule (no 28–36px gaps — measure with Playwright `boundingBox` on a sample); motion variety table; up-and-right direction everywhere; diagonal cuts present; critic ≥ 8 per section; zero invented content |
| 6 Forms | All validation paths; states; `aria-live`; PHP endpoint validates server-side; WhatsApp prefill encoding correct (test Devanagari/emoji-free, special chars); events fire |
| 7 Pages | All routes render; each ends with a CTA; breadcrumbs + JSON-LD; product pages generated for all published parts; empty states honest; 404 helpful |
| 8 SEO | Unique titles/descriptions; canonical; OG images; valid JSON-LD (no rating/price); sitemap/robots correct; `_lab` excluded; redirects drafted |
| 9 Hardening | All §25 gates green with real numbers |

### 22.2 Screenshot protocol
Playwright script `tests/screens.spec.ts`: for each route × viewport (375, 768, 1024, 1440, 1920) save full-page screenshots to `.screenshots/<phase>/<route>/<vw>.png`, plus reduced-motion variants (`page.emulateMedia({ reducedMotion: 'reduce' })`). Wait for fonts and disable the preloader via `?nopreload=1` (dev-only flag) for section screenshots. **Look at the screenshots yourself** (Read the PNGs) before declaring anything done. Never commit `.screenshots/`.

---

## 23. STACK & PROJECT STRUCTURE

**Stack:** Next.js 15+ (App Router, `output: 'export'`) · React 19 · TypeScript (strict) · Tailwind CSS v4 (`@theme` tokens) · GSAP 3.13+ (ScrollTrigger, SplitText, Flip — all free now) + `@gsap/react` · `lenis` (not the deprecated `@studio-freight/lenis`) · `motion` for micro-interactions only · `zod` · `fuse.js` · `next/font` self-hosted · Playwright + axe + Lighthouse CI · sharp. **No UI kit** (no shadcn default theme, no MUI) — if you take a shadcn/Radix primitive for accessibility (Dialog, Popover), restyle it fully to §2/§3.

```
alok-plastics/
├─ .claude/agents/*.md              # the 12 agents (§20)
├─ brand/                           # source logo PNG / vector masters (client-supplied)
├─ content/source/                  # catalogue PDF, client docs (if provided)
├─ docs/  MASTER_PROMPT.md · decisions.md · client-questions.md · agent-log.md · qa.md ·
│         design-research.md · hero-video-brief.md · deploy-hostinger.md · redirects.md ·
│         catalogue-reconciliation.md · credits.md · loop-log/ · critique/
├─ public/  brand/ · media/ · images/products/ · api/enquiry.php · .htaccess · llms.txt
├─ scripts/ check-hex.mjs · check-spacing.mjs · check-glass.mjs · check-forbidden.mjs ·
│           logo-trace.mjs · logo-diff.mjs · optimise-images.mjs · encode-hero.sh · og-images.mjs
├─ src/
│  ├─ app/ layout.tsx · (site)/… routes · _lab/… (dev only) · sitemap.ts · robots.ts · not-found.tsx
│  ├─ components/ brand/ · preloader/ · layout/ · hero/ · sections/ · product/ · forms/ · ui/ · icons/
│  ├─ content/ types.ts · site.ts · products.ts · industries.ts · journey.ts · navigation.ts · career.ts
│  ├─ lib/ motion.ts · preload.ts · whatsapp.ts · analytics.ts · seo/ · validation/
│  ├─ hooks/
│  └─ styles/ tokens.css · globals.css · typography.css
└─ tests/ screens.spec.ts · a11y.spec.ts · forms.spec.ts · nav.spec.ts · preloader.spec.ts · lighthouserc.json
```

### 23.1 Agent file template (example: `.claude/agents/design-critic.md`)
```markdown
---
name: design-critic
description: Ruthless art-direction reviewer for Alok Plastics. Use after any visual change to score screenshots against the logo-derived design system and the anti-generic filter. Read-only.
tools: Read, Grep, Glob, Bash
---
Read docs/MASTER_PROMPT.md §2, §3, §3.2, §4, §13 before reviewing. You never edit source files.
For each screenshot you are given:
1. Score 1–10 on: brand fidelity (§2), logo-derived language (§3 rows 1–10), hierarchy & spacing (§7.4 coupling rule), originality (§3.2 slop filter), mobile quality.
2. List issues as CRITICAL/MAJOR/MINOR with the rule number and the exact element (selector or description + viewport).
3. For each issue give one concrete fix (values, not adjectives).
4. Say what is genuinely excellent and must be protected.
Write your review to docs/critique/<phase>-<section>.md and return a 10-line summary.
Be harsh. "Looks good" is not a review.
```
Write the other 11 agents in the same shape, with their ownership and checklists from §20.1 and §22.1.

---

## 24. CLIENT INFORMATION STILL MISSING (seed `docs/client-questions.md` with these)
1. Phone, WhatsApp number, email, Google Maps pin, GSTIN, business hours.
2. Social media URLs (if any).
3. Vector logo master files (SVG/AI/PDF) — the PNG trace is a stopgap.
4. Product photographs (white background) for every published part; hero video footage or approval to commission it.
5. Missing product data: materials for Adjustable Leg Insert (catalogue says HDPE — confirm), Ventilation Jalli (PPCP — confirm), Gasket, Bright Chrome, Three Core Plug, Door Lock; SKU/HSN, MOQ, packing quantity; which parts fit which machine; group for Three Core Plug, PUF Chemical, Bright Chrome.
6. Whether catalogue prices may be shown publicly.
7. Approval of all drafted copy flagged `// COPY:`.
8. Legal texts: Privacy, Terms, Refund.
9. Open roles for the Career page; real team photos (optional).
10. Real testimonials / customer logos (with permission) — optional.
11. Current WordPress site URL list for 301 redirects; Hostinger access for deployment.
12. Hosting decision for future phases (Hostinger Premium is static/PHP only; admin panel & cart need Node-capable hosting — SRS v1.0 §12.2).
13. Typical reply time for enquiries; states/cities served (if they want them named on the map).

---

## 25. GATES — the build is not done until every line is true

**Brand & design**
- [ ] Every colour comes from a §2.1 token; `check-hex` passes; no `#000`, no purple/cyan/blue/orange/neon.
- [ ] Green appears only on WhatsApp elements and form success.
- [ ] ~61/28/11 balance holds on every page (eyeball from 1440 screenshots; one burgundy block per viewport; never two adjacent burgundy sections).
- [ ] Every §3 logo-derived rule is visibly applied: diagonals, up-and-right motion & arrows, 2px corners, top-lit metal gradient, numbered micro-labels, technical-drawing furniture (restrained).
- [ ] Passes the §3.2 slop filter; design-critic ≥ 8/10 on every home section and ≥ 9/10 on the preloader and hero.
- [ ] Spacing uses tokens only; no 28–36px gaps.
- [ ] Tagline reads exactly **भारते शिल्पितम्, विश्वय निर्मितम्** / **Crafted in Bharat, made for the world.** everywhere it appears.
- [ ] Logo resting state is identical to the master; correct version per background; never distorted or recoloured.

**Preloader**
- [ ] Construction → light sweep → PLASTICS → shirorekha inscription → FLIP into navbar + diagonal split exit. No plain fade/slide (except reduced motion).
- [ ] ≤ 3.4s typical, hard cap 4.0s, skippable, once per session, skipped on Save-Data/2G, `role="status"`, page beneath is SSR and `inert` until exit, no CLS, no double logo.

**Navbar & hero**
- [ ] Navbar (and drawer) are the only glass; `grep -rn "backdrop-filter" src/` → ≤ 2 files.
- [ ] Glass has `saturate(180%)`, `-webkit-` prefix, 1px light border, inset top highlight, and is a sibling of the hero media; docking transition designed.
- [ ] HeroMedia works in ambient (default), poster and video modes; switching to video is a config change only.
- [ ] Video (when present): `autoplay muted loop playsinline preload="metadata" poster aria-hidden`; injected after first paint; ≤ 2.5 MB mp4 / ≤ 1.5 MB webm; seamless loop; paused off-screen; not autoplayed < 768px or coarse pointer; pause control; poster under reduced motion.
- [ ] Headline readable over the brightest frame — measured, not assumed.
- [ ] `100svh`, never `100vh`.

**Motion**
- [ ] Lenis on `gsap.ticker` with ×1000 and `lagSmoothing(0)`; exactly one rAF loop.
- [ ] Reduced motion fully honoured — no Lenis, no pin, no counters, no marquee motion, no video, no preloader construction — site complete and usable.

**Content & honesty**
- [ ] Product taxonomy exactly §6.1 — 4 groups, 10 anchor parts, 01 card 2× width; unconfirmed items unpublished.
- [ ] Zero invented certifications, specs, clients, testimonials, ratings, prices on display, cities, or numbers. Every drafted line flagged and listed.
- [ ] Every page ends in a real next step (Enquire Now · WhatsApp Us · Get a Quote). No `#` hrefs, no dead links, no "coming soon".

**Quality**
- [ ] 375px: no horizontal scroll, ≥ 44px targets, drawer traps focus; 320px still usable.
- [ ] Lighthouse mobile: **Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO ≥ 95** on Home, Products, a Product page, About, Contact (report actual numbers).
- [ ] LCP < 2.0s mobile, CLS < 0.02, INP < 200ms, page < 1.5 MB excl. video.
- [ ] axe: zero serious/critical issues on every route.
- [ ] `npm run typecheck`, `npm run lint` (incl. custom checks), `npm run build` all clean; browser console clean (no errors, no warnings from our code).
- [ ] Static export in `out/` runs from a plain static server (`npx serve out`) with forms posting to the PHP endpoint (tested with `php -S`).
- [ ] `docs/qa.md` contains the **actual numbers**, not claims.

---

## 26. GO

1. Read this whole prompt. Save it to `docs/MASTER_PROMPT.md`.
2. Before writing code, reply in **at most 6 lines**:
   - what you're building (one line),
   - the agent waves you'll run for Phases 0–3,
   - the one structural decision of yours I'd most want to argue about,
   - the first thing you're unsure of,
   - anything you need from me right now (e.g. the logo file path, the catalogue PDF).
3. Then start **Phase 0** and continue phase by phase, running the Quality Loop (§22) at the end of each. After each phase, give me a 5-line status: what shipped, loop iterations used, critical issues left (should be 0), key numbers, next phase.
4. Never deploy, push to a remote, or install global tools without asking me first.
