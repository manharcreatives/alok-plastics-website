# ALOK PLASTICS — FINAL PROMPT (copy everything below into Claude Code)

---

## ⚡ SECTION 0 — RUN THIS FIRST (environment is not ready)

**Do not skip this. Two of the four verification gates in this project will silently fail without it.**

This machine was audited. These are the **measured** facts, not assumptions:

| Check | State | Action |
|---|---|---|
| Node | ✅ `v24.13.1` | — |
| `node_modules` | ✅ installed (27 top-level packages) | — |
| `tsc --noEmit` | ✅ **clean, zero output** | — |
| `out/` build | ✅ already built (293 files) | — |
| **`pnpm` on PATH** | ❌ **NOT FOUND** | `corepack enable pnpm` — `corepack 0.34.6` is available |
| **Playwright browsers** | ❌ `ms-playwright` absent | `npx playwright install chromium` (~150 MB) |
| **PHP** | ❌ not found | Phase 3 is **blocked** until installed |

### Run these now, in order

```powershell
corepack enable pnpm
npx playwright install chromium
```

`packageManager` is `pnpm@12.4.1`. A stray `package-lock.json` exists — **ignore it, never let npm rewrite deps.**

### 🚨 Two hard stops — do not work around these

**STOP 1 — No screenshots, no design work.** Playwright browsers must be installed before §8 step 4 (LOOK). If they are missing when you get there: **stop, tell me, do not proceed.** Reading code and calling it "visually verified" is **the exact failure mode this whole engagement exists to fix.** A previous agent did that, and the client said the site looked AI-generated.

**STOP 2 — No PHP, no Phase 3.** Phase 3 (admin panel) needs `php -S localhost:8080` for the attack suite. Do Phase 0 → 2 first, then stop and ask.

---

## 1. READ THESE FIRST — COMPLETELY, IN THIS ORDER

Do not touch a file until all eight are read.

| # | File | Lines | Why it exists |
|---|---|---|---|
| 1 | `docs/MASTER_PROMPT.md` | 1174 | **The constitution.** §2 brand lock · §3 design language · §3.2 anti-slop · §19 honesty · §25 gates. Absolute. |
| 2 | `docs/STATE.md` | — | 🔄 **Loop memory.** Read at cycle start, write at cycle end. Create from §14 on first run. |
| 3 | `docs/decisions.md` | 130 | Closed ADRs. Do not relitigate. |
| 4 | `docs/qa.md` | 46 | **Measured** baseline. Not claims. |
| 5 | `docs/admin-panel.md` | 84 | Panel spec + security model. Non-negotiable. |
| 6 | `docs/loop-log/` · `docs/critique/` | 20+ files | What was already fixed. Don't re-fix. |
| 7 | **`public/catalogue/spares/catalogue.txt`** | **199** | 🔴 **Real client data.** Prices, materials, sizes, **phone number**. Nothing reads this yet. |
| 8 | `docs/client-questions.md` | 85 | What is genuinely missing vs what is not |

Then reply in **at most 6 lines** — no code: what you're changing, how you'll slice it, agent waves, the one decision you'd argue about, your least-sure risk, anything you need from me. **Then start. Do not wait for my reply.**

---

## 2. THE MISSION — AND WHY IT IS NOT A DESIGN PROBLEM

The client's exact words: **"pura design AI generated lag raha hai."**

### I investigated. The design is not the problem.

| Slop test | Measured in `src/` | Verdict |
|---|---|---|
| `rounded-2xl` / `xl` / `lg` / `3xl` | **1** site-wide | ✅ not template slop |
| `backdrop-filter` | **exactly 2 files** — `layout/glass-nav.css` + `layout/Drawer.tsx` | ✅ §9 compliant |
| Crop marks, dimension rules, register marks | **30** occurrences | ✅ engineering furniture live |
| `IndustriesBento` spans | `['w7','w5','w4','w4','w4','w5','w7']` | ✅ asymmetric |
| `ProductGroups` | 12-col: row1 `01(7)+02(5)`, row2 `03(5)+04(7)` | ✅ alternating weight |
| `PartCard` | crop marks, 2px top-light `inset`, burgundy draw-on-hover, `back.out(1.4)` | ✅ hand-engineered |

**The tokens, grid, CSS and motion language are award-grade. No AI generator produced this.** Someone hand-built it against §3. A previous agent recommended a redesign — that was wrong.

### The actual cause is one line of code

```tsx
// src/components/products/PartCard.tsx:24
return <span aria-hidden="true" className="p-plate">
  <span className="p-plate__cap">Drawing to come</span></span>;
```

**All 20 products have `images: []`** — verified by counting `images: []` in `products.ts` (20 occurrences, 20 empty, zero populated). Every product card renders the same empty plate saying *"Drawing to come."* Twenty identical placeholders in a neat grid **is** the AI-generated look. Compounding it:

- **45 `TODO` markers** in `products.ts` — 42 are `TODO(client)` plus 3 variant spellings; broken down: `machine` ×12, `material` ×10 (+1 ss note), `sku` ×7, `group` ×3, `variants` ×7, `price` ×2, `hsn`/`moq`/`packing`/`images` ×1 each → hollow spec tables, empty variant lists
- **`phone: null`, `whatsapp: null`** (`site.ts:29-30`) → **every CTA on the site renders nothing**
- **17 `TODO(client)` in `site.ts`** → the same hole on the site-wide content side

**Correct the count before you quote it.** `public/admin/lib/catalogue.php` is a snapshot with **20 entries — 17 `published: true`, 3 `false`** (`three-core-plug`, `puf-chemical`, `bright-chrome`, each commented *"not shown until group confirmed"*). `products.ts` holds **4 groups + 20 products**. Earlier notes in this repo said "19"; that number is wrong. If you find a fourth discrepancy, **trust the file you just read, not a number someone told you.**

### Three conclusions you must not forget

1. **Redesigning will not fix this.** Repaint the layout while the plates still say "Drawing to come" and you have shipped a prettier version of the same complaint on a bigger budget.
2. **The data is already in the repo.** `catalogue.txt` has real prices, materials, sizes and the phone number. **Nobody read it.**
3. **Order is everything: DATA → PERFORMANCE → DESIGN.** Do not open a design file first.

---

## 3. RESOURCES — WHAT EXISTS, WHAT YOU MUST CREATE

### ✅ Exists — build on these, do not rebuild

**Data (unused, and it is the whole ballgame)**
```
public/catalogue/spares/page-001-000.jpg … page-022-027.jpg   28 catalogue scans
                                                      (numbered 000-027, so 28 files)
public/catalogue/spares/catalogue.txt                          extracted text — 199 lines
public/catalogue/spares/blockmap.txt
```
`git status` shows `?? public/catalogue/` — **referenced by nothing in the codebase.**

