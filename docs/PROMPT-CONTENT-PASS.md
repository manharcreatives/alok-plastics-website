# ALOK PLASTICS — CONTENT + FLOW + EMPHASIS PASS

**Audience:** Claude, operating as a senior agentic developer who leads a team of sub-agents.
**Scope:** Tasks 1, 3, 4 (remove duplicate/unnecessary content · highlight keywords · decide section flow first).
**Repo:** `alok-plastics-website` — Next.js 16.3.7 static export, React 19, Tailwind v4, TypeScript, GSAP, Lenis.

---

## 0. HOW YOU MUST WORK — THE AGENTIC LOOP

You are the **senior developer and the decision-maker**. You do not delegate judgement; you delegate *labour*.
Sub-agents gather facts and verify results. **You** own the flow decisions, the copy decisions, and the final judgement.

Run this loop. Do not linearise it into one pass.

```
 ┌─ 0. GATE ───────────────────────────────────────────────┐
 │  Confirm tree is clean. Confirm the 5 gates pass BEFORE   │
 │  you touch anything. A red baseline is not your fault,   │
 │  but it must be recorded before you start.               │
 └───────────────────────────┬───────────────────────────────┘
                             ▼
 ┌─ 1. RECON (parallel sub-agents) ─────────────────────────┐
 │  Fan out 3–5 read-only scouts. They return FACTS with    │
 │  file:line. They do not edit. They do not recommend.     │
 └───────────────────────────┬───────────────────────────────┘
                             ▼
 ┌─ 2. DECIDE (you, alone, no edits) ───────────────────────┐
 │  Write the FLOW MANIFEST: for every page, the target    │
 │  section order and the fate of every current section     │
 │  (KEEP / MOVE / CUT / MERGE / REWRITE). This is a        │
 │  document BEFORE it is a diff. Nothing gets edited       │
 │  until the manifest exists.                              │
 └───────────────────────────┬───────────────────────────────┘
                             ▼
 ┌─ 3. EXECUTE (one page per batch) ────────────────────────┐
 │  Small batches. One page. Copy first, structure second.  │
 │  Run gates after EVERY batch, not at the end.            │
 └───────────────────────────┬───────────────────────────────┘
                             ▼
 ┌─ 4. VERIFY (independent sub-agent) ──────────────────────┐
 │  A scout that did NOT do the edit re-reads the result    │
 │  and tries to REFUTE your work. Report gaps, not praise. │
 └───────────────────────────┬──────────────────────────────┘
                             ▼
 ┌─ 5. GATE ────────────────────────────────────────────────┐
 │  typecheck · lint (4 scripts) · a11y · build · SEO       │
 │  ANY failure blocks. Fix, then re-enter VERIFY.          │
 └───────────────────────────┬──────────────────────────────┘
                             ▼
        not clean ─────────────► back to 3
                                 clean ──────────────► next page
```

### Hard rules of the loop

- **No editing before the Flow Manifest exists.** Task 4 gates Tasks 1 and 3. You cannot decide what to cut until you know what the page is *for*.
- **Never let a sub-agent decide taste.** Scouts report `file:line` + quoted string. You decide.
- **Every batch must be independently revertable.** One page = one reviewable unit. Do not refactor `src/content/` and three pages in the same batch.
- **If a scout and the source disagree, the source wins.** Verify before you act on any claim in this document — it was written from a prior audit and may have drifted.
- **Stop and ask** before deleting anything a client supplied (numbers, history, names) or anything that changes a legal/privacy statement.

---

## 1. NON-NEGOTIABLES (a violation here = a failed task)

### 1.1 The five gates

