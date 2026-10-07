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

## Added in the premium revamp
| # | Question | Where |
|---|---|---|
| 33 | Which products belong to Commercial Kitchen Spare parts, Caster wheel and On demand Customized Products? Those groups are empty until supplied (Information required from client) | `products.ts`, admin Products |
| 34 | Confirm the provisional group for each existing product (Water Cooler vs Deep freezer & Display counter) | `products.ts` |
| 35 | Client WhatsApp number for order messages | `NEXT_PUBLIC_CLIENT_WHATSAPP`, `api/config.php` |
| 36 | SMS provider account and approved DLT template for OTP (MSG91 or Fast2SMS) | `api/config.php` `$ALOK_OTP` |
| 37 | Google account that will own the Apps Script, Sheet and Drive folder; client email for career and order alerts | `docs/google-apps-script/README.md` |
| 38 | Confirm each decade line on the journey timeline (2000s to 2020s) | `journey.ts` |
| 39 | The home "We don't just mould plastic. We mould possibilities." is core value 1 but the About "Core values" section shows only values 2 and 3. Show all three on About (value 1 would then leave Home), or keep as is? | `TrustQuote.tsx`, `aboutContent.ts` |
| 40 | The journey timeline now lives on /about only (it repeated the home proof numbers). OK to keep it off Home? The 2000s/2010s/2020s figures in `journey.ts` still await confirmation (#38) | `app/page.tsx`, `journey.ts` |
| 41 | Visiting hours and any landmark directions for the Contact page (currently "Please send an enquiry first and we will reply.") | `ContactSheet.tsx` |

## Added in the home sections pass (Why Alok Plastics, Pan Bharat, Enquiry, Footer)
| # | Question | Where |
|---|---|---|
| 42 | Home "Why Alok Plastics" now lists four commitments (Quality, Fitment, Supply, B2B first) using the previously approved wording. No guarantee (for example a multi-year guarantee), certification or quantity is claimed. If the client offers a guarantee or warranty, send the exact terms and we will add it. Please also confirm the section title "Four reasons buyers reorder." | `TrustQuote.tsx` |
| 43 | "Beyond the catalogue" copy under the map says parts are developed to a sample, drawing or photo and supplied for many industries, with repeat orders across India. Confirm wording; supply real figures only if they want any (none are shown). | `PanIndiaMap.tsx` |
| 44 | Approve new drafted lines: enquiry H2 "Send us the part. We'll take it from there.", the "What to send us." panel, and the closing sign-off "Every part starts with a conversation." | `EnquirySection.tsx`, `ClosingNote.tsx` |
| 45 | Footer shows both phone numbers, WhatsApp, email and address. Still unknown, so not shown: GSTIN, business hours, Google Maps place link. | `Footer.tsx`, `site.ts` |

## Added with the blogs section
| # | Question | Where |
|---|---|---|
| 42 | Approve the five launch guides (copy is drafted from catalogue facts only). Any statement you would rather not publish? | `src/content/blogs.ts` |
| 43 | For the custom-parts guide: do you want to state a typical sample-approval step, mould development lead time, minimum order quantity or tooling arrangement? Today the guide says only that timing and cost are confirmed per requirement | `blogs.ts` (custom parts guide) |
| 44 | Confirm "SS Kabja" is stainless steel (the materials guide mentions it as stainless steel) and the material of the Gasket, Door Lock and Hinge, so the guides can name them | `blogs.ts`, `products.ts` |
| 45 | Confirm the heavy and light Push Cock variants: is "heavy suits busy locations" an accurate way to describe them? | `blogs.ts` (float valve guide) |
| 46 | Who should be named as the author of guides (currently "Alok Plastics Team"), and may we publish new guides monthly? | `blogs.ts` |

## Added with the commercial kitchen products pass (gas stove catalogue + burner/valve screenshots)
Numbers continue after the home-sections pass (rows 42 to 46 are also used by the blogs list above).
| # | Question | Where |
|---|---|---|
| 47 | The Commercial Gas Stoves catalogue contains whole stoves and bhattis, not only spare parts. They are listed in group 03 "Commercial Kitchen Spare parts" because it is the closest of the five fixed groups. OK, or should the group be renamed (for example "Commercial Kitchen")? | `products.ts` group 03 |
| 48 | Does Alok Plastics manufacture the burners, valves, adaptors and stoves, or supply them? The site avoids the word "manufacturer" for group 03 (page titles and Product schema) until this is confirmed. | `lib/seo.ts`, `products.ts` |
| 49 | Stove sizes are printed without a unit (10x10x6, 12x30x8 ...). Are they inches? Also confirm the meaning of "Double Buff", "3RV burner" and "2RV burner". They are shown exactly as printed. | `products.ts` stove variants |
| 50 | Three bhatti pages are all titled "Stainless Steel Bhatti", and the second Square Heavy page is titled the same as the first (only its price sheet says "Extra Hight"). We added suffixes to tell them apart: "(Twin Burner)", "(Twin Burner, Shelf)", "(Round, Extra Heavy)" and "(Extra Height)". Please give the names you want customers to see. | `products.ts` |
| 51 | "5year Guarantee" is printed beside the extra-heavy SS ring sizes. It is NOT shown on the site. If it is a real guarantee, send the exact terms and what it covers. | `ss-bhatti-round-extra-heavy` |
| 52 | Price pairs and triples printed without labels: Delux Canteen Heavy With Ring 1060/1105, Jumbo Canteen Heavy With Ring 1532/1582, Pilot Burner 105/132 (three types: Lite, Medium, Heavy). Which price belongs to what? The canteen valves (87/98/114 for 65/75/85 gm) were matched in print order: please confirm. Prices are stored only, never shown. | `catalogNote`, variants |
| 53 | Pilot Burner weights differ: caption says Lite 68 gm and Medium 90 gm, the photo says Lite 65 gm, Medium 85 gm, Heavy 95 gm. Which is right? Weights are not shown for it until confirmed. | `pilot-burner` |
| 54 | Some screenshot cards are cut off: Jumbo Canteen Heavy With Ring (below the price), SS Puffer Plate (after "Making 3mm Plate with Heavy Duty") and HP Adaptor CI Nojal (below weight and packing). Please send the full pages, including MOQ. | `products.ts` |
| 55 | Possible typos in the stove sheets: Square Extra Height 18x18x18 weighs "7 kg", the same as 15x15x15; the Bhatti with shelf 10x30x18 is "7 kg" while the lower 10x30x8 is "9 kg". | `products.ts` |
| 56 | Material is not printed for the Jumbo Lite / Jumbo Heavy burners, Delux / Jumbo Canteen with ring, Korian Ring Burner, Door Lock, Gasket, Hinge and Three Core Plug, so none is shown. "CI" in HP Adaptor CI Nojal was read as cast iron: confirm. | `products.ts` |
| 57 | Three products were unpublished until a group was confirmed. They are now published provisionally: Three Core Plug in Water Cooler spare parts, PUF Chemical and Bright Chrome in Deep freezer & Display counter Parts. Confirm the group for each, and where PUF Chemical and Bright Chrome are used. | `products.ts` |
| 58 | The catalogue has two pages titled "Handle Lock": page 6 (black nylon lever, Rs 70) and page 12 (chrome lever sold as "Door lock big" Rs 260 / "Door lock small" Rs 160). The site keeps "Handle Lock" for page 6 and "Door Lock" for page 12. Confirm the names. | `handle-lock`, `door-lock` |
| 59 | Ventilation Jalli: the old site labels "RS 60, RS 75, RS 80, RS 130" were prices. Variants are now the printed sizes 11" x 11", 14" x 14", 14" x 17", 18.5" x 10". Also, the catalogue does not say which machines the Adjustable Leg Insert, Ventilation Jalli and Waste Pipe fit (the site lists machines from the earlier brief): confirm. The generic "Hinge" has no catalogue page: keep or remove? | `products.ts` |
| 60 | Gasket: 47 profile codes are listed exactly as printed (including "HOSHIZAKI"); the last row of each gasket sheet has no labels. Do you have size, material and price per profile? | `gasket` |
| 61 | The supplied photos carry other companies' marks (a retail box on the HP adaptor, brand lettering on valve knobs, a logo on the pilot burner, brand names on the spray cans). The new product photos will be generated without any brand marks. Please confirm, or send unbranded originals. | product photos |
| 62 | Caster wheel (04) and On demand Customized Products (05) still have no products. Please send names, sizes and prices (see also #33). | `products.ts` |
| 63 | MOQ and packing printed for kitchen parts (for example MOQ 100 pcs, packing 25 pcs pouch, 8 pcs, 200 pcs) are shown on the part pages. OK to publish them? Prices stay hidden. | part pages |
| 64 | "SS Kabja 202": is 202 the stainless steel grade, and may "12 gauge heavy duty" be shown (it is printed on the catalogue sheet)? | `ss-kabja` |
