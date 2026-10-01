# Phase 3 — Hero · Nav · Engineer

**Status:** COMPLETE  
**Build:** ✓ 7 static routes, 0 TypeScript errors, check-glass 2/2

---

## Files created

| File | Description |
|------|-------------|
| `src/components/hero/HeroMedia.tsx` | Three render modes: ambient (canvas grid + part silhouettes + pointer parallax + 9s sweep), poster (Ken Burns), video (client-inject, IntersectionObserver pause, WCAG 2.2.2 control) |
| `src/components/hero/Hero.tsx` | Full hero section: `100svh`, eyebrow rule, H1 Archivo Expanded, "big machines" metal gradient, sub, Devanagari tagline with hairlines, 2 CTAs + tertiary link, scroll cue, diagonal exit clip-path + 2px folded-sheet rule |
| `src/components/hero/ValuesRibbon.tsx` | 56px `--surface` band, continuous marquee, 45° burgundy diamond separators, hover/focus pause (WCAG 2.2.2), aria-hidden duplicate track, static under reduced-motion |
| `src/components/layout/Header.tsx` | Glass navbar coordinator: UtilityBar + glass-nav + NavMegaPanel + Drawer. Scroll state machine: floating pill → docked → hide/show |
| `src/components/layout/glass-nav.css` | §9.1 LOCKED spec: `blur(14px) saturate(180%)`, inset highlight, `--docked` and `--hidden` states |
| `src/components/layout/NavMegaPanel.tsx` | Solid `--surface` mega panel: 4 group columns + burgundy feature tile, hover-intent 150ms, Esc + arrow key nav |
| `src/components/layout/Drawer.tsx` | Glass mobile drawer (2nd backdrop-filter file), diagonal clip-path, focus trap, body `inert`, `data-lenis-prevent` |
| `src/components/layout/UtilityBar.tsx` | 32px `--mist` utility bar |
| `src/components/layout/LenisProvider.tsx` | Client mount for Lenis (side-effect only; `children` optional) |

## Files updated

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Wired `Header` + `LenisProvider`; `<main id="main">` wrapper owns all page content |
| `src/app/page.tsx` | Replaced Phase 0 placeholder with `<Hero />` + `<ValuesRibbon />` |
| `src/components/layout/NavMegaPanel.tsx` | Fixed: `ProductGroup` has no `.products`; now derives per-group products from `anchorParts` slugs joined with `products` array. Fixed `Pictogram` size from invalid `16` to `24` (overridden to 16×16 via style). |
| `src/components/layout/LenisProvider.tsx` | Made `children` optional (layout uses it as a side-effect mount, no wrapping) |

## Constraints verified

- **Glass:** exactly 2 files — `glass-nav.css` + `Drawer.tsx` ✓ (check-glass 2/2)  
- **100svh** used throughout hero — never `100vh`  
- **"big machines" metal gradient** — only gradient text on the page (§11.5)  
- **Devanagari tagline** — `विश्वय` brand spelling preserved (§2.7)  
- **Forbidden spacing zone 28–36px** — none introduced  
- **Honesty rule §19** — no invented numbers, certifications, or unverified claims  
- **prefers-reduced-motion** — `prefersReducedMotion()` gates: scroll cue, hero sweep, Ken Burns, scroll-dot animation, marquee motion  
- **WCAG 2.2.2** — video pause/play button present; marquee pauses on hover/focus  
- **Static export** — all 7 routes pre-render cleanly (`output: 'export'`)

## ADRs

No new ADRs. ADR-005 (lab routes at `/lab/`) already in `docs/decisions.md`.

---

## Next: Phase 4 — UI Builder

Primitives: `Button`, `Badge`, `Card`, `SectionHeader`, `Divider`, `Tag`, `Tooltip`, `Skeleton`.  
Lab page: `/lab/primitives` showcasing all primitives.
