# Phase 1 Loop Log — Brand Systems

**Date:** 2026-10-01  
**Status:** COMPLETE ✅

## Exit criteria

| Criterion | Status |
|-----------|--------|
| `pnpm run build` — 6 static pages | ✅ |
| TypeScript strict mode | ✅ |
| check-hex passes | ✅ |
| check-spacing passes | ✅ |
| check-glass passes (0 files — Phase 3) | ✅ |
| check-forbidden passes | ✅ |
| Logo component — 3 variants, full/mark lockups | ✅ |
| Logo TODO(client) logged | ✅ |
| 20 pictograms exist, currentColor | ✅ |
| Typography CSS — full fluid scale | ✅ |
| /lab/swatches — all 24 tokens + 2 gradients + WCAG | ✅ |
| /lab/type — full specimen including Devanagari | ✅ |
| /lab/directions — 3 directions rendered | ✅ |

## Files created this phase

| File | Purpose |
|------|---------|
| `src/styles/typography.css` | Full fluid type scale §7.2 + section-label + metal gradient + callout |
| `src/app/globals.css` | Updated: imports typography.css, adds font-family tokens to @theme |
| `src/components/brand/Logo.tsx` | Logo component — color/white/bright × full/mark, gradient defs, TODO(client) |
| `src/components/brand/Pictogram.tsx` | 20 custom SVG pictograms (10 parts + 7 industries + 3 machines) |
| `public/brand/alok-logo-color.svg` | Placeholder color SVG for light backgrounds |
| `public/brand/alok-logo-white.svg` | Placeholder white SVG for burgundy backgrounds |
| `public/brand/alok-logo-bright.svg` | Placeholder bright SVG for dark photos/video |
| `src/app/lab/layout.tsx` | Lab nav shared layout |
| `src/app/lab/page.tsx` | Lab index |
| `src/app/lab/swatches/page.tsx` | Colour token reference + live WCAG contrast ratios |
| `src/app/lab/type/page.tsx` | Full type specimen + Devanagari tagline at all sizes |
| `src/app/lab/directions/page.tsx` | 3 moodboard directions with hero/card/proof strip |
| `docs/decisions.md` | ADR-005: lab routes at /lab/ not /_lab/ |

## Decisions

- **ADR-005**: Lab route URL is `/lab/` not `/_lab/` — Next.js App Router treats `_` prefix as "private folder" (excluded from routing). Lab pages have `robots: { index: false, follow: false }` and will be excluded from sitemap.
- **Pictograms**: All 20 drawn from scratch on a 48×48 grid (1.5px stroke, squared caps/joins, currentColor). Engineering-style, no Lucide/Tabler glyphs. These are structural placeholders — final refinement after client supplies product photos for reference.
- **Logo**: Placeholder geometric approximation of the ALOK wordmark structure. All 3 variants use correct brand token colours. TODO(client) clearly logged. Final logo requires client-supplied PNG or vector.

## TODO(client) items logged this phase

- `TODO(client): provide logo PNG at /brand/alok-logo-primary.png` — Logo.tsx
- All existing TODO(client) items from Phase 0 remain open (client-questions.md)

## Next: Phase 2 — Motion Engineer
- Lenis + GSAP wiring (one rAF loop, ×1000, lagSmoothing(0))
- Preloader construction sequence (§10.3)
- Motion vocabulary utilities (mask-rise, draw, diagonal-wipe, lock, light-sweep, odometer, nudge)
- /lab/preloader with Replay/Slow-mo controls
- Reduced-motion gate throughout