Run all five. They are the definition of done.

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint + check-hex + check-spacing + check-glass + check-forbidden
npm run test:a11y     # playwright tests/a11y.spec.ts (axe)
npm run build         # next build (also runs postbuild prune-lab/sitemap/llms/catalogue)
npm run check:seo     # SEO assertions
```

If any gate is red, the batch is not done. Do not report success on a red gate.

### 1.2 Colour lock — the hardest constraint

`scripts/check-hex.mjs` **fails the build** if any hex outside a locked set appears anywhere in `src/`.
The allowed set is exactly the 24 tokens in `src/styles/tokens.css` plus 4 gradient-only stops.

> **Consequence for Task 3:** you may **not** introduce a single new hex value to make a highlight work.
> Highlights must be built from existing tokens. This is not a stylistic preference — it is a hard CI gate.

Tokens already sanctioned for emphasis, per their own definitions in `tokens.css`:

| Token | Hex | Token's own stated role |
|---|---|---|
| `--burgundy-bright` | `#8A2C38` | "link hover, **highlights**, charts" |
| `--pink-soft` | `#F3DFE0` | "tags, hover panels" — already the About highlighter |
| `--blush` | `#FAF1F1` | "callout boxes, note panels" |
| `--rose-pale` | `#E3B5B8` | "text accent on burgundy, soft outlines" |
| `--rose` | `#C35A61` | "accent on dark backgrounds, small highlights" |
| `--grey-warm` | `#D8D4D0` | "fine lines, card borders" |
| `--ink` / `--body` | `#1E1115` / `#4A3D40` | headings / paragraphs |

If you need a new semantic name (e.g. `--hl-bg`), define it in `tokens.css` **as a composition of existing tokens** — e.g.
`--hl-bg: var(--pink-soft);` — never as a literal hex. That keeps the token set closed and the gate green.

Also banned by `check-forbidden.mjs`: `rounded-2xl`/`rounded-3xl` (pills are banned), any blue/purple/cyan/teal,
aurora/sparkle/blob/liquid-glass language, `outline: none`, `100vh` (use `100svh`), `lorem ipsum`.
Card radius ceiling is `--radius-card: 6px`; pills only for the glass navbar.

### 1.3 Spacing lock

`check-spacing.mjs` enforces a base-4 system. Never hardcode arbitrary values between 28px and 36px.
Use `--space-xs/sm/md/lg/xl`.

### 1.4 The honesty rule

This is a real manufacturer with real clients. The site carries an explicit honesty discipline
(see `docs/decisions.md` ADR-012, and the `PanIndiaMap` caption).

> **Never invent a number, testimonial, client name, certification, lead time, or capacity.**

- A stat must be client-verifiable or already present in `src/content/`.
- `src/content/site.ts` marks its figures as *"the ONLY numbers allowed."* Treat that as binding.
- If a claim cannot be substantiated, **remove or weaken the claim** — do not invent support.
- `TODO(client)` markers are deliberate. Leave them and report them. Do not silently fill them.
- Aspirational language is allowed in `vision`, never in a stat tile.

### 1.5 Structural conventions

- Server Components import icons from `@phosphor-icons/react/dist/ssr/*`. The `dist/csr/*` build calls `createContext` and **breaks Server Components** (ADR-014).
- Section grammar is `MicroLabel → H2 → optional lead → optional right link`. This lives in `src/components/ui/SectionHeader.tsx` and `src/components/about/parts.tsx`. Do not invent a fourth grammar.
- Every route is wrapped by `src/app/layout.tsx`: skip-link → Preloader → LenisProvider → RuntimeProvider → CartProvider → AnnouncementBanner → Header → `<main id="main">` → Footer → WhatsAppFAB.
- `src/components/sections/Footer.tsx:50` contains `body:has(.eb, #enquiry) .ft__cta { display: none; }`.
  Adding or removing an `EnquiryBand` silently changes whether the footer quote CTA appears. **Check this coupling on every page you touch.**

---

## 2. TASK 4 (FIRST) — DECIDE THE FLOW OF EVERY SECTION

> *"Before improving any content, decide the sequence of sections on every page."*
> This is the correct methodology and it is non-negotiable. A page's job is one job. Section order is how you enforce it.

### 2.1 The decision framework

For each page, answer in this order. Write the answers into the manifest.

1. **Who arrives here, and what do they want?** A service technician hunting a float valve. An OEM buyer qualifying a supplier. A job candidate. A returning customer re-ordering. Each wants a different page.
2. **What is the single next action?** Every page must make exactly one action obvious. Name it.
3. **What must they believe before they act?** Trust is built in a specific order: *legibility → capability → process → proof*. Never lead with proof; nobody trusts a number from a stranger.
4. **What can be deleted without losing the argument?** Anything that repeats another section's job is a candidate for CUT.
5. **What is the shortest honest path?** Length is a cost. Every extra section taxes the scroll.

### 2.2 The canonical spine

Almost every page here should be an instance of this spine, sized to the page's job:

```
Hero (what we are + primary action)
  → Capability  (what we make / what we do)
  → Bridge      (the thing they specifically came for that capability doesn't cover)
  → Process     (how we work — this is the differentiator for a manufacturer)
  → Proof       (numbers, history, reach — only AFTER they know what you make)
  → Convert     (one action, repeated once)
```