**Admin panel (PHP, working — extend, never weaken)**
```
public/admin/index.php              21,391 B  router
public/admin/lib/auth.php            9,015 B  sessions, CSRF, brute-force throttle
public/admin/lib/core.php           21,304 B  SQLite (PDO) + JSONL fallback store
public/admin/lib/content.php        11,999 B  saveSettings · saveRoles · saveHidden · validators
public/admin/lib/query.php          11,196 B  enquiry queries
public/admin/lib/catalogue.php       1,250 B  ⚠️ HARDCODED 20-tuple array (17 true / 3 false) — this is the wall
public/admin/lib/web.php             3,474 B
public/admin/lib/views/  15 files = 13 screens + layout.php + error.php:
                          dashboard · enquiries · enquiry · enquiry_delete · role · role_delete ·
                          careers · products · settings · system · audit · login · setup
public/admin/assets/admin.css       16,319 B  ⚠️ READ THIS before writing any new CSS
public/admin/hash.php                5,075 B  password hasher (delete after setup)
```
`content.php` already exports `hiddenProducts()` / `saveHidden()` — visibility toggles work today; **the missing piece is CRUD, not the storage pattern.**

**Design system**
```
src/styles/tokens.css      5,637 B  24 LOCKED hex tokens · spacing · radius · easings
src/styles/typography.css  4,166 B  Archivo · Inter · JetBrains Mono · Noto Devanagari
src/styles/ui.css          7,785 B  button/tag/card/divider states
src/components/ui/         11 primitives (Button · Card · Tag · SpecTable · Callout · Divider …)
src/components/layout/glass-nav.css        ← the ONE allowed glass file (§9)
src/components/hero/ · preloader/ · sections/ (14 sections) · products/ · forms/ · brand/ · art/
```

**Scripts (all must stay green)**
```
pnpm typecheck   → tsc --noEmit
pnpm lint        → eslint + check-hex + check-spacing + check-glass + check-forbidden
pnpm build       → next build  (+ postbuild: prune-lab → generate-sitemap → generate-llms)
pnpm check:seo   → scripts/check-seo.mjs
pnpm test        → playwright (tests/smoke.spec.ts, tests/a11y.spec.ts)
pnpm analyze     → ANALYZE=true next build  (bundle report)
pnpm dev         → sets NEXT_PUBLIC_SHOW_LAB=1, turbopack
```

### ❌ Does NOT exist — you must create it

| What | Where | Note |
|---|---|---|
| Agent definitions | `.claude/agents/*.md` | Empty **and gitignored** (`.gitignore` line `/.claude/`). Recreate per §7 |
| MCP config | `.mcp.json` | **Absent.** Add Playwright MCP |
| Loop state | `docs/STATE.md` | Create from §14 |
| Screenshots | `.screenshots/` | Gitignored. Create |
| Research captures | `.research/` | Gitignored. Create |
| Product image assets | `scripts/crop-*` | You write this |
| Product photos (per part) | `public/catalogue/parts/` | You create |

### 🔧 Install these skills

`.claude/` is empty. Install:

| Skill | Why |
|---|---|
| `frontend-design` | Blocks the centred-blob-hero and `rounded-2xl` reflex |
| `motion-design` | GSAP/Lenis choreography, stagger, easing discipline |
| `webapp-testing` | Drives Playwright → screenshots → **you must open the PNGs** |

**And write these three yourself — highest leverage in the whole engagement:**

```
.claude/skills/brand-guard/SKILL.md       Injects §2 tokens + §3.2 slop filter into every
                                           sub-agent so nobody re-reads 1174 lines.
.claude/skills/responsive-audit/SKILL.md  7-breakpoint overflow + tap-target + contrast pass.
.claude/skills/perf-budget/SKILL.md       Fails the cycle on JS/LCP regression.
```

`brand-guard` frontmatter + body:

```markdown
---
name: brand-guard
description: Use before AND after ANY edit to src/ in the Alok Plastics repo.
---
ALWAYS: colours only from src/styles/tokens.css (check-hex enforces this).
NEVER:  radius > 2px · backdrop-filter outside components/layout/glass-nav.css and
        components/layout/Drawer.tsx · 28-36px gaps · 100vh · #000 ·
        blue/purple/cyan/orange/neon · invented facts (§19) · emoji ·
        gear/droplet/snowflake icons · two adjacent burgundy sections.
ALWAYS: one h1 per page · focus ring 2px burgundy + 2px offset · 100svh ·
        reduced-motion complete · tap targets >= 44px · no scroll at 320px.
```

---

## 4. EXPERIENCE THIS WORK DEMANDS

You have built industrial B2B sites and you have run pre-launch audits. Bring that.

**The 25-year instincts to apply:**

- **A machinist reads a drawing, not a mood board.** Every line should look measured. `Print No-06` in a 1px hairline with end caps (`|—|`) carries more authority than any gradient.
- **Engineers trust precision over adjectives.** "14″×14″, PPCP, Rs. 75" persuades. "High-quality durable ventilation solution" repels. This is a buyer who knows what a jalli is.
- **Density is respect, clutter is anxiety.** Technical drawings are dense and legible because the density is *organised*. Blank space is confidence; cramming is panic.
- **The person using this is standing up, one-handed, in a noisy workshop, probably on a phone, possibly with dusty hands.** Fitts's law, thumb reach, 44px targets, high contrast. Not a desk.
- **A factory that has made one part for 27 years does not need to be impressed. It needs to be believed.** Restraint reads as competence. Ornament reads as a reseller.
- **Deletion is a design act.** The best section on a great industrial site is often the one you removed.

**The specific failure to avoid:** *the previous agent diagnosed "generic cards → redesign."* That instinct is wrong here because it did not open the files. **Ground truth beats pattern-matching, every time.** If you find yourself about to recommend a redesign, stop and read the CSS first.

---

## 5. PHASE 0 — THE UNBLOCKING 🔴 *(design work does not count until all four are DONE)*

### P1 — Product photography

**Source:** `public/catalogue/spares/page-*.jpg` — 23 scans, 10 KB–363 KB. Used by nothing.

1. Read `catalogue.txt` and map each scan to its product.
2. **Crop each scan to just the part.** Every scan has the catalogue footer and `+91 7479497003` printed into the pixels. Crop tight. Verify no text bleeds at any edge.
3. Emit per-product assets: **AVIF + WebP**, max 1600 px, explicit `width`/`height`, to `public/catalogue/parts/`.
4. Wire into `PartCard`, `PartFinder`, `ProductGallery`, product detail hero, search results.
5. **No component rewrite needed** — `PartArt` (`PartCard.tsx:13-25`) already checks `product.images[0]` first. Once images exist the "Drawing to come" branch simply stops rendering.

**Rules**
- **Never upscale.** A crop under ~600 px wide → keep it as a *spec-sheet* tile, not a fake photo.
- **Never AI-generate a product render.** That makes the complaint worse, not better.
- Missing photo → honest schematic + `TODO(client)`. Never a grey box with a broken-image glyph.
- **Do not pad a group** with an extra product to balance a grid. A group with 3 parts shows 3.
- Reference treatment: teenage.engineering, igus.eu — part on white, crisp contact shadow, no props.

**Exit:** zero products show "Drawing to come" where a scan exists.

### P2 — Catalogue reconciliation

`docs/catalogue-reconciliation.md:9` says **"Catalogue PDF found: No."** **That line is false and stale.** The catalogue is in the repo. Fix it and reconcile from `catalogue.txt:10-183`.

`src/content/products.ts` has **45 `TODO(client)` markers**. The catalogue answers most:

| Product | Code today | `catalogue.txt` truth |
|---|---|---|
| Ventilation Jalli | `variants: []` | 11"×11" RS 60 · 14"×14" RS 75 · 14"×17" RS 80 · 18.5"×10" RS 130 · **PPCP** |
| Bracket Handle | `variants: []` | 3" ₹15 · 4" ₹20 · 5" ₹30 · 6" ₹35 · **PPCP** |
| Handle Lock | `material: undefined` | **Nylon**, Rs. 70/pc |
| Connecting Bush | `price: undefined` | Brass Rs. 200 · Plastic Rs. 190 |
| Door Lock | incomplete | Big Rs. 260 · Small Rs. 160 |
| Waste Coupling | `material: undefined` | **SS**, Rs. 60 |
| L-Type Hinge | `material: undefined` | **SS**, Rs. 95 |
| U-Type Door Spring | `material: undefined` | **SS**, Rs. 100 |
| L-Hinge Door Spring | `material: undefined` | **SS**, Rs. 249 |
| SS Kabja 202 | `material: undefined` | 3" Rs. 24 · 4" Rs. 32 · **SS** |
| Three Core Plug | unpublished + TODO | 2.5 m Rs. 160 · 3 m Rs. 200 |
| Push Cocks | `price: undefined` | Light Rs. 280 · Heavy Rs. 300 · **Brass** |
| PUF Chemical | unpublished + TODO | Polyol & Isocyanate, Rs. 270/kg |
| Bright Chrome | unpublished + TODO | Rs. 110 / Rs. 120 |

**Rules:** price stored but **not displayed** while `site.showPrices === false` (§6.4). Material the catalogue does **not** state → **omit the field**, log `TODO(client)`. Do not infer. *"Bright Chrome"* and *"Gasket"* have no material in the file — they get nothing. **Never publish a price the catalogue does not print.**

**Exit:** 0 answerable TODOs remain; reconciliation doc rewritten with real rows.

### P3 — Wake the CTAs

`src/content/site.ts:29-33` — `phone`, `whatsapp`, `email`, `mapsUrl`, `gstin` all `null`.

`catalogue.txt` carries **`+91 7479497003`** at lines 9, 26, 37, 49, 58, 68, 75, 82, 90, 102, 110, 117, 124, 130, 136, 144, 153, 161, 169, 176, 183 — plus **`9915745414`** (line 197) and the address (194–196, already correct in `site.ts`).

- `whatsapp: '917479497003'` — **digits with country code, no `+`, no spaces.** `wa.me/<n>` requires this (`whatsapp.ts:17-20`).
- `phone: '+91 74794 97003'` for display. `telHref()` (`site.ts:140-142`) strips formatting.
- **Verify after setting:** `WhatsAppFAB.tsx`, every `PartCard` CTA, `UtilityBar`, footer, all `tel:` links render. `qa.md` already notes *"Floating WhatsApp button renders only once a WhatsApp number exists."*
- **Still blocked** — leave `null`, add to `docs/client-questions.md`: `email` · `gstin` · `mapsUrl` · `ga4Id` · social URLs. **Do not invent.**

**Exit:** one tap from any product page → call or WhatsApp.

### P4 — Fix the stale docs

`SESSION_HANDOVER.md` says Phases 7–10 NOT STARTED (they are done). `catalogue-reconciliation.md:9` says the PDF is missing (it exists). `MASTER_PROMPT.md` says `/_lab/*` but the route is `/lab/*` (ADR-005). **A stale doc is how the next agent re-derives your work or contradicts it.**

---

## 6. PHASE 1 — PERFORMANCE 🔴 *(the second-biggest lie the site tells)*

`docs/qa.md`: home **Perf 53 · LCP 12.2 s** throttled mobile. Home JS **386 KB** gzipped vs **170 KB** budget — **2.3× over.**

**Why this is design work:** the target user is on a ₹12,000 Android in a workshop. A 12-second load means they leave before reading anything. The design never gets its chance.

### P5 — LCP < 2.0 s
Root cause: first-visit preloader + GSAP hero entrance delay the hero paragraph, **which is the LCP element.** In order:
1. **Hero copy readable beneath the overlay.** Render the paragraph in the prerendered HTML; let the preloader sit *over* it, not replace it. Cheapest, biggest win.
2. **Shorter preloader cap** — in `src/components/preloader/Preloader.tsx`.
3. **Defer SplitText/Flip to `requestIdleCallback`.** Neither is needed for first paint.
4. **Lazy below-fold GSAP.** Measured source sizes — these are *source bytes*, so check what they cost **after** GSAP in the bundle:
   `sections/JourneyOrbit.tsx` 27,113 B · `sections/worldDots.ts` 24,019 B · `sections/PanIndiaMap.tsx` 16,848 B · `sections/RequirementToRepeat.tsx` 14,955 B.
   All four live in **`src/components/sections/`** — `worldDots.ts` is *not* in `art/`.

### P6 — JS < 170 KB
- **Do not assume where the weight is. Measure it first.** `src/lib/analytics.ts` is only **2,368 bytes / 78 lines** — it is *not* the biggest lib and optimising it will not move the number. The largest is `src/lib/seo.ts` at 7,514 B, then `enquiry-schema.ts` 5,141 B, `preload.ts` 4,316 B. Even all of `src/lib` is ~30 KB of source, so **386 KB gzipped is coming from somewhere else — almost certainly GSAP + its plugins and the per-route component graph.** Run `pnpm analyze` and read the report before you touch a single file.
- Noto Devanagari: **3 weights** shipped — `500` (53,620 B) + `600` (53,716 B) + `700` (53,984 B) = **161,320 B in `src/fonts/`**. Drop to **1** weight → saves ~107 KB raw. `typography.css` decides which. This is the single largest *certain* win in this phase.
- Route-split every `gsap` plugin. `CheckTsconfig`/`motion` already covers Framer Motion — **never install both.**
- Also check `src/lib/preload.ts` (4,316 B) — if it eagerly preloads below-fold chunks, that is budget spent on nothing.

### P7 — Render discipline
`<Reveal>` appears **21×**, and every one is in a **page** file — `about` (13), `career` (3), `enquiry` (2), `contact` (4). Zero in `src/components/`. If a below-fold section fades in via JS, the browser already painted it — wasted work and a CLS source. **Anything not near the first viewport must be visible by default**, animating only if already in view. `about/page.tsx` is the worst case: 13 reveals on one route. Verify reduced-motion: the site must be complete and usable with all animation off. `qa.md` claims clean — **verify, don't assume.**

**Exit:** re-measure, put **real numbers** in `docs/qa.md`. Never a claimed number.

---

## 7. PHASE 2 — DESIGN *(now, and only now)*

The CSS is good. You are polishing something already well-built. **Do not redesign what works.** §3 and §3.2 still bind you.

### P8 — Break the 20-identical-cards monotony 🔴
`PartCard` renders identical height, plate and two actions 20 times (17 published on the public grid, 3 held back). With real photos + real variant chips the grid gains texture — then fix rhythm:
- **Variant chips** (`RS 60 · RS 75 · RS 80 · RS 130`) give each card a data edge.
- **Vary card heights and internal composition.** Not every card needs the same three zones.
- Keep `ProductGroups` bento asymmetric — it already is.
- **Honesty:** never pad a group to balance the grid.

### P9 — Depth, machined not glassy 🟠
Same colours: burgundy `#581C25`, machined silver-grey `#737171`. **CSS/SVG only — no WebGL, no new dependency.** You are 2.3× over budget, and `motion` already covers Framer Motion's job — **never install both.**

| Effect | Implementation |
|---|---|
| Extruded edge | layered `box-shadow` + 1px top-lit hairline, 2px radius |
| Machined bevel | `clip-path` 44–46° (§3) |
| Specular sweep | one `--metal-gradient-text` pass on hover. **Never loops** |
| Parallax depth | 3–5 layers, `translate3d`, **< 6% travel** or it reads floaty |
| Perspective tilt | `perspective(1200px)` + `rotateX(2–4deg)`, returns to rest, reduced-motion → none |
| Light sweep on load | diagonal `clip-path` wipe lower-left → upper-right, `back.out(1.4)` |

**Hard limit:** `backdrop-filter` stays in exactly **2 files** — `src/components/layout/glass-nav.css` + `src/components/layout/Drawer.tsx`. `check-glass.mjs` counts files and will fail you.

**Path correction:** the glass file is **`src/components/layout/glass-nav.css`**, not `src/styles/`. Older docs are wrong.

### P10 — Button physics 🟠
`Button.tsx` already has 5 variants, 3 sizes, a spinner. Improve **states**, don't add a library:
rest · hover · active `translate(2px,-2px)` · **focus 2px burgundy + 2px offset** · disabled · loading · error.
`lock` = `back.out(1.4)`, one click, no loop. **One** primary action per viewport. **Never two burgundy sections adjacent.** Every press visibly confirms. Copy verb-first: "Get a quote", not "Submit".

### P11 — Microcopy 🟠
The complaint includes AI *copy*. Banned: "solutions", "seamless", "elevate", "unlock", "empower", "one-stop", "cutting-edge", "trusted by thousands". Use the actual thing: *"Ventilation Jalli, PPCP, four sizes."* *"Brass and plastic connecting bush, 2 to 3 inch."* Voice: a workshop-floor engineer — precise, plain, unhurried, never chirpy. Tagline is locked: `भारते शिल्पितम्, विश्वय निर्मितम्` / `Crafted in Bharat, made for the world.` — **`विश्वय` is the approved spelling. Do not "correct" it.** Every drafted line stays flagged `// COPY: drafted, needs client approval`.

### P12 — Responsive as recomposition 🟡
Test **320 / 375 / 414 / 768 / 1024 / 1440 / 1920**. **320 is a hard gate** — no horizontal scroll, ever. Tap targets ≥ 44×44, one-handed reach in the lower third. `--section-y` already steps 120 → 80 → 56 (`tokens.css`). **Test with real content lengths** — `Adjustable Leg Insert` with a 3" variant, not lorem. Desktop-lite is not responsive: at 375 the composition must be **recomposed, not reflowed.**

### P13 — Duration and rhythm 🟡
Every section currently reads at the same tempo. §3.2 bans "every section the same height with the same fade-up." **Vary deliberately:** one dense spec-table section, one near-empty breather section, one full-bleed statement. Rhythm is what a human hand leaves behind and a template never does.

---

## 8. PHASE 3 — WORKING ADMIN PANEL 🟠 *(blocked until PHP is installed)*

The client must add a product **without a developer and without a rebuild.** Today `views/products.php` is 1,951 bytes and can only hide/show 20 names from a hardcoded array in `lib/catalogue.php`. Its own copy says: *"Adding, renaming, or properly removing a product means editing the product content and rebuilding the website; ask your developer."*

**Kill that sentence.**

### P14 — Architecture (decide first, ADR it)
`next.config.ts` has `output: 'export'`. **A new product slug has no prerendered page until a rebuild.** Solve this before building.

**Recommended: `data/products.json` + a client-side dynamic route.** Admin writes JSON; one catch-all route renders any product; static pages keep build-time data and overlay at hydration (`runtime-data.ts` already does exactly this for settings/careers/overrides).

**State the SEO cost honestly — do not hide it:** prerendered HTML, `sitemap.xml`, `llms.txt` and crawlers see **only build-time** products. A new product is not indexable until a rebuild. Mitigate — every product appears in `/products` and its group page (static, runtime-overlaid), so crawl depth stays 1–2. **Write this limitation in the panel's own help text and the ADR.** The client must not discover it later.

**Rejected:** Node runtime / ISR — violates ADR-001 (Hostinger Premium has no Node.js); would rewrite the working `enquiry.php` and the whole panel for a benefit nobody asked for.

### P15 — Product CRUD
Mirror `src/content/types.ts` exactly — **one contract, not two.** New `views/product.php`, `product_delete.php`. Follow `role.php`/`settings.php`: `validateProduct()` beside `validateRole()`; label above field, help under, error beside, **re-render with values preserved — never lose typed input on a validation error.** That is the most important UX rule in the panel.

- **`bestUse` is not a copy field.** It is what a workshop buyer scans first. Guidance, not marketing: *"Fits 11″×11″ and 14″×14″ jalli cut-outs on display-counter cabinets."*
- **`machine` is a fixed enum** — `display-counter` · `water-cooler` · `deep-freezer`. Free text produces `Deep Freezer`/`deep freezer`/`DF` and breaks the filter. Enforce server-side.
- **`groupId` must exist** in `products.ts`; block the save, list valid ids.
- **`slug` is immutable** after creation — inbound links depend on it. Name changes, slug stays.
- **`summary` ≤ ~90 chars** — renders small in `PartCard`. Enforce.
- **Save `published: false` by default.** One click to publish. Prevents a half-typed product going live.
- **Archive, never hard-delete.** Two-step confirm, mirroring `enquiry_delete.php`.
- **Never `innerHTML`.** `description`/`bestUse` render as text nodes (`admin-panel.md:45`).
- **Never seed a fake product.** Empty is valid (§19). Three known fields beat seven invented ones.

### P16 — Image upload 🔴 highest risk — zero precedent
**`$_FILES` appears nowhere in `public/admin/`.** You are writing brand-new attack surface with nothing to copy.

| Control | Requirement |
|---|---|
| Storage | `data/uploads/` — already `.htaccess`-protected. Verify via System check |
| Validate **server-side, always** | MIME via `finfo`/`getimagesize` — **never trust `$_FILES['type']`** · allowlist `jpg/jpeg/png/webp/avif` · max 4 MB · min 400×400 · reject PHP/HTML signatures |
| **Re-encode, never store raw** | `imagecreatefrom*` → `imagejpeg`/`imagewebp` q82, max 1600 px. **Defeats polyglot attacks.** Never `move_uploaded_file` the client file to disk |
| Filename | **Fully server-generated:** slug + random hex + ext. **Never trust `$_FILES['name']`** — attacker-controlled, classic traversal vector |
| Traversal | Reject `..`, `/`, `\`, null bytes |
| Dir hardening | Ship a deny-PHP `.htaccess` in `data/uploads/` — mirrors `public/data/.htaccess` |
| CSRF | Token on the upload POST — `auth.php` provides it |
| Failure | Unlink partials. No orphans |
| Delete | Offer to delete images, or list orphans in System check |
| Alt text | **Required.** Decorative alt is an a11y failure and axe catches it. Forces the client to describe the part |

Display: below-fold `loading="lazy"`, always explicit `width`/`height`, fixed aspect box so a portrait photo cannot break the grid, **no next/image optimizer** (static export cannot run it).

### P17 — Admin UI discipline
**Read `admin.css` (16 KB) and `admin.js` before writing new CSS.** Consistency is a feature — the client learns one system. No `backdrop-filter`, no glass, no gradient: the site is the brand showpiece, the panel is an instrument. Keyboard-first (Tab order, Enter to save, `/` to focus search). Preview before publish. Sortable columns, searchable lists. A11y = same floor as the site.

### P18 — Attack suite — paste real output, not intentions
`php -S localhost:8080 -t public/` then **actually attempt**: `evil.php.jpg` · `.php` double extension · 6 MB file · 100×100 px image · `%00` in name · polyglot JPEG + appended PHP · missing CSRF token · cross-session token · `groupId: "../../etc"` · `machine: "<script>"` · `slug: "../evil"` · `<script>alert(1)</script>` in `description` (**must render as visible text, never execute**) · POST with no session cookie.

Every one must fail cleanly with a message. Then confirm the enquiry pipeline and the public site still work. **This task must not break the working panel.**

---

## 9. THE REVIEW LOOP — EVERY CYCLE, NO EXCEPTIONS

```
PLAN → BUILD → VERIFY → LOOK → CRITIQUE → FIX → RE-VERIFY → REPEAT
```

1. **PLAN** — restate the change, list exact files, map each to its rule.
2. **BUILD** — via agents.
3. **VERIFY** — all green or it does not ship:
   ```
   pnpm typecheck    pnpm lint    pnpm build    pnpm check:seo
   ```
   PHP work: **load every touched screen, confirm zero PHP notice/warning.** Warnings are failures.
4. **LOOK** — screenshot affected routes at **375, 768, 1440, 1920** into `.screenshots/<cycle>/`, then **actually `Read` the PNGs.**
   ⚠️ **Requires `npx playwright install chromium`. If browsers are missing → STOP AND TELL ME.** Do not substitute reading code for looking. That is the exact failure mode this engagement exists to fix.
5. **CRITIQUE** — screenshots to a read-only `design-critic`. Score 1–10: brand fidelity · logo-derived language · composition & hierarchy · originality · **mobile quality**. Tag **CRITICAL / MAJOR / MINOR** with rule number + exact element. One concrete fix each — **values, not adjectives.** *"Section padding is 96px at 1440; §7.4 says 120 — set `--section-y`"*, not *"improve spacing."* Also name what is excellent and **must be protected.**
6. **FIX** — each issue back to the agent owning that file, with rule + evidence.
7. **RE-VERIFY** — the **full** list, not just fixed items. Compare before/after. Confirm no neighbouring section broke and the enquiry pipeline still works.
8. **REPEAT** — until **zero CRITICAL** and no MAJOR on brand lock / honesty / a11y. **Hard cap 5.** If a CRITICAL survives iteration 5: **stop, document, ask me.** Do not grind.

Write to `docs/loop-log/<change-name>.md` with ✅/❌ per item.

### Severity
- **CRITICAL** — §2 or §19 violation · typecheck/lint/build break · a11y blocker · layout broken at any breakpoint · console error · **LCP > 3 s** · auth bypass · CSRF hole · arbitrary file write · stored XSS · path traversal · loses typed input · any PHP warning.
- **MAJOR** — reads generic (§3.2) · wrong spacing token · not reduced-motion-safe · **budget miss** · **"Drawing to come" still visible where a scan exists** · critic score < 7 · no way to undo an action.
- **MINOR** — optical alignment, easing feel, copy rhythm.

**Never lower the bar to make a loop pass.** If something cannot be fixed honestly, say so and leave it flagged. **A short honest site beats a long invented one.**

---

## 10. AGENT-WISE — LIMITED CREDITS

You are **Orchestrator / Art Director**. Plan, delegate, integrate, judge. **Do not hand-write everything.**

### Recreate only what this change needs — `.claude/agents/*.md`, gitignored, with `name` / `description` / `tools` frontmatter and a prompt opening:

> *"Read docs/MASTER_PROMPT.md §[sections] before doing anything. Honesty rule §19 and brand lock §2 are absolute. Only edit the files you own. Report back with: files changed, decisions made, open questions, self-check results."*

| Agent | Owns | Job |
|---|---|---|
| `product-media` | `public/catalogue/**`, `scripts/crop-*`, `src/components/products/Product*` | Scan → per-part crop → AVIF/WebP → wire everywhere |
| `content-architect` | `src/content/**`, `docs/client-questions.md`, `docs/catalogue-reconciliation.md` | P2 reconcile · P3 contact · P11 copy |
| `perf-engineer` | `src/lib/analytics.ts`, `src/lib/preload.ts`, `src/components/preloader/**`, `src/app/layout.tsx`, `src/fonts/**`, `src/styles/typography.css` | P5–P7 |
| `ui-builder` | `src/components/ui/**` | P10 button states, machined depth |
| `sections-builder` | `src/components/sections/**`, `src/app/page.tsx` | P8–P9, P13 rhythm |
| `pages-builder` | `src/app/**` (non-home), `src/components/products/**` | P12 recomposition, product templates |
| `product-store` | `public/admin/lib/store-products.php`, `product-schema.php` | P14/P15 validate + `data/products.json` |
| `product-upload` | `public/admin/lib/upload.php`, `data/uploads/**` | P16 re-encode + hardened dir |
| `product-admin-ui` | `public/admin/lib/views/product*.php`, `products.php`, `admin.css` (**additive only**) | P15/P17 CRUD |
| `product-runtime` | `src/lib/runtime-data.ts`, new dynamic route, `PartCard.tsx`, `PartFinder.tsx` | P14 overlay, live products |
| `design-critic` *(read-only)* | `docs/critique/**` | Brutal screenshot review |
| `qa-auditor` *(read-only)* | `tests/**`, `docs/qa.md`, `.screenshots/**` | Screenshots, axe, budgets, attack suite |

### Rules
- **Max 4 per wave**, parallel **only across disjoint ownership.** Two agents never touch one file in a wave.
- **Contracts first** — `tokens.css` and `content/types.ts` ship before any builder imports them. **Builders import, never redefine.**
- **`product-store` before `product-admin-ui`.** **`product-media` before `pages-builder`.**
- **Limited credits:** one wave → one verify → one critique. Never start wave 2 before wave 1 is verified. Prefer one strong agent over three weak ones when files overlap.
- **Never** deploy, `git push`, install global tools, or delete `data/`, `admin/config.php`, `public/api/config.php`, or the client PDFs in `Alok Plastics - Client side/` without asking.
- **Never invent a fact.** No spec, price, material, certification, testimonial, rating or city that isn't in `catalogue.txt`, `MASTER_PROMPT.md` §5–§6, or a content file. Missing → `TODO(client)` + `docs/client-questions.md` + honest empty state.
- If an agent's output violates §2 / §3.2 / §19, **send it back with the exact rule number.** Do not silently patch it.
- Log every report in `docs/agent-log.md`. Write ADRs to `docs/decisions.md`.

---

## 11. THE DESIGN COUNCIL — TWO EXPERTS, WHOLE SITE, EVERY ROUND

You are the orchestrator. **You are not the best designer in the room. Two experts are.**

- **`art-director`** — Awwwards-featured, industrial and editorial. Lens: composition, typography, hierarchy, colour, brand fidelity, section rhythm, whether a screen is genuinely beautiful or merely tidy. Asks: *where does the eye go first? is this derivable from the logo? would this stop a scroll?*
- **`motion-designer`** — interaction and motion. Lens: reveals, transitions, timing curves, easing, choreography, hover states, the preloader, whether movement has intent. Asks: *does this move with purpose or just move? is the stagger right? does it feel machined or floaty?*

**They do not overlap.** `art-director` owns everything static; `motion-designer` owns everything that moves. If A flagged something, B goes **deeper** — never re-flags it.

### They review everything, not just your diff
(1) the change under work, full depth · (2) their sweep of **every route**: `/`, `/about`, `/products`, `/products/[group]`, `/products/[group]/[part]`, `/industries`, `/career`, `/contact`, `/enquiry`, `/privacy`, `/terms`, `/refund`, `/not-found`, `/lab/*`.

**My changes are not the only thing that needs to be excellent — the whole website does.**

### Report format — the scored matrix

| Route · Section | Composition | Brand | Type | Motion | A11y | Score | Top 3 fixes |
|---|---|---|---|---|---|---|---|
| `/products · PartCard grid` | 8 | 9 | 7 | 6 | 9 | 7.5 | stagger uneven on cards 03/04; h2 breaks to 3 lines at 375; divider 1px → 1.5px |

### Where findings go — merged into ONE prioritised backlog
- **CRITICAL** → fixed this round. Non-negotiable.
- **MAJOR** → enters the backlog and gets worked. The loop does not exit while findings remain.
- **MINOR** → logged to `docs/critique/backlog.md` with a score.

Run shape: your changes land → council reviews them **and** sweeps the site → findings become work → loop again → re-review. Until **no CRITICAL and site-wide average ≥ 8.5 with no section below 7.**

Reviews → `docs/critique/<cycle>-<designer>.md`. Backlog → `docs/critique/backlog.md`.

### Council rules
- **Be harsh.** "Looks good" is not a review. If excellent, say so **and** say what must be protected — that protects good work from the next round's "improvements."
- **Never lower the bar to end the loop.** More iterations is cheaper than shipping generic.
- **Praise is not a substitute for rigour.** Both, in that order.
- **They review rendered screenshots, not code.**

---

## 12. WHEN YOU'RE UNCLEAR — RESEARCH, DON'T STALL, DON'T GUESS

**The one rule: never invent a placement, a pattern or a fact to keep moving.**

### Spawn a researcher immediately when
- **"Where does this go?"** — an element has no clear home.
- Two sections in §8/§13 seem to conflict.
- You don't know whether the repo already solved this somewhere.
- You're choosing between two good options and can't justify either.
- An asset or value is missing and you're tempted to fake around it.
- A change would touch a locked rule and you can't tell if it's a real violation.
- **You're not confident — and then spawn one anyway.** Unjustified confidence is the exact moment to research.

Work does not wait. Spawn in parallel. Do not park. Do not guess.

### Order — stop when you have the answer
1. `docs/MASTER_PROMPT.md` — the spec
2. `docs/decisions.md` — a closed ADR may have answered it
3. `docs/loop-log/`, `docs/critique/`, `docs/agent-log.md` — precedent
4. **The actual code** — the pattern may already exist elsewhere in the repo
5. **The libraries below** — for mechanics
6. The web, if still open

### It returns
A **recommendation with evidence** (file, rule number, or URL), options rejected and why, a confidence level, and the risk of being wrong. **Not a survey. A decision.**

### You do
You decide, record it as an ADR, and move. If confidence is low **and** the call is genuinely the client's — brand direction, a claim, a price — that is the **only** thing you bring me, bundled into one question with your recommendation attached. Everything else is yours.

**A blocked agent is a failed agent. Go look.**

---

## 13. INSPIRATION LIBRARY — A FILTER, NOT A MENU

I fetched every one of these. **~85% of their catalogue is banned on this site.** A researcher treating the index as a menu produces exactly the template the client complained about.

### ✅ Take the mechanic — verified present

| Library | Block | Mechanic | Apply as |
|---|---|---|---|
| ui-incubator | `Product Showcase 360` | drag-rotate viewer | Part gallery. **Pairs with real photos — a fake part rotating is worse than none** |
| ui-incubator | `Product Showcase Exploded` | layered separation | Group pages — the 4 jalli sizes fanned out. Engineering language, not e-commerce |
| ui-incubator | `Process Path Draw` | SVG draws on scroll | `RequirementToRepeat` S5 chain |
| ui-incubator | `Process Sticky Steps` | sticky + advancing | `/about` journey |
| ui-incubator | `Stats Slot Machine` | digit roll | `ProofStrip` S3 — **odometer already exists. Compare, don't add a second system** |
| ui-incubator | `Hero 3D Tilt` | perspective rotate | Part tiles. **Cap 2–4°, return to rest, reduced-motion → none** |
| ui-incubator | `Gallery 3D Wall` | depth-stacked grid | Product gallery. Straighten on hover |
| ui-incubator | `About Parallax Image` | multi-layer parallax | Hero + JourneyOrbit. **< 6% travel** |
| lightswind | `Interactive Primitives` | spring button physics | P10. **Take the spring, drop the magnetism** |
| lightswind | `Pipeline Visualizers` | node-edge diagrams | Requirement-to-Repeat. Industrial vocabulary |
| **aceternity** | **`Scales`** | **repeating diagonal lines** | 🔑 **The one genuinely Alok-shaped background.** Diagonal = the 44° language. 3% opacity, `--grey-metal` |
| aceternity | `SVG Mask Effect` | clip-path mask reveal | Diagonal wipe lower-left → upper-right |
| aceternity | `Direction Aware Hover` | effect follows cursor | Product tiles. Cheap and *feels mechanical* |
| aceternity | `Stateful Button` | loading → success | **Directly for the enquiry form.** Current button has no success state |
| aceternity | `Glare Card` | one specular pass | `--metal-gradient-text` sweep. **Never loops** |
| magicui.design | 150+ primitives | mostly shadcn complements | **Lowest value.** Only for a genuinely missing primitive — then rebuild on tokens |

### 🚫 REJECT ON SIGHT — these exist in these libraries and are banned here
Naming them so nobody "discovers" one later and thinks it's new.

**aceternity** — `Aurora` · `Sparkles` · `Meteor Effect` · `Shooting Stars` · `Glowing Stars` · `Background Beams` (+ Collision) · `Vortex` · `Wavy` · `Background Ripple` · `Dotted Glow` · `Wobble Card` · `Glowing Effect` · `Spotlight` · `Infinite Moving Cards` · `Card Stack` · `Logo Clouds` · `Animated Testimonials` · `Chromatic Image` · `Encrypted Text` · `Evervault Card` · `Floating Dock` · `Hover Border Gradient`

**lightswind** — the whole `FinTech & Web3` category · `AI & Neural` · `AI Agents` · `SaaS Sections` · `Pricing` (21 blocks) · `Changelogs` · `DevSecOps` · any Gradient/Glass/Neon block

**uilib.co** — all 4 hero blocks are "animated gradients", and the page lists *"Social proof elements"* as included. That is the fake-logo-strip tell. **Treat uilib as a NEGATIVE reference:** read it to understand what generic *looks* like, reject all four blocks, design from §3. Most instructive item on this list.

**ui-incubator** — `Testimonials 3D Stack` / `Stack Swipe` · `CTA Magnetic Burst` · `Portfolio Cursor Follow` · `Bento Magnetic Cards` · `Banner Gradient` · every `Dark` variant

**Global filter — a pulled block is wrong if:** it has a gradient blob/mesh/aurora/beam background · uses `backdrop-filter` outside nav+drawer · radius > 2 px · needs WebGL/canvas to work · any colour not a `tokens.css` token · animates on an infinite loop · a decorative icon-library glyph · would not survive being recoloured `--ink` on `--canvas`.

### 🚫 The hard part — read twice

| Take this ✅ | Never this ❌ |
|---|---|
| How the effect works | Its colours, gradients, glow |
| The easing curve + duration | The visual treatment |
| The interaction model (hover/focus/scroll) | The component's default look |
| The sequencing + stagger logic | Purple/blue/cyan/neon anything |
| The perf technique (transform-only, lazy, rAF) | Glassmorphism outside nav + drawer |
| The structural idea | Aurora, mesh blobs, sparkles, meteors |
| | Pill cards, `rounded-2xl` + soft shadows everywhere |

Everything pulled must be rebuilt onto §2 tokens and §3 rules: **2 px max radius**, top-lit metal gradient, 44–46° diagonals, up-and-right motion, `backdrop-filter` only in the 2 allowed files.

### Fetch order — go straight to the named block
1. `ui-incubator.com/catalog` → `Product Showcase 360`, `Exploded`, `Process Path Draw`, `Sticky Steps`, `Stats Slot Machine`, `Gallery 3D Wall`
2. `ui.aceternity.com/components` → `Scales`, `SVG Mask Effect`, `Direction Aware Hover`, `Stateful Button`, `Glare Card`
3. `lightswind.com/blocks` → `Interactive Primitives`, `Pipeline Visualizers`, `Steps`
4. `uilib.co/category/hero-sections` → **negative reference only**
5. `magicui.design` → last resort, for a missing primitive

**If a block's code is behind a paywall, move on.** Do not guess an implementation and do not stall — spawn a researcher or rebuild in CSS. `blocks.serp.co` and `preblocks.com/ui` were **not reachable** at audit time — verify before relying on them.

---

## 14. THE STANDING BAR — NEVER LOWER IT

### Brand (§2, lint-enforced)
Every colour a token · `check-hex` passes · no `#000` · no blue/purple/cyan/orange/neon · green **only** on WhatsApp and form success · ~61% light / ~28% burgundy / ~11% grey-text · **max one burgundy block per viewport** · **never two burgundy sections adjacent** · spacing by token only, **never a 28–36 px gap** · `backdrop-filter` in exactly **2 files** · `100svh` never `100vh` · logo resting state identical to the master (traced **98.4%**), never redrawn/recoloured/stretched/shape-animated · tagline exactly `भारते शिल्पितम्, विश्वय निर्मितम्` / `Crafted in Bharat, made for the world.`

### Accessibility (WCAG 2.2 AA floor)
Skip link first tab stop · semantic landmarks · **one `h1` per page** · full keyboard operation · visible **2 px burgundy focus ring, 2 px offset** · touch targets ≥ 44×44 · **no horizontal scroll at 320 px** · contrast against **actually rendered** backgrounds · **reduced motion fully honoured** — no Lenis, pin, odometers, marquee, video autoplay or preloader construction; complete and usable fully static. **Test it, don't assume** · axe zero serious/critical on every touched route.

### Performance (₹12,000 Android, 4G, standing in a workshop)
LCP **< 2.0 s** mobile · CLS < 0.02 · INP < 200 ms · home **< 1.5 MB** excl. video · JS gzipped **< 170 KB** home, inner pages < 120 KB · animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset` · exactly **one** rAF loop — `gsap.ticker` seconds → `lenis.raf()` **×1000**, `lagSmoothing(0)` · GSAP plugins dynamic-imported per route · images AVIF+WebP, explicit dimensions, lazy below fold.

### Security (admin work)
`password_hash` (Argon2id, else bcrypt cost 12) · **no default account** — with no valid hash the panel shows setup only · sessions `HttpOnly` + `SameSite=Strict` + `Secure` on HTTPS, scoped to `/admin/`, ID regenerated at login, 30 min idle / 12 h absolute · CSRF token on **every** POST + same-host Origin/Referer check · 5 failures per IP **and** per username → 15 min lock · prepared statements only, update columns from a **fixed whitelist**, all output escaped · **raw IPs never stored** — salted HMAC 20 hex · CSP `default-src 'none'; script-src 'self'; style-src 'self'` — **no inline script or style, so no inline event handlers in new templates** · `.htaccess` keeps denying `config*.php`, `*.sqlite|jsonl|lock|bak|tmp|log`, all of `lib/` · every `lib/*` keeps its "exit if requested outside the app" guard.

### Honesty (§19 — absolute)
**Never invent a product, spec, price, material, certification, testimonial, rating or city.** Missing → `TODO(client)` + `docs/client-questions.md` + honest empty state. **Never pre-fill with plausible-looking values.** Three known fields and four blanks beat seven invented ones.

### Motion vocabulary — vary deliberately, not everything fades up
`mask rise` (headings) · `draw` (rules, register marks) · `diagonal wipe` lower-left → upper-right · `lock` (`back.out(1.4)`, one click) · `light sweep` (never loops) · `odometer` (numerals) · `nudge` `translate(2px,-2px)`.
Easings only: `expo.out`, `expo.inOut`, `power3.inOut`, `back.out(1.4)`.
Durations only: **200 / 400 / 700 / 900 / 1200 ms.**
All forward motion **up-and-right ↗**. Never a plain →. Never ↓ for "next".

---

## 15. HOW TO THINK

- **Read before you write.** A "fix" that ignores existing work is worse than no change.
- **Decide, don't ask.** Bring decisions, not questions.
- **Screenshots are the truth.** Code can pass every gate and still be wrong on screen. **Look.**
- **Match the house style.** Every component, token and motion already has a precedent. A new pattern needs a reason.
- **Smallest correct change.** Don't redesign what works — and right now, most of it works.
- **Evidence beats opinion.** Cite the file, the screenshot, the measurement.
- **My taste > your default.** When in doubt, choose the more disciplined option.
- **Quality is the constraint, time is not.** Five cycles is fine. One generic cycle isn't.
- **If it's ambiguous, resolve it — don't average it.** A clear wrong-but-justified call beats a mushy safe one. Log it and move on.

---

## 16. KNOWN STATE — DON'T REDISCOVER

**Green:** `next build` (40 static pages) · typecheck clean (**verified: `tsc --noEmit` returns nothing**) · 4 brand lints pass · `check:seo` 0 errors · axe 0 serious/critical on 9 routes · no overflow at 375/768/1440 · logo traced **98.4%** · `out/` already built (23 files).

### Repo gotchas
- MASTER_PROMPT says `/_lab/*`; the real route is **`/lab/*`** (ADR-005 — Next treats `_` dirs as private). Gated behind `NEXT_PUBLIC_SHOW_LAB=1`, which `pnpm dev` sets.
- The glass file is **`src/components/layout/glass-nav.css`**, not `src/styles/`. Older docs are wrong.
- **Stale docs to trust over:** `SESSION_HANDOVER.md` (claims Phases 7–10 not started — they are done), `catalogue-reconciliation.md:9` (claims no catalogue PDF — it exists). Trust `CHANGELOG.md`, `docs/qa.md`, `docs/loop-log/`.
- 3 commits, **no remote configured**: `29afed7` initial · `69f6254` Round 2 · `2397f14` Rounds 3–4.
- Uncommitted: `public/llms-full.txt`, `public/llms.txt`, `public/sitemap.xml`, `src/content/types.ts` modified; `public/catalogue/`, `test-results/` untracked. **Inspect `git diff` on `types.ts` before building on it.**
- Gitignored and safe to create: `.claude/` · `.research/` · `.screenshots/`.

### 🔴 The single biggest open weakness — home LCP
Lighthouse mobile 4× CPU: **Perf 53 · LCP 12.2 s** · TBT 250 ms · CLS 0. Slow-4G + gzip, preloader skipped: **Perf 72 · LCP 5.5 s** · FCP 1.1 s. Real Chromium, no network throttle: LCP 0.5 s.
Root cause: first-visit preloader + GSAP hero entrance delay the hero paragraph, **the LCP element.** Levers in P5. **If your change touches hero, preloader or motion, LCP is in scope — measure before and after, put real numbers in `docs/qa.md`.** Do not accept a regression.

### Blocked on the client — do NOT fake
`email` · `gstin` · `mapsUrl` · `ga4Id` · social URLs · logo vector master · hero video & poster · testimonials · legal text · reply time.

**NOT blocked:** **phone + WhatsApp = `+91 7479497003`** (21× in `catalogue.txt`), second number `9915745414`, **and the product photos** (23 scans in `public/catalogue/spares/`). These three unblock the entire site. They are not a client dependency — they are an **unread-file dependency.**

### Also worth knowing
- `showPrices` is `false`. Prices stored, not displayed (§6.4). Recommend keeping it — B2B pricing varies by quantity; the CTA is "Get a quote."
- `PUF Chemical`, `Three Core Plug`, `Bright Chrome` are `published: false` in `catalogue.php`. Group assignment is a client decision — flag it, don't publish silently.
- 7 products have no pictogram (Handle Lock, Bracket Handle, SS Kabja, L-Type Hinge, U-Type & L-Hinge Door Springs, Waste Coupling) → these show "Drawing to come" today. Real photos fix this.
- `test-results/` has 5 failed Playwright artifacts on disk — read them before assuming the suite passes.

---

## 17. REPORTING — 5 lines, every cycle

```
Shipped:     <one line>
Loop:        <n> iterations · CRITICAL <n> · MAJOR <n>
Gates:       typecheck ✓ lint ✓ build ✓ seo ✓ axe ✓ · LCP <before>→<after> · JS <before>→<after> · "Drawing to come" <before>→<after>
Decisions:   <ADR refs, or "none">
Next:        <what you're doing>
```

Don't narrate file-by-file. Don't ask permission for routine in-scope work. **Do** ask before breaking a locked rule, inventing a fact, spending real time on something I'd notice, or making a decision that's genuinely the client's.

---

## 18. STATE — `docs/STATE.md` 🔄 THE LOOP MEMORY

**Read at the start of every cycle. Update at the end. This file is the entire reason each cycle is better than the last** — without it every run restarts from zero.

Create on first run from this template:

```markdown
# Alok Plastics — Loop State

## Cycle
current: <n>
scores_history: [<n1>, <n2>, ...]      # site-wide average per completed cycle
stop_condition: no CRITICAL · site average >= 8.5 · no section < 7 · cap 5

## Environment readiness
pnpm_on_path:        <yes/no>
playwright_browsers: <yes/no>
php_installed:       <yes/no>
out_dir_built:       <yes/no>

## Unblocking ledger            # Phase 0 — design work does not count until all DONE
| # | Item | Status | Evidence |
|---|------|--------|----------|
| P1 | Product photos wired | TODO | <how many products still show a plate> |
| P2 | products.ts TODOs resolved | TODO | <count before -> after> |
| P3 | phone + whatsapp live | TODO | <what renders now> |
| P4 | Stale docs corrected | TODO | |
| P5 | LCP < 2.0s | TODO | <before -> after> |
| P6 | JS < 170 KB | TODO | <before -> after> |

## Admin ledger                 # Phase 3 — needs PHP
| # | Item | Status |
|---|------|--------|
| P14 | Architecture ADR | TODO |
| P15 | Product CRUD | TODO |
| P16 | Hardened upload | TODO |
| P17 | Admin UI discipline | TODO |
| P18 | Attack suite all-fail | TODO |

## Backlog                        # merged from art-director + motion-designer
| ID | Route . Section | Issue | Severity | Rule | Fix | Owner | Status |
|----|------------------|-------|----------|------|-----|-------|--------|

## Protected                      # excellent — do NOT "improve" these
- <element> — <why it is right>

## Scorecard
| Route . Section | Comp | Brand | Type | Motion | A11y | Score |
|-----------------|------|-------|------|--------|------|-------|
| / . ProductGroups | | | | | | |

## Rejected approaches             # so the next cycle does not retry
- <approach> — rejected because <reason> (ADR-n)

## Open questions for the client
- <one line each>
```

---

## 19. ABSOLUTE RULES — NEVER BREAK

1. **§19 Honesty** — never invent numbers, names, specs, prices, materials, certificates, cities, testimonials or ratings.
2. **§2 Brand lock** — no hex outside `tokens.css`; no pure black; no blue/purple/cyan/orange/neon.
3. **Glass budget** — `backdrop-filter` in exactly 2 files: `components/layout/glass-nav.css` + `components/layout/Drawer.tsx`.
4. **`100svh`** in hero, never `100vh`.
5. **`विश्वय`** — that exact spelling is intentional. Do not "correct" it.
6. **Logo** — never redraw, recolour, stretch, skew or shape-animate.
7. **Spacing** — no 28–36 px arbitrary gaps.
8. **Two burgundy sections adjacent** — forbidden. Always separate.
9. **Security is never weakened** to make a feature work. No inline `<script>` or `style` (the CSP forbids both).
10. **Never** deploy, `git push`, install global tools, or delete `data/`, `admin/config.php`, `public/api/config.php`, or the client PDFs in `Alok Plastics - Client side/` without asking.
11. **Never** claim visual verification without opening a screenshot. **If Playwright browsers are missing, stop and say so.**
12. **Never** start design work while Phase 0 is open. Data first — that is what the client is actually complaining about.