# PROMPT — TASK 1: Alok Plastics Design & UX Overhaul

> **How to use:** paste this whole file as your instruction to Claude Code.
> It is **loop-safe**: sections marked `STATE` are read at the start of every cycle and
> written back at the end, so each run improves on the last instead of restarting.

---

## 0. READ FIRST, IN THIS ORDER

Do not touch a single file until you have read all five completely.

| # | File | Why it matters |
|---|---|---|
| 1 | `docs/MASTER_PROMPT.md` (1174 lines) | The constitution. §2 brand lock, §3 design language, §3.2 anti-slop filter, §19 honesty, §25 gates are **absolute**. This prompt does not override them. |
| 2 | `docs/PROMPT-STATE.md` | **STATE** — live scoreboard, open backlog, cycle count. Read at start, update at end. |
| 3 | `docs/decisions.md` | Closed ADRs. Do not relitigate. |
| 4 | `docs/qa.md` | **Measured** numbers, not claims. Your baseline. |
| 5 | `docs/critique/backlog.md` + `docs/loop-log/` | What was already fixed and what is still owed. Do not re-fix. |

**Two traps in this repo:**
- `docs/SESSION_HANDOVER.md` is **stale** — it claims Phases 7–10 are NOT STARTED. They are done. Trust `CHANGELOG.md` and `docs/loop-log/`.
- `docs/catalogue-reconciliation.md` line 9 says *"Catalogue PDF found: No"*. **That is wrong.** The catalogue is at `public/catalogue/spares/catalogue.txt` (extracted text) with 23 page images. Read it.

Then reply in **at most 6 lines**, no code yet: what you are changing, how you will slice it, the agent waves, the one design decision you would most like to argue about, your least-sure risk, and anything you need from me. **Then start. Do not wait for my reply.**

---

## 1. THE MISSION

A real manufacturer in Chandigarh since 1998. Moulded plastic and steel spare parts for water coolers, display counters and deep freezers. The logo is two burgundy ribbons folded around a silver-grey core. *Alok* means light — the brand's job is to bring small essential parts into the light.

**The customer's complaint, verbatim: "the whole design looks AI-generated."**

That is your brief. Not "make it prettier." Diagnose *why* it reads as machine output and remove that cause.

### The definition of done

Someone opens this on a ₹12,000 Android, standing in a workshop. They read two lines. They scroll back up to double-check it wasn't a dream. **That pause is the entire goal.** Lighthouse, axe, the lint gates are table stakes — they exist so the pause survives contact with a real device.

### The failure state I refuse

Anything that could have come from *"make me a landing page, company name is X."*

Apply this test to every section, every cycle: **if this screen were recoloured and dropped into a bank, a SaaS or a law firm and still looked at home, it has failed.**

Every screen must be answerable *only* by Alok Plastics — the logo's folded geometry, the 44° diagonals, a ventilation jalli at 11"×11" and a float valve at Rs. 180, burgundy against machined silver-grey, Plot No-06 Ram Darbar, the parts that keep large machines running.

**Generic is not a style you failed to avoid. It is a failure to try hard enough.**

---

## 2. DIAGNOSIS — WHERE THE AI TELL ACTUALLY IS

I audited this repo. Do not re-derive these; verify them and go deeper. These are the four causes, ranked by how much each one hurts.

### D1 — Every product image is a placeholder 🔴 **highest impact**

`src/content/products.ts` — all 19 products have `images: []`. So `ProductGallery.tsx` (2.0 KB) and `PartSheetArt.tsx` (8.9 KB) fall back to schematic SVG diagrams. **Nineteen products rendered as the same generated diagram is the single loudest "AI made this" signal on the site.**

Real photography exists and is unused: `public/catalogue/spares/page-001-000.jpg` … `page-022-027.jpg` (23 scans, 10 KB–363 KB).

**Why this dominates:** stock-3D-render and schematic-diagram look are both tells. Real photographed parts on white with hard top light are neither. No amount of animation fixes a fake product photo.

**Do:** crop each page scan to its part, wire into the product, make `PartFinder`, `PartCard`, `ProductGallery`, product detail and search results all consume the real image.

### D2 — The content is still 45 TODOs, so the design has nothing true to show

`products.ts` has **45 `TODO(client)` markers**. The catalogue answers most of them — `catalogue.txt` lines 10–183. Compare:

| Product | Code says | Catalogue.txt actually says |
|---|---|---|
| Ventilation Jalli | `variants: []` TODO | 11"×11" RS 60 · 14"×14" RS 75 · 14"×17" RS 80 · 18.5"×10" RS 130 · PPCP |
| Bracket Handle | `variants: []` TODO | 3" ₹15 · 4" ₹20 · 5" ₹30 · 6" ₹35 · PPCP |
| Handle Lock | `material: undefined` TODO | **Nylon**, Rs. 70/pc |
| Connecting Bush | `price: undefined` TODO | Brass Rs. 200 · Plastic Rs. 190 |
| Waste Coupling | material TODO | **SS**, Rs. 60 |
| L-Type Hinge | material TODO | **SS**, Rs. 95 |
| U-Type Door Spring | material TODO | **SS**, Rs. 100 |
| L-Hinge Door Spring | material TODO | **SS**, Rs. 249 |
| SS Kabja 202 | material TODO | 3" Rs. 24 · 4" Rs. 32 · **SS** |
| Three Core Plug | TODO | 2.5 m Rs. 160 · 3 m Rs. 200 |
| Push Cocks | price TODO | Light Rs. 280 · Heavy Rs. 300 · Brass |
| PUF Chemical | TODO | Polyol & Isocyanate, Rs. 270/kg |

