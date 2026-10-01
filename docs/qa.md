# QA report (measured 2026-10-01, local static build, headless Chromium)

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| check-hex / glass / spacing / forbidden | all pass |
| `next build` | 40 static pages |
| `check:seo` | 34 HTML files, 28 indexable, 1,624 internal links, 0 errors |
| Horizontal overflow 375 / 768 / 1440 (home + inner pages) | none |
| axe (WCAG 2 A/AA, serious+critical) on 9 routes | 0 violations |
| Playwright tests | smoke + a11y suites in `tests/` |
| Lighthouse (mobile emulation, throttled), home | Perf 53 · A11y 100 · BP 100 · SEO 100 · LCP 12.2 s · CLS 0 · TBT 250 ms |
| Lighthouse, home, gzip (as Hostinger will serve) + preloader skipped | Perf 72 · LCP 5.5 s (simulated slow-4G) · TBT 260 ms · FCP 1.1 s |
| Real Chromium, 4× CPU throttle, no network throttle | LCP 0.5 s, CLS 0 |
| ESLint | 0 errors (8 minor unused-var warnings) |
| Lighthouse, /products/ | Perf 73 · A11y 100 · BP 100 · SEO 100 · LCP 8.7 s · CLS 0 |

## Known gaps / next
- **Home performance is the weak point.** LCP is the hero paragraph, delayed by the first-visit preloader and GSAP entrance under 4× CPU throttling. Options: shorten preloader cap, render hero copy visible beneath the overlay, defer GSAP plugins (SplitText/Flip) to idle. Re-measure after each.
- Not run: cross-browser (Firefox/WebKit), real-device Safari backdrop-filter, Lighthouse CI in pipeline, bundle analyser report.
- Preloader is skipped for automated browsers (navigator.webdriver) and with `?nopreload`, so audits measure the page, not the intro.
- Next speed wins if wanted: trim Devanagari font weights (3 × ~54 KB), lazy-load below-fold GSAP sections.
- .htaccess untested on Apache (verify on Hostinger).
- No hero video / product photos / real contact data yet (placeholders degrade honestly).
