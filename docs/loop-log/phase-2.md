# Phase 2 Loop Log — Motion Engineer

**Date:** 2026-10-01  
**Status:** COMPLETE ✅

## Exit criteria

| Criterion | Status |
|-----------|--------|
| `pnpm run build` — 7 static pages | ✅ |
| TypeScript strict mode | ✅ |
| All 4 lint scripts pass | ✅ |
| Lenis wired via gsap.ticker with ×1000 | ✅ |
| lagSmoothing(0) present | ✅ |
| No standalone rAF loop | ✅ (motion.ts only) |
| Reduced-motion gate — no Lenis under reduced | ✅ |
| Preloader construction sequence — all 8 beats | ✅ |
| Preloader skippable (Esc/click) | ✅ |
| sessionStorage guard (once per session) | ✅ |
| Save-Data detection skips preloader | ✅ |
| role="status" aria-live="polite" | ✅ |
| body inert while running | ✅ |
| 7 motion vocabulary hooks | ✅ |
| /lab/preloader with controls | ✅ |

## Files created this phase

| File | Purpose |
|------|---------|
| `src/lib/motion.ts` | Lenis+GSAP wiring (×1000, lagSmoothing(0), one rAF) |
| `src/lib/preload.ts` | Asset preloader (fonts, poster, video, images) + session guard |
| `src/hooks/useReducedMotion.ts` | Reduced-motion gate hook + `prefersReducedMotion()` utility |
| `src/hooks/useMotion.ts` | 7 motion vocabulary hooks (mask-rise, draw-rule, diagonal-wipe, lock-reveal, light-sweep, odometer, nudge) |
| `src/components/layout/LenisProvider.tsx` | Client-side Lenis mount/unmount provider |
| `src/components/preloader/Preloader.tsx` | Overlay component with full construction sequence |
| `src/components/preloader/preloader.timeline.ts` | GSAP timeline builder with all 8 beats + FLIP exit |
| `src/components/preloader/preloader.css` | Overlay CSS — all states including reduced-motion |
| `src/app/lab/preloader/page.tsx` | Lab page (server) |
| `src/app/lab/preloader/PreloaderLabClient.tsx` | Lab controls (Replay / Slow-mo / Reduced / Step) |

## Bugs fixed this phase

- `Logo.tsx` did not forward ref — added `forwardRef<SVGSVGElement>` so Preloader can hold the SVG ref for FLIP handoff
- `preloader.css`: `margin-top: 32px` was in the 28–36px forbidden zone — changed to `var(--space-lg)` (40px)

## Self-check results

- [x] `grep -rn "requestAnimationFrame" src/` — 0 results (motion.ts uses gsap.ticker only)
- [x] ×1000 multiplication exists in motion.ts
- [x] lagSmoothing(0) exists in motion.ts
- [x] No Lenis instantiation inside reduced-motion path
- [x] Preloader Esc/click skip sets `tl.timeScale(4)`
- [x] sessionStorage guard in `shouldShowPreloader()`
- [x] Save-Data detection in `shouldShowPreloader()`
- [x] body `inert` set/cleared in Preloader.tsx
- [x] All 4 lint scripts pass

## Known limitations (resolved when client delivers assets)

- Logo SVG named elements (#A-ribbon, #LO-core, #K-arm) target the placeholder geometry. The GSAP clip-path reveals in preloader.timeline.ts will work correctly once the real traced logo paths are available.
- FLIP handoff to navbar slot requires the Navbar component (Phase 3) to mount with a `navLogoSlotRef`. Until then, a fallback opacity crossfade is used.
- Playwright video recording of preloader sequence not yet captured (requires dev server + Playwright session).

## Next: Phase 3 — Hero & Navbar (hero-nav-engineer)
- Glass navbar (exact §9.1 CSS: saturate(180%), -webkit-backdrop-filter, pill → dock transition)
- HeroMedia 3 modes (ambient/poster/video)
- Values ribbon (marquee with reduced-motion static fallback)
- Hero headline entrance animation (SplitText, after preloader)
