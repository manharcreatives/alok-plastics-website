# P7 — Company pages (/about, /industries, /career)

Pass 1: implemented three routes + src/components/about/{parts.tsx,aboutContent.ts}. tsc clean; check-forbidden/glass/hex/spacing report nothing for these files.
Pass 2 (self-critique fixes): About h1 no longer duplicates JourneyOrbit's h2; vision/mission/values moved to white section so no two same-bg blocks run into the pinned journey; career roles list filters `published` and renders typed fields; industries heading de-claimed.

Decisions
- Layout already provides <main id="main">; pages use fragments (one main landmark).
- Titles use `{ absolute }` to avoid the root template doubling the suffix.
- JourneyOrbit reused unmodified: pin is gated by a desktop + no-reduced-motion media query, so it is not pinned on mobile.
- Vision/mission/values are verbatim MASTER_PROMPT §5.2-5.4 (not in content/*.ts; stored in components/about/aboutContent.ts).
- Process-step descriptions come from journey.ts (flagged COPY: needs client approval).
- Not verified visually (no build allowed).

Needs client info: phone/email/WhatsApp (career CV mailto switches on once email is set); open roles; confirm journey decade placements and step copy.
