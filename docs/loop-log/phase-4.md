# Phase 4 — UI Library (ui-builder)

**Status:** COMPLETE  
**Build:** ✓ 10 static routes, 0 TypeScript errors, check-glass 2/2, check-spacing clean

---

## Files created

| File | Description |
|------|-------------|
| `src/styles/ui.css` | All pseudo-class states for primitives: button hover/focus/active/disabled/loading, light-sweep animation, tag states, card hover lift, divider variants |
| `src/components/ui/Button.tsx` | 5 variants (primary · secondary · on-burgundy · whatsapp · ghost), 3 sizes (sm/md/lg), loading spinner, light sweep via CSS `::after`, ↗ icon nudge, focus rings, disabled state |
| `src/components/ui/TextLink.tsx` | Burgundy underline link, ↗ arrow with hover nudge |
| `src/components/ui/MicroLabel.tsx` | 0.75rem uppercase micro, optional sequential number, 24px burgundy rule |
| `src/components/ui/SectionHeader.tsx` | MicroLabel + Archivo Expanded H2 + lead + right-aligned link; left and center alignment variants |
| `src/components/ui/Tag.tsx` | Blush bg default, material variant (dot + label), muted variant; built-in MATERIAL_LABELS for nylon/hdpe/ppcp/brass/ss |
| `src/components/ui/Card.tsx` | 4 variants: plain (surface), drawing (crop-mark corners), feature (burgundy), tint (blush); lit top edge §3.9 |
| `src/components/ui/Callout.tsx` | Blush bg, 4px burgundy left border, optional micro heading — matches brand PDF callout style |
| `src/components/ui/Divider.tsx` | Default 1px grey-cloud; diagonal 2px folded-sheet variant; labeled variant with flanking rules |
| `src/components/ui/SpecTable.tsx` | Burgundy thead, canvas/surface striped rows, tabular-nums, `<th scope>`, scrollable overflow |
| `src/components/ui/index.ts` | Barrel export of all primitives + their types |
| `src/app/lab/components/page.tsx` | `/lab/components` — full showcase of all §15.1 primitives with all variants |

## Files updated

| File | Change |
|------|--------|
| `src/app/globals.css` | Added `@import "../styles/ui.css"` |
| `src/app/lab/layout.tsx` | Updated lab nav: sticky top: 80px, all 5 lab routes, correct `/lab/` hrefs |
| `src/app/lab/page.tsx` | Added Preloader + Components to lab index list; fixed `<main>` → `<div>` |
| `src/app/lab/swatches/page.tsx` | Fixed nested `<main>` → `<div>` (layout owns main) |
| `src/app/lab/type/page.tsx` | Fixed nested `<main>` → `<div>` |
| `src/app/lab/directions/page.tsx` | Fixed nested `<main>` → `<div>` |
| `src/app/lab/preloader/PreloaderLabClient.tsx` | Fixed nested `<main>` → `<div>` |

## Constraint notes

- **Light sweep** on primary button: pure CSS `::after` + `@keyframes btn-sweep` — "once per hover" achieved via `animation: ... forwards` (stays off-screen after completion, resets on mouseleave)
- **WhatsApp hover**: `color-mix(in srgb, var(--whatsapp) 82%, var(--ink))` — token-only, no hex
- **Lit top edge** (§3 rule 9): `box-shadow: inset 0 1px 0 rgba(255,255,255,.9)` on plain/drawing/tint cards; `rgba(255,255,255,0.18)` on feature (dark bg)
- **Radius**: all components use `var(--radius-card)` (2px) — no rounded-xl, no pills except navbar
- **44px touch targets**: all button variants have `min-width: 44px`; sm height is 36px but width is 44px min
- **Tabular numbers**: `font-feature-settings: "tnum"` in SpecTable
- **No invented content**: lab page uses dummy F-Bush spec data for demo only

---

## Next: Phase 5 — Home Sections (S3–S13)

Sections to build per §13:
- S3: Trust Bar / Proof Points (odometer counters)
- S4: Products Bento (4 group cards, expand-in-place, glare on 01+02)
- S5: Process / How We Work (3-step diagonal)
- S6: Industries Served (bento grid, 7 industry pictograms)
- S7: Journey / Radial Orbital Timeline (pinned)
- S8: India Footprint (dotted India map + city arcs)
- S9: Quality Commitment
- S10: Testimonials / Social Proof (when client supplies)
- S11: Why Alok Plastics (4 differentiators)
- S12: Two-path CTA Block
- S13: Enquiry Section
