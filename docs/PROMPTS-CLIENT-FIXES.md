# Claude Prompts — Client Fix Batch (6 tasks)

Repo context to give Claude first: `plastic 2`, Next.js (App Router). CSS is **tokens-only**
(`src/styles/tokens.css` is the only place raw hex may live). Fonts: Archivo (display), Inter (body),
Noto Devanagari, JetBrains Mono. Lint: `pnpm lint` (runs `check-hex.mjs` + `check-spacing.mjs` +
glass + forbidden). Typecheck: `pnpm typecheck`.

---

## PROMPT 1 — Home hero sub text: font + font-size only

```
Repo: Alok Plastics Next.js site. Make a MINIMAL change: only the font-family and font-size
(plus line-height to keep rhythm) of the hero sub-paragraph. Do not change the copy, colour,
markup, layout, or anything else.

File: src/components/hero/Hero.tsx
- Source string lives at src/content/site.ts:62 (site.hero.sub) — do NOT edit the string.
- Rendered at Hero.tsx:257 inside <p className="hero__sub">.
- Current CSS rule: `.hero__sub { font-size: 1rem; line-height: 1.6; max-width: 52ch;
  margin: 0 0 var(--space-md); text-wrap: pretty; }` (Hero.tsx line ~67).
- Responsive overrides at lines ~129 (>=768px: 1.0625rem) and ~133 (>=1024px: 1.125rem).

Environment: this text sits bottom-left over a dark-scrimmed hero photo/video, in Soft White
(color set inline from subColor), directly under an Archivo Expanded 650 headline and above a
Devanagari/English tagline. It must stay AA-legible on the scrim and read as engineered/spec-sheet,
not generic body copy.

Required change (recommended — apply exactly this):
  For `.hero__sub` set:
    font-family: var(--font-archivo, sans-serif);
    font-variation-settings: "wdth" 100;
    font-weight: 450;
    letter-spacing: 0.005em;
    font-size: clamp(1.0625rem, 1.3vw, 1.1875rem);
    line-height: 1.7;
  Update the two media-query overrides:
    @media (min-width: 768px)  -> .hero__sub { font-size: 1.1875rem; }
    @media (min-width: 1024px) -> .hero__sub { font-size: 1.25rem; }
  Keep max-width: 52ch (do not exceed 56ch).

Why: Archivo (already self-hosted, no extra font request) matches the drawing-sheet environment,
and the larger size + 1.7 leading lifts legibility over moving footage while staying a clear step
below the headline. Inter remains the page body font elsewhere.

Constraints / acceptance:
- No new font files, no raw hex, no arbitrary spacing (28–36px zone is lint-forbidden).
- Verify the sub still clears AA (>=4.5:1) against the hero scrim at every frame; if it does not,
  report instead of silently changing colour.
- Run: pnpm lint && pnpm typecheck. Report the exact diff.
- Do not touch HeroMedia, the headline, tagline, CTAs, or the rail.
```

---

## PROMPT 2 — Home "Pan Bharat" map: realistic, multi-colour, interactive

```
Repo: Alok Plastics Next.js. Rework the Pan-India/world dot-matrix map so it looks richer, more
realistic and more creative — the client says it currently reads as a flat, single-burgundy graphic
and feels "overwhelmed". Keep honesty rules (no country/city names, no flags, no export claims).

Files:
- src/components/sections/PanIndiaMap.tsx  (CSS block lines 88–139; SVG markup lines 266–314;
  legend lines 243–263; GSAP timeline lines 155–226).
- src/components/sections/worldDots.ts (AUTO-GENERATED — do NOT hand-edit; regenerate via
  scripts/gen-world-dots.mjs if new geo data is truly required).
- src/styles/tokens.css (the ONLY place raw hex may be defined).
- scripts/check-hex.mjs — the ALLOWED_HEX set must be extended for every new token.

Current problem:
- Everything is var(--burgundy): India outline, India dots, all arcs, origin, legend swatches.
- No hue contrast between layers, so the map reads as one flat wash.

Required change — build a small, documented, brand-harmonious chart palette and use it by layer:
1. Add to tokens.css a commented "Map palette (chart-only)" group of 5–6 tokens, e.g.
   --map-origin, --map-node, --map-arc-domestic, --map-arc-world, --map-land, --map-land-alt.
   Choose a harmonised set that keeps the burgundy family as the hero but adds 2–3 supporting hues
   (e.g. a warm amber/terracotta, a muted teal, a slate/plum) that read "cartographic", not neon.
   Also add each new hex to ALLOWED_HEX in scripts/check-hex.mjs (otherwise pnpm lint fails).
2. Colour by layer in PanIndiaMap.tsx:
   - India land dots/outline: --map-land / --map-land-alt (NOT pure burgundy).
   - Domestic delivery arcs: --map-arc-domestic (the brand hero hue).
   - Chandigarh origin + ring: --map-origin.
   - End-node markers: --map-node.
   - World/ambition arcs: --map-arc-world (lighter/desaturated).
   - Legend swatches must match the actual layer colours 1:1.
3. Add subtle realism without false claims:
   - Give the India fill a very low-opacity tonal wash + a soft inner glow so it reads as landmass.
   - Keep the world backdrop muted (grey/slate) so India pops.
   - Optional: a faint latitude/longitude grid behind the dots, low opacity.
4. Interactivity / creativity (progressive enhancement):
   - Hover/focus a legend row -> highlight the matching arc group (raise opacity, dim the others);
     add matching hover emphasis on arc groups. Keyboard-reachable.
   - Keep one-shot scroll-in motion and the reduced-motion finished-state.
5. Keep the existing aria-label accurate; update it to describe the colour-coded layers.

Constraints:
- Tokens only in components; any raw hex ONLY in tokens.css + check-hex.mjs allow-list.
- No forbidden spacing (28–36px). Use --space-* tokens.
- All new motion gated by (prefers-reduced-motion: no-preference).
- Do NOT claim named destinations/exports; arcs stay illustrative.
- Run: pnpm lint (hex + spacing + glass + forbidden) and pnpm typecheck. Report diff + which tokens
  were added and that the client must approve the new hues (Brand Guide v1.0 locks colour).
```

