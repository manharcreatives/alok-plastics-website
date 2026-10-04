# MASTER EXECUTION BRIEF — Alok Plastics UI Revamp (T1–T8)

> **Paste this entire file into Claude Code as the single instruction set.**
> Target repo: `alok-plastics-website/` (Next.js 16 static export, React 19, GSAP, Tailwind v4 tokens).
> Branch discipline: **do not commit, do not push** unless the user explicitly asks.

---

## 0. ROLE AND OPERATING MODE

You are the **Orchestrator** of a multi-agent refactor of the Alok Plastics marketing site.

You are responsible for four things and nothing else:

1. **Reconnaissance** — read the real files before touching anything. Never guess a path, a class name, or a data shape.
2. **Delegation** — hand each workstream to a focused subagent with an exact file list, exact acceptance criteria, and the repo constraints below.
3. **Verification** — run the gate suite after every workstream. A workstream is not done until every gate passes.
4. **Iteration** — when a gate fails, dispatch a fix, re-run gates, up to 3 loops per workstream. Then escalate with a written root-cause report rather than looping forever.

You must **preserve meaning**. You must **not redesign**. Every task below is a cleanup, a precision fix, or a clearly-scoped enhancement. If you find yourself changing spacing rhythm, type scale, colour tokens, or copy meaning, you have drifted — stop and revert that part.

---

## 1. REPO FACTS YOU MUST KNOW BEFORE YOU START

### 1.1 Stack and commands

| Fact | Value |
|---|---|
| Framework | Next.js `16.3.7`, App Router, **static export** (`out/`) |
| React | `19.2.8` |
| Animation | `gsap` `^3.15.0` + `@gsap/react`, `ScrollTrigger`, `Lenis` (via `gsap.ticker`, never a standalone rAF loop) |
| Package manager | `pnpm` `@12.4.1` — **use `pnpm`, never `npm`** |
| Dev server | `pnpm dev` → `http://localhost:3000` |
| Build | `pnpm build` (also runs `prune-lab`, sitemap, llms.txt) |
| Static serve | `npx serve out -l 4173` → Playwright `baseURL` |
| Screenshot tool | `node scripts/shoot.mjs <name> <routes,csv> <widths,csv> <baseUrl>` → `.screenshots/<name>/` |

### 1.2 Mandatory verification commands (in this order)

```bash
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint + check-hex + check-spacing + check-glass + check-forbidden
pnpm build         # static export must succeed
pnpm test          # playwright smoke (no h-overflow @375/768/1440, no TODO/invented strings, hero CTAs)
pnpm test:a11y     # axe wcag2a + wcag2aa, serious/critical must be [] on 10 routes
```

**All five must pass.** `pnpm lint` is not optional — it contains four custom guards that will reject your work otherwise.

### 1.3 Hard design constraints (these WILL fail the build if broken)

- **No raw hex outside `src/styles/tokens.css`.** Use `var(--burgundy)`, `var(--grey-metal)`, `var(--silver)`, etc. Guard: `scripts/check-hex.mjs`.
- **No `100vh`** — use `100svh`. Guard: `check-forbidden.mjs`.
- **No `rounded-2xl` / `rounded-3xl` / `rounded-full`** (except Header/Nav/Drawer/WhatsApp FAB). Max radius is `--radius-card: 2px`. Guard: `check-forbidden.mjs`.
- **No spacing value in the 28–36px "ambiguous zone"** and no arbitrary Tailwind values — use `--space-xs:8 / sm:16 / md:24 / lg:40 / xl:72`. Guard: `scripts/check-spacing.mjs`.
- **Never remove a `:focus-visible` outline.** Guard: `check-forbidden.mjs`.
- **Never tween `height: auto`** with GSAP.
- **No blue / purple / cyan / teal / indigo / violet.** Burgundy + greys only.
- **No aurora / sparkle / meteor / blob / liquid-glass effects.** The `check-forbidden.mjs` regex bans the literal words too — do not name a variable `blob`.
- **No lorem ipsum, no `TODO` in rendered output.** `tests/smoke.spec.ts` asserts rendered body text contains none of `TODO`, `uninterrupted`, `Chandigarh, Chandigarh`, `1,998`.
- **Every animation must have a `prefers-reduced-motion: reduce` escape** and must be fully readable with JS disabled.

### 1.4 Content honesty rules (§19 / ADR-012) — these are brand/legal constraints, not style

- **Never invent a number.** The only permitted figures are `site.proof` in `src/content/site.ts` (currently `20 Cr+`, `70%+`, `1998`, `100%`, plus three word stats), `site.foundingYear` (1998), and counts derivable from `src/content/products.ts` / `DOMESTIC` arrays. No fake city counts, no "500+ clients", no revenue claims, no delivery-time promises.
- **Never name a city** in the Pan India map (other than Chandigarh as origin) and **never name a country** other than India. No flags. The world arcs are illustrative *ambition*, not delivery destinations, and the existing `figcaption` disclaimer must survive.
- **Never invent history.** Story copy is verbatim from `docs/MASTER_PROMPT.md`.
- The Devanagari tagline `भारते शिल्पितम्, विश्वय निर्मितम्` is **LOCKED** (§2.7 — `विश्वय` is the approved spelling; do not "correct" it).
- Copy blocks marked `// COPY: drafted, needs client approval` must **keep that comment** if you touch the surrounding file.

### 1.5 Where things live (do not re-discover this)

| Concern | File |
|---|---|
| Home page composition (S1–S11) | `src/app/page.tsx` |
| Home hero | `src/components/hero/Hero.tsx` |
| **T1** Parts schedule ("table") | `src/components/hero/ValuesRibbon.tsx` — imported as `S2` in `page.tsx:34` |
| **T2** Achievement numbers | `src/components/sections/AboutIntro.tsx` (`Stat` at L44–96) |
| T2 duplicate count-up (compiled, unused on home) | `src/components/sections/ProofStrip.tsx` (`useCountUp` L31–52) |
| T2 third count-up (Journey odometer) | `src/hooks/useMotion.ts` → `useOdometer` (~L190) |
| **T3** Understand→Repeat process | `src/components/sections/RequirementToRepeat.tsx` |
| **T5** Pan India map | `src/components/sections/PanIndiaMap.tsx` + `src/components/sections/worldDots.ts` |
| **T6** About hero logo art | `src/components/page/art/AboutArt.tsx` |
| **T7** About logo + colour legend | `src/app/about/page.tsx` L191–222 + `.cp-sheet` in `src/components/about/parts.tsx` |
| **T8** Career hero decoration | `src/components/page/art/CareerArt.tsx` + `src/components/page/PageHero.tsx` |
| Inner-page hero shell (all pages) | `src/components/page/PageHero.tsx` |
| Real ALK logo (trace, ≥97% fidelity) | `src/components/brand/Logo.tsx` |
| Product pictograms (20 hand-drawn) | `src/components/brand/Pictogram.tsx` — names in L14–37 |
| Section fold diagonals | `src/components/sections/FoldEdge.tsx` |
| Shared /about + /career blocks | `src/components/about/parts.tsx` |
| Design tokens | `src/styles/tokens.css` |
| Architecture decisions (ADR-001…ADR-014) | `docs/decisions.md` |
| Agent log | `docs/agent-log.md` |
| Known art/motion issues | `docs/critique/backlog.md` |

