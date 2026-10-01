# Round 2 — Motion Designer critique

Method: Playwright (Chromium 1234) against the live dev server. Frame sequences by CDP screencast and timed screenshots, DOM polling for the count-up and ink indicator, wheel-driven scrolling (real Lenis path), PerformanceObserver longtask plus rAF frame deltas, reducedMotion:'reduce' contexts, 375px mobile pass. Source was read only to explain what the frames showed.

## Headline findings
- Motion is the strongest layer of the site. Journey, Requirement-to-Repeat, Pan-India map and the About hero are brand-specific and smooth. Zero long tasks over 100ms while scrolling any section; rAF p95 is 7ms everywhere, including the 4932px pinned Journey. No uncaught page errors on any route.
- Reduced motion is clean. Home, /about, /products, /industries, /contact: 0 running animations, Lenis not instantiated, no content with effective opacity below 0.9 after scrolling the full page (the three 0.85 hits are the intentional "(optional)" form labels).
- Two real defects: the preloader overlay is visible without the preload class (CRITICAL), and a 404 console error on every route (CRITICAL by definition, benign in cause).

## CRITICAL
1. **Preloader overlay is `display:flex` without the `is-preloading` class.** In `src/components/preloader/preloader.css` the guard `.preloader { display:none }` (line 10) is overridden by the later `.preloader { ... display:flex }` block (line 24): same specificity, later wins. Measured with `?nopreload=1`: the full-screen logo / "SKIP INTRO" / ghost "LIGH" overlay paints for about 480ms on every load (computed display flex, opacity 1 from t=216ms to 698ms; frame 0 of both the `/` and `/about/` sequences is the preloader). With JavaScript disabled it is `flex` forever and covers the whole site (z-index 100). Returning visitors, reduced-motion and Save-Data users, and every hard load after the first get a flash of the intro. Fix: move `display:flex` into `html.is-preloading .preloader` only and delete it from the base `.preloader` block; check `.preloader__panel` and `.preloader__seam` the same way.
2. **Console error on every route:** `GET /data/settings.json 404` (`src/lib/runtime-data.ts`), logged on 7 of 7 routes. The file legitimately does not exist until the admin saves. Fix: ship `public/data/settings.json` (and careers / product-overrides) as real `{}` defaults, or skip the fetch when not needed, so a clean visit logs nothing.

## MAJOR
1. **Hero has no entrance of its own.** `Hero.tsx` has no GSAP or CSS entrance; the only reveal is the preloader panel wipe. After the first load per session (or with the preloader skipped) the headline, Devanagari lockup and two CTAs simply appear. Fix: one mount timeline gated on preloader-done and reduced-motion: headline lines mask rise 900ms `expo.out` with 80ms stagger; hairline rules draw 700ms `power3.inOut`; Devanagari and English lines fade-rise 700ms `expo.out`; CTAs lock in (24px slide along 45deg, `back.out(1.4)`) with 200ms stagger.
2. **Easings and durations outside the allowed set are used widely.** Preloader timeline uses `power2.inOut/in/out`, `power3.out`, `'none'` (10 places in `preloader.timeline.ts`); AboutIntro count-up uses `power3.out`; about 35 CSS transitions use `ease` or `ease-in-out`; hero sweep is 9s, ken-burns 20s. Not visually wrong, but it breaks the stated system. Map `power2.*` to `power3.inOut`, `*.out` to `expo.out`, CSS `ease` to `cubic-bezier(.16,1,.3,1)` at 200 or 400ms.
3. **Hero scroll cue animates `top`** (`@keyframes hero-scroll-dot`, `Hero.tsx` line 70): a layout property, forbidden by section 12.3, run forever. Use `transform: translateY()` as `PageHero` already does (`ph-cue`).
4. **WhatsApp FAB pulses forever via `box-shadow` keyframes** (`fab-pulse`, 2.4s `ease-in-out infinite`): paint-triggering and endless. Replace with a ring pseudo-element animated by `transform: scale` and `opacity`, fired twice then stopped (already off under reduced motion).

