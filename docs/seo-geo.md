# SEO + GEO — what is built, and what the client does after launch

Scope: master prompt §18. The site is a static export on Hostinger (Apache/LiteSpeed, no Node). Nothing here promises a ranking; it makes the business easy for search engines and AI answer engines to read, and makes every page a clean path to an enquiry.

## 1. Implemented

| Area | Where | Notes |
|---|---|---|
| Central helpers | `src/lib/seo.ts`, `src/components/seo/JsonLd.tsx` | `absoluteUrl`, Organization / LocalBusiness / WebSite / BreadcrumbList / Product / FAQPage builders. Data only from `src/content/*.ts`; null fields (phone, email, geo, social, SKU, images) are omitted. No `aggregateRating`, `review`, `offers`, awards or certifications anywhere. |
| Root metadata | `src/app/layout.tsx` | `metadataBase`, title template `%s \| Alok Plastics, Chandigarh`, OG (`en_IN`, `/og-image.png` 1200×630), Twitter `summary_large_image`, icons, manifest, theme colour, robots. Canonical is per page (never inherited). |
| Per-page metadata | each `page.tsx` | Unique title (≤ 60) and description (≤ 155), canonical. Part titles pick the longest of `Part \| Group — Alok Plastics, Chandigarh` → `Part Spare Part \| Alok Plastics` that fits 60. |
| JSON-LD | Home: Organization + LocalBusiness + WebSite. Inner pages: BreadcrumbList (inside `Breadcrumbs`, single source). Part pages: Product. `/products/`: FAQPage. | Founder is **not** used; Owner/CEO are `employee` + `jobTitle` until the client confirms. WebSite has no `SearchAction` because `/products/` does not read `?q=` yet. |
| FAQ | `src/components/sections/FaqSection.tsx` on `/products/` | 6 Q&As assembled from content; marked `// COPY: drafted, needs client approval`. |
| Icons / social | `public/og-image.png`, `icon-192/512.png`, `apple-touch-icon.png`, `src/app/favicon.ico`, `public/site.webmanifest` | Icon = the A of the ALOK mark on `--canvas`. OG = logo + English tagline on `--canvas`. |
| robots | `public/robots.txt` | Allow all; disallow `/api/`, `/lab/`; explicit allow for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended; Sitemap line. |
| Sitemap | `scripts/generate-sitemap.mjs` (`postbuild`) | Static routes (scanned from `src/app`) + every group + every published part. `lastmod` = build date. Writes `public/` and `out/`. |
| llms.txt | `scripts/generate-llms.mjs` (`postbuild`) | `llms.txt` (concise) and `llms-full.txt` (per-part). Generated from content; nothing hand-written. |
| Lab guard | `src/app/lab/layout.tsx`, `scripts/prune-lab.mjs` | `NEXT_PUBLIC_SHOW_LAB` unset ⇒ `notFound()` **and** `out/lab` deleted after build (under static export `notFound()` alone still leaves the lab's data in the 404 shell's RSC payload). Set `NEXT_PUBLIC_SHOW_LAB=1` to keep it (`pnpm dev` sets it). Lab is `noindex` and never in the sitemap either way. |
| Apache rules | `public/.htaccess` (copied to `out/.htaccess`, verified) | HTTPS + non-www in one 301; trailing-slash normalisation; `ErrorDocument 404 /404.html`; Brotli/gzip; `/_next/static` immutable 1 year; images/fonts/CSS/JS 1 year; HTML + RSC `.txt` 5 min; security headers (nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS); denies `*.example`, `config.php`, dotfiles, `.md`, `.map` etc. **No CSP** on purpose: Next injects inline scripts and a static host cannot supply nonces. |
| Audit | `scripts/check-seo.mjs` (`pnpm check:seo`) | One `<h1>`; unique title ≤ 60 (61–65 warns, > 65 fails); description 50–160 and unique; canonical = page URL; OG/Twitter present; JSON-LD parses, no duplicates, no forbidden keys; every internal `href`/`src` resolves in `out/`; every `<img>` has `alt`; sitemap = exactly the indexable pages; root files present. |

Build/verify: `pnpm build && pnpm check:seo`.

## 2. Keyword → page map (to be validated with keyword research)

Seeded only from product and group names in the catalogue. Volume, competition and intent are **not** known yet.

| Page | Candidate primary terms | Candidate secondary |
|---|---|---|
| `/` | water cooler spare parts; display counter spare parts; deep freezer spare parts | spare parts manufacturer Chandigarh |
| `/products/` | water cooler parts; freezer spare parts list | part finder, spare parts catalogue |
| `/products/deep-freezer-display-counter-parts/` | display counter spare parts; deep freezer spare parts | door hinge, door lock, door spring |
| `/products/water-cooler-spare-parts/` | water cooler spare parts; water cooler float valve; water cooler waste pipe | push cock, waste coupling |
| `/products/commercial-kitchen-spare-parts/`, `/products/caster-wheel/`, `/products/on-demand-customized-products/` | to be researched once the client supplies products for these groups | Information required from client |
| `/products/sealing/` | freezer door gasket; display counter gasket | refrigeration gasket |
| `/products/…/f-bush/` | display counter F-bush; sliding door bush | nylon bush |
| `/products/…/connecting-bush/` | connecting bush brass; connecting bush nylon | 2 / 2.5 / 3 inch |
| `/products/…/float-valve/` | water cooler float valve | float valve nylon |
| `/products/…/waste-pipe/` | water cooler waste pipe | PPCP waste pipe |
| `/products/…/ventilation-jalli/` | ventilation jalli | RS 60 / RS 75 / RS 80 / RS 130 |
| `/products/…/adjustable-leg-insert/` | adjustable leg insert | round / square leg insert |
| `/products/…/hinge`, `l-type-hinge`, `door-lock`, `handle-lock`, `bracket-handle`, `ss-kabja`, door springs | freezer / display counter hinge; door lock | per part |
| `/industries/` | (brand + industries; low search intent) | — |
| `/about/`, `/contact/` | alok plastics; alok plastics chandigarh | brand / local |