`Logo.tsx` is a **verified trace** of the client-supplied file (`public/brand/source/alok-logo-original.png`). Never redraw, simplify, restyle, or edit its path data. It exposes `variant: 'color' | 'white' | 'bright'` and `lockup: 'full' | 'mark'`.

`Pictogram.tsx` exposes 20 names and is the **only** sanctioned icon set. No Lucide/Tabler/emoji/glyph fonts for product or machine imagery. Phosphor (`@phosphor-icons/react`) is allowed for UI chrome only (arrows, envelope).

---

## 2. PHASE 0 — BASELINE (orchestrator only, no subagents)

Do this before delegating anything. You cannot judge regressions without it.

```bash
pnpm typecheck && pnpm lint && pnpm build
npx serve out -l 4173            # keep running in background
pnpm test && pnpm test:a11y
node scripts/shoot.mjs baseline /,/about/,/career/ 375,768,1024,1440 http://localhost:4173
```

Record, in your own working notes:

1. **Baseline gate results** (pass/fail per command, plus any pre-existing failures you must not blame on yourself).
2. **Baseline screenshots** in `.screenshots/baseline/` — these are your regression reference.
3. **A measured overlap report** for the Career hero, using this throwaway script (write it to a temp path, not `tests/`):

```js
// tmp: career-overlap.mjs — measures rect intersection between decoration and heading
import { chromium } from '@playwright/test';
const widths = [360, 375, 414, 768, 834, 1024, 1280, 1440, 1920];
const b = await chromium.launch(); 
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 700 ? 812 : 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await p.goto('http://localhost:4173/career/?nopreload=1', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const word = document.querySelector('.pa-career__word');
    const h1 = document.querySelector('.ph__h1');
    const lead = document.querySelector('.ph__lead');
    if (!word || !h1) return { skipped: true };
    const vis = el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0; };
    const inter = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) *
                            Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
    const wa = word.getBoundingClientRect(), ha = h1.getBoundingClientRect();
    const la = lead ? lead.getBoundingClientRect() : null;
    return {
      wordVisible: vis(word), wordFontPx: parseFloat(getComputedStyle(word).fontSize),
      h1FontPx: parseFloat(getComputedStyle(h1).fontSize),
      wordRect: [wa.left|0, wa.top|0, wa.right|0, wa.bottom|0],
      h1Rect: [ha.left|0, ha.top|0, ha.right|0, ha.bottom|0],
      overlapPx2: Math.round(inter(wa, ha)),
      leadOverlapPx2: la ? Math.round(inter(wa, la)) : 0,
    };
  });
  console.log(w, JSON.stringify(r));
}
await b.close();
```

Save the output as `docs/loop-log/t8-baseline-overlap.md`. This table is your **before** column and the proof that T8 actually fixed something.

**Gate 0 passes when** all five commands are green (or pre-existing failures are documented) and the overlap table exists.

---

## 3. PHASE 1 — PARALLEL READ-ONLY AUDITS (3 explore subagents, run simultaneously)

Dispatch these as `subagent_type: "explore"`, **read-only**. They return inventories; they change nothing.

### Audit A — Dash inventory (feeds T4)

> Thoroughness: **very thorough**.
> Produce a complete, deduplicated inventory of "large dash" occurrences in `src/`, split into three buckets, with `file:line` for every entry:
> - **(a) User-visible em/en dashes** inside string literals that render on the page (TSX text nodes, template literals, metadata descriptions, CMS/content strings). Include `—`, `–`, `——`, and repeated-hyphen runs like `---` / `--` used as a typographic device in copy.
> - **(b) Decorative horizontal-rule elements** in CSS/inline styles that read as a long dash: pseudo-elements with a small height and a large width (e.g. `width: 40px; height: 2px`), measurement rules with end caps, `border-top` used purely as an ornament, dashed SVG `stroke-dasharray` strokes that render as a dash run.
> - **(c) DO-NOT-TOUCH** — the legitimate brand devices you must classify as keepable: eyebrow bars (`24px` burgundy), `PageHero` `.ph__rule`, `FoldEdge` diagonals, `Divider` component, `Hero` tagline hairlines, CSS custom property names (`--foo`), `§` section references in comments, Tailwind/arbitrary-value syntax, `data-*` attributes.
>
> Also flag every place where a **spec-marker comment** (`// ... §N.N ...`) exists in the same file so T4's editor does not "clean up" those.
> Return a markdown table. No edits.

### Audit B — Motion inventory (feeds T2, T3)

> Thoroughness: **medium**.
> For every count-up / odometer / numeric-roll implementation in `src/` (`AboutIntro.tsx#Stat`, `ProofStrip.tsx#useCountUp`, `hooks/useMotion.ts#useOdometer`, anything in `JourneyOrbit.tsx`), report: the file, the start value expression, the duration, the ease, the trigger, the stagger, the formatter (and whether it handles the 1900–2100 year case), the reduced-motion path, and the no-JS/SSR path. Quote the exact lines.
> Also report every **infinite CSS animation** in `src/` (grep `infinite`) with the file, the selector, and whether it is already paused off-screen (e.g. gated behind a `data-live` / `.live` class driven by an IntersectionObserver).
> Return a markdown table. No edits.

### Audit C — Boundary and overlap map (feeds T6, T7, T8)

> Thoroughness: **medium**.
> Report exactly:
> - `/about/` hero: which element renders the "आलोक" outline text, its parent chain, the SVG `viewBox` and `preserveAspectRatio`, and the animation helper classes it uses (`pa-draw`, `pa-fade`, `pa-rise`, `D()` from `page/art/artCss`).
> - `/about/` brand-idea block: every class applied to the logo + colour-legend container, and which of those classes come from the shared `SECTION_CSS` in `components/about/parts.tsx` (note that `.cp-sheet` is **shared** with the leadership plates — a change to `.cp-sheet` affects `/career/` and `/about/` leadership too).
> - `/career/` hero: every positioning/z-index/overflow declaration in play (`.ph`, `.ph__grid`, `.ph__art`, `.pa-career`, `.pa-career__word`, `.ph__body`, `.ph__text`) with the exact line numbers, plus the `layout="stack"` overrides in `PageHero.tsx`.
> - Which of `PageHero.tsx`, `artCss.ts`, `parts.tsx`, `Logo.tsx`, `Pictogram.tsx` are shared by **more than one route**, so the orchestrator knows the blast radius.
> No edits.

