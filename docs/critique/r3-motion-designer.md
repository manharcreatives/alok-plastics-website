# Round 3 (council round 2 re-test) - Motion Designer

Method: Playwright/Chromium 1234 against the live dev server; computed-style polling, document.getAnimations(), longtask + rAF frame-delta observers, wheel-driven scrolling (real Lenis path), reducedMotion contexts, 375px touch context. Temporary settings.json with contact.whatsapp written for the FAB test and restored to {"schemaVersion":1}.

## Previous CRITICAL / MAJOR - verification
| Item | Result |
|---|---|
| CRITICAL preloader overlay flash | FIXED. `?nopreload=1`: `.preloader` computed display none/opacity 1 on every sample (no flash). JS disabled: display none. Rule now scoped to `html.is-preloading`. |
| CRITICAL console 404 `/data/settings.json` | FIXED. `public/data/settings.json` exists; 8 of 8 routes (/, /about, /products, /industries, /contact, /career, /enquiry, /privacy) log no console error/warning, no page error, no 4xx after a full scroll. |
| MAJOR hero entrance (`?heroanim`) | FIXED. Headline mask rise (translateY 80 to 0, expo.out, ~900ms), hairline rules scaleX 0 to 1 draw (~700ms), CTAs lock in on the 45deg axis (-17,17 to 0,0) with a back.out overshoot (1.14px past), staggered ~170ms. Clean end state. |
| MAJOR easings/durations | MOSTLY FIXED. CSS `ease` gone (only linear-gradients and the 700ms button spinner `linear`). Preloader/GSAP calls are all in the allowed set. Remaining: `src/hooks/useMotion.ts` line 177 `power2.inOut` (light-sweep helper) and line 217 `power3.out` 1.4s (count-up hook, used by ProofStrip path); art CSS uses `cubic-bezier(.65,0,.35,1)` at 1200ms; hero ken-burns 20s. See MINOR. |
| MAJOR cue animates `top` | FIXED. `hero-scroll-dot` is transform + opacity; computed `top` is static 0; pauses when the cue is hidden. |
| MAJOR FAB box-shadow pulse | FIXED. `fab-ring` pseudo-element, 1200ms, 2 iterations, measured running -> `finished` at iteration 2 (~2.8s). |
| Looping animations pause off-screen | FIXED. Home top: only hero-sweep (single pass) and cue dot. At the map: ap-sweep + pim-pulse. Scrolled past: zero running animations. /about /career /contact idle only `ph-cue` (cheap, transform). |

## Re-tests
- Mega panel: opens on Products hover; opacity 1 at all 20 path samples from link to panel, closes and unmounts on leave. Reachable.
- Nav ink: `--ink-x` is set by 10ms after pointer-down (previously ~450ms after click). Starts on intent. 
- AboutIntro count-up: 0/0/1900/0 to 20/70/1998/100, 14+ distinct steps over ~2.2s, `power3.inOut`, staggered, zero frames over 14ms. Smooth, never jumps.
- RequirementToRepeat: after a 700px-per-tick fling through the section and 2.5s wait, 24 text nodes all at opacity ~1; no double fire, chain/loop arc/"REPEAT SUPPLY" complete.
- Industries hover: art scale 1 to 1.03 and -4px, settles in ~400ms with exp curve (no overshoot). Application-line wipe was not reproducible via my selector; the first card is not teaching the hover (unchanged MINOR).
- Journey pinned (12 positions, 400px steps across 4649px): every settled frame clean (year, title, body, stat, marker on road); no overlap; "20 Cr+" now clear of the body. p95 7.0ms, max 20.9ms, 0 frames over 33ms, 0 long tasks. Remaining: while scroll is moving, the year briefly sits half-masked (2020s clipped at the mask line in a mid-motion frame); resolves within ~300ms.
- PanIndia: world dots, India outline, arcs fan out sequentially; legend present; pulse paused off-screen.
- Inner heroes: /about/ (ray lines pa-draw, A-ribbon) and /contact/ (h1 fades 0 to 1 over ~600ms) animate; /products/ and /career/ h1 is at opacity 1 from the first frame (only art draws) - no mask-rise on those titles.
- Reduced motion (/ , /about, /products, /contact): 0 running animations, no content dimmed, preloader display none.
- Perf (1440): rAF p50 6.9ms, p95 7.0ms on all sections. 375px mobile full-page scroll (19450px): overflowX 0, no errors, p95 7.0ms, but three long tasks of 156/76/65ms during load/first scroll (unthrottled desktop CPU; likely hydration/refresh).