**The most common failure in the current build is `proof before capability`.** The homepage places
`AboutIntro` (the `20 Cr+ / 70%+ / 1998 / 100%` numbers band) at position **2**, immediately after the hero.
A first-time visitor has no context for `20 Cr+` — it is a number about a company they have not understood yet.
Trust numbers land as noise. They belong adjacent to history and reach, after capability is established.

### 2.3 Audit findings on flow (verify each before acting)

**`/` — homepage, 10 blocks. Longest page on the site by a wide margin.**

Current: `Hero → AboutIntro+proof → ProductGroups → NeedPartBlock → RequirementToRepeat → IndustriesBento → JourneyOrbit → PanIndiaMap → TrustQuote → EnquirySection`

| # | Finding | Action |
|---|---|---|
| 1 | Two pinned scroll-scrubbed sections (`RequirementToRepeat` 3D ring, `JourneyOrbit` ~250vh road) plus a map with ~26 animated arcs. Enormous scroll budget on the first visit. | CUT one pinned section. Keep `JourneyOrbit` (it carries the history and the odometer). Demote `RequirementToRepeat` to a static/step-reveal section unless testing shows the pin earns its place. |
| 2 | `AboutIntro`'s proof band sits at position 2, before capability. | MOVE. Proof belongs with `JourneyOrbit`/`PanIndiaMap` near the bottom. |
| 3 | `NeedPartBlock` ("Two ways to start" → From the catalogue / Custom development) sits at position 4, *after* `ProductGroups` has already explained how to browse the catalogue. It is a fork the visitor has already passed. | MOVE directly under the hero, or MERGE into `ProductGroups` as its closing block. Do not leave a chooser stranded in the middle. |
| 4 | Positions 6, 7, 8 are three consecutive heavy credibility blocks (`IndustriesBento`, `JourneyOrbit`, `PanIndiaMap`). | KEEP at most two. Fold industries into a compact strip or move it to `/industries` only. |
| 5 | `PanIndiaMap`'s "What leaves Chandigarh" unit chart is *catalogue* detail, not *trust*. It duplicates what `ProductGroups` already showed. | CUT the unit chart. Keep the map + honest caption. |
| 6 | `TrustQuote` is titled `We don't just mould plastic. We mould possibilities.` under the eyebrow `Why manufacturers choose Alok Plastics`. The headline answers neither question — it is a brand line, not a reason to choose. | MOVE `TrustQuote` up (it is genuine "why us" material, and it belongs before process), and REWRITE the eyebrow so the commitments ledger beneath it actually answers it. |
| 7 | `EnquirySection` last — correct. | KEEP. But it repeats its own form's field labels in the aside (see Task 1). |

**`/about` — 10 sections, and one is a verbatim duplicate of the homepage.**

- **Position 6 (`JourneyOrbit`) is byte-identical to home position 7** — same H2, same six milestones, same ~250vh pin. A visitor who scrolled the homepage has already seen it in full. This is the single worst repetition on the site.
  → **Decision required:** if `JourneyOrbit` stays on the homepage, `/about` must not repeat it. Either CUT it from `/about`, or replace it with about-page-native material. Do not ship a 250vh pinned duplicate.
- `Core values` (position 5) renders exactly **two** values under a plural heading, with a hardcoded `i === 0` branch (`about/page.tsx` / `ab-val--hero` vs `ab-val--soc`). Adding a third value breaks the layout silently. → REFRAME as two panels with honest labels, and fix the index branch.
- The sprue-and-runner SVG at position 5 illustrates material waste; its caption says only "Smarter manufacturing." → CAPTION must name the idea.
- Position 9 (`Our people` → `/career/`) and position 7 (`Leadership`) overlap. → MERGE or differentiate.

**`/industries` — heading collision with the homepage.**

- Its H1 `Built for the industries that build India.` is **verbatim identical** to the homepage `IndustriesBento` H2. Same words, two pages. This hurts SEO and reads as lazy to a returning visitor.
  → **One canonical form.** Vary the other.
- Positions 2 and 3 duplicate the homepage's seven industry lines and three core-market items (`content/industries.ts` feeding both).
- Position 4 (`What to send us`) duplicates `/enquiry`'s "What helps us most" — see Task 1.

