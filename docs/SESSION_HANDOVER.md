# Alok Plastics — Session Handover
**Date:** 2026-10-01  
**Session:** Phase 0 → Phase 6 complete

---

## BUILD STATUS
```
pnpm build → ✓ PASSES (11 static pages)
pnpm tsc --noEmit → ✓ CLEAN (0 errors)
check-glass.mjs → ✓ 2/2 backdrop-filter files only
```

---

## WHAT IS COMPLETE

### Phase 0 — Setup
- Next.js 16.3.7 App Router, `output: 'export'`, Tailwind v4, pnpm
- All packages installed: gsap, @gsap/react, lenis, motion, zod v4, fuse.js, clsx
- Git initialised, .gitignore configured (brand/, content/source/, config.php, .research/)

### Phase 1 — Brand Foundation
- `src/styles/tokens.css` — 24 colour tokens + 2 gradients (LOCKED from Brand Colour Guide v1.0)
- `src/styles/ui.css` — button/tag/card/divider states
- Tailwind v4 `@theme` mirror in `globals.css`
- Fonts: Archivo (variable), Inter (variable), Noto Sans Devanagari, JetBrains Mono via next/font
- `src/components/brand/Logo.tsx` — 3 variants (color/white/bright), forwardRef for GSAP FLIP
- `src/components/brand/Pictogram.tsx` — custom part/industry icon set, 24/32/48px
- Lint scripts: `check-hex.mjs`, `check-spacing.mjs`, `check-glass.mjs`, `check-forbidden.mjs`
- Lab pages: `/lab/swatches`, `/lab/type`

### Phase 2 — Motion Core & Preloader
- `src/lib/motion.ts` — Lenis + GSAP single ticker (×1000ms, lagSmoothing(0))
- `src/lib/preload.ts` — asset preload promise (fonts, hero poster)
- `src/hooks/useReducedMotion.ts` — `prefersReducedMotion()` helper
- `src/hooks/useMotion.ts` — `useMaskRise`, `useOdometer`, `useLightSweep`
- `src/components/preloader/Preloader.tsx` — full construction sequence (stroke draw → fill → light sweep → inscription → FLIP into navbar)
- `src/components/layout/LenisProvider.tsx` — client component wrapping Lenis init
- Lab page: `/lab/preloader` with Replay/Slow-mo/Reduced-motion controls

### Phase 3 — Glass Navbar + Hero
- `src/components/layout/Header.tsx` — glass pill navbar, docking on scroll, hide/show on scroll direction
- `src/components/layout/UtilityBar.tsx` — 32px mist bar (Since 1998 · Pan Bharat · WhatsApp TODO)
- `src/components/layout/NavMegaPanel.tsx` — 4-column products mega-panel, solid surface (no glass)
- `src/components/layout/Drawer.tsx` — mobile drawer, diagonal clip-path, glass, focus trap
- `src/styles/glass-nav.css` — the ONLY glass styles (1 of 2 allowed files)
- `src/components/hero/Hero.tsx` — 100svh, left-aligned type, diagonal clip-path exit, ScrollCue
- `src/components/hero/HeroMedia.tsx` — ambient/poster/video modes
- `src/components/hero/ValuesRibbon.tsx` — CSS marquee, pause on hover/focus, aria-hidden duplicate
- `src/app/layout.tsx` — LenisProvider + Header + main wrapper

### Phase 4 — UI Library
- `src/components/ui/Button.tsx` — 5 variants, 3 sizes, loading spinner, polymorphic (button/a)
- `src/components/ui/TextLink.tsx`, `MicroLabel.tsx`, `SectionHeader.tsx`
- `src/components/ui/Tag.tsx` — material tags (NYLON/HDPE/PPCP/BRASS/SS)
- `src/components/ui/Card.tsx`, `Callout.tsx`, `Divider.tsx`, `SpecTable.tsx`
- `src/components/ui/index.ts` — barrel exports
- Lab page: `/lab/components`

### Phase 5 — Home Sections (S1–S13)
- `src/app/page.tsx` — full home page, all sections wired
- `src/components/hero/Hero.tsx` (S1), `ValuesRibbon.tsx` (S2)
- `src/components/sections/ProofStrip.tsx` (S3) — odometer + light sweep, register marks
- `src/components/sections/ProductGroups.tsx` (S4) — bento grid, glare, expand-in-place, two-path block
- `src/components/sections/RequirementToRepeat.tsx` (S5) — chain nodes, rising diagonal, pull quote
- `src/components/sections/IndustriesBento.tsx` (S6) — core market tile + 7 industries
- `src/components/sections/JourneyOrbit.tsx` (S7) — fixed arc + scroll-driven active panel, vertical on mobile
- `src/components/sections/PanIndiaMap.tsx` (S8) — schematic India SVG, Chandigarh pulse, dispatch arcs
- `src/components/sections/TrustQuote.tsx` (S10) — blockquote + 3 trust signals, testimonials slot hidden
- `src/components/sections/EnquirySection.tsx` (S11) — uses ShortEnquiryForm
- `src/components/sections/Footer.tsx` (S12) — 4-col, burgundy-deep
- `src/components/sections/WhatsAppFAB.tsx` (S13) — hides when #enquiry in view