## CRITICAL
None.

## MAJOR
None.

## MINOR (also in backlog.md)
1. `useMotion.ts` `power2.inOut` (L177) and `power3.out` 1.4s (L217): map to `power3.inOut` / `expo.out` 1200ms to finish the easing set.
2. /products/ and /career/ page titles have no mask-rise; match /about/ staging.
3. Journey: half-masked year/title during scroll movement; add a 80ms hold or narrow the swap window.
4. Mobile 375: 156ms long task at load; split ScrollTrigger refresh / defer below-fold GSAP setup (idle callback).
5. Industries: draw core-market illustration once (900ms power3.inOut); teach hover wipe on card 1.
6. Hero ken-burns 20s infinite alternate: pause when hero off-screen (or drop; spec has no ambient loop).

## Scored matrix (out of 10)
| Route - Section | Comp | Brand | Type | Motion | A11y | Score | Top fixes |
|---|---|---|---|---|---|---|---|
| Global - Preloader | n/a | 9 | n/a | 9 | 9 | 9.0 | Skip as first focus stop |
| Home - Nav | 9 | 9 | 9 | 9.5 | 9 | 9.1 | CTA sweep once per hover-in |
| Home - Hero | 8.5 | 9 | 9 | 9 | 9 | 8.9 | pause ken-burns off-screen |
| Home - ValuesRibbon | 8 | 9 | 8 | 8.5 | 9 | 8.5 | cap diagonal stagger at 80ms |
| Home - AboutIntro | 8.5 | 9 | 9 | 9.5 | 9 | 9.0 | protect count + sweep |
| Home - ProductGroups | 8 | 8 | 8 | 8 | 9 | 8.2 | diagonal wipe entry 1200ms expo.inOut |
| Home - RequirementToRepeat | 9 | 9 | 8 | 9.5 | 9 | 9.0 | none |
| Home - IndustriesBento | 9 | 9 | 8 | 8.5 | 9 | 8.7 | illustration draw; teach hover |
| Home - JourneyOrbit | 9 | 10 | 9 | 9.5 | 9 | 9.4 | mid-scroll mask hold |
| Home - PanIndiaMap | 9 | 9 | 8 | 9.5 | 9 | 9.0 | legend icon sync |
| Home - TrustQuote | 8 | 9 | 9 | 8 | 9 | 8.6 | quote marks lock |
| Home - Enquiry/Footer/FAB | 8 | 8 | 8 | 8.5 | 9 | 8.3 | form success check draw |
| /about/ PageHero | 9 | 10 | 9 | 10 | 9 | 9.4 | protect |
| /products/ hero+groups | 8 | 8 | 8 | 8 | 9 | 8.2 | h1 mask rise |
| /industries/ hero | 8 | 8 | 8 | 8 | 9 | 8.2 | stagger across sheet |
| /contact/ /enquiry/ /career/ | 8 | 8 | 8 | 8 | 9 | 8.2 | career h1 entrance; focus underline |

Average of 16 rows: **8.8 / 10** (was 8.3).

## Protect
Pinned Journey (clean at all 12 settled positions, 0 janky frames), About count-up, Requirement-to-Repeat chain, mega panel hover bridge, ink glide with notch, /about/ hero art, hero entrance (mask rise, rule draw, CTA lock), single-pass sweeps, reduced-motion discipline (0 animations).