**`/career` — the apply form sits above an empty list.**
`src/content/career.ts` has `openRoles: []`. `RoleList` renders `No open roles right now` and directly beneath it `CareerApplyForm` posts to `/api/career.php`.
A visitor is invited to apply for a job that does not exist, with no frame explaining why.
→ Either state the speculative-application invitation honestly, or reorder so the empty state carries the invitation.

**`/contact` — thin, and leaks an internal gap.** See Task 1 (`To be confirmed.`).

**`/enquiry` — thinnest page (2 blocks).** For a form-destination page that is *correct*. Do not pad it. It may add reassurance (response time, what happens next), not filler.

**`/products`, `/products/[group]`, `/products/[group]/[part]`** — evaluate against the spine: capability → specific part → process → convert. `/products` correctly leads with the finder. Check that the finder stays above the fold on mobile.

**`/privacy`, `/terms`, `/refund`** — every middle section is a bare `<h2>` with **no body copy**, all three are `noindex`, and all three are linked from the footer. → See Task 1, section 4.

### 2.4 The manifest — required output before any edit

Produce and show the user a table per page:

| # | Section component | Current position | Target position | Fate | Reason |
|---|---|---|---|---|---|
| 1 | `Hero` | 1 | 1 | KEEP | |
| 2 | `AboutIntro` (proof band) | 2 | 7 | MOVE | proof before capability |

Allowed fates: `KEEP` · `MOVE` · `CUT` · `MERGE → <target>` · `REWRITE` · `SPLIT`.
Every row needs a reason. **Show the manifest to the user and get an ack before executing Task 1 and Task 3.**

---

## 3. TASK 1 — REMOVE DUPLICATE AND UNNECESSARY CONTENT

### 3.1 Reusable vocabulary for judging

- **Exact duplicate** — the same string in two or more places. Pure liability; fix with a shared constant.
- **Semantic duplicate** — different words, same claim. The reader perceives repetition even though the strings differ. Fix by merging or by genuinely differentiating the angle.
- **Unnecessary** — a section that adds no persuasive value, duplicates another section's job, or is filler/placeholder.
- **Unverifiable** — a claim with no proof behind it. Must be weakened or removed (see honesty rule).

### 3.2 Confirmed duplicates — findings to verify and fix

**CTA fragmentation.** One action, many labels, eight-plus sites:

| Label | Where |
|---|---|
| `Get a Quote` | `Header.tsx:272`, `Drawer.tsx:224`, `Footer.tsx:132`, `EnquiryBand.tsx:66`, `ProductCta.tsx:19`, `StickyEnquiryBar.tsx:53`, `not-found.tsx:44` |
| `Ask for a quote` | `GroupRange.tsx:48` |
| `Get Custom Quote` | `NeedPartBlock.tsx:63` |
| `Send Your Requirement` | `site.ts:60`, rendered by `Hero.tsx:302` |
| `Browse products` | `site.ts:61` (never rendered), `CartPageClient.tsx:134`, `MiniCart.tsx:71`, `SuccessNext.tsx:33` |
| `Browse Products` | `Hero.tsx:306` (hardcoded) |
| `View Catalogue` | `NeedPartBlock.tsx:55` |

→ Promote canonical labels into `src/content/site.ts` (e.g. `site.cta.quote`, `site.cta.browse`) and import them everywhere.
Keep contextual words ("for a custom part", "for a drawing") in the *supporting sentence*, never in the button.
`site.hero.ctas.tertiary` is dead config — `Hero.tsx:306` hardcodes around it. Delete the key, make it `{ primary, secondary }`.

**EnquiryBand has seven near-identical bodies.** The default (`EnquiryBand.tsx:62`) is overridden at
`products/[group]/page.tsx:77`, `products/[group]/[part]/page.tsx:127`, `CustomProductView.tsx:95`,
`products/page.tsx:39`, `industries/page.tsx:212`, `LegalPage.tsx:70`, `GroupRange.tsx:43-44`.
The default says `we reply`; every override says `we will reply`.
→ **Drop the `text` prop.** One band body. Keep the caller's `heading` for page-specific context and a short optional `lead` for genuine local differences.

**`Share the quantity and use, and we will reply with a quote.`** appears identically at
`products/[group]/[part]/page.tsx:127` and `CustomProductView.tsx:95`. → One shared constant.

**Two implementations of "what to send with an enquiry".**

