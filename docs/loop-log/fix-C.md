# Fix C — Journey, Map & Trust

## Changes
- JourneyOrbit.tsx: pin length now (markers-1) x 55vh = ~275vh (was 500vh). Layout switch is CSS-only (pinned arc >=1024px with motion allowed; otherwise a static vertical timeline with all six markers). ScrollTrigger lives in gsap.matchMedia with the same query, so it reverts fully (no stale pin-spacer) on resize/query change. Reduced-motion = static timeline. Pinned section padding reduced to --space-xl; SVG max-height tied to viewport so content fits the pin. Removed hard-coded rgba shadow, 3px radius, duplicate year text.
- PanIndiaMap.tsx + new indiaDots.ts: dot-matrix India rasterised from a coarse outline; Chandigarh pulse; 7 dispatch arcs to unlabeled generic directions; HTML legend ("Origin — Chandigarh", "Pan Bharat delivery network"); single in-SVG label with leader line inside the viewBox; auto-fit responsive grid; animation via CSS with prefers-reduced-motion gate. Removed zone chips and "all major Indian states" claim.
- TrustQuote.tsx: signals now Manufacturing since 1998 / 70%+ repeat customers / Automatic moulding machines (consistent quality & faster production). Removed "uninterrupted", per-batch checking, packaging, Chandigarh-facility claims and the drafted pull-quote (client USP quote already shown in RequirementToRepeat). Testimonials slot still hidden while empty. Grid is auto-fit (no 375px overflow).
- journey.ts (markers only): TODO(client) comments added; text unchanged (marked verbatim from brief §5.7).

## Flagged for client verification
- 2000s marker: decade narrative.
- 2010s: "strengthens manufacturing capabilities", "different parts of India".
- 2020s: decade placement of the 20 Cr+ milestone (figure itself is verified).
- Today: "plastic and steel products" range claim; "across India".
- The Future: expansion plans publicly stated?
- PanIndiaMap intro sentence (drafted from verified facts) needs approval.
- Outside my files: uspChain "Manufacture"/"Supply" copy in journey.ts (Agent B) contains the unverified "Chandigarh facility"/"packaging" claims.

## Verification
tsc --noEmit clean; check-forbidden/glass/hex/spacing report nothing for these files. No next build run; not browser-tested (pin height by construction).
