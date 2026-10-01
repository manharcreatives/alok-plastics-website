# Alok Plastics — Architectural Decisions

Format: Decision · Options Considered · Why · Date

---

## ADR-001: Static export with PHP forms
**Decision:** Next.js `output: 'export'` static site with a PHP endpoint at `public/api/enquiry.php` for form submission.
**Options considered:**
- (A) Static export + PHP (chosen)
- (B) Vercel/Netlify deployment with server actions
- (C) Static + Formspree/third-party form service
**Why:** Hostinger Premium plan (client's hosting) supports static files and PHP only — no Node.js runtime. This is the only option that works within their current hosting contract without an upgrade. Option B needs a hosting change; Option C adds a third-party dependency. A thin PHP endpoint stays fully under our control, supports rate-limiting and honeypot, and can send email via Hostinger's SMTP. Architecture is designed so switching to server actions later is a config change (swap `output: 'export'` + PHP endpoint for API routes).
**Date:** 2026-10-01

---

## ADR-002: Tailwind CSS v4 with CSS `@theme` for design tokens
**Decision:** Use Tailwind v4's `@theme` directive to mirror CSS custom properties from `tokens.css` into Tailwind utilities.
**Options considered:**
- (A) Tailwind v4 `@theme` (chosen)
- (B) Tailwind v3 with `theme.extend` in `tailwind.config.js`
**Why:** Next.js 15 + React 19 scaffold defaults to Tailwind v4. The `@theme` approach keeps tokens as real CSS custom properties (usable in plain CSS and GSAP), while also generating Tailwind utilities. Single source of truth in `tokens.css`.
**Date:** 2026-10-01

---

## ADR-003: GSAP for all scroll animations; `motion` (formerly Framer Motion) for micro-interactions only
**Decision:** GSAP 3.13+ (ScrollTrigger, SplitText, Flip) for scroll-driven and sequenced animations. `motion` for component-level micro-interactions (button press, toggle).
**Options considered:**
- (A) GSAP + motion (chosen)
- (B) GSAP only
- (C) motion/Framer Motion only
**Why:** GSAP has the most precise control for the preloader's construction sequence (stroke-draw, clip-path, FLIP handoff) and for Lenis integration. SplitText is now free in 3.13+. `motion` is smaller and more idiomatic for React component state transitions. Never mix Lenis + Framer Motion scroll — two scroll systems = desync.
**Date:** 2026-10-01

---

## ADR-004: Package manager — pnpm
**Decision:** Use pnpm (v12.4.1 available).
**Why:** Faster installs, strict hoisting, disk efficient. Next.js 15 supports pnpm fully.
**Date:** 2026-10-01

---

## ADR-005: Lab routes at `/lab/` not `/_lab/`
**Decision:** The design system lab pages are at `/lab/swatches`, `/lab/type`, `/lab/directions` (not `/_lab/*`).
**Why:** Next.js App Router treats directories prefixed with `_` as "private folders" and excludes them from routing entirely — they are not accessible in dev OR production. Since static export builds all pages, the lab directory must have a routable name. The `/_lab/*` URLs in the master prompt and agent specs are updated to `/lab/*`.
**Mitigations:** All lab pages have `robots: { index: false, follow: false }` and will be excluded from the sitemap. They are documented as dev-only.
**Date:** 2026-10-01

---

## ADR-006: JourneyOrbit — fixed arc instead of rotating dial (SUPERSEDED by ADR-013)
**Decision:** S7 JourneyOrbit implements a fixed rising arc with scroll-driven `activeIndex` state change, not the "rotating dial" described in §13.S7 of the master prompt.
**Options considered:**
- (A) Fixed arc + content panel (chosen)
- (B) Full rotating SVG dial (deferred)
**Why:** The rotating dial requires per-marker SVG arc rotation matrices and GSAP scrub on SVG transforms — complex to implement correctly without visual artefacts and with good mobile fallback within Phase 5 scope. The fixed arc delivers the "scroll through time" narrative clearly. The v2 rotating dial is a polish enhancement for Phase 9.
**Date:** 2026-10-01

---

## ADR-007: PanIndiaMap — schematic SVG placeholder (SUPERSEDED by ADR-012 — real Natural Earth geometry now used)
**Decision:** India outline in S8 uses a hand-drawn schematic bezier path, not a real geographic boundary.
**Options considered:**
- (A) Schematic placeholder (chosen for now)
- (B) Natural Earth 110m boundary SVG
- (C) datameet/maps CC-BY boundary SVG
**Why:** A production-quality India outline requires a proper GeoJSON→SVG pipeline with boundary simplification, which is out of Phase 5 scope. The schematic shows the Chandigarh origin and dispatch arc concept accurately. **Action required:** Replace before launch with a boundary from Natural Earth (public domain) or datameet (CC-BY). File: `src/components/sections/PanIndiaMap.tsx` — update `INDIA_PATH` constant.
**Date:** 2026-10-01

---

## ADR-008: S9 CultureTeaser cut from home page
**Decision:** S9 (CultureTeaser) is not implemented on the home page.
**Why:** No team photos are available from the client at this stage. A typographic-only culture section would not meet the Awwwards-calibre quality standard. The section is deferred to the `/about` page in Phase 6 where it can be implemented as a standalone section. The home page sequence (S10 TrustQuote) compensates by reinforcing trust through USP signals instead.
**Date:** 2026-10-01

---

## Phase 5 — Section motion decisions

| Section | Desktop animation | Mobile fallback | Reduced-motion |
|---------|------------------|-----------------|----------------|
| S3 ProofStrip | Odometer roll + light sweep (ScrollTrigger once) | Same | Show final values immediately |
| S4 ProductGroups | Cursor-tracked glare on 01+02 | No glare | No glare |
| S5 RequirementToRepeat | `useMaskRise` on heading + pull quote | Same | No mask |
| S6 IndustriesBento | Hover/focus opacity reveal on industry lines | Always visible (`hover:none`) | Always visible |
| S7 JourneyOrbit | Pin 250vh, scroll scrub activeIndex | Vertical timeline, no pin | Vertical timeline, no pin |
| S8 PanIndiaMap | SVG `<animate>` pulse on Chandigarh dot | Same | No pulse |
| S10 TrustQuote | `useMaskRise` on heading + blockquote | Same | No mask |
| S11 EnquirySection | None (form is static) | — | — |
| S12 Footer | JS hover colour transitions | Same | Same |
| S13 WhatsAppFAB | pulse ring, show/hide via IntersectionObserver | Same | No pulse; still shows |

---

## ADR-012: PanIndiaMap becomes a dot-matrix world map from real geodata (Round 2, ask 13)
**Decision:** Replace the schematic India with a world map generated by `scripts/gen-world-dots.mjs` from Natural Earth 1:10m admin-0 countries, India point-of-view edition (public domain; India drawn per the Government of India depiction, full J&K and Ladakh). Output `src/components/sections/worldDots.ts` (~16 KB): run-length dot rows (zero-length round-cap dashes), a simplified India outline, and a 3x finer burgundy dot field for India. Rest of world = muted silver dots. Chandigarh pulses as origin.
**Honesty:** Arcs are unlabelled. Burgundy arcs inside India = the verified "Pan Bharat delivery network". Longer grey arcs across the world carry only the *ambition* (vision: globally recognised Indian manufacturing brand; tagline "Crafted in Bharat, made for the world."). No export/country claims, no names, no flags; the caption says arcs are illustrative. Label them as dispatch only after the client confirms (client-questions #31).
**Options:** d3-geo + topojson at build (rejected: no new deps needed; own rasteriser is ~150 lines); 110m data (rejected: Kashmir depiction is not the GoI one).
**Date:** 2026-10-01

---

## ADR-013: Journey as a cinematic scroll roadmap; Industries as drawn illustration cards (Round 2, asks 11-12)
**Journey:** Pinned (>=1024, motion allowed) scrubbed marker travels a winding SVG road (getPointAtLength, transform only) over a drawn factory-roofline/light-ray/blueprint backdrop. No info box: year/title/line mask-rise on the page; 2020s runs the 20 Cr+ odometer; The Future is a dashed ghost road. Mobile/tablet/reduced-motion: vertical road with per-milestone scrubbed segments, no pin. Supersedes ADR-006.
**Industries:** No photos exist, so hand-authored SVG scenes (src/components/art/IndustryScenes.tsx). `Industry.image?` replaces a scene automatically when supplied. Diagonal-cut media, hover diagonal-wipe of the application line (always visible on touch / reduced motion), asymmetric 12-col bento; core market stays the single burgundy block.
**Date:** 2026-10-01


---

## ADR-011: ProofStrip merged into AboutIntro (round 2, agent B)
**Decision:** The home page renders a new `AboutIntro` (after the hero ribbon) that carries the four numeric proof points (20 Cr+, 70%+, 1998, 100%) and the three word-stats; `ProofStrip` is no longer used on `/` (file kept, compiling).
**Why:** Client asked for a short about intro with numbers that count up slowly. A separate strip right after a short intro duplicated the idea. Numbers now sit in a band closing the intro. Count-up: ~2.4s power3.out, 0.4s + 0.16s/stat delay, once via IntersectionObserver, tabular-nums, light sweep on landing; reduced motion shows final values. The year counts from 1900.
**Also:** micro-labels carry no numbers; product group ids 01-04 are not shown; section transitions use `FoldEdge` (rising diagonal + short burgundy arm); TrustQuote uses the core value "We don't just mould plastic. We mould possibilities." (S5 keeps the USP quote).
**Date:** 2026-10-01


---

## ADR-014: Footer vs EnquirySection, and the inner-page hero stage (round 2, agent E1)
**Footer / enquiry separation:** `EnquirySection` was burgundy and the footer burgundy-deep, so two burgundy blocks touched. Resolved by making `EnquirySection` a light section (`--surface-alt`, faint 8px grid) that keeps ONE burgundy accent (the "Tell us the part" side panel with a cut corner). The footer is a single `--burgundy` block (one shade only; the legal bar is a hairline, not a second shade) that opens on a folded 44-degree top edge (`clip-path` + pulled up under the previous section, rose-pale fold line with short arm), so even when the previous section is burgundy-adjacent in content it is never flat against another block. `EnquiryBand` (inner pages) is also light with a folded top.
**WhatsApp:** every WhatsApp button/CTA removed from the footer, EnquirySection, EnquiryBand, forms (success + fallback), contact and enquiry pages, FAQ copy. `src/lib/whatsapp.ts` exports are untouched (the FAB uses them). Form success states now offer Call / Email (only when set in `site.contact`) / Browse products; the email-failure fallback offers mailto + retry.
**Maps:** `mapsHref()` / `MAPS_ARIA_LABEL` added to `site.ts`: footer, contact, enquiry and EnquirySection addresses are links (new tab, `rel="noopener noreferrer"`) to `site.contact.mapsUrl` or, while null, a Google Maps search URL built from the address.
**PageHero:** full-screen stage (`min-height:100svh`, content low-left, folded exit line drawn inside the hero so the next section can never peek in). Props kept; added `art`, `scrollHint`, `enter` (`rise` mask-rise / `wipe` diagonal clip / `draw` rule + slide) and `calm` (legal). Entrances are CSS keyframes (transform/opacity/clip-path only), disabled under `prefers-reduced-motion`. Bespoke artwork per page lives in `src/components/page/art/**` (About folded A + light rays, Career teams title-block, Contact schematic site plan marked Plot No-06, Enquiry part blueprint with callouts, Legal quiet document, 404 ghost part). Plot plan and part drawing are schematic and labelled as such: no coordinates, no dimensions.
**Icons:** Server components use `@phosphor-icons/react/dist/ssr/*`; `dist/csr/*` calls `createContext` and breaks in Server Components.
**Date:** 2026-10-01