---

## PROMPT 3 — Products page: replace flat white backgrounds so cards/images pop

```
Repo: Alok Plastics Next.js. The /products catalogue reads too pale — near-white backgrounds
(--canvas #F8F7F7 and --surface-alt #F1EEEF) make the product cards and photos look flat/washed out.
The client wants a richer background treatment that makes the product image cards + descriptions pop,
without changing any content or card logic.

Primary file: src/components/products/products.css
Section wrapper: src/components/products/GroupSection.tsx (renders .p-grp--canvas / .p-grp--alt,
the "Water cooler spare parts / Valves, taps, drain and levelling parts for water coolers." block).
Also relevant: .p-card / .p-card__art (product photo card) in products.css lines 47–93; the finder
results block .pr (line 118) and the FAQ .pq (line 218).

Reference group data: src/content/products.ts:18 (water-cooler tagline).

Required change:
1. Replace the two flat section backgrounds with layered, tokens-only treatments so adjacent groups
   read as distinct "boards":
   - .p-grp--canvas: keep the light canvas base but add a subtle depth layer, e.g.
       background:
         radial-gradient(120% 90% at 82% -10%, color-mix(in srgb, var(--blush) 70%, transparent), transparent 60%),
         linear-gradient(180deg, var(--canvas) 0%, var(--surface-alt) 100%);
   - .p-grp--alt: a slightly deeper counterpart using --surface-alt -> --mist and a faint
     color-mix(in srgb, var(--grey-metal) x%, transparent) corner wash.
   - Optional: add a very low-opacity technical grid ONLY behind the part grid (pseudo-element,
     masked so it never sits under text), so the cards appear mounted on graph paper.
2. Strengthen the card so it separates from the new background:
   - .p-card: ensure --surface background, 1px --grey-warm border, and a soft resting shadow
     (e.g. box-shadow: 0 1px 0 var(--surface) inset, 0 10px 28px color-mix(in srgb, var(--burgundy-night) 6%, transparent)).
   - .p-card__art: keep the 1:1 plate but let the new page tint show through the grid subtly.
3. Keep alternation rhythm: canvas / alt should be clearly distinguishable at a glance.
4. Do NOT alter card markup, pricing, availability, images, or search behaviour.

Constraints:
- Tokens only; no raw hex; no arbitrary spacing (28–36px forbidden). Body/meta text must keep AA.
- Verify at 375 / 768 / 1024 / 1440 widths. Run pnpm lint && pnpm typecheck. Report before/after CSS.
```

---

## PROMPT 4 — Blog stories: fix cramped spacing, alignment and readability

```
Repo: Alok Plastics Next.js. On individual blog posts (/blogs/[slug]/) the article body feels cramped
("bhot gich") — paragraphs, lists, headings, callouts and tables are too tight, and it must read well
on both desktop and mobile. Fix the spacing/rhythm/alignment only; do NOT change any article copy.

Files:
- src/components/blogs/blogs.css — the prose block .bl-prose (lines 89–115), article shell
  .bl-ah (65–71), .bl-article (72–73), .bl-faq (133–143), .bl-table (109–115), .bl-note (106–108).
- src/components/blogs/BlogBody.tsx (renders p/h2/h3/ul/ol/callout/table into .bl-prose).
- Layout: src/app/blogs/[slug]/page.tsx.

Current tight values to open up:
- .bl-prose { font-size: var(--fs-body); line-height: 1.75; max-width: 68ch; }
  .bl-prose > * + * { margin-top: var(--space-sm); }   <-- 16px between ALL blocks = cramped
  .bl-prose h2 { margin-top: var(--space-xl); padding-top: var(--space-md); }
  .bl-prose ul/ol { gap: var(--space-xs); }            <-- 8px list gap

Required change (tokens only):
1. Body rhythm:
   - .bl-prose line-height: 1.8; max-width: 66ch.
   - Paragraph-to-paragraph gap: raise to var(--space-md) (24px).
   - Give headings more breathing room: h2 margin-top var(--space-xl), padding-top var(--space-lg),
     and add margin so the first paragraph after a heading is clearly grouped (space-sm is fine).
   - h3: margin-top var(--space-lg).
2. Lists: gap var(--space-sm); ol/ul item padding-left stays token-based; add margin-top after
   lists so following text does not crowd.
3. Callouts (.bl-note), tables (.bl-table) and any blockquote-equivalent: ensure at least
   var(--space-md) above and below, and add inner padding where tight.
4. First paragraph: keep the lead treatment but ensure it is not glued to the meta/heading.
5. Mobile (<640px): reduce measure, keep font-size >= 1rem, ensure line-height stays >= 1.7,
   no horizontal overflow (tables already scroll). Verify tap targets and reading width.
6. Alignment: consistent left edge across prose, lists, callouts and tables on both breakpoints.

Constraints:
- No raw hex; no arbitrary spacing in the forbidden 28–36px zone (pnpm lint runs check-spacing).
- Only spacing/typography/alignment — do not touch copy, JSON-LD, TOC logic, FAQ behaviour.
- Run pnpm lint && pnpm typecheck. Report the precise CSS diff and the rendered spacing at 375/1440.
```

