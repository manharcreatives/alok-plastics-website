# Fix log — Agent A (Hero & Header)

## Iteration 1 — implement
1. Header/glass: transform is `translate3d(-50%,0,0)` in all states (docked = width 100%, left 50%, no overflow); Header.tsx sets no transforms. UtilityBar was never mounted: now first child of `<header>` (in flow, 32px, scrolls away). Floating pill moved to top:40px (32 + 8 gap); docked top:0. Mega panel gets `top` prop (112 floating / 72 docked). Mobile: pill width calc(100% - 16px), tighter inner padding, utility extras hidden < 560px. Scroll state synced on mount.
2. Preloader mounted in layout.tsx (SSR markup is display:none unless html.is-preloading; the <head> script is the single source of truth: session guard, reduced-motion, save-data/2g). Failsafes: head script removes class at 6s; component forces end at 5s (+ timeScale x6 at 4s); Esc / Skip button. Inert goes on `header` + `#main` (previously on <body>, which would have frozen the preloader itself). `suppressHydrationWarning` on <html>. Exit panels were never hidden afterwards (would have covered the page) — now display:none on finalise. Counter was positioned off-screen (rule not `position:relative`) and jumped to 100 immediately (fonts-only task) — now driven by timeline progress. Flanking hairlines were opacity:0 forever and collapsed to 0 width — fixed.
3. FLIP handoff: replaced DOM re-parenting (would duplicate logo / fight React) with a measured transform glide to `.glass-nav__logo svg`; nav logo hidden via `html.is-preloading` until finalise; falls back to fade.
4. H1: clamp(2rem, 4.4vw, 4.5rem) >= 768px with each headline half as a nowrap block (exactly two lines); < 768px balanced wrap (text-wrap: balance). Removed `aria-hidden` on "big machines" (screen readers were skipping it).
5. Scroll cue: bottom-right, hidden < 1024px and < 760px tall, fades after first scroll, reduced-motion via CSS (removed render-time prefersReducedMotion() that caused hydration mismatch).
6. WhatsApp Us: real secondary button (token --whatsapp) via waGeneral(); when number is null it routes to /enquiry (same slot). Tertiary link keeps U+FE0E.
7. Tagline hairlines: now flank only the Devanagari line (own flex row, align-items:center + optical 0.12em nudge); English line below. Preloader hairlines same approach; hidden < 640px.
8. Ambient hero: stronger technical grid, diagonal metallic plate + burgundy edge, label-free technical drawing sheet (bush plan + section, centre-lines, dimension arrows, NO numerals/specs), part silhouettes. Video/poster architecture untouched.
9. Hero height: min-height min(calc(100svh - 32px), 1000px) — grows if content is taller (no clipping at 375x667).

## Verification
- `npx tsc --noEmit` clean.
- check-forbidden / check-spacing pass. check-glass fails only because of src/components/forms/shared.ts (not mine); check-hex fails only on #25D366 / #10003 in enquiry, EnquirySection, Footer, WhatsAppFAB, FullEnquiryForm (not mine; Logo.tsx internal hex is Agent C).
- Not browser-tested (no build allowed). H1 two-line fit is calculated (Archivo wdth125 ~0.66em/char) — worth a visual check at 768/1024/1440.

## Remaining
- WhatsApp number null → button goes to /enquiry; label still says "WhatsApp Us" (Information required from client: number).
- Preloader logo glide depends on Logo svg rendering inside `.glass-nav__logo`.
- Reduced-motion path in preloader.timeline.ts is now unused (preloader skipped entirely).
- UtilityBar copy ("Since 1998", "Pan-Bharat dispatch") unchanged — confirm with client.