- `/enquiry` — `enquiry/page.tsx:82-90`, "For a faster quote / What helps us most." → part name, material & size, quantity, drawing or photo.
- `/industries` — `industries/page.tsx:189-191`, "Before you enquire / What to send us." → A sample, A drawing, Quantity, Where it is used.

Same four data points. → Promote ONE list into `src/content/`. Keep `/enquiry` canonical; on `/industries` replace the section with a one-line pointer.

**The homepage enquiry aside restates its own form.** `EnquirySection.tsx:70` `<h3>Tell us the part.</h3>` +
`EnquirySection.tsx:72` "Share the part name, quantity and any size or material preference, or describe what the part does…" —
and then the form's own field labels say the same four things. → Keep the h3, cut the sentence.

**`Pan Bharat` — four variants.** `site.ts:92`, `FaqSection.tsx:40`, `aboutContent.ts:11`, `enquiry/page.tsx:64`, `seo.ts:114`.
`Pan Bharat` is regional jargon with no search value. → Pick one public phrase; keep regional phrasing only if the client insists.

**`20 Cr+` vs `20 crore+`.** `site.ts:68-69` uses the abbreviation for the stat tile; `aboutContent.ts:11` uses it in prose.
→ Never abbreviate in prose; never spell out in a numeric tile.

**`Since 1998` — six renderings.** Mostly legitimate (different formats, different surfaces), and `site.foundingYear` is a
single source so it cannot drift. One cleanup: `TrustQuote.tsx:145` `Chandigarh. Since 1998.` inverts the canonical
`EST. 1998 · CHANDIGARH` and so reads as a different claim.

**Hero eyebrow** `EST. 1998 · CHANDIGARH` (`site.ts:56`) front-loads the founding year — the least differentiating fact — instead of what the company makes.

### 3.3 Unnecessary content — cut candidates

1. **`ProofStrip.tsx` — fully dead.** ADR-011 merged it into `AboutIntro`; zero imports remain. 211 lines of a compiled-but-never-rendered client component. → DELETE with its CSS.
2. **`ValuesRibbon.tsx` — fully dead.** Zero imports, 139 lines. Its own header comment claims `app/page.tsx` needs no change; that comment is stale. → DELETE.
3. **`FaqSection.tsx` default export — dead.** Only the named export `buildCatalogueFaq` is used (by `CatalogueFaq`). It has become a content factory wearing a section's clothes. → Split: move the factory into `src/content/`, delete the dead component.
4. **`src/app/lab/` — a design playground shipped as routes** (5 routes: `/lab`, `/lab/directions`, `/lab/type`, `/lab/components`, `/lab/swatches`). Guarded by `NEXT_PUBLIC_SHOW_LAB` + `notFound()`, and `postbuild` runs `prune-lab.mjs`. → Verify the prune actually excludes it from `out/`. If it does not, gate it properly.
5. **Product groups 03, 04, 05 have zero parts.** Five catalogue pillars, three of them landing pages that admit they are empty (`GroupRange.tsx:44` "This range is being added to the online catalogue…"). → Stop linking unpopulated groups from the mega menu. Fold into one honest "Custom development" page. Keep ONE empty-state string, not three.
6. **`/products/item` — a near-duplicate PDP.** `noindex`, unlinked from navigation, canonical points at `/products/` while the content lives here, and it is **missing the "Sizes and variants" block** that `/products/[group]/[part]` renders. → Either render `CustomProductView` inside `/products/`, or set the canonical correctly and parity-fix the missing block.
7. **Three legal pages with zero body copy.** Every section is a bare `<h2>`, all `noindex`, all footer-linked. A visitor sees "content pending" on a company site. → Publish reviewed text, or remove the routes *and* the footer links. A visible placeholder is worse than a visible absence.
8. **`Automatic Moulding Machines` sits in a numeric stat band** (`site.ts:102-103`) where every sibling value is a number. It reads as broken formatting. → Move to body copy; replace the slot with a number or remove it.
9. **`To be confirmed. Send an enquiry first and we will reply.`** (`ContactSheet.tsx:55`) — an internal data gap leaking into production copy. → Fill the field or omit the row. The codebase already has the correct pattern: `EnquirySection.tsx:75` gates contact rows on presence.

### 3.4 Unverifiable / weak claims