---

## PROMPT 5 — Career hero: remove the "Four teams" table

```
Repo: Alok Plastics Next.js. On /career the hero shows a small "Four teams / Alok Plastics /
Product Development / Sales / Social Media & Marketing / Tech Developers" table. It visually
conflicts with the hero background photo. REMOVE that table only.

File: src/app/career/page.tsx
- Delete the entire .cr-hero-sheet block: JSX lines 104–116
  (the <div className="cr-hero-sheet"> ... </div>, including its __head and __cells).
- Keep the hero lead text "A strong company is built by strong people. Join one of four teams and
  grow alongside the company." (line 98) UNCHANGED.
- Keep the .cr-hero-actions row (lines 117–120: "See open roles" + "Send your CV") UNCHANGED.
- Remove the now-dead CSS rules for .cr-hero-sheet and its parts (CSS lines ~60–68) so no unused
  selectors remain.
- Do NOT remove the `teams` destructure — it is still used by the "Four teams. Find where you fit."
  section lower on the page.

Constraints:
- No other layout/heading/font/button changes; the PageHero layout stays layout="stack".
- Check spacing where the table was: the actions row should sit naturally under the lead with the
  existing --space tokens, no empty gap.
- Run pnpm lint && pnpm typecheck. Report the diff.
```

---

## PROMPT 6 — Career apply form: remove resume-link line, require LinkedIn link

```
Repo: Alok Plastics Next.js. In the career "Apply / Introduce yourself to the team." form:
- Remove the line "or share a link to your resume".
- Replace the "Resume link" field with a LinkedIn profile field.
- The LinkedIn link is REQUIRED for submission, but do NOT show a mandatory marker ("*") on the
  label (client request). Keep it enforced in validation.

File: src/components/career/CareerApplyForm.tsx
1. Delete line 183: <p className="ca-form__or ca-form__full">or share a link to your resume</p>.
   Also remove the now-unused .ca-form__or CSS rule (line 25).
2. Replace the "Resume link" field (current lines 184–189) with:
     <label htmlFor={id('resumeUrl')}>LinkedIn profile</label>
     <input {...attrs('resumeUrl')} type="url" inputMode="url"
            placeholder="https://www.linkedin.com/in/your-profile" maxLength={400}
            aria-required="true" />
     help text: "Your LinkedIn profile link."
   Keep the FormData key as `resumeUrl` so the existing backend keeps working
   (public/api/career.php reads $body['resumeUrl'] at line 22 and stores resume_link).
3. Validation (onSubmit):
   - Add isLinkedIn(raw): parses the URL (reuse validUrl's https://-prefix logic) and requires
     hostname ending in linkedin.com and a path starting with /in/ or /company/.
   - Require it: if (!isLinkedIn(text('resumeUrl'))) next.resumeUrl = 'Enter your LinkedIn profile link.';
   - Remove the old "attach resume or share a link" fallback (line 100) since LinkedIn is now mandatory.
   - The resume FILE upload stays optional (unchanged, lines 178–182).
4. Backend/UI follow-through (report, then apply if the client agrees):
   - public/admin/lib/views/application.php (lines 19–22) and applications.php (line 46) currently
     label the field "Resume"/"Link". Relabel to "LinkedIn" so the admin panel matches.
   - Optionally rename the stored column later; do NOT rename the API field in this change.

Accessibility note to surface: a required field should be announced to screen readers — keep
aria-required="true" (screen-reader only) so the visible label stays clean as requested. If the
client wants a visible cue, propose a subtle "(required)" in helper text instead of an asterisk.

Constraints:
- Do not break the POST contract to /api/career.php. No other fields change.
- Run pnpm lint && pnpm typecheck. Report the diff and confirm a valid /invalid LinkedIn link both
  behave correctly (required error shown when empty/invalid; submit succeeds when valid).
```