**Why it matters for design:** a spec table full of empty rows reads as a wireframe. Real variant chips (`RS 60 · RS 75 · RS 80 · RS 130`) give the page texture and density that placeholder space never will.

### D3 — The phone number is `null`, so every conversion path is dead

`src/content/site.ts` lines 29–33 — `phone`, `whatsapp`, `email`, `mapsUrl`, `gstin` all `null`. `whatsapp.ts:17` returns `null`, therefore **the WhatsApp FAB, every product CTA, the utility bar and `tel:` links render nothing.**

The catalogue footer carries it: **`+91 7479497003`** (`catalogue.txt` lines 9, 26, 37, 49, 58, 68, 75, 82, 90, 102, 110, 117, 124, 130, 136, 144, 153, 161, 169, 176, 183) and a second number `9915745414` (line 197).

**Why it matters for design:** the primary CTA is the whole conversion path. A dead CTA is not a design bug you can style around.

### D4 — Performance is failing on the exact device in the brief

From `docs/qa.md`: home **Perf 53 · LCP 12.2 s** on throttled mobile. Home JS **386 KB gzipped** against a **170 KB** budget. Root cause: the preloader plus the GSAP hero entrance delay the hero paragraph, which *is* the LCP element.

**A design that scores 53 on the target device is a failed design.** Fix this in the same cycle, not later.

---

## 3. WHAT "NOT AI-GENERATED" ACTUALLY MEANS — THE CHECKABLE LIST

A human-made industrial site has these properties. Verify each on screen.

1. **Real things.** Photographed parts, real measurements, real prices. Nothing generated.
2. **Asymmetry with a reason.** The logo folds — two ribbons, unequal weight, L+O lock. Layouts should resolve to something, not centre everything.
3. **Density where it belongs.** Technical drawings are dense. Spec tables, variant chips, title blocks. Then let it breathe somewhere else. Uniform rhythm = template.
4. **One idea per screen, executed completely.** Not five features, each at 60%.
5. **Type as material.** Archivo at engineered sizes with optical alignment, not Inter at every weight.
6. **Evidence of the machine.** Crop marks, register crosses, dimension rules with end caps, drawing-sheet title blocks. Restrained — one or two per section, per §3.1.
7. **Nothing decorative that is not also functional.** Every hairline, every divider earns its place.
8. **Ear for the buyer.** Someone standing in a workshop needs the part number fast. Respect that over visual flourish.
9. **Restraint.** Generous space is confidence. Cramming is anxiety.
10. **It could only be this company's.** Test: recolour it grey. Does it still feel like Alok? If not, the identity is only paint.

### Rejected on sight (§3.2 + this brief)

Centred hero with a gradient blob · three equal icon-topped cards · purple/blue/cyan/neon · `rounded-2xl` + soft shadow everywhere · fake logo strips · invented testimonials · gears / water-droplet / snowflake icons · emoji · generic lucide icons as decoration · Lorem ipsum dressed as copy · **and the specific ones this repo is prone to**: uniform schematic product art, six-column feature rows, "Why choose us" triads, stock-photo factory handshakes, perfectly symmetric bento grids, icon+label list rows.

---

## 4. THE FIVE LEVERS — in this priority order

Do not reorder. Each lever lists the win, the mechanism, and the trap.

### LEVER 1 — Real product photography 🔴 do this first

**Win:** removes the loudest AI tell in one move.
**Mechanism:** crop `public/catalogue/spares/page-*.jpg` → per-part cutouts → AVIF+WebP, explicit `width`/`height`, `loading="lazy"` below fold → wire into `PartCard`, `ProductFinder`, `ProductGallery`, product detail hero.
**Trap:** a scan has the catalogue footer and website line baked into it. Crop tight and check edges. Never upscale — if a crop is under ~600 px wide, render it as a *spec-sheet* tile instead of pretending it is a photo. **Do not invent product renders with AI.** Missing photo → honest schematic + `TODO(client)`, never a fake photo.
**Reference for treatment:** teenage.engineering, igus.eu — part on pure white, crisp contact shadow, no props.

### LEVER 2 — Responsive as a design material, not a breakpoint switch

**Win:** the target user is on a phone in a workshop. This is where the pause is won or lost.
**Mechanism:**
- Test at **320 / 375 / 414 / 768 / 1024 / 1440 / 1920**. 320 is a hard gate — no horizontal scroll, ever.
- Tap targets ≥ 44×44. One-handed reach: primary CTA within the lower third on mobile.
- `--section-y` already steps 120 → 80 → 56 (`tokens.css`). Verify each breakpoint feels *composed*, not just non-broken.
- Type scale must be fluid via `clamp()`, not three hardcoded sizes.
- **Test with real content lengths.** The longest German/Sanskrit-free string is `Adjustable Leg Insert` at a 3" variant — not "Lorem". Long names, long company names, empty states.
- Thumb-zone the FAB so it never covers a form field or the sticky bar.
**Trap:** desktop-lite (a squeezed two-column grid) is not responsive design. At 375 the composition must be *recomposed*, not reflowed.
**Bonus:** portrait/landscape tilt on phone, and safe-area insets for notched devices.

### LEVER 3 — 3D and depth, machined not glassy

Same theme. Burgundy and machined silver-grey. **No new colour, no new hue.**