### Phase 6 — Enquiry & WhatsApp
- `src/lib/enquiry-schema.ts` — Zod v4 schemas (short + full), `flattenZodErrors`, `validateShortForm`
- `src/lib/whatsapp.ts` — `waGeneral()`, `waProduct()`, `waFromShortForm()`
- `src/lib/analytics.ts` — `dataLayer` pushes (no-op when ga4Id is null)
- `public/api/enquiry.php` — PHP endpoint (CORS, honeypot, rate-limit 30s/IP, email)
- `public/api/config.php.example` — config template (actual config.php is gitignored)
- `src/components/forms/ShortEnquiryForm.tsx` — reusable, onLight prop
- `src/components/forms/FullEnquiryForm.tsx` — multi-line products, GSTIN, city/state
- `src/app/enquiry/page.tsx` — `/enquiry` route with full form + WA sidebar
- `docs/deploy-hostinger.md` — Hostinger deployment guide

---

## CONTENT FILES (all content wired, never hardcoded in components)
```
src/content/site.ts       — company info, hero config, proof points (TODO: phone/WA/email/GSTIN)
src/content/products.ts   — 4 groups, 18 products, all with published:true/false
src/content/industries.ts — 7 industries + core market config
src/content/journey.ts    — 6 journey markers + USP chain + pull quote
src/content/navigation.ts — primary nav, mega-panel columns, footer links, legal links
src/content/types.ts      — all TypeScript types
```

---

## WHAT NEEDS CLIENT INPUT (from docs/client-questions.md)
| Item | Used in |
|------|---------|
| Phone number | Header utility bar, Footer, Enquiry |
| WhatsApp number | FAB, EnquirySection, Footer, all WA links |
| Email address | Footer, EnquirySection, PHP config |
| Google Maps URL | Footer, Enquiry page sidebar |
| GSTIN | Footer |
| Logo PNG/vector | `/brand/alok-logo-primary.png` (Logo component uses placeholder) |
| Hero video (.mp4/.webm) | HeroMedia — currently in 'ambient' mode |
| Hero poster image | `/media/hero-poster.jpg` |
| Product photos | All `images: []` in products.ts |
| Testimonials (real, attributed) | TrustQuote — array is empty |
| India map SVG | PanIndiaMap — replace INDIA_PATH with real boundary |
| GA4 Measurement ID | analytics.ts — currently null |
| Instagram/LinkedIn/Facebook/YouTube URLs | Footer social icons |
| Enquiry email inbox | PHP config ($ALOK_TO_EMAIL) |
| Typical reply time | EnquirySection success message |

---

## REMAINING PHASES
| Phase | What | Status |
|-------|------|--------|
| 7 | Inner pages: About, /products, /products/[group], /products/[group]/[part], Industries, Career, Contact, /privacy, /terms, /refund, 404 | NOT STARTED |
| 8 | SEO/GEO: metadata per route, JSON-LD, sitemap.xml, robots.txt, .htaccess, llms.txt | NOT STARTED |
| 9 | Hardening: Playwright, axe, Lighthouse CI, bundle report, cross-browser | NOT STARTED |
| 10 | Handover: README.md, CHANGELOG.md, client-questions final list | NOT STARTED |

---

## KEY DECISIONS (ADRs — full log in docs/decisions.md)
- **ADR-001** Static export + PHP (Hostinger Premium has no Node.js)
- **ADR-005** Lab routes at `/lab/` not `/_lab/` (Next.js treats `_` dirs as private, non-routable)
- **ADR-006** JourneyOrbit uses fixed arc (rotating dial deferred to Phase 9 polish)
- **ADR-007** PanIndiaMap uses schematic SVG (real boundary to be swapped in before launch)
- **ADR-008** S9 CultureTeaser cut from home (no team photos; goes on /about in Phase 7)

---

## ABSOLUTE RULES (never break these)
1. **§19 Honesty** — Never invent numbers, names, certs, cities, testimonials, ratings
2. **§2 Brand lock** — No hex outside tokens.css; no pure black; no blue/purple/cyan/orange
3. **Glass budget** — backdrop-filter in exactly 2 files: `glass-nav.css` + `Drawer.tsx`
4. **`100svh`** always in hero, never `100vh`
5. **`विश्वय`** — this exact spelling is intentional brand spelling, do not "correct"
6. **Logo** — never redraw, recolour, stretch, or animate the shape
7. **Spacing** — no 28–36px arbitrary gaps (§7.4 lint check)
8. **Two burgundy sections adjacent** — forbidden; always separate

---

## TO RESUME NEXT SESSION
Run: `cd "D:\alok plastics" && pnpm dev`  
Continue with: **Phase 7 — Inner pages** (start with `/about`, then `/products`, then product detail)  
Read: `docs/MASTER_PROMPT.md §8.2` for the full page list and specs.