## 3. GEO notes

- Entity sentence is identical on Home meta, Organization/LocalBusiness `description`, About and `llms.txt`.
- Name, address, founding year are consistent everywhere (all from `site.ts`).
- Part pages answer what / material / which machine / sizes in a spec table (see Phase 7).
- No fake citations, no keyword stuffing, no hidden text.

## 4. Open items for the client (SEO-relevant)

Phone, WhatsApp, enquiry email, Google Maps place URL / lat-lng, opening hours, social profile URLs, GSTIN, part photos, confirmed machine fit and sizes per part, approval of FAQ and part summaries, final privacy/terms/refund text (those three pages are still placeholders but currently indexable — consider `noindex` until published), export of old WordPress URLs for 301 redirects (add to the marked block in `.htaccess`).

## 5. Post-launch checklist (client / Manhar Creatives)

1. Confirm the domain serves `https://alokplastics.com/` with a valid certificate; `http://` and `www.` must 301 to it (`.htaccess` handles it).
2. Open `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/og-image.png` in a browser.
3. **Google Search Console**: add the property (Domain via DNS TXT, or URL-prefix with the HTML tag/file), submit `https://alokplastics.com/sitemap.xml`, inspect the home page and one part page, then request indexing.
4. **Bing Webmaster Tools**: import from Search Console, submit the same sitemap.
5. **Google Business Profile**: claim/verify the Chandigarh unit; use the exact NAP from the site; add category, hours, phone, website link, photos.
6. **GA4**: create a property, put the measurement ID in `site.analytics.ga4Id` (the script loads only when set), rebuild; mark `enquiry_submit`, WhatsApp and phone clicks as key events.
7. Fill `phone`, `whatsapp`, `email`, `mapsUrl`, `geo`, `social` in `src/content/site.ts` — JSON-LD and `llms.txt` pick them up on the next build.
8. Validate: Rich Results Test on Home, a part page and `/products/`; check for any Search Console enhancement errors after a week.
9. Redirects: when the old WordPress URL list is available, add 301 rules to `.htaccess`.
10. Review the Search Console Performance report monthly (impressions, clicks, queries, pages) and the qualified-lead count in the enquiry inbox. Rankings and AI citations vary and cannot be guaranteed.

## 6. Deploy notes

Upload the **contents** of `out/` to `public_html/` (including the dotfile `.htaccess`; enable "show hidden files" in File Manager). `postbuild` regenerates `sitemap.xml` and `llms*.txt` with the build date every time.

## 7. Blogs (guides)

- Routes: `/blogs/` (index, `Blog` + `BreadcrumbList` JSON-LD) and `/blogs/<slug>/` (five posts from `src/content/blogs.ts`; `BlogPosting` + `FAQPage` + `BreadcrumbList`). Not in the primary navbar; linked from the Home teaser (`BlogsSection`) and the footer.
- Each post: keyword-first H1 (≤60 chars), unique `metaTitle` (≤60, brand included) and `metaDescription` (≤155), canonical, Open Graph `article`, author = "Alok Plastics Team" (organisation, no fictional person), publisher = Alok Plastics (name + logo inline), internal links to part pages, `/enquiry/` and `/contact/`.
- Target topics: water cooler float valve / overflow / leakage, display counter sliding door parts, HDPE vs nylon vs PPCP vs brass, deep freezer gasket and hinge replacement, custom moulded parts sample to supply. Only catalogue products and materials are named; no statistics, prices or standards.
- Cover images: `/images/blog/<slug>.webp` (16:9, 1600x900) are layered over a drawn placeholder. JSON-LD `image` and `og:image` use the cover only if the file exists in `public/` at build time, otherwise the site OG image, so nothing points at a 404.
- `sitemap.xml` lists the index (weekly) and every post (lastmod = publish date); `llms.txt` lists the guides and `llms-full.txt` carries each guide's text and FAQs.
- `check-seo` verifies the index and every post exist and are indexable, carry BlogPosting (headline, datePublished, author, publisher, image, mainEntityOfPage), BreadcrumbList and FAQPage, and og:type=article. A missing `/images/...` photo is a warning (photos are generated later), not an error.
- Adding a post: append to `blogPosts` in `src/content/blogs.ts` (slug, dates, body blocks, FAQ, related) and add the cover to `docs/images/manifest.blogs.json`; routes, sitemap and llms update on the next build.