**Use these, all CSS/SVG-native — no WebGL library:**
| Effect | Implementation | Applies to |
|---|---|---|
| **Extruded edge** | layered `box-shadow` + 1px `--grey-warm` top-lit hairline, 2px radius | cards, spec panels |
| **Machined bevel** | `clip-path` at 44–46°, per §3 | section edges, buttons, panels |
| **Specular sweep** | one `--metal-gradient-text` pass on hover, **never loops** | CTAs, hero panel |
| **Parallax depth** | 3–5 layers, `translate3d`, rAF-driven, <6% travel | hero, JourneyOrbit, PanIndiaMap |
| **Perspective tilt** | `perspective(1200px)` + `rotateX(2–4deg)`, returns to rest on leave | part finder, product detail |
| **Light sweep on load** | diagonal `clip-path` wipe lower-left → upper-right | section reveals, `back.out(1.4)` |
| **Isometric part** | SVG, 44° axes, `--silver-gradient` faces | empty/placeholder product slots |
| **Depth via occlusion** | one real shadow direction site-wide, from top-left | everything |

**If you consider WebGL/Three.js:** only for the hero part, `dynamic import` on idle, `prefers-reduced-motion` → static poster, and it must fit the **170 KB** budget. My default recommendation is **do not**. CSS-first will beat it here and cost 0 KB. Argue with me if you disagree — that is a legitimate ADR.

**Trap:** `backdrop-filter` is allowed in **exactly two files** — `src/styles/glass-nav.css` and `src/components/layout/Drawer.tsx`. `check-glass.mjs` fails the build otherwise. Layered blur elsewhere = glassmorphism = instant template.

### LEVER 4 — Buttons and controls that feel machined

Current primitives: `src/components/ui/Button.tsx` (5 variants, 3 sizes, spinner), `TextLink`, `Tag`, `Card`, `Callout`, `Divider`, `SpecTable`, `SectionHeader`, `MicroLabel`.

**Improve states, do not invent a new library:**
- **States:** rest · hover · active(`translate(2px,-2px)` nudge) · focus(**2px burgundy ring, 2px offset — non-negotiable**) · disabled · loading · error.
- **Motion:** the `lock` interaction — `back.out(1.4)`, one click, no loop.
- **Shape:** 2px radius. Diagonal 44° cut on primary CTAs only.
- **Feedback:** every press confirms. If nothing visibly happens, it is broken.
- **Hierarchy:** exactly one primary action per viewport. One burgundy block. Never two burgundy sections adjacent.
- **Copy:** verb-first. "Get a quote" > "Submit". Never "Click here".
- **Compare against:** Linear (press physics), Stripe (focus + hierarchy), Vercel (restraint).
- **Buttons must survive 200% zoom** and long translated labels without breaking.

### LEVER 5 — Microcopy that sounds like a person who makes parts

The customer complaint includes AI *copy*, not just AI layout.

- **Banned:** "solutions", "seamless", "elevate", "unlock", "empower", "cutting-edge", "one-stop", "trusted by thousands", "we're passionate about".
- **Use:** the actual thing. "Ventilation Jalli, PPCP, four sizes." "Brass and plastic connecting bush, 2 to 3 inch." "Tell us the part. We'll take it from there."
- **Voice:** a workshop-floor engineer. Precise, plain, unhurried. Never chirpy, never corporate, never translated-from-English.
- **Hindi/English mix:** the tagline is locked — `भारते शिल्पितम्, विश्वय निर्मितम्` / `Crafted in Bharat, made for the world.` `विश्वय` is the approved spelling. **Do not "correct" it.**
- Every drafted line stays flagged `// COPY: drafted, needs client approval` until the client approves.

---

## 5. RESPONSIVE, 3D & UX — SKILLS TO INSTALL

`.claude/` is currently **empty** in this repo. Install these before starting. Each is a real, useful addition; none are decoration.

### Install into `.claude/skills/`

| Skill | Why this project needs it |
|---|---|
| **`frontend-design`** | Core aesthetic guard. Prevents centred-blob heroes and rounded-2xl reflex. Highest value of the set. |
| **`motion-design`** | GSAP/Lenis choreography, stagger, easing discipline. Directly targets the "floaty vs machined" question. |
| **`webapp-testing`** | Drives Playwright to screenshot 320–1920 and *actually read the PNGs*. Non-negotiable for this brief. |
| **`brand-guard`** *(write this one yourself, see below)* | Encodes §2 tokens + slop filter so **every sub-agent** inherits the rules without re-reading 1174 lines. Highest leverage per line written. |
| **`responsive-audit`** *(write this one)* | Breakpoint matrix runner: overflow check, tap-target audit, contrast vs rendered background. |
| **`perf-budget`** *(write this one)* | Enforces 170 KB JS / <1.5 MB transfer / LCP <2.0 s on every cycle. Stops regressions the moment they land. |

**Write `brand-guard` as a repo skill** — the single highest-value thing in this list:

```
---
name: brand-guard
description: Use before and after ANY edit to src/ in the Alok Plastics repo...
---
ALWAYS: colours only from src/styles/tokens.css (check-hex enforces).
NEVER: radius > 2px · backdrop-filter outside glass-nav.css and Drawer.tsx ·
       28–36px gaps · 100vh · pure black · blue/purple/cyan/orange/neon ·
       invented facts (§19) · emoji · gear/droplet/snowflake icons ·
       two adjacent burgundy sections.
ALWAYS: one h1 per page · focus ring 2px burgundy / 2px offset ·
       reduced-motion complete · tap targets ≥44px · 100svh.
```

### MCP / tooling

- **Playwright MCP** — screenshots at 7 breakpoints, plus the frame-by-frame preloader capture.
- **axe-core** — already a devDependency. Keep zero serious/critical.
- Bundle analyser — already wired via `ANALYZE=true`. Run it every cycle; you are over budget.

---

## 6. WHERE FOCUS SHOULD GO — PRIORITISED

Fix in this order. Each row is a real, measured or audited problem — not a guess.

