# Phase 8 — SEO / GEO loop log

## Pass 1 — build
- Added `src/lib/seo.ts`, `JsonLd`, root metadata, home metadata + 3 JSON-LD entities, part/group metadata via shared `describe`/`partTitle`.
- Generated OG, icons, favicon.ico, manifest from the real logo (A-mark isolated by colour saturation from the 2000px PNG).
- robots, `.htaccess`, sitemap + llms generators, `check-seo`, FAQ, lab guard.
- First build + audit: 2 failures (descriptions 164/166 chars on /industries/ and /enquiry/).

## Self-critique 1 → fixes
- `notFound()` in the lab layout left lab page data inside the 404 shell's RSC payload (`"Ink on Soft White"` found in `out/lab/swatches/index.html`) ⇒ added `scripts/prune-lab.mjs` to delete `out/lab` unless `NEXT_PUBLIC_SHOW_LAB=1`; verified both modes.
- Root `alternates.canonical: '/'` would be inherited by any page that forgot its own (enquiry did) ⇒ removed from root; enquiry now has its own.
- Enquiry title had the brand twice via the template ⇒ `Get a Quote`. Enquiry description promised "within one business day" (a §19 delivery-time claim) ⇒ reworded.
- Home Product + Breadcrumb: BreadcrumbList lived in `Breadcrumbs` already; moved to the shared builder, Product moved to `productJsonLd`; checker asserts no duplicate types.

## Pass 2
- Rebuilt: og:title/description on every page were the HOME values (root openGraph object overrode page metadata) ⇒ removed title/description from root openGraph/twitter so each page's own values are inherited; verified on part, group, enquiry, about.
- Part meta descriptions were cut mid-word ("five siz…") ⇒ `describe()` keeps whole sentences.
- Lint: fixed `next.config.ts` require, lab `<a href="/">`, lab/type unescaped quotes. Remaining ESLint errors are pre-existing in files owned by other phases: `HeroMedia.tsx:273`, `Header.tsx:68` (setState in effect), `lib/motion.ts:35` (require('lenis')).

## Pass 3 — final verification
- `pnpm build` (flag off): `out/lab` removed, `out/.htaccess` present, sitemap 31 URLs.
- `pnpm check:seo`: 34 HTML files, 31 indexable pages, 1624 internal links, 0 errors, 0 warnings.
- Flag-on build (`NEXT_PUBLIC_SHOW_LAB=1`): lab kept, noindex, not in sitemap; check passes.
- `tsc --noEmit` clean. check-hex / spacing / glass / forbidden pass.

## Known limits
- `og:url` is not emitted (canonical is). Cosmetic.
- No SearchAction (needs `?q=` support in PartFinder).
- `.htaccess` could not be executed here (no Apache); syntax follows standard Apache 2.4 / LiteSpeed directives, all inside `<IfModule>`.
- Placeholder legal pages are indexable.