## MINOR (also appended to backlog.md)
- Infinite SVG pulses (`jrn-pulse`, `pim-pulse`) keep running while their sections are off-screen (seen running at idle at page top on `/` and `/about/`). Pause via IntersectionObserver.
- Hero ambient light sweep loops every 9s; the spec says a sweep crosses once. Use a single 1200ms `expo.inOut` pass.
- Journey: when parked mid-swap, year/title/body are half-masked (title clipped at 2020s, a body line cut at "Today"). Shorten the swap window or add a hold. The "20 Cr+" stat sits about 24px under the body copy at 2020s; give it 40px.
- Journey and mobile skyline: a stray 2px burgundy dash with a thin vertical sliver (desktop x~778,y~775; mobile x~215,y~420) reads as a rendering artefact.
- Nav: the ink glide begins about 450ms after the click (waits for route paint). Start it on click and reconcile on route change.
- RequirementToRepeat: per-node `once:true` reveal (start `top 90%`) plus the scrubbed timeline could double-fire on fast scroll; verify.
- Industries: the core-market illustration is static; a one-time stroke draw (900ms `power3.inOut`) would match the rest.

## Scored matrix (out of 10)
Composition and Type only counted where they interact with motion; "n/a" allowed.

| Route · Section | Composition | Brand | Type | Motion | A11y (reduced-motion) | Score | Top 3 fixes |
|---|---|---|---|---|---|---|---|
| Global · Preloader | n/a | 9 | n/a | 8 | 4 | 6.0 | (1) CRITICAL: scope `display:flex` to `html.is-preloading` (no-JS and returning visitors see the overlay); (2) MAJOR: power2/none eases to the allowed set; (3) MINOR: make Skip the first focus stop |
| Home · Nav (ink, mega panel, CTA) | 9 | 9 | 9 | 9 | 9 | 9.0 | (1) MINOR: start ink glide on click; (2) MINOR: CTA light sweep once per hover-in, 700ms; (3) MINOR: 0.2s `ease` to expo.out cubic |
| Home · Hero | 8 | 8 | 9 | 5 | 9 | 7.0 | (1) MAJOR: mount timeline (mask rise 900ms `expo.out`, rules draw 700ms `power3.inOut`, CTA lock `back.out(1.4)`); (2) MAJOR: cue `top` to `translateY`; (3) MINOR: ambient sweep once, not 9s loop |
| Home · ValuesRibbon / parts schedule | 8 | 9 | 8 | 8 | 9 | 8.4 | (1) cap the diagonal cell wipe stagger at 80ms so the right half is not empty for long; (2) single sweep pass, not 9s loop; (3) `ease` to expo.out |
| Home · AboutIntro (count-up) | 8 | 9 | 9 | 8 | 9 | 8.6 | (1) MINOR: `power3.out` to `expo.out` 1200ms or `power3.inOut` 2400ms (about 70% of each number lands in the first 1.1s); (2) delay body fade 200ms so the heading mask-rise does not overlap the first paragraph; (3) protect the landing sweep |
| Home · ProductGroups | 8 | 8 | 8 | 7 | 9 | 8.0 | (1) hover transitions on CSS `ease` 0.4s to expo.out 400ms; (2) card top-rule draw is excellent, add to focus-visible; (3) cards enter with diagonal wipe 1200ms `expo.inOut`, 80ms stagger |
| Home · RequirementToRepeat | 9 | 9 | 8 | 9 | 9 | 8.8 | (1) verify no double reveal (scrub plus per-node once); (2) "REPEAT SUPPLY" label should fade with the arc end; (3) keep the 45deg staircase |
| Home · IndustriesBento | 9 | 9 | 8 | 8 | 9 | 8.6 | (1) draw the core-market illustration once, 900ms `power3.inOut`; (2) cap art scale at 400ms; (3) show the application-line wipe on the first card without hover to teach it |
| Home · JourneyOrbit (pinned) | 9 | 10 | 9 | 9 | 9 | 9.2 | (1) MINOR: shorten half-masked swap window; (2) MINOR: 40px under the "20 Cr+" stat; (3) MINOR: remove stray skyline dash. Marker travels the road, year/title swap like credits, no box, no overlap at rest, 0 long tasks across 4932px |
| Home · PanIndiaMap | 9 | 9 | 8 | 9 | 9 | 8.8 | (1) pause `pim-pulse` off-screen; (2) legend line icons draw in sync with their arc; (3) keep unlabelled arcs |
| Home · TrustQuote | 8 | 9 | 9 | 8 | 9 | 8.6 | (1) rule draw 1200ms `power3.inOut` is good; (2) quote marks could lock 24px at 45deg `back.out(1.4)`; (3) nothing urgent |
| Home · Enquiry / Footer / FAB | 8 | 8 | 8 | 6 | 9 | 7.6 | (1) MAJOR: FAB pulse to transform ring, twice then stop; (2) footer links nudge arrow 200ms; (3) form success: check mark `stroke-dashoffset` 700ms |
| /about/ · PageHero | 9 | 10 | 9 | 10 | 9 | 9.4 | (1) none critical; (2) protect the A-ribbon fold, ray fan and Devanagari outline draw; (3) `ph-cue` already transform-only |
| /products/ · hero and groups | 8 | 8 | 8 | 8 | 9 | 8.2 | (1) match /about/ hero staging; (2) part-card light sweep once, 700ms; (3) filter chips glide rather than swap |
| /industries/ · hero art | 8 | 8 | 8 | 8 | 9 | 8.2 | (1) `ih-in` diagonal wipe is on-brand; (2) 80ms stagger across the sheet; (3) keep reduced-motion kill |
| /contact/, /enquiry/, /career/ | 8 | 8 | 8 | 7 | 9 | 8.0 | (1) field focus underline `scaleX` 400ms `expo.out`; (2) map loader opacity only; (3) clear the 404 console error |