| # | Area | Evidence | Severity |
|---|---|---|---|
| 1 | **Wire real product photos** | all 19 `images: []`; 23 unused scans in `public/catalogue/spares/` | 🔴 CRITICAL — *the* AI tell |
| 2 | **Reconcile catalogue into `products.ts`** | 45 TODOs; all answers in `catalogue.txt:10-183` | 🔴 CRITICAL |
| 3 | **Set phone + WhatsApp = `+91 7479497003`** | `site.ts:29-30` `null` → FAB and every CTA dead | 🔴 CRITICAL |
| 4 | **Home LCP 12.2 s → < 2.0 s** | `qa.md` Perf 53; LCP element is the hero paragraph | 🔴 CRITICAL |
| 5 | **Home JS 386 KB → < 170 KB** | `qa.md`; over budget before any of my work | 🔴 CRITICAL |
| 6 | **Recompose mobile, don't reflow** | brief targets 375 first | 🟠 MAJOR |
| 7 | **Machined 3D depth layer** | §2 forbids glass outside 2 files | 🟠 MAJOR |
| 8 | **Button states + press physics** | §5 quality bar | 🟠 MAJOR |
| 9 | **Section rhythm variation** | §3.2 bans uniform height + uniform reveal | 🟠 MAJOR |
| 10 | **Anti-AI microcopy pass** | §3.2 bans placeholder-as-copy | 🟠 MAJOR |
| 11 | **Devanagari weights 3 → 1** | ~161 KB across 3 weights (`src/fonts/`) | 🟡 MINOR |
| 12 | **Lazy-load below-fold GSAP** | Journey, Map, Requirement chain | 🟡 MINOR |

**Rows 1–3 are prerequisites, not design.** Do them in the first cycle. Designing a page whose CTAs do nothing and whose product photos are fake is theatre.

---

## 7. HOW TO WORK — AGENT-WISE

You are **Orchestrator / Art Director**. You plan, delegate, integrate, judge.

**Do not hand-write every file.** Break each cycle into file-scoped briefs and run them through sub-agents. Reuse `MASTER_PROMPT.md` §20 ownership boundaries exactly so two agents never touch one file in a wave.

### Recreate only the agents this work needs

`.claude/agents/` is empty (gitignored). Create these, with `name` / `description` / `tools` frontmatter and a prompt opening:

> *"Read docs/MASTER_PROMPT.md §[sections] before doing anything. Honesty rule §19 and brand lock §2 are absolute. Only edit the files you own. Report back with: files changed, decisions made, open questions, and self-check results."*

| Agent | Owns | Job |
|---|---|---|
| `product-media` | `public/catalogue/**`, `scripts/crop-*`, `src/components/products/Product*` | Crop scans → per-part assets → wire everywhere |
| `content-architect` | `src/content/**`, `docs/client-questions.md`, `docs/catalogue-reconciliation.md` | Catalogue reconciliation, microcopy, TODO register |
| `contact-truth` | `src/content/site.ts` only | Phone/WA from catalogue, verify every CTA wakes up |
| `perf-engineer` | `src/lib/preload.ts`, `src/components/preloader/**`, `src/app/layout.tsx` | LCP, bundle budget, preloader cost |
| `sections-builder` | `src/components/sections/**`, `src/app/page.tsx` | Home sections S3–S13 |
| `pages-builder` | `src/app/about\|products\|industries\|career\|contact/**`, `src/components/products/**` | Inner pages, product templates |
| `ui-builder` | `src/components/ui/**` | Button/control states, machined depth |
| `responsive-engineer` | `src/styles/globals.css`, `src/styles/ui.css` + any file in the wave | Breakpoint recomposition, 320 gate |
| `design-critic` *(read-only)* | `docs/critique/**` | Brutal screenshot review, scored matrix |
| `qa-auditor` *(read-only)* | `tests/**`, `docs/qa.md`, `.screenshots/**` | Screenshots, axe, budgets, reduced-motion |

### Rules

- **Up to 4 agents per wave**, parallel **only across disjoint ownership**.
- **Contracts first** — tokens (`src/styles/**`) and types (`src/content/**`) ship before anything imports them. Builders import, never redefine.
- **Limited credits:** one wave, one verify, one critique. Do not spawn a second wave before the first is verified. Never spawn two agents on the same file. Prefer one strong general agent over three weak ones when files overlap.
- **Never** deploy, `git push`, install global tools, or delete the client PDFs without asking.
- **Never invent a fact.** No certifications, specs, clients, testimonials, ratings, prices, cities or numbers absent from `catalogue.txt`, `MASTER_PROMPT.md` §5–§6 or the content files. Missing → `TODO(client)` + `docs/client-questions.md` + an honest empty state.
- If an agent violates §2 / §3.2 / §19, **send it back with the rule number.** Do not silently patch it.
- Log each report in `docs/agent-log.md`.
- Write an ADR into `docs/decisions.md` for every elastic call.

---

## 8. THE REVIEW LOOP — EVERY CYCLE, NO EXCEPTIONS

```
PLAN → BUILD → VERIFY → LOOK → CRITIQUE → FIX → RE-VERIFY → REPEAT
```

1. **PLAN** — restate the change, list exact files, map each to the rule it must satisfy.
2. **BUILD** — via agents.
3. **VERIFY** — all green or it does not ship:
   ```
   pnpm typecheck
   pnpm lint          # includes check-hex · check-spacing · check-glass · check-forbidden
   pnpm build
   pnpm check:seo
   ```
4. **LOOK** — screenshot affected routes at **375, 768, 1440, 1920** into `.screenshots/<cycle>/`, then **actually `Read` the PNGs.** Never declare a visual win from code you read.
5. **CRITIQUE** — hand screenshots to `design-critic`. Score 1–10 on: brand fidelity · logo-derived language · composition & hierarchy · originality · mobile quality. Tag every issue **CRITICAL / MAJOR / MINOR** with the rule number and the exact element. One concrete fix per issue — values, not adjectives. Also state what is excellent and **must be protected**.
6. **FIX** — each issue back to the agent owning that file, with the rule and evidence.
7. **RE-VERIFY** — the **full** list, not just the fixed items. Compare before/after. Confirm no neighbouring section broke.
8. **REPEAT** — until zero CRITICAL and no MAJOR on brand lock, honesty or a11y. **Hard cap 5 iterations.** If a CRITICAL survives iteration 5, stop, document, ask me.