| Claim | Location | Issue |
|---|---|---|
| `100%` / `Commitment to quality & trust` | `site.ts:86-87` | Unmeasurable by construction. A `100%` tile beside real numbers lends false credibility to them. Replace with a real commitment (e.g. defect-free replacement, reply within 24h) **only if the business can honour it**. |
| `Quarter-on-Quarter` / `Production growth` | `site.ts:97-98` | Names a trend with no magnitude. Conveys nothing. Supply the figure or remove. |
| `We don't just mould plastic. We mould possibilities.` | `TrustQuote.tsx:113` | Brand line, not a reason to choose. Keep as a brand line; do not let it carry a "Why manufacturers choose" eyebrow. |
| `What you can hold us to` | `TrustQuote.tsx:135` | Sets an accountability expectation. Confirm the ledger rows are binding commitments, not descriptions. |
| `Precision Plastic Components for OEMs & Replacements` | `site.ts:124` | "Precision" asserted with no tolerance, process, or standard. Split the two audiences. |
| `Social employment` as a "core value" | `aboutContent.ts:25` | A social commitment in the same visual register as a manufacturing principle. Give it a number or relocate it. |
| Vision / mission as single 25–41 word sentences | `aboutContent.ts:16-20` | Dense clause lists under bare `Mission`/`Vision` headings. Split; add one concrete near-term milestone. |

### 3.5 Contradictions — fix these before anything cosmetic

**Highest severity. This is a factual statement about user data handling.**

- `src/app/cart/page.tsx:1-3` (file comment): *"no accounts, no payment, nothing stored on a server"*
- `src/app/cart/page.tsx:8-12` (metadata description): *"sends a WhatsApp request"*
- `src/components/cart/CartPageClient.tsx:15-18`: imports `checkSession, signIn, signOut, placeOrder`

The code has full session handling and server-side order placement. The comment and the meta description both say otherwise.
→ **Decide the cart model, then make every statement match.** If sessions and `placeOrder` are real, the comment and the
description are false, and the privacy page needs revisiting. Flag this to the user explicitly — do not quietly rewrite
a privacy-adjacent claim.

**WhatsApp policy stated three times, broken twice.**
`Hero.tsx:15`, `EnquirySection.tsx:6`, `ShortEnquiryForm.tsx:7` all assert WhatsApp lives *only* in the FAB.
`StickyEnquiryBar.tsx:29` renders an `Enquire on WhatsApp` action; `ProductBuyBox.tsx:4` references WhatsApp confirmation.
→ Pick one. Either delete the per-PDP WhatsApp actions, or delete the three policy comments so the next reader is not misled.

**`Hero.tsx:15`** comment names the primary CTA `Enquire Now`; the real label is `Send Your Requirement` (`site.ts:60`).

**Stale comment** in `src/content/products.ts` — group 04's slug is `caster-wheel` but a nearby comment labels it `Sealing`.

**`ENTITY_STATEMENT`** (`seo.ts:64-67`) is documented as machine-readable (home meta + `llms.txt` + Organization/LocalBusiness
JSON-LD) but is rendered verbatim as a user-facing FAQ answer (`FaqSection.tsx:21,60`).
→ Split into `ENTITY_STATEMENT` (schema) and `ENTITY_STATEMENT_PLAIN` (FAQ), so a schema edit never silently changes visible copy.

### 3.6 Writing rules — user POV

The two audiences are an **Indian SME owner** (needs a part fast, fears being sold the wrong thing) and a **service technician** (knows the machine, wants the part number, wants it now). Both are scanning under time pressure.

- **Lead with the user's problem, not the company's self-description.** "Your cooler stopped cooling because the float valve failed" beats "we are precision manufacturers".
- **Every sentence must survive the question: "so what?"** If the answer is nothing, cut it.
- **Concrete beats claimed.** "We reply within 24 hours" beats "responsive service".
- **One idea per paragraph.** Two sentences, maximum, in body copy.
- **Always end a section with its next action.** If a section has no clear follow-on, it probably should not exist.
- **Never make the visitor feel they are being sold to.** This is a supplier relationship, not a pitch.
- **Do not pad the thin pages.** `/enquiry` is short because a form page should be short. Short is not the problem; *unfocused* is.

### 3.7 User-POV failure points already identified

