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

## ADR-006: JourneyOrbit — fixed arc instead of rotating dial
**Decision:** S7 JourneyOrbit implements a fixed rising arc with scroll-driven `activeIndex` state change, not the "rotating dial" described in §13.S7 of the master prompt.
**Options considered:**
- (A) Fixed arc + content panel (chosen)
- (B) Full rotating SVG dial (deferred)
**Why:** The rotating dial requires per-marker SVG arc rotation matrices and GSAP scrub on SVG transforms — complex to implement correctly without visual artefacts and with good mobile fallback within Phase 5 scope. The fixed arc delivers the "scroll through time" narrative clearly. The v2 rotating dial is a polish enhancement for Phase 9.
**Date:** 2026-10-01

---

## ADR-007: PanIndiaMap — schematic SVG placeholder
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

_Record all future decisions here. One ADR per significant choice._