Write to `docs/loop-log/<change-name>.md` with ✅/❌ per item.

### Severity

- **CRITICAL** — violates §2 or §19 · breaks typecheck/lint/build · a11y blocker · layout broken at any breakpoint · console error · LCP > 3 s.
- **MAJOR** — reads generic (§3.2) · wrong spacing token · motion not reduced-motion-safe · budget miss · critic score < 7.
- **MINOR** — optical alignment, easing feel, copy rhythm.

**Never lower the bar to make a loop pass.** If something cannot be fixed honestly, say so and leave it flagged. A short honest site beats a long invented one.

---

## 9. THE STANDING BAR — NEVER LOWER IT

### Brand (§2, enforced by lint)
- Every colour from a token. `check-hex` passes. No `#000`. No blue/purple/cyan/orange/neon.
- Green **only** on WhatsApp elements and form success.
- ~61% light / ~28% burgundy / ~11% grey-text. **Max one burgundy block per viewport. Never two burgundy sections adjacent.**
- Spacing by token only — **never a 28–36 px gap.** Belonging things 8–16 px apart; unrelated things ≥ 40 px.
- `backdrop-filter` in **exactly two files**: `src/styles/glass-nav.css` + `src/components/layout/Drawer.tsx`.
- `100svh`, never `100vh`.
- Logo resting state identical to the master (traced at **98.4%** pixel match). Never redrawn, recoloured, stretched, skewed or shape-animated. Correct variant per background.
- Tagline exactly `भारते शिल्पितम्, विश्वय निर्मितम्` / `Crafted in Bharat, made for the world.`

### Accessibility (WCAG 2.2 AA floor)
- Skip link is the first tab stop · semantic landmarks · **one `h1` per page**
- Full keyboard operation · visible 2 px burgundy focus ring, 2 px offset
- Touch targets ≥ 44×44 · **no horizontal scroll at 320 px**
- Contrast measured against **actually rendered** backgrounds, not tokens
- **Reduced motion fully honoured** — no Lenis, no pin, no odometers, no marquee, no video autoplay, no preloader construction. The site must be complete and fully usable static. Test it, don't assume.
- axe: zero serious/critical on every touched route