- Homepage CTA `Send Your Requirement` promises a fast send, then lands on `/enquiry` whose hero asks the visitor to describe the part in prose. Two-step expectation mismatch. → Align the CTA to the destination.
- `GroupRange.tsx:44` — a 30-word sentence that apologises for the website and asks the visitor to do the work manually. → Cut to `Not listed yet? Send us the part.`
- `/industries` teaches enquiry requirements the visitor already read on `/enquiry`.
- The `ab-vals` sprue illustration explains runner waste; its caption says only "Smarter manufacturing." The reader must infer the link.

---

## 4. TASK 3 — HIGHLIGHT THE KEYWORDS IN EVERY SECTION

### 4.1 Do NOT invent a highlight system. Reuse the one that already exists.

`src/app/about/page.tsx` already contains exactly what is being asked for:

```css
/* line 50 */
.ab-mark {
  background: linear-gradient(transparent 62%, var(--pink-soft) 62%);
  color: var(--ink);
  font-weight: 650;
  padding: 0 2px;
}
```

and a partial-bold renderer (`about/page.tsx:27-39`):

```tsx
function renderStory(p: { text: string; strong?: string[] }) {
  let parts: (string | { s: string })[] = [p.text];
  for (const s of p.strong ?? []) {
    parts = parts.flatMap(part => {
      if (typeof part !== 'string' || !part.includes(s)) return [part];
      const [a, b] = part.split(s);
      return [a, { s }, b];
    });
  }
  return parts.map((part, i) =>
    typeof part !== 'string' ? part : <mark key={i} className="ab-mark">{part.s}</mark>);
}
```

> **Your first task in Task 3 is to lift this into a shared component** — e.g. `src/components/ui/Em.tsx` plus a
> shared `HL_CSS` block — and have `/about` consume it. Then extend it to the rest of the site.
> Do not leave the pattern page-scoped, and do not re-implement it per page.

### 4.2 The highlight API

Design it once, reuse everywhere:

```tsx
// intent: which phrase carries the weight
<Em>20 Cr+ products delivered</Em>

// or data-driven, the way about/page.tsx already does it
{ text: '…', strong: ['20 Cr+ products delivered', 'Chandigarh'] }
```

Variants (all token-legal):

| Variant | Use on | Treatment |
|---|---|---|
| `hl-mark` (default) | light surfaces (`--canvas`, `--surface`, `--surface-alt`) | highlighter band: `linear-gradient(transparent 62%, var(--pink-soft) 62%)`, text `--ink`, weight 650 |
| `hl-ink` | light surfaces, want restraint | text `--burgundy-bright` + `text-decoration: underline; text-decoration-color: var(--grey-warm); text-underline-offset: 3px` |
| `hl-rule` | headings | `--burgundy-bright` text, no background |
| `hl-dark` | burgundy / dark panels | `--rose-pale` text, or `--rose` background at low alpha with `--blush` text |

Define any new custom property in `tokens.css` **as a composition of existing tokens** (`--hl-bg: var(--pink-soft);`).
Never write a literal hex in a component — `check-hex.mjs` will fail the build.

### 4.3 The rules that keep this from becoming spam

This is the part that matters most. Highlighting everything highlights nothing.

- **Cap: 1–3 highlighted phrases per section.** Three in a long section. One in a card. Zero in a nav, button, form label, table cell, spec row, or micro-label.
- **Never highlight inside** `<h1>` on a hero, a button/CTA label, a `<label>`, an alt-text, a stat's numeric value (the number is already the emphasis), or metadata.
- **Highlight the claim, not the grammar.** Highlight `20 Cr+ products delivered`, not `the` or `and`.
- **Prefer the differentiating phrase over the common noun.** `moulded in nylon, HDPE and PPCP` beats `parts`.
- **One emphasis style per page.** If half the page uses highlighter bands and half uses burgundy underlines, it reads as an accident. Pick per page, apply consistently.
- **Must survive mobile.** At 375px a highlighted phrase must not force a bad break. Prefer phrases that wrap cleanly; avoid highlighting across a line-break-sensitive boundary.
- **Contrast ≥ 4.5:1** for the highlighted text against its actual background — on light *and* on burgundy. This is checked by `npm run test:a11y`. Verify it; do not assume.
- **This is a readability and emphasis device, not an SEO device.** Over-highlighting reads as keyword stuffing to a human and to Google. `npm run check:seo` must stay green.

### 4.4 Which content gets emphasis

Priority order — emphasise what the visitor is actually buying:

1. **Specificity numbers** — `20 Cr+`, `since 1998`, `70%+ repeat`, quantities, MOQs, HSN codes.
2. **Capability nouns** — the part names, materials (`nylon, HDPE, PPCP, brass`), machines served.
3. **The differentiator** — what this manufacturer does that a distributor does not.
4. **The next action** — highlight sparingly, and never in the button itself.

Do **not** emphasise filler adjectives ("best quality", "world-class", "leading"). If a phrase is not worth highlighting,
it is usually a phrase that should be deleted instead.

---

## 5. REPORTING CLAIMS THAT NEED THE CLIENT

Do not invent these. Collect them into a single list for the user at the end of the pass.

Figures currently rendered with no supporting source in the repo:

| Claim | Location |
|---|---|
| `20 Cr+` products delivered | `site.ts:68`, `aboutContent.ts:11` |
| `70%+` repeat customers | `site.ts:74` |
| `100%` commitment to quality & trust | `site.ts:86` — unmeasurable, replace |
| `Quarter-on-Quarter` production growth | `site.ts:97-98` — needs magnitude |
| `20+ Crore` / `12+ Crore` / `5+ Crore` delivered | `journey.ts:16-35` — three unit styles in one dataset |
| `established in 1998` | `seo.ts:65`, `site.ts:16` |
| `Pan Bharat` delivery network | `site.ts:92`, `FaqSection.tsx:40` |
| OEM & B2B wholesale welcome | `seo.ts:26` |
| Product `machine` values | `types.ts:38` — the field permits a literal `'TODO'`; confirm none ships |

Note: `site.ts:65` marks these as *"the ONLY numbers allowed"* — i.e. client-supplied. Do not "improve" them into
different numbers. Rewrite the *framing* only, and ask about the *values*.

---

## 6. DEFINITION OF DONE

The pass is complete only when **all** of the following hold:

- [ ] A **Flow Manifest** exists for every route: final section order, with a recorded fate (`KEEP`/`MOVE`/`CUT`/`MERGE`/`REWRITE`) for every section that was there before. Signed off by the user before execution.
- [ ] Every page follows the §2.2 spine, or has a written justification for deviating from it.
- [ ] No verbatim duplicated sentence remains site-wide. Re-grep to prove it.
- [ ] No semantic duplicate claim remains across sections/pages.
- [ ] All CTA labels come from shared constants in `src/content/site.ts`. No hardcoded CTA in a component.
- [ ] Dead code deleted: `ProofStrip`, `ValuesRibbon`, the `FaqSection` default export, the unused `site.hero.ctas.tertiary`.
- [ ] No placeholder surfaces a visitor can reach: legal stubs, empty product groups, the lab routes, `To be confirmed.` rows.
- [ ] Every claim in §5 is either verified, weakened, or listed for the client.
- [ ] The cart comment/metadata contradiction is resolved and the user was told about it explicitly.
- [ ] WhatsApp FAB-only policy is either enforced or its three comments are removed.
- [ ] A single shared emphasis primitive exists (`src/components/ui/Em.tsx` + shared `HL_CSS`), `/about` was migrated onto it, and it is used across all pages. No per-page re-implementations.
- [ ] Highlight density is within the §4.3 cap on every page. No highlighting in buttons, labels, headings' numeric values, or metadata.
- [ ] `npm run typecheck` — green
- [ ] `npm run lint` — green (all four custom scripts)
- [ ] `npm run test:a11y` — green
- [ ] `npm run build` — green
- [ ] `npm run check:seo` — green
- [ ] An independent sub-agent has attempted to refute the work and reported its gaps.
- [ ] Updated `docs/decisions.md` with an ADR for every structural decision (new/cut/moved section, deleted component, changed rule). The repo's convention is an ADR per decision, with **Decision / Why / Date**.

---

## 7. ANTI-PATTERNS — DO NOT DO THESE

- Editing copy before the Flow Manifest is approved.
- Deleting a section without a stated reason in the manifest.
- Introducing a hex value to make a highlight work. The token gate is hard.
- Highlighting more than three phrases in a section.
- Rewriting a client-supplied number because it "looks wrong". Flag it.
- Marking a `TODO(client)` as resolved with invented data.
- Running `next build` only once at the very end.
- Bulk-editing every page in one commit-sized batch.
- Letting a sub-agent decide copy quality or section order.
- Reporting success while any gate is red.
- Silently rewriting a privacy-adjacent claim.
- Re-implementing the About highlighter in a new file instead of generalising the existing one.
- Trusting this document's findings without re-verifying them against the current source.