Average of the 15 rows: **8.3 / 10** (8.5 excluding Preloader).
Lowest: Preloader (6.0, CRITICAL overlay bug), Hero (7.0, no entrance of its own, `top` keyframe), Enquiry/Footer/FAB (7.6, FAB pulse).

## Excellent — protect these
- **Pinned Journey roadmap.** The marker follows the S-curve road, a burgundy progress stroke trails it, year and title swap credit-style at the left with no box, resting positions at each stone are clean, p95 frame time 7ms across the whole pin. The mobile version (vertical rail, scrubbed fill) has no horizontal overflow and no errors.
- **Nav.** The mega panel stays open along a straight path from Products down into the panel (opacity 1 at all 25 samples, links reachable, closes cleanly on leaving). The ink indicator glides with a rule that stretches ahead and a diamond notch that trails by about 200ms (x 658 to 816 to 940, settling in about 500ms), a genuinely Alok-specific detail.
- **/about/ PageHero.** Folded A-ribbon, converging ray fan, Devanagari outline draw: the most on-brand motion on the site.
- **Requirement-to-Repeat chain.** Staircase nodes lock in with `back.out(1.4)`, connectors draw by `stroke-dashoffset`, dashed loop arc closes the cycle; scrubbed so it follows the reader.
- **Pan-India map.** World dots, India outline draw, then unlabelled arcs sequentially; honest copy.
- **AboutIntro count-up.** Counts smoothly on scroll-in, staggered 0 / 160 / 320ms, over about 2.5s, never jumps (measured at 100ms intervals), then a light sweep on landing.
- **Reduced-motion discipline.** Zero running animations, Lenis absent, nothing hidden; every reveal has a static fallback.