### Performance (₹12,000 Android, 4G, standing in a workshop)
- LCP **< 2.0 s** mobile · CLS < 0.02 · INP < 200 ms
- Home **< 1.5 MB** excl. video · JS gzipped **< 170 KB** home · inner pages < 120 KB
- Animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`
- Exactly **one** rAF loop. `gsap.ticker` seconds → `lenis.raf()` ×1000. `lagSmoothing(0)`.
- GSAP plugins dynamic-imported per route. Images AVIF+WebP, explicit dimensions, lazy below fold.

### Motion vocabulary — vary deliberately, not everything fades up
`mask rise` (headings) · `draw` (rules, register marks) · `diagonal wipe` lower-left → upper-right · `lock` (`back.out(1.4)`, one click) · `light sweep` (never loops) · `odometer` · `nudge` `translate(2px,-2px)`.

Easings only: `expo.out`, `expo.inOut`, `power3.inOut`, `back.out(1.4)`.
Durations only: **200 / 400 / 700 / 900 / 1200 ms.**
All forward motion points **up-and-right ↗**. Never a plain →. Never ↓ for "next".

---

## 10. THE DESIGN COUNCIL — TWO EXPERTS, WHOLE SITE, EVERY ROUND

You are the orchestrator. **You are not the best designer in the room. Two experts are.**

- **`art-director`** — Awwwards-featured, industrial and editorial. Lens: composition, typography, hierarchy, colour, brand fidelity, section rhythm, whether a screen is genuinely beautiful or merely tidy. Asks: *where does the eye go first? is this derivable from the logo? would this stop a scroll?*
- **`motion-designer`** — interaction and motion. Lens: reveals, transitions, timing curves, easing, choreography, hover states, the preloader, whether movement has intent. Asks: *does this move with purpose or just move? is the stagger right? does it feel machined or floaty?*

They do **not** overlap. `art-director` owns everything static; `motion-designer` owns everything that moves. If A flagged something, B goes **deeper** on it — never re-flags.

### They review everything, not just your diff

Each round: (1) the change under work, full depth · (2) their sweep of **every route**: `/`, `/about`, `/products`, `/products/[group]`, `/products/[group]/[part]`, `/industries`, `/career`, `/contact`, `/enquiry`, `/privacy`, `/terms`, `/refund`, `/not-found`.

**My changes are not the only thing that needs to be excellent — the whole website has to be top-notch.**

### Report format — the scored matrix

| Route · Section | Composition | Brand | Type | Motion | A11y | Score | Top 3 fixes |
|---|---|---|---|---|---|---|---|
| `/products · ProductGroups` | 8 | 9 | 7 | 6 | 9 | 7.5 | stagger uneven on cards 03/04; h2 breaks to 3 lines at 375; divider 1px → 1.5px |

Every fix is **specific and actionable** — actual values, actual selectors, actual before/after. *"Improve the spacing"* is not a review. *"Section padding is 96 px at 1440; §7.4 says 120 px desktop — set `--section-y`"* is a review.

### Where findings go

Merge both reviews into **one prioritised backlog**, then work it inside the loop. This is not advisory:

- **CRITICAL** → fixed this round. Non-negotiable.
- **MAJOR** → enters the backlog and gets worked. The loop does not exit while findings remain.
- **MINOR** → logged to `docs/critique/backlog.md` with a score, worked opportunistically.

Run shape: your changes land → council reviews them **and** sweeps the site → findings become work → loop again → council re-reviews. Repeat until there is **no CRITICAL and the site-wide average hits 8.5+ with no section below 7**.

Write reviews to `docs/critique/<cycle>-<designer>.md`. Keep the backlog in `docs/critique/backlog.md`.

### Council rules
- **Be harsh.** "Looks good" is not a review. If something is excellent, say so **and** say what must be protected — that protects good work from the next round's "improvements".
- **Never lower the bar to end the loop.** More iterations is cheaper than shipping generic.
- **Praise is not a substitute for rigour.** Both, in that order.
- **The council reviews rendered screenshots, not code.** Looking at code is how you ship something that passes lint and dies on screen.

---

## 11. WHEN YOU'RE UNCLEAR — RESEARCH, DON'T STALL, DON'T GUESS

**The one rule: never invent a placement, a pattern or a fact to keep moving.**

The moment you hit any of these, spawn a researcher **immediately**, in parallel with whatever else is safe. Work does not wait. You do not park. You do not guess and quietly pick the safe option.

### Spawn a researcher when
- **"Where does this go?"** — a section or element has no clear home.
- A requirement is ambiguous, or two sections in §8/§13 seem to conflict.
- You don't know whether the repo already solved this somewhere.
- You're choosing between two good options and can't justify either.
- You're unsure how to achieve an effect or technique.
- An asset or value is missing and you're tempted to fake around it.
- A change would touch a locked rule and you can't tell if it's a real violation.
- **You're not confident — and then spawn one anyway.** Confidence you can't justify is the exact moment to research.

### What the researcher does — in order, stops when it has the answer
1. `docs/MASTER_PROMPT.md` — the spec
2. `docs/decisions.md` — a closed ADR already answered it
3. `docs/loop-log/`, `docs/critique/`, `docs/agent-log.md` — precedent
4. The actual code — the pattern may already exist elsewhere in the repo
5. The inspiration libraries below — **for mechanics only**
6. The web, if still open

---

### LIBRARY MAP — verified, not a URL dump

I fetched every one of these. The finding that matters: **these libraries are built for SaaS and dark-mode AI products. Roughly 85% of their catalogue is banned on this site.** A researcher who treats the index as a menu will produce exactly the template the customer complained about.

So this is a **filter table, not a link list.** Use it as-is.

#### ✅ TAKE THE MECHANIC FROM THESE — verified present as of this audit

| Library | Block | The mechanic worth stealing | Apply to Alok as |
|---|---|---|---|
| **ui-incubator.com** | `Product Showcase 360` | drag-to-rotate product viewer | Part detail gallery. **Burgundy/silver only.** Pairs with the real photos from Lever 1 — a fake part rotating is worse than no rotation |
| **ui-incubator.com** | `Product Showcase Exploded` | layered parts separating on axis | Group pages — showing a jalli's 4 sizes fanned out. Engineering-drawing language, not e-commerce |
| **ui-incubator.com** | `Process Path Draw` | SVG path that draws as you scroll | `RequirementToRepeat.tsx` S5 chain — already diagonal, this is the correct upgrade |
| **ui-incubator.com** | `Process Sticky Steps` | sticky column + advancing steps | `/about` journey. Replaces a generic accordion |
| **ui-incubator.com** | `Stats Slot Machine` | digit roll on enter | `ProofStrip.tsx` S3 — **odometer already exists here.** Compare, don't add a second system |
| **ui-incubator.com** | `Hero 3D Tilt` | perspective rotate on pointer | Part finder / product tiles. **Cap at 2–4°, return to rest, respect reduced-motion** |
| **ui-incubator.com** | `About Parallax Image` | multi-layer scroll parallax | Hero + `JourneyOrbit` backdrop. **< 6% travel or it reads floaty** |
| **ui-incubator.com** | `Gallery 3D Wall` | depth-stacked image grid | Product gallery. **Straighten on hover, no perspective-skewed text** |
| **ui-incubator.com** | `Values Parallax Cards` | cards translating at different rates | `ValuesRibbon` / `IndustriesBento` |
| **ui-incubator.com** | `FAQ Accordion` | accessible accordion | `FaqSection.tsx` exists at 2.7 KB — this is already thin, worth the upgrade |
| **lightswind.com** | `Interactive Primitives` | magnetic button, ripple loader, 3D hover | Button press physics (§5 LEVER 4). **Take the spring, drop the magnetism** |
| **lightswind.com** | `Pipeline Visualizers` | node-and-edge process diagrams | Requirement-to-Repeat chain. Industrial vocabulary, not SaaS |
| **lightswind.com** | `Steps` | numbered horizontal stepper | Journey markers |
| **lightswind.com** | `Stats` | count-up + hairline dividers | Already in `ProofStrip`. Rheinmetall pattern, already applied |
| **aceternity** | `Scales` | repeating diagonal line pattern | **This is the one genuinely Alok-shaped background.** Diagonal = the 44° language. Use at 3% opacity, `--grey-metal` |
| **aceternity** | `SVG Mask Effect` | clip-path mask reveal on hover | Diagonal wipe, lower-left → upper-right |
| **aceternity** | `Direction Aware Hover` | hover effect follows cursor direction | Product tiles. Cheap, and it *feels* mechanical |
| **aceternity** | `Timeline` | sticky header + scroll-driven beam | `/about` |
| **aceternity** | `Glare Card` | one specular pass across a surface | `--metal-gradient-text` sweep. **Never loops** — looping glare = glassmorphism |
| **aceternity** | `Cover` | hover reveals speed/coverage | Product tiles. **Plain text, not the black-box treatment** |
| **aceternity** | `Floating Navbar` | hide on scroll down, reveal on up | `Header.tsx` already does this. Verify, don't duplicate |
| **aceternity** | `Stateful Button` | loading → success state on the button | **Directly for the enquiry form.** `Button.tsx` has a spinner but no success state |
| **magicui.design** | 150+ animated primitives | mostly shadcn/ui complements | Lowest value here. Only for a missing primitive (accordion, tooltip) — and rebuild it on tokens |

#### 🚫 REJECT ON SIGHT — these exist in these libraries and are **banned here**

I am naming them so nobody "discovers" them later and thinks they're new.

**aceternity** — `Aurora Background` · `Sparkles` · `Meteor Effect` · `Shooting Stars` · `Glowing Stars` · `Background Beams` (+ With Collision) · `Vortex Background` · `Wavy Background` · `Background Ripple Effect` · `Dotted Glow Background` · `Wobble Card` · `Glowing Effect` · `Spotlight` (radial glow) · `Infinite Moving Cards` · `Card Stack` · `Logo Clouds` · `Animated Testimonials` · `Chromatic Image` (RGB split) · `Encrypted Text` (gibberish) · `Evervault Card` · `Floating Dock` · `Glowing Effect` · `Hover Border Gradient`

**lightswind** — the entire `FinTech & Web3` category · `AI & Neural` · `AI Agents` · `SaaS Sections` · `Pricing` (21 blocks) · `Changelogs` · `DevSecOps` · any `Gradient` / `Glass` / `Neon` block

**uilib.co** — all 4 hero blocks are "animated gradients" / "gradient backgrounds". **The single most on-brand-for-SaaS, most banned category on this site.** Note the page literally lists "Social proof elements" as included — that is a fake-logo-strip tell.

**ui-incubator** — `Testimonials 3D Stack` / `Testimonials Stack Swipe` · `CTA Magnetic Burst` · `Portfolio Cursor Follow` · `Bento Magnetic Cards` · `Banner Gradient` · any `Dark` mood variant

**Global filters — a pulled block is wrong if:**
- its background is a gradient blob, mesh, aurora or beam
- it uses `backdrop-filter` on anything but nav/drawer
- its radius is more than 2 px
- it needs a WebGL/canvas dependency to work
- its palette is not 100% tokens from `tokens.css`
- it animates on an infinite loop
- it has an icon library glyph doing decorative work
- it would not survive being recoloured `--ink` on `--canvas`

### 🚫 The hard part — read twice

These libraries ship **cyan, purple, dark, neon, glassmorphism cards, aurora, sparkles, meteors, liquid glass.** On Alok Plastics all of that is banned by §2.4 and §3.2. The filter table above is the concrete version of this rule — read it before you pull anything.

| Take this ✅ | Never this ❌ |
|---|---|
| How the effect works | Its colours, gradients, glow |
| The easing curve + duration | The visual treatment |
| The interaction model (hover/focus/scroll) | The component's default look |
| The sequencing + stagger logic | Purple/blue/cyan/neon anything |
| The perf technique (transform-only, lazy, rAF) | Glassmorphism outside nav + drawer |
| The structural idea | Aurora, mesh blobs, sparkles, meteors |
| | Pill cards, `rounded-2xl` + soft shadows everywhere |

Everything pulled must be rebuilt onto §2 tokens (`src/styles/tokens.css`) and §3 rules: 2 px max radius, top-lit metal gradient, 44–46° diagonals, up-and-right motion, `backdrop-filter` only in the 2 allowed files.

Check bundle impact — you are **already 2.3× over the JS budget**. Drop any dependency a pulled component drags in that you don't need.

**Budget note:** `pnpm dev` already has `gsap`, `motion`, `lenis`, `fuse.js`, `clsx`. If a block needs `three`, `@react-three/fiber`, `framer-motion` *in addition to* `motion`, or a canvas lib — **do not pull it.** Rebuild in CSS or reject the mechanic. `motion` already covers what Framer Motion does; never install both.

---

### 🔍 Highest-value fetches, in order (verified live)

Do not browse these aimlessly. Go straight to the named block, read its code, take the mechanic.

1. **ui-incubator.com/catalog** → `Product Showcase 360`, `Product Showcase Exploded`, `Process Path Draw`, `Process Sticky Steps`, `Stats Slot Machine`, `Gallery 3D Wall`
2. **ui.aceternity.com/components** → `Scales`, `SVG Mask Effect`, `Direction Aware Hover`, `Stateful Button`, `Glare Card` (and confirm you are **not** pulling `Aurora`/`Sparkles`/`Beams`)
3. **lightswind.com/blocks** → `Interactive Primitives`, `Pipeline Visualizers`, `Steps`
4. **uilib.co/category/hero-sections** → read **only** to understand what makes the *generic* hero generic. Then reject all 4 blocks and design from §3. This is a negative reference, and it is the most instructive one here — it is the shape of the thing the customer is complaining about
5. **magicui.design** → only if a primitive is genuinely missing (accordion, tooltip). Rebuild on tokens. Lowest priority

**If a block's code is not visible without a paid tier, move on.** Do not guess at an implementation and do not stall — spawn a researcher or use CSS-first.

### What the researcher returns
A **recommendation with evidence** (file, rule number, or URL), the options it rejected and why, a confidence level, and the risk of being wrong. Not a survey. A decision.

### What you do
You decide, you record it in `docs/decisions.md` as an ADR, and you move. If confidence is low **and** the call is genuinely mine — brand direction, a claim, a price — that is the **only** thing you bring me, bundled into one question with your recommendation attached. Everything else is yours.

**A blocked agent is a failed agent. Go look.**

---

## 12. HOW TO THINK

Operate like the expert you are, from the first token.

- **Read before you write.** The answer is usually in the repo, the docs, or an existing file. A wrong "fix" that ignores existing work is worse than no change.
- **Decide, don't ask.** You have taste and I trust it over your defaults. Bring decisions, not questions.
- **Screenshots are the truth.** Code can pass every gate and still be wrong on screen. Look.
- **Match the house style.** Every component, spacing token and motion already has a precedent here. A new pattern needs a reason.
- **Smallest correct change.** Solve what's asked. Don't redesign what's working.
- **Evidence beats opinion.** Cite the file, the screenshot, the measurement.
- **My taste > your default.** When in doubt, choose the more disciplined option.
- **Quality is the constraint, time is not.** Five cycles is fine. One generic cycle isn't.
- **If it's ambiguous, resolve it — don't average it.** A clear wrong-but-justified call beats a mushy safe one. Log it and move on.

---

## 13. KNOWN STATE — DON'T REDISCOVER

**Green:** `pnpm build` (40 static pages) · typecheck clean · all 4 brand lints pass · `check:seo` 0 errors · axe 0 serious/critical on 9 routes · no overflow at 375/768/1440 · logo traced at 98.4%.

**Gotchas:**
- Use **`pnpm`** (declared `pnpm@12.4.1`). A stray `package-lock.json` exists — don't let npm rewrite deps.
- MASTER_PROMPT says `/_lab/*`; the actual route is **`/lab/*`** (ADR-005). Gated behind `NEXT_PUBLIC_SHOW_LAB=1`, which `pnpm dev` sets.
- `.claude/` is empty and gitignored. Recreate only the agents this work needs.
- The build output directory is `out/`; `pnpm start` serves it.

**🔴 The single biggest open weakness — home LCP.** Lighthouse mobile 4× CPU: **Perf 53 · LCP 12.2 s** · TBT 250 ms · CLS 0. Root cause: the first-visit preloader plus the GSAP hero entrance delay the LCP element (the hero paragraph). Levers: shorter preloader cap · hero copy readable beneath the overlay · defer SplitText/Flip to idle · lazy below-fold GSAP. **If your change touches hero, preloader or motion, LCP is in scope — measure before and after, put real numbers in `docs/qa.md`.** Do not accept a regression.

**Blocked on the client** — honest placeholders in place, **do not fake around them:** email · GSTIN · Google Maps URL · logo vector master · hero video & poster · testimonials · GA4 ID · social URLs · legal text · reply time. **Phone and WhatsApp are NOT blocked** — the catalogue has `+91 7479497003`.

Full list: `docs/client-questions.md`.

---

## 14. REPORTING — 5 lines, every cycle

```
Shipped:     <one line>
Loop:        <n> iterations · CRITICAL <n> · MAJOR <n>
Gates:       typecheck ✓ lint ✓ build ✓ seo ✓ axe ✓ LCP <before>→<after> · JS <before>→<after>
Decisions:   <ADR refs, or "none">
Next:        <what you're doing>
```

Don't narrate file-by-file. Don't ask permission for routine in-scope work. **Do** ask before breaking a locked rule, inventing a fact, spending real time on something I'd notice, or making a decision that's genuinely mine.

---

## 15. STATE — `docs/PROMPT-STATE.md` 🔄 LOOP MEMORY

**Read at the start of every cycle. Update at the end. This file is what makes each cycle better than the last.**

Keep this template:

```markdown
# Alok Plastics — Design Loop State

## Cycle
current: <n>
scores_history: [<n1>, <n2>, ...]   # site-wide average per completed cycle
stop_condition: no CRITICAL · site average ≥ 8.5 · no section < 7 · cap 5

## Prerequisite ledger            # §2 D1–D4 — must be DONE before design work counts
| # | Item | Status | Evidence |
|---|------|--------|----------|
| D1 | Product photos wired (19/19) | TODO | |
| D2 | products.ts reconciled (0 TODOs) | TODO | |
| D3 | phone + whatsapp = 7479497003 | TODO | |
| D4 | home LCP < 2.0s, JS < 170KB | TODO | |

## Backlog                        # merged from art-director + motion-designer
| ID | Route · Section | Issue | Severity | Rule | Fix | Owner | Status |
|----|-----------------|-------|----------|------|-----|-------|--------|

## Protected                      # excellent work — do NOT "improve" these
- <element> — <why it's right>

## Scorecard                      # §10 matrix, current cycle
| Route · Section | Comp | Brand | Type | Motion | A11y | Score |
|-----------------|------|-------|------|--------|------|-------|

## Rejected approaches             # so the next cycle doesn't retry them
- <approach> — rejected because <reason> (ADR-n)

## Open questions for the client
- <one line each>
```

---

## 16. ABSOLUTE RULES — NEVER BREAK

1. **§19 Honesty** — never invent numbers, names, certificates, cities, testimonials, ratings, prices or specifications.
2. **§2 Brand lock** — no hex outside `tokens.css`; no pure black; no blue/purple/cyan/orange/neon.
3. **Glass budget** — `backdrop-filter` in exactly two files.
4. **`100svh`** always in hero, never `100vh`.
5. **`विश्वय`** — that exact spelling is intentional brand spelling. Do not "correct" it.
6. **Logo** — never redraw, recolour, stretch or shape-animate.
7. **Spacing** — no 28–36 px arbitrary gaps.
8. **Two burgundy sections adjacent** — forbidden. Always separate.
9. **Never deploy, never `git push`, never install global tools** without asking.
10. **Never delete or overwrite the client PDFs** in `Alok Plastics - Client side/`.