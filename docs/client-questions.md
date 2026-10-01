# Alok Plastics — Client Questions & TODO Register

All items here represent missing data. Nothing is invented. The site renders honest empty states until these are resolved.

---

## CRITICAL — Needed before launch

| # | Question | Impact | Where in code |
|---|---|---|---|
| 1 | Phone number and WhatsApp number | Contact page, WhatsApp FAB, enquiry form, utility bar, footer | `src/content/site.ts` → `contact.phone`, `contact.whatsapp` |
| 2 | Email address for enquiries | Contact page, PHP form endpoint config | `src/content/site.ts` → `contact.email`; `public/api/enquiry.php` SMTP config |
| 3 | Google Maps pin / place ID for Chandigarh address | Contact page map embed | `src/content/site.ts` → `contact.mapsUrl` |
| 4 | GSTIN | JSON-LD, contact page | `src/content/site.ts` → `contact.gstin` |
| 5 | Vector logo master (SVG or AI) | Logo fidelity, favicon, OG images | `/brand/alok-logo-primary.svg` — currently using PNG trace (stopgap) |
| 6 | Product catalogue PDF (spare parts for water coolers, deep freezers) | Product data completeness, variants, materials | `/content/source/catalogue.pdf` |
| 7 | Legal texts: Privacy Policy, Terms & Conditions, Refund Policy | `/privacy`, `/terms`, `/refund` pages | `src/app/(site)/privacy/`, `terms/`, `refund/` |

---

## HIGH — Needed for full product catalogue

| # | Question | Impact |
|---|---|---|
| 8 | Which parts fit which machine (water cooler / display counter / deep freezer) for each product | Machine filter on Products page; product detail "Fits:" row |
| 9 | Materials confirmation: Adjustable Leg Insert (HDPE — confirm), Ventilation Jalli (PPCP — confirm), Gasket material, Bright Chrome material, Three Core Plug material | `src/content/products.ts` material fields |
| 10 | SKU / article numbers, HSN codes, MOQ, packing quantity for each product | SpecTable on product detail pages |
| 11 | Group assignment for: Three Core Plug, PUF Chemical, Bright Chrome, and any other catalogue items not clearly in groups 01–04 | Whether these items are published at launch |
| 12 | Whether catalogue list prices (F-Bush Rs.10, Float Valve Rs.180, etc.) may be shown publicly | `src/content/site.ts` → `showPrices` flag |
| 13 | Product photographs (white background, hard top light) for every published part | Product cards, product detail gallery |

---

## MEDIUM — Needed for complete experience

| # | Question | Impact |
|---|---|---|
| 14 | Hero video footage (or approval to commission AI-generated footage per `docs/hero-video-brief.md`) | Hero video mode; currently ships in ambient mode |
| 15 | Social media URLs (Instagram, LinkedIn, Facebook, YouTube, etc.) | Footer social icons; `Organization` JSON-LD `sameAs` |
| 16 | Business hours (for LocalBusiness JSON-LD) | SEO structured data only; not displayed unless confirmed |
| 17 | Real testimonials from customers (with permission to publish) | S10 TrustQuote — component is built but hidden while `testimonials: []` |
| 18 | Customer logos (if any, with permission) | Industries section logo marquee — hidden while `industries.logos: []` |
| 19 | Open job roles for Career page | Career page job listings; ships with "No open roles right now" empty state |
| 20 | Real team photos (optional) | Culture section team tiles; ships typographic if no photos |
| 21 | Typical enquiry reply time | Enquiry section response note |
| 22 | States/cities served (if they want them named on the Pan-India map) | Map arc labels; currently ships with unlabelled arcs |

---

## LOWER — For redirects & analytics

| # | Question | Impact |
|---|---|---|
| 23 | Current WordPress site URL list / sitemap export for 301 redirects | `docs/redirects.md`, `.htaccess` |
| 24 | Hosting type confirmation (Hostinger Premium = static/PHP; any upgrade planned?) | Architecture path for future admin panel (SRS v1.0 future scope) |
| 25 | GA4 / GTM measurement IDs | `src/content/site.ts` → `analytics.ga4Id`; scripts load only when ID exists |

---

## COPY: Drafted lines needing approval

These are functional descriptions drafted from catalogue/requirements facts. They must be approved before launch:

| ID | Where | Drafted line |
|---|---|---|
| C01 | S4 group cards | One-liner per group on what the group does in the machine |
| C02 | S5 USP chain | One-sentence description per step (Understand / Develop / Manufacture / Supply / Repeat) |
| C03 | S11 enquiry H2 | "Tell us the part. We'll take it from there." |
| C04 | Product summaries | One-line "What it does" per published product |

_All items above are flagged `// COPY: drafted, needs client approval` in the source code._

---

## Added in the fix pass / Phases 7–8
| # | Question | Where |
|---|---|---|
| 26 | Approve drafted copy: journey decade lines, process steps (Understand→Repeat), vision/mission/values display, FAQ answers on /products/ | `journey.ts`, `aboutContent.ts`, `FaqSection.tsx` |
| 27 | Pictograms/photos for 7 parts without icons (Handle Lock, Bracket Handle, SS Kabja, L-Type Hinge, U-Type & L-Hinge Door Springs, Waste Coupling) | product cards |
| 28 | Business hours, geo-coordinates | LocalBusiness JSON-LD |
| 29 | Old WordPress URL list for 301s | `.htaccess` redirect block |
| 30 | Is Company a required field in the enquiry form? | enquiry schema |

| 31 | Which regions/countries do you ship to? Confirm before we label the world arcs as dispatch (today they are illustrative ambition only) | `PanIndiaMap.tsx` |
| 32 | Photos for the 7 industries (replace the drawn scenes via `industries.ts` `image`) | `IndustriesBento.tsx` |