---

## 4. PHASE 2 — WORKSTREAMS

Dispatch order is **fixed** because of file overlap (T4 rewrites copy that T1/T2/T5 also touch; T6 and T7 both touch `/about/`).

```
T8  →  T6 → T7  →  T2  →  T3  →  T1  →  T5  →  T4  →  Phase 3 verification
```

Run at most **two subagents concurrently**, and only when their file lists are disjoint.

For each workstream the subagent must return, in its final message:
1. Files changed, with a one-line reason each.
2. The exact diff summary of behaviour changes.
3. Which gates it ran and their output.
4. Anything it deliberately did **not** do and why.
5. Any decision-gate question it wants answered.

---

### T1 — Home: replace the "Parts schedule" table with a non-table representation

**Owner files (exclusive):**
- `src/components/hero/ValuesRibbon.tsx` (rename the file to match the new concept; update the import in `src/app/page.tsx`)
- `src/app/page.tsx` (import + comment only)
- Read-only: `src/content/products.ts`, `src/content/types.ts`, `src/components/brand/Pictogram.tsx`

**Current state (verified):**
- The section renders an engineering-drawing "parts schedule": a bordered grid (`.ps__frame`, `grid-template-columns: 272px minmax(0,1fr)`) with a bordered title block on the left (kicker "Parts schedule", name "Spare parts, made in Chandigarh", then a `dl` of Since / Material / Fits) and, to the right, one bordered cell per published part — each with a `Pictogram`, part name, material tags, and machine-fit glyphs.
- It has an IntersectionObserver entrance (diagonal `clip-path` wipe per cell, 80ms stagger), a one-shot light sweep, and a `data-armed`/`data-in`/`data-live` state machine.
- Narrow viewports already turn the cell row into a horizontal snap scroller.
- `aria-label="Parts schedule"` on the section.

**Required outcome:** remove the table reading — the boxed grid, the cell borders, the vertical cell divider, the framed title block, and the register marks that read as a table. Keep every piece of information.

**Information that must survive:**
- The line "Spare parts, made in Chandigarh" (or an equally faithful, more natural phrasing of the same claim — keep `site.contact.city` as the source, never hardcode the city).
- Since: `site.foundingYear`.
- Material: the catalogue-confirmed material set, still **derived** from `publishedProducts`, never hardcoded.
- Fits: water cooler / display counter / deep freezer, using the machine `Pictogram`s.
- One entry per catalogue-confirmed part: pictogram, name, material tag(s), machine fit(s), still linking to `/products/[group]/[part]`.

**Design direction (use judgement, but respect these):**
- Read as a **spec strip / component rail**, not a table: no outer frame, no per-cell borders, a single hairline rhythm, generous `--space-lg` / `--space-xl` breathing room.
- Prefer a horizontal rail that is a real scroll region on narrow screens (keep the existing snap scroller behaviour; it is good) and a clean inline row on desktop. No card grid.
- Use `--surface` / `--canvas` alternation and the existing burgundy accent exactly as the rest of the site does. No new tokens, no new hex.
- Keep hover/focus affordances on every part link, with a visible `:focus-visible` ring.
- Keep or improve the entrance: one tasteful once-on-scroll reveal. Do not add a marquee, an infinite loop, or an auto-advancing carousel.
- Keep the mobile experience honest: if it scrolls horizontally, make that discoverable (existing scroll-snap plus a subtle affordance), and never introduce horizontal page overflow (`tests/smoke.spec.ts` asserts none at 375/768/1440).

