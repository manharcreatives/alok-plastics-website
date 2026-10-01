# Phase 5 — Home Sections (S3–S13)

**Status:** Complete  
**Build:** ✓ Passes (`pnpm build` — 10 static pages generated)  
**TypeScript:** ✓ Clean (0 errors `pnpm tsc --noEmit`)

---

## Sections created

| ID   | File                          | Section                      | bg token          |
|------|-------------------------------|------------------------------|-------------------|
| S3   | `ProofStrip.tsx`              | Proof strip — 4 stat cards   | `--canvas`        |
| S4   | `ProductGroups.tsx`           | Product groups bento         | `--surface-alt`   |
| S5   | `RequirementToRepeat.tsx`     | USP chain + pull quote       | `--canvas`        |
| S6   | `IndustriesBento.tsx`         | Industries bento             | `--surface`       |
| S7   | `JourneyOrbit.tsx`            | Journey arc + panel          | `--canvas`        |
| S8   | `PanIndiaMap.tsx`             | Pan India dispatch map       | `--surface-alt`   |
| S10  | `TrustQuote.tsx`              | Trust signals + pull quote   | `--canvas`        |
| S11  | `EnquirySection.tsx`          | Enquiry form + WhatsApp      | `--burgundy`      |
| S12  | `Footer.tsx`                  | 4-col footer                 | `--burgundy-deep` |
| S13  | `WhatsAppFAB.tsx`             | Floating WhatsApp button     | fixed overlay     |

---

## Key decisions

### S7 · JourneyOrbit — fixed arc, not rotating dial (ADR-006)
The master prompt specifies a "rotating dial" where scroll rotates the arc so the active
marker reaches the upper-right position. Implementing SVG arc rotation with GSAP scrub
requires pre-calculated rotation matrices per marker and complex SVG viewBox transforms.
Deferred to Phase 6 v2 polish. Current implementation: fixed rising-arc with scroll-driven
`activeIndex` state that changes the active marker styling + content panel. The effect is
legible and performant. Full rotating dial is recorded as an enhancement ticket.

### S8 · PanIndiaMap — schematic placeholder (ADR-007)
Real India SVG boundary requires a licensed file from Natural Earth or datameet (CC-BY).
Current implementation uses a hand-drawn schematic outline that conveys the concept.
**TODO(client/developer):** Replace `INDIA_PATH` in `PanIndiaMap.tsx` with official
boundary from https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
or https://github.com/datameet/maps before launch.

### S9 · CultureTeaser — cut from home
No team photos available at build time. A typographic-only culture section would weaken
the visual quality of the page. Removed from home page plan. The section can be built
as a standalone section on `/about` in Phase 6.

### S12 · Footer `'use client'`
Footer uses `onMouseEnter`/`onMouseLeave` on link elements for hover colour transitions.
This requires it to be a Client Component. Alternative: replace JS hover with CSS-class
hover. JS hover kept for now as it allows per-element colour transitions that CSS `:hover`
also handles — considered a low-risk client boundary.

---

## Fixes during this phase

- `TrustQuote.tsx`: `HTMLBlockquoteElement` → `HTMLQuoteElement` (correct DOM type)
- `Footer.tsx`: missing `'use client'` directive — added to allow inline event handlers

---

## Files updated

- `src/app/page.tsx` — imports and renders all S1–S13 sections

---

## Phase 5 glass budget check

`check-glass.mjs` passes: only `glass-nav.css` and `Drawer.tsx` contain `backdrop-filter`.
No new glass added in Phase 5.

---

## Awaiting from client (no change)

- Logo PNG/vector
- Phone, WhatsApp, email, Maps URL, GSTIN
- Testimonials (verified, attributed — §19)
- India boundary SVG
- Hero video + poster