**Acceptance criteria:**
- Zero visible table: no enclosing border, no cell borders, no vertical column rules.
- All listed information present and rendered from data, not literals.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:a11y` all green.
- No horizontal overflow at 375 / 768 / 1440.
- The section still has a meaningful accessible name, and each part link has discernible text.

---

### T2 — Home: make the achievement numbers count up gradually from zero

**Owner files (exclusive):**
- `src/components/sections/AboutIntro.tsx` (the `Stat` component and its count-up effect)
- `src/hooks/useMotion.ts` (`useOdometer`) — align it
- `src/components/sections/ProofStrip.tsx` (`useCountUp`) — align it, or delete the file if it is truly unused (it is not rendered on `/`; ADR-011 merged it into `AboutIntro`)

**Current state (verified):**
- `AboutIntro.tsx` L44–96 renders four numeric stats from `site.proof.filter(p => p.isNumeric)`.
- The tween is `gsap.to(o, { v: target, duration: COUNT_S /* 2.4 */, delay: 0.4 + index * 0.16, ease: 'power3.inOut' })`, triggered by an IntersectionObserver at `threshold: 0.5`, driven once.
- **The year starts from `target - 98`, i.e. 1900, not 0.**
- `power3.inOut` front-loads and back-loads the motion and spends the steepest part of the curve in the middle, so each number appears to sit still, then jump, then sit still — the "sudden jump" the user sees. `Math.round()` on top of that compounds it.
- On completion a light sweep class `ap-swept` is added.
- Reduced motion and no-JS both render the authored final value (SSR text is the correct numeral) — **that fallback must survive**.
- `.ap-num` already sets `font-variant-numeric: tabular-nums lining-nums`, which prevents width jitter. Keep it.

**Required outcome — the number must read as real, gradual progress:**

- **Every value starts at `0`.** No exceptions, including the founding year. Replace the `target - 98` special case.
- Duration: long enough to be felt. Target **3.0–3.4s** for the whole roll. Expose it as a named constant next to `COUNT_S`, do not inline the number.
- Ease: a curve that is monotonic and *settles* rather than lurches. Use **`power2.out`** (or `expo.out` if you also lengthen the duration). **Do not use `power3.inOut`, `back.*`, `elastic.*`, or `steps()`.**
- Add `snap: { v: 1 }` so the displayed integer increments exactly, with no fractional flicker.
- Stagger: widen from `0.16` to roughly `0.22` so the four numbers cascade rather than firing as a block, and keep the initial delay around `0.35–0.4s` after the trigger.
- Trigger: keep `once` semantics. Keep the `IntersectionObserver` `disconnect()` pattern so a re-render cannot double-fire.
- The `ap-swept` light sweep must fire **only after** that stat's number has landed.
- Cleanup must restore the final value so unmount / fast scroll cannot leave a half-rolled number on screen.
- Reduced motion: render the final value immediately, no tween, no sweep.
- No-JS / SSR: the server-rendered text must already be the correct final numeral.

**Consistency requirement:** `useOdometer` in `hooks/useMotion.ts` and `useCountUp` in `ProofStrip.tsx` drive the same kind of number (the Journey section shows its own `20 Cr+`). Apply the **same** easing philosophy there, or delete the dead implementation. Do not leave three divergent implementations.

**Acceptance criteria:**
- On a real scroll to the section, all four numbers visibly roll from `0` upward, at visibly different speeds, landing exactly on `20`, `70`, `1998`, `100` with correct suffixes (`Cr+`, `%+`, none, `%`).
- No number ever displays a fractional value.
- `1998` is not formatted with a thousands separator (the `isYear` guard must still work).
- Reduced-motion emulation shows final values instantly.
- All five gates green.
- Proof: capture `.screenshots/t2/` at 1440 with the mid-roll frame and the settled frame.

---

### T3 — Home: rebuild Understand → Develop → Manufacture → Supply → Repeat as a 3D cycle, and delete the `----`

**Owner file (exclusive):** `src/components/sections/RequirementToRepeat.tsx`
**Read-only:** `src/content/journey.ts` (`uspChain`, `uspPullQuote`), `src/components/sections/FoldEdge.tsx`

**Current state (verified):**
- Five `li.usp-node` tiles on an ascending staircase (per-node `margin-top` offsets at L105), each a clipped-corner plate with a hand-drawn `STEP_GLYPH` icon, label, and description.
- Between nodes, `.usp-link` — two interlocking rounded `rect`s rotated `-45deg`, drawn on a scrubbed timeline.
- **The `----` you must remove:** `.usp-loop-wrap` → `.usp-loop` → an SVG `path` with `d="M 98 0 C 98 56, 2 56, 2 6"` styled `stroke-dasharray: 6 5`, plus a `.usp-loop-head` triangle and a `.usp-loop-label` reading "Repeat supply". A dashed Bézier arc rendering as a run of dashes is the exact "large dash / `----`" element under this section. Secondary offenders in the same block: `.usp-quote-attr::before` (a `56px × 2px` bar in front of the attribution) and the `.usp-link` chain-link rects.
- Motion: a `gsap.matchMedia()` pair — a **scrubbed** timeline at `min-width: 1024px` and per-node `once` reveals below that — plus a `settle()` safety net that force-completes the reveal so it can never be left half-drawn (including a `onRefresh` self-check and a 3.5s timeout).
- The section closes with a pull quote and a folded A-peak ribbon (`.usp-peak`).

**Required outcome:**

1. **Delete the dash element completely.** Remove `.usp-loop-wrap`, `.usp-loop`, `.usp-loop-head`, `.usp-loop-label` from the markup, their CSS, and every reference in the GSAP block (the `loop` ref, its `clipPath` set, its tween, and its `clearProps`). Also remove the `.usp-quote-attr::before` bar. If you keep any of it, justify it in your report — the default is delete.

2. **Replace the flat staircase with a 3D cycle** that reads as one continuous manufacturing loop:
   - Five stages, always all five: Understand → Develop → Manufacture → Supply → Repeat. Labels and descriptions must still come from `uspChain` in `src/content/journey.ts` — never retyped into the component.
   - Real dimensionality: use a genuine 3D treatment (CSS 3D `transform-style: preserve-3d` on a ring/disc, perspective on the section, per-station counter-rotation so labels stay upright and legible, real shading via layered gradients and the existing `--silver-gradient` / burgundy ramp). A flat 2D fan with a drop shadow is **not** 3D — reject it.
   - The cycle must read as **structured and controlled**, never as an endless loop:
     - Absolutely **no** `infinite` animation, no auto-rotating ring, no perpetual spin, no `@keyframes` that repeat.
     - Animation is **triggered once** on scroll-in and **comes to rest**. If you add any idle motion, it must be a *finite* settle (e.g. a single 3D parallax that eases to a fixed pose) and it must stop.
     - No hover-triggered re-spin.
   - Subtle and professional: this is a B2B manufacturer's process, not a toy. No bouncing, no wobble, no glow.
   - Add a restrained, finite directional cue that communicates "this closes back on itself" — a short arc segment, a chevron chain, or a `Repeat → Understand` return marker. It must be a *drawn* element, not a dashed run of dashes.
   - Keep the existing `STEP_GLYPH` icon set unless a stage genuinely needs a redraw; the glyphs are on-brand 48-grid squared-stroke line art.
   - Keep the closing pull quote and its attribution, minus the bar.

3. **Responsive strategy** (the 3D cycle is a desktop enhancement, not a universal one):
   - **≥1024px:** the full 3D cycle.
   - **768–1023px:** a simplified 3D or isometric treatment — smaller, flatter perspective, still legible, no collision with the quote.
   - **<768px:** a clean vertical stack on a left rail (the current pattern is a good baseline — reuse it). No 3D on phones.
   - Never introduce horizontal page overflow at any width.

4. **Motion safety (do not regress this):**
   - Preserve the `settle()` pattern: reveals must complete even on fast scroll, anchor jumps, refresh-while-past, and reduced motion. The existing `ScrollTrigger.create({ onRefresh })` + timeout safety net is deliberate — port it to the new structure, do not delete it.
   - Every animated property must be `transform`, `opacity`, `clip-path`, or `stroke-dashoffset` only. No layout-animating properties.
   - Full `prefers-reduced-motion: reduce` static state, fully legible and complete.
   - Do not double-fire reveals against a scrubbed timeline (this is a known open item in `docs/critique/backlog.md`).

5. **3D containment:** `transform-style: preserve-3d` and perspective can leak scroll/overflow. Wrap in a container with `overflow: hidden` and confirm nothing clips the glyphs or descenders. Verify at 1440, 1024, 768, 375.

**Acceptance criteria:**
- Zero `----` / dashed-arc / `.usp-loop*` remnants anywhere in the section's markup or CSS (grep to prove it).
- All five stages visible with icon + label + description, sourced from `journey.ts`.
- Grep proof of no `infinite` in this file.
- 3D reads as 3D at 1440 (perspective evident, shading present, labels upright and undistorted).
- No overlap between the cycle and the pull quote at 1440 / 1024 / 768.
- No horizontal overflow at any width.
- Reduced-motion state is complete and readable.
- All five gates green. Proof in `.screenshots/t3/`.

---

### T4 — Sitewide: remove the "AI-looking" large dashes without breaking the brand

**Owner files (exclusive):** every file in Audit A bucket (a) and (b), plus `src/components/hero/ValuesRibbon.tsx`'s renamed equivalent and `src/content/*.ts`.
**Must NOT edit:** anything in Audit A bucket (c).

**This is a copy-editing + restraint task, not a find-and-replace.** It is the highest-risk task for meaning drift, so run it **last**, after all other copy is final.

**Rules for user-visible copy:**
- Replace a decorative `—` with the punctuation the sentence actually wants: a comma, a full stop, a colon, a semicolon, parentheses, or nothing at all. Read each sentence and choose deliberately.
- **Attribution lines:** `uspPullQuote.attribution` currently begins `— Aalok Kumar, CEO, Alok Plastics`. Drop the leading dash; the name is the attribution.
- **Do not** convert a dash into a hyphen inside a word. Leave legitimate hyphenated compounds (`Pan-Bharat`-style forms only if they are genuinely compounds, not style), technical hyphens, ranges, and CSS/markup identifiers completely alone.
- **Never** touch: `site.tagline.devanagari` / `site.tagline.english`, the Devanagari copy anywhere, `§N.N` spec references, comments, JSDoc, code identifiers, CSS custom properties, `data-*` attributes, Tailwind/arbitrary syntax, `//`-prefixed author notes, and the `// COPY: drafted, needs client approval` markers (keep them).
- Metadata descriptions (`src/lib/seo.ts`) are user-visible in search results and count as visible copy — humanise them the same way, but **preserve every keyword and every verified fact**, and preserve character-length intent (do not truncate mid-claim).
- Spelling consistency is already a known open item (`recognized` vs `recognised`, in `docs/critique/backlog.md`). The project voice is British (`moulded`). **Unify on `recognised`** and apply it consistently — but flag this to the user as a client-approval item rather than silently changing client copy.

**Rules for decorative rules:** the complaint is *repetition* — the same long dash under every heading across every page. Remove the ornament where it adds nothing and keep the brand's actual structural devices. Specifically:
- **Keep:** the 24px burgundy eyebrow bar (`.cp-eyebrow i`, `.usp-micro::before`, `.ap-micro::before`, `.pim-label i`, `.hero__eyebrow-bar`) — this is the identity device, not an AI artefact.
- **Keep:** `.ph__rule` in `PageHero.tsx`, `FoldEdge` diagonals, the `Divider` component, the Hero tagline hairlines, `.ab-val::before` corner arms, table/drawing-sheet borders that carry data structure.
- **Remove or reduce:** orphaned rules with nothing above or below them, the `.usp-quote-attr::before` bar (already handled in T3), `.ap-tb-head`'s `padding-left: 56px` that reserved space for a rule that no longer exists, repeated stacked `border-top` ornaments under consecutive headings, and any `height: 1–2px; width: 40px+` pseudo-element that is pure decoration and duplicates the eyebrow bar.
- After any removal, check for **collateral layout damage**: a removed absolute pseudo-element often leaves a `padding` or `gap` that now looks like dead space. Re-balance with tokens, not magic numbers.

**Acceptance criteria:**
- Zero decorative `—` runs remain in user-visible copy; every replacement is grammatical and meaning-preserving.
- Every change is a punctuation/spacing decision you can justify in one clause. Produce a **before → after table** for every copy change in your report — the user will review this line by line.
- Zero changes to bucket (c).
- Zero changes to locked Devanagari or to verified numbers.
- Site still reads naturally end to end. Proofread the rendered output, not just the source.
- All five gates green. Proof in `.screenshots/t4/`.

---

### T5 — Home: turn the Pan India map into a product-and-network story

**Owner file (exclusive):** `src/components/sections/PanIndiaMap.tsx`
**Read-only:** `src/components/sections/worldDots.ts`, `src/components/brand/Pictogram.tsx`, `src/content/products.ts`, `src/content/site.ts`, `docs/decisions.md` (ADR-012)

**Current state (verified):**
- An accurate dot-matrix world map generated from Natural Earth 1:10m data (`worldDots.ts`). India is drawn with the Government of India depiction in burgundy; the rest of the world is a muted silver dot backdrop.
- `ORIGIN = ind(76.78, 30.73)` — Chandigarh, the pulsing origin with two `pim-ring` pulses gated behind a `.live` class so they stop off-screen.
- `DOMESTIC` = 16 **unlabelled** in-India points; `WORLD` = 10 illustrative out-of-India points. Arcs are quadratic Béziers from the origin (`arcPath()`), drawn on a once-only GSAP timeline with a light dot (`ride()`) travelling each arc once.
- A `VIEWBOX`-based `inFrame()` guard hides endpoints that fall outside the frame.
- Layout: heading + lead + a 3-row legend on the left/right split, then a full-width framed stage. The stage uses an intersect `mask-image` so the map fades at the edges; on mobile the SVG is scaled `175%` and offset `-55%`.
- Legend rows today: Origin, Pan Bharat network, and a third "ambition" row.
- `figcaption`: "Illustrative. Arcs show direction of travel, not delivery destinations." — **ADR-012 honesty guard. Keep it.**

**Diagnosis:** it is currently a competent abstract map plus a text description. It does not say *what moves*. For a plastics manufacturer the missing idea is: **moulded parts leave one factory in Chandigarh and become components inside other people's machines, all over India.**

**Required outcome — build the visual storytelling system:**

1. **Keep the verified geometry.** Do not regenerate `worldDots.ts`, do not redraw India, do not change the projection. The map is honest, accurate, and already review-approved under ADR-012. Your work is the layer on top.

2. **Introduce the product layer.** Use `Pictogram` (the sanctioned 20-name hand-drawn set) and nothing else. Ground every glyph in a real catalogue item from `src/content/products.ts`:
   - Parts: `float-valve`, `f-bush`, `connecting-bush`, `gasket`, `waste-pipe`, `ventilation-jalli`, `door-lock`, `hinge`, `push-cock`, `adjustable-leg-insert`.
   - Machines the parts go into: `water-cooler`, `display-counter`, `deep-freezer`.
   - Draw them as vector groups inside the map SVG using the same 48-grid squared-stroke, `currentColor`/token-coloured line-art language as `Pictogram.tsx`, or reuse its paths directly. Do not rasterise, do not use emoji, do not use a glyph font, do not invent part names.

3. **Tell the story in the composition.** A strong structure to build toward (use judgement, this is a direction not a spec):
   - The origin is a **factory**, not a dot: seat a compact machine/part lockup at Chandigarh as the source node.
   - The arcs carry **cargo**: at a subset of the domestic arc endpoints (alternate them so the map does not turn into confetti), place a small product pictogram plate — ~10–14px, burgundy, hairline frame. Each plate is a part that physically arrives somewhere.
   - The machines are the **destination context**: a compact "what we supply" key showing the three machine pictograms with the part families that fit them.
   - A thin, structured connector/hub system (an origin hub plus region nodes) makes it read as a *network* rather than a map with lines.

4. **Make it feel data-driven without inventing data.**
   - Any count you display must be **derived** at render time from real data: `publishedProducts.length`, `productGroups.length`, the number of `DOMESTIC` points, the number of distinct materials. Never hardcode a figure, never invent one.
   - Add a compact "at a glance" strip (e.g. part families / material families / states served) where every value is computed. Keep it restrained — this is a manufacturer, not a SaaS dashboard.
   - Preserve the existing `site.proof` numbers if you reuse them.

5. **Keep the honesty guard intact.** No city names. No country names other than India. No flags. No delivery-time or service-coverage promises. No export claims. Keep the illustrative `figcaption`. If you add a new caption line, it must be equally honest.

6. **Keep the motion discipline.**
   - Once on scroll-in, then rest. No infinite loops. The origin pulse may continue **only** while the section is on screen (the existing `.live` / IntersectionObserver gate) — preserve that.
   - `transform`, `opacity`, `stroke-dashoffset` only.
   - Full reduced-motion static state.
   - Respect the existing stage `mask-image`; new elements must not be clipped unintentionally at the edges, and must not break the mobile `175% / -55%` scaling.

7. **Responsive.** Desktop: full network + product plates. Tablet: fewer plates, same story. Mobile: the map must remain legible and must not overflow horizontally; consider dropping the endpoint plates and keeping the key.

**Acceptance criteria:**
- A reader who has never seen the site can tell, from the visual alone: parts are made in Chandigarh, they are real moulded components, they travel across India, and they end up inside coolers, display counters and freezers.
- Every pictogram maps to a real catalogue entry. No invented parts.
- Every displayed number is computed from data.
- ADR-012 honesty rules intact; the disclaimer survives.
- India geometry and projection unchanged.
- No horizontal overflow at 375 / 768 / 1440.
- Reduced-motion state complete.
- All five gates green. Proof in `.screenshots/t5/`.

---

### T6 — `/about/` hero: remove the "आलोक" outline text under the logo mark

**Owner file (exclusive):** `src/components/page/art/AboutArt.tsx`
**Must NOT edit:** `src/app/about/page.tsx` for this task, `src/components/page/PageHero.tsx`, `src/components/brand/Logo.tsx`.

**Current state (verified):**
- `AboutArt` is a 640×760 SVG with `preserveAspectRatio="xMaxYMid meet"`, injected into `PageHero` via `art={<AboutArt />}` with `layout="center"`.
- Contents: light rays fanning from a point at the top; a small burgundy dot and ring at the apex; a **folded A-peak ribbon** group (`.pa-rise`) — a burgundy leg and a metal leg meeting at a 46° crease with highlight lines; **an outlined Devanagari `<text>` reading `आलोक` centred at `y=728` in `--grey-metal` 1px stroke**; and two register marks.
- Animation helpers `pa-draw` / `pa-fade` / `pa-rise` and the `D()` timing helper come from `./artCss`.

**Required outcome:**
- **Delete the `<text>` element and its group entirely.** No Devanagari, no watermark, no outline lettering, no stray characters anywhere in that art.
- **Change nothing else about the composition.** Same viewBox, same `preserveAspectRatio`, same rays, same ribbon geometry, same gradients, same register marks, same animation timing, same colours. The mark must land in exactly the same position at exactly the same size.
- Do not crop, stretch, distort, rotate, or resize the ribbon. Do not alter its gradients.

**DECISION GATE — resolve before you touch the file, ask the user if unsure:**

> The folded A-peak ribbon **is** the brand's A-peak mark, drawn in the logo's geometric language. The alternative reading is to replace it with the actual traced logo mark (`<Logo lockup="mark" variant="color" />`).
> - **Recommended:** keep the ribbon exactly as-is, delete only the text. Zero risk of visual regression, zero layout shift, and it stays consistent with how the A-peak is drawn elsewhere on the site (`RequirementToRepeat`, `JourneyOrbit`).
> - **Alternative:** swap in `<Logo lockup="mark" variant="color" />`, which would render the genuine ALOK mark. This changes the artwork's geometry and therefore its visual footprint — it is a *bigger* change than the brief's "not a redesign" allows, and it would break the shared folded-A language.
>
> Default to **Recommended** if the user does not reply. If you take the alternative, say so loudly in your report.

**Acceptance criteria:**
- Zero text nodes of any kind inside the `/about/` hero art. Verify with `document.querySelectorAll('.ph__art text').length === 0` in Playwright.
- The mark occupies the same pixel rectangle as the baseline screenshot (compare `.screenshots/baseline/about-1440-fold.png` against `.screenshots/t6/about-1440-fold.png`; the ribbon bounding box must not move).
- No regression in the light rays, register marks, or the apex dot.
- No changes to `/career/`, `/products/`, or any other route.
- All five gates green.

---

### T7 — `/about/`: remove the outer border around the logo + colour legend

**Owner files (exclusive):**
- `src/app/about/page.tsx` — the brand-idea section markup (the `.cp-sheet.ab-idea__sheet` wrapper) and the `.ab-idea*` CSS block only
- `src/components/about/parts.tsx` — **only if** you can scope the change safely; see the blast-radius warning below

**Current state (verified):**
- The section is `.cp-section.ab-idea`, whose background is `--surface`. It lays out `.ab-idea__grid` (`5fr / 7fr` at ≥1024px).
- The left column is `<Reveal variant="wipe"><div className="cp-sheet ab-idea__sheet">`, containing:
  - `.ab-idea__logo` — a flex-centred `<Logo variant="color" width 100%, maxWidth 340, height auto />`. **This is the real, verified ALOK + PLASTICS trace. Preserve it byte-for-byte.**
  - `<ul className="ab-legend">` — two rows, each with a 16px colour swatch `<i>` and text. The strings are **already exactly** `Burgundy: our strength` and `Grey: our metal`. Preserve them exactly.
- `.cp-sheet` is defined in the shared `SECTION_CSS` in `src/components/about/parts.tsx` as `background: var(--surface); border: 1px solid var(--grey-metal)` **plus `::before` and `::after` corner-bracket pseudo-elements** (top-left and bottom-right, 10px, 1px border). That border plus those brackets **are** the outer frame you must remove.
- **BLAST RADIUS WARNING:** `.cp-sheet` is shared — it is also used by `.ab-plate` (the About leadership cards, also on `/about/`) and is exported into `/career/` via `SECTION_CSS`. **Do not edit `.cp-sheet` itself.** Remove the class from this one element in `about/page.tsx`, or define a borderless override scoped tightly to `.ab-idea__sheet`.

**Required outcome:**
- **No outer frame whatsoever** around the logo + legend: no border, no outline, no corner brackets, no card background panel, no shadow, no rounded container. The user was explicit: do **not** replace the border with a shadow, a card, or a background panel.
- Since the section background is `--surface` and `.cp-sheet`'s background is also `--surface`, dropping the background is visually a no-op — do it anyway so nothing is inherited.
- **Keep** the logo, its size, its centring, its colours, and its `PLASTICS` lettering, exactly as rendered today.
- **Keep** the two legend rows, their exact text, their exact swatch colours (`--burgundy` and `--grey-metal`), and their horizontal alignment.
- Keep the existing `border-top` hairline on `.ab-legend` as the single, thin visual separator between logo and explanation. That is the "thin divider only if needed" the brief allows. Do not add a second divider, a box, or a frame.
- Preserve the current padding rhythm so the block does not collapse or jump. Keep `Reveal variant="wipe"` and its behaviour — check `src/components/ui/reveal.css` for any dependency on the bordered element before you change the class list.

**Do NOT touch:** the navbar, the hero, `.ab-idea__devname` (`आलोक` heading), `.ab-idea__means`, `.ab-idea__p`, `.ab-tag`, or any of `.ab-story*`, `.ab-vm*`, `.ab-vals*`, `.ab-lead*`, `.ab-rec*`, `.ab-culture*`. Do not change typography, background colours, logo colours, or logo proportions anywhere.

**Acceptance criteria:**
- The logo + legend render with **zero** enclosing border, bracket, shadow, or panel — verified visually and by `getComputedStyle` on the wrapper (`border-top-width === '0px'`, `box-shadow === 'none'`).
- `.ab-idea__sheet` no longer carries `cp-sheet` (or is overridden to borderless).
- **The About leadership plates (`.ab-plate`) still have their sheet border** — confirm they are visually unchanged.
- `/career/` is completely unaffected (it imports the same `SECTION_CSS`).
- The legend strings are still exactly `Burgundy: our strength` and `Grey: our metal`.
- All five gates green. Proof: `.screenshots/t7/` at 375 / 768 / 1440, plus an unchanged `/career/` diff check.

---

### T8 — `/career/` hero: fix the decorative "PEOPLE & CRAFT" overlap

**Owner files (exclusive):**
- `src/components/page/art/CareerArt.tsx`
- `src/components/page/PageHero.tsx` **only if** a change there is strictly required (see below)

**Current state (verified):**
- `CareerArt` renders `.pa-career` (a `position: relative; width: 100%; height: 100%` box, `pointer-events: none`) containing `.pa-career__word` — an `aria-hidden` outlined display wordmark reading `PEOPLE` / `& CRAFT`, set with `-webkit-text-stroke: 1.5px` in a translucent burgundy, `font-size: clamp(3rem, 6.5vw, 6.5rem)`, `position: absolute; top: 0; right: 0; z-index: 0`, `white-space: nowrap`, `text-align: right`.
- It is **already hidden below 768px** (`display: none`) and already scaled down for tablet (`clamp(3rem, 6vw, 5rem)`).
- Inside `PageHero` with `layout="stack"`: `.ph__art` is `position: absolute; inset: 0` at `z-index: 1`; `.ph__body` is `z-index: 2`. **The stacking order is already correct** — this is a *geometric collision*, not a z-order bug. The heading is rendered at `clamp(2.75rem, 7vw, 6.25rem)` in `stack` layout, so at mid-desktop widths the oversized heading and the oversized watermark occupy the same band.
- `.ph` has `overflow: hidden` already.

**Required outcome:**

1. **The heading always wins.** "Grow alongside the company." must be fully readable and the strongest visual element at every width. Zero geometric intersection between the watermark's bounding box and the H1's, the breadcrumb's, the CAREER label's, or the lead paragraph's — at **every** tested width.

2. **Reposition the watermark to the true empty zone — upper right, clear of the text column.** Prefer a *layout-based* solution over magic pixel offsets: constrain the watermark into its own track or clamp it with a max-width derived from the grid tokens, so it occupies the region to the right of the text column rather than floating over it.

3. **Correct positioning context.** `.pa-career` is currently the containing block. Make the hero itself the positioning context so the watermark can respect the hero's page padding and nav clearance (the glass pill is `16px + 64px` → content must clear `96px`). Do not let the watermark slide under the nav pill at any width.

4. **Keep the layering explicit.** Background: grid + watermark. Foreground: breadcrumb, label, heading, lead, and the team sheet. Assert the watermark's computed `z-index` is strictly below `.ph__body`'s, and that the watermark is `aria-hidden` and non-interactive.

5. **Responsive, not hardcoded.** Because the heading scales with `vw` and the watermark scales with `vw` independently, a fixed offset will break at some width. The solution must be derived from the grid/tokens. Target behaviour:
   - **≥1024px:** large, upper-right, generous clearance from the heading.
   - **768–1023px:** scaled down, pushed further up/right, still zero overlap.
   - **<768px:** keep it hidden (already correct) — or show it only if you can prove zero overlap.
   - Test at minimum: **360, 375, 414, 768, 834, 1024, 1280, 1440, 1920**.

6. **Clip safely.** Clip the decorative text inside the hero (`overflow: hidden` on the hero is fine and already present) but never clip the heading, lead, or the team sheet.

7. **Preserve the design exactly.** Same outlined typography, same thin stroke treatment, same subtle burgundy/grey tone, same background grid, same hero spacing, same fonts, same weights. Do not replace the watermark with a different design.

8. **Do not modify main content.** Not the heading, not "A strong company is built by strong people.", not the breadcrumb, not the CAREER label, not the `.cr-hero-sheet` team sheet, not the navbar, not any button, not any font size unless a collision at a tested width makes it unavoidable — and if it does, stop and report instead of silently shrinking the heading.

9. **Keep the watermark string as-is.** It currently reads `PEOPLE` / `& CRAFT`. The user's brief writes it as "PEOPLE / CRAFT". Changing the string is a content change and is out of scope for a layout fix. If you believe the ampersand should go, raise it as a question in your report; do not change it unilaterally.

**Acceptance criteria — and these must be machine-verified, not eyeballed:**

Run the Phase 0 measurement script again after the fix and save it to `docs/loop-log/t8-after-overlap.md`. Then assert:

```
For every width in [360, 375, 414, 768, 834, 1024, 1280, 1440, 1920]:
  overlapPx2 (watermark ∩ h1)  === 0
  leadOverlapPx2 (watermark ∩ lead) === 0   (when the lead is visible)
  heading computed font-size is UNCHANGED from baseline
  heading text content is exactly "Grow alongside the company."
```

- Zero overlap at every width, both columns of the report agree.
- The watermark remains visible and clearly intentional at ≥768px, and hidden below.
- The heading is the visually dominant element.
- All five gates green. Proof in `.screenshots/t8/` at all nine widths.

---

## 5. PHASE 3 — VERIFICATION AND ITERATION

### 5.1 Full gate suite (orchestrator, after every workstream AND at the end)

```bash
pnpm typecheck
pnpm lint
pnpm build
npx serve out -l 4173 &
pnpm test
pnpm test:a11y
node scripts/shoot.mjs final /,/about/,/career/,/products/,/industries/,/contact/,/enquiry/ 375,768,1024,1440 http://localhost:4173
```

### 5.2 Additional regression sweeps (write these as throwaway scripts, not in `tests/`)

1. **Horizontal overflow sweep** — every route at 360/375/414/768/1024/1440/1920. `document.documentElement.scrollWidth <= clientWidth`.
2. **Console-error sweep** — every route, fail on any `console.error`, page error, hydration warning, or GSAP "target not found" warning. Route changes and `matchMedia` cleanup bugs surface here.
3. **Reduced-motion sweep** — emulate `prefers-reduced-motion: reduce`, load every route, confirm all content is present, visible, and fully legible, and that nothing is stuck at `opacity: 0` or `visibility: hidden`.
4. **No-JS sweep** — disable JavaScript, load `/`, `/about/`, `/career/`. Confirm the T2 numbers show their final values, headings are visible, and there is no blank content region.
5. **Focus sweep** — tab through `/`, `/about/`, `/career/`. Every interactive element must show a visible focus ring and never be trapped.
6. **Text integrity** — diff the rendered body text of every route before vs after, and produce an explicit list of every changed string. A copy change you cannot justify is a regression.
7. **Route blast-radius check** — confirm `/career/` and the About leadership plates are pixel-unchanged where T6/T7 said they would be.

### 5.3 Iteration protocol

On any gate or sweep failure:

1. Classify: **code defect** / **gate-script false positive** / **pre-existing**.
2. Code defect → dispatch a fix subagent with the exact failing output, the exact file, and a one-line root cause. Re-run the full gate suite. **Maximum 3 loops per workstream.**
3. Gate false positive → do **not** edit the guard script to make your code pass. Escalate to the user with the guard's intent and your case.
4. Pre-existing → record it, do not fix it, do not let it block.
5. After 3 failed loops on the same workstream → **stop**, revert that workstream to baseline, and report. A half-done redesign is worse than the original defect.

### 5.4 Definition of done

- All five gates green at the end.
- All seven sweeps clean or documented.
- Zero new console errors.
- Zero new a11y violations (serious/critical) on the 10 audited routes.
- Zero horizontal overflow at any tested width, any route.
- Every content change listed in a before → after table and justified.
- No invented numbers, no invented history, no city names in the map, ADR-012 intact.
- All eight tasks verifiably fixed, with screenshot evidence per task.
- `docs/decisions.md` updated with **ADR-015 and onward** — one ADR per architectural decision you made (parts-schedule replacement, count-up easing policy, 3D process cycle, dash-removal policy, Pan India product layer, About hero mark, About borderless brand block, Career hero stacking). Follow the existing ADR format.
- `docs/agent-log.md` appended in the existing format.

---

## 6. GLOBAL NON-NEGOTIABLES

1. **Never change the meaning of any content.** Punctuation may change; claims may not.
2. **Never invent data.** No number, city, country, client count, date, or capability that is not already in the content files or derivable from real data.
3. **Never break a shared component for one page.** Before editing anything in `PageHero.tsx`, `artCss.ts`, `parts.tsx`, `Logo.tsx`, `Pictogram.tsx`, `FoldEdge.tsx`, or the token/UI CSS, enumerate every route that imports it and verify each one afterwards.
4. **Never degrade accessibility.** Decorative means `aria-hidden` + `pointer-events: none`. Contrast must hold. Focus must be visible. Reduced motion must be complete.
5. **Never introduce an infinite animation.** Finite, scroll-triggered, then at rest.
6. **Never commit or push** without an explicit request.
7. **Report honestly.** If you could not fully satisfy a task, say so plainly and say exactly what is left. A truthful partial report is required; an optimistic one is a failure.

---

## 7. DECISION GATES — ASK BEFORE GUESSING

Stop and ask the user if any of these arise:

| Gate | Question |
|---|---|
| **T6** | Keep the folded A-peak ribbon as the hero mark (recommended), or replace it with the traced `<Logo lockup="mark" />`? |
| **T1** | Is a borderless component rail acceptable, or does the client want the parts removed from the home page entirely? |
| **T2** | Confirm: the founding year should also roll from **0** (per the brief) rather than from 1900? |
| **T4** | British `recognised` vs American `recognized` — client copy is inconsistent today; unify on which, and is client approval required? |
| **T4** | Do `site.proof` values and the pull-quote attribution count as "copy" for the dash cleanup? |
| **T8** | Should the watermark read `PEOPLE & CRAFT` (as it does today) or `PEOPLE CRAFT` (as the brief writes it)? |
| **T5** | Is deriving a "regions served" count from the 16 `DOMESTIC` points acceptable as a display figure, or should the map stay purely qualitative? |
| Any | Any change you believe improves the result but falls outside the brief. Raise it; do not do it silently. |

---

## 8. FINAL REPORT FORMAT

Return, in this exact structure:

1. **Outcome per task** (T1–T8): `DONE` / `PARTIAL` / `BLOCKED`, one paragraph each, naming the exact files changed.
2. **Gate results table** — all five commands plus the seven sweeps, baseline vs final.
3. **Evidence index** — screenshot paths and the two overlap reports.
4. **Content change log** — every before → after copy change, one line each, with justification.
5. **Architecture decisions added** — ADR numbers and titles.
6. **Constraints honoured** — tokens, no hex, no 28–36px spacing, reduced motion, a11y, honesty rules, no infinite animation.
7. **Open items and honest gaps** — anything not fully solved, anything you would do differently, and any decision still waiting on the user.