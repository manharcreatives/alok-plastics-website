# ALOK PLASTICS — MASTER BUILD PROMPT
### Paste this entire file into Claude Code as one prompt.

---

## 0. ROLE

You are a senior art director who has shipped Awwwards-calibre work, and you build what you art-direct. Build the production website for **Alok Plastics** — a Chandigarh B2B manufacturer (est. 1998) of moulded plastic and steel spare parts for water coolers, display counters and deep freezers: float valves, F-bushes, connecting bushes, ventilation jalli, adjustable leg inserts, waste pipes, door locks, hinges, gaskets, push cocks, in nylon, HDPE, PPCP and brass. Buyers are OEMs, dealers, distributors and equipment businesses across India.

Real files. Real components. A dev server you start and verify. Not a mockup.

**The bar:** the logo is an engineered object — burgundy ribbons around a silver-grey core, sharp diagonals, light catching folded metal. A visitor must feel that this site was *made by the same mind that made that logo*. If it reads as a generic SaaS template, you have failed regardless of how it scores.

---

## 1. BRAND LOCK — non-negotiable

```css
:root{
  --burgundy:#581C25; --burgundy-deep:#3E131A; --burgundy-bright:#8A2C38;
  --burgundy-night:#2E0A0F;  --rose:#C35A61;  --rose-pale:#E3B5B8;
  --pink-soft:#F3DFE0;        --blush:#FAF1F1;

  --grey-metal:#737171;  --grey-warm:#D8D4D0;  --grey-cloud:#E1DBDC;
  --silver:#909090;  /* decoration only, never text */

  --canvas:#F8F7F7;  --surface:#FFFFFF;  --surface-alt:#F1EEEF;  --mist:#ECE7E8;

  --ink:#1E1115;  --body:#4A3D40;  --muted:#6B5F62;

  --whatsapp:#0F7B6C;  --success:#2E7D32;  --error:#B3261E;  --warning:#8A5A00;
}
```

**Forbidden:** pure black `#000000` for text. Blue, orange, or any green as a *brand* colour — green is WhatsApp-only. A full page of burgundy. Multiple burgundy shades inside one block. Purple, cyan, neon, glassmorphism cards, aurora gradients. Recolouring, stretching or animating the logo. **Inventing any fact not in §4** — no certifications, no specs, no client names, no testimonials, no review counts, no aggregateRating.

**Weighting:** ~61% light surfaces, 28% burgundy, 11% grey+text+photos. Light is the default state. One burgundy block per viewport, maximum.

**Tagline — this exact spelling:**
> भारते शिष्पतेम्, विश्वय निर्मातम्
> Crafted in Bharat, made for the world.

A Requirements PDF contains a variant ("Crafted **from** Bharat, **Built for** the World"). **Discard it.** Brand Philosophy v1.0 is approved. Put the English line beneath the Devanagari in `--body`; never replace it.

---

## 2. DESIGN LANGUAGE — derived from the logo, not borrowed from a template

This is the most important section. Every rule traces to a specific feature of the ALOK wordmark. Follow it literally.

| Logo feature | System rule |
|---|---|
| **A** = burgundy ribbon folded into a **peak** | **Diagonal cuts everywhere.** Hero exit, section dividers, card corners, image masks all use `clip-path` diagonals echoing that peak. Never a straight rectangle where a diagonal reads better. |
| **L + O** lock into a **silver-grey block** like a **chain link** | **Strict binary:** BURGUNDY or SILVER-GREY, never equal weight. Burgundy = brand / strength / CTA. Grey = engineering / metadata / lines. Enforce it everywhere, including inside single components. |
| **K** = burgundy arm sweeping **up-and-right to a sharp point** | **All forward motion points up-and-right.** Arrow icons, progress rails, the timeline's growth direction, image reveal masks, the scroll cue. Never right-only. Never down. |
| **PLASTICS** = wide-spaced, **squared** metallic grey | **Micro-labels:** uppercase, 12px, `letter-spacing: .16em`, squared caps, `--grey-metal`. These are the voice of the page. Use on every section header as a numbered technical callout. |
| Wordmark is **wide and low** | **Wide, short proportions.** Landscape sections. Never a tall skinny hero. Section height max `min(88svh, 780px)`. |
| **Dark-to-light shading across every shape** | **Metallic gradient**, light always from the top: `linear-gradient(175deg,#2E0A0F 0%,#581C25 32%,#8A2C38 58%,#C9A0A4 100%)`. Apply to key words, rules, card top-edges. Never a left-to-right or bottom-up gradient — that would contradict the logo. |
| **Squared cut corners** | `border-radius: 2px` maximum. Pill-shaped cards are banned. Circles only for the counter dots and the map pins. |
| **Folded-sheet** construction | Card and section top-edges carry a single 1px lit line (`inset 0 1px 0 rgba(255,255,255,.9)` on white, `rgba(88,28,37,.12)` on tint). Section breaks are 2px diagonal rules, like a folded sheet edge. |
| Engineering credibility | **Technical drawing furniture:** corner crop marks on primary cards, crosshair `+` register marks, measurement-style rules with end caps, and a faint 8px grid in the section backgrounds at 3% opacity. Restrained — one or two per section, never decorative noise. |

**Result:** the page should feel like an engineering drawing that got a pulse. Precise, machined, warm. Not a landing page.

---

## 3. TYPE & SPACING — decided, do not re-litigate

### Typefaces
- **Display / headings:** `Archivo` (variable, `wght 500–700`) — squared terminals, industrial, wide by nature. Load `Archivo Expanded` for the H1 only.
- **Body / UI:** `Inter` at 16–18px.
- **Devanagari:** `Noto Sans Devanagri`, properly self-hosted.
- Numerals: `font-variant-numeric: tabular-nums` on every stat and spec table.

### Scale (fluid, `clamp()`)
```
display   clamp(2.75rem, 7vw, 5.5rem)   / 1.02   tracking -.03em   weight 600
h2        clamp(2rem, 4vw, 3.5rem)       / 1.06   tracking -.02em   weight 600
h3        1.75rem  / 1.15                                    weight 600
lead      1.25rem  / 1.5   --body                           weight 400
body      1.0625rem / 1.65 --body
micro     .75rem   / 1    uppercase  tracking .16em  --grey-metal
```

### Spacing — the "everything is connected" rule
Base unit **4px**. Everything below is fixed; do not invent values.

```
xs  8     hairline gap inside a group
sm  16    gap between a label and its value
md  24    gap between sibling cards
lg  40    padding inside a section's content block
xl  72    gap between two groups inside one section
2xl 120   section padding — desktop
2xl 80    — tablet
2xl 56    — mobile
```

**The coupling rule that makes it read as designed:** things that belong together sit **8–16px** apart. Things that don't belong together sit **≥40px** apart. Never a 28px gap — ambiguous spacing is what makes a page feel unconsidered.

- Grid: `max-width: 1360px`, 12 columns, gutter `32px` desktop / `20px` mobile, page padding `clamp(20px, 5vw, 64px)`.
- Vertical rhythm: sections alternate `--canvas` → `--surface-alt` → `--canvas`. One section in the run may go burgundy. **Never two adjacent.**

---

## 4. CONTENT — source of truth

Wire every string to a single config file at the project root. No copy hardcoded in components.

**Alok Plastics** · Manufacturer · Est. **1998** · Plot No-06, Industrial Area Phase II, Ram Darbar, Chandigarh **160003** · Owner **Mr. Gopal Kumar** · CEO **Mr. Aalok Kumar**. Contact details → placeholder values in config, clearly marked.

**Vision** — To build Alok Plastics into a globally recognized Indian manufacturing brand, growing our capabilities, our people, and our partnerships while becoming trusted for turning customer requirements into the right solutions and responsible manufacturing.

**Mission** — To combine manufacturing expertise, practical problem-solving, and customer collaboration to deliver plastic and steel solutions through consistent manufacturing, responsive service, and lasting trust.

**Core values** — We don't just mould plastic. We mould possibilities. · Less waste. More value. · Social employment — creating opportunities and supporting local talent.

**Story** — *Built on Manufacturing. Grown on Trust.* Established 1998 with a simple belief: good products build business, but trust builds long-term relationships. Starting with industrial and B2B customers, the company grew through consistent manufacturing, dependable service, and an understanding of what businesses truly need from a manufacturing partner — quality, competitive pricing, reliable supply, timely delivery. Now manufacturing plastic components from moulds and plastic granules across India, with 20 crore+ products delivered and ongoing. Not finished: expanding production capacity, creating employment, adopting responsible manufacturing, building partnerships in India and global markets. *Growth is not only producing more. It is building better products, stronger relationships, lasting trust.*

**Journey**
`1998` The Beginning — serving industrial and B2B customers
`2000s` Building Customer Relationships — consistent manufacturing, reliable service
`2010s` Expanding Reach — capabilities strengthened, customer base across India
`2020s` 20+ Crore Products Delivered — milestone reached, deliveries continuing
`Today` Serving India — B2B customers, plastic and steel products
`The Future` Expanding Production — new production house, greater capability

**Proof** — `20 Cr+` products delivered · `70%+` repeat customers · `Since 1998` · `Pan Bharat` delivery · `Quarter-on-Quarter` production growth · `100%` commitment to quality & trust · `Automatic Moulding Machines` consistent quality, faster production

**USP** — *From Requirement to Repeat Supply.* We don't just manufacture plastic components; we build reliable, repeatable supply partnerships. → **Understand → Develop → Manufacture → Supply → Repeat** → *"We don't measure success by the order we deliver. We measure it by the orders that keep coming back."*

**Industries** — OEM & Manufacturing · Engineering & Machinery · Automotive · Electrical & Electronics · Gas & Kitchen Equipment · Agriculture & Equipment · Packaging & Specialized Applications. *Built for the industries that build India.*

**Pan-India** — *From Chandigarh to every corner of India. From a single component to thousands of parts for a production line — we manufacture for businesses that build.*

**Culture** — Joyful, supportive, trustworthy. Four teams: Product Development (with factory operations, to develop and improve products) · Sales (relationships, B2B reach) · Social Media & Marketing (brand presence, new audiences) · Tech Developers (digital systems). Teamwork, learning, responsibility, continuous improvement, ownership.

**Brand idea** — Alok (आलोक) means **light**. *The small parts that keep big machines running.* Bringing essential parts into the light: visible, trusted, easy to choose.

---

## 5. PRODUCT TAXONOMY — decided

Group by **what the part does inside a machine**, because that is how a dealer or repair shop actually searches. Four groups, every part placed exactly once. The first group is largest on the page — F-bushes and connecting bushes are the logo's own silver-grey chain link, so they are the brand's core metaphor and must read as the anchor.

| # | Group | Parts | Card |
|---|---|---|---|
| 01 | **Sliding & Door Systems** | F-Bushes · Connecting Bushes · Door Locks · Hinges | 2× width, the anchor |
| 02 | **Water Control** | Float Valves · Push Cocks · Waste Pipes | standard |
| 03 | **Ventilation & Leveling** | Ventilation Jalli · Adjustable Leg Inserts | standard |
| 04 | **Sealing** | Gaskets | standard |

Each card: group number as a micro-label, name in Archivo, the parts as a `metal-grey` list with hairline dividers, one line on what it does in the machine, and a `View parts →` link. No prices, no stock status, no invented specs.

Industries get their own section (§7 #5) — do not merge the two taxonomies.

---

## 6. THE HERO + GLASS NAVBAR

### The one rule
The client asked for a **glassmorphism navbar over a video hero**. Not a glass website.

- **Navbar is glass.** **Everything below the hero is FLAT** — solid fills, solid hairline borders, solid cards. No `backdrop-filter` anywhere except the desktop navbar and the mobile drawer.
- Verify by `grep -rn "backdrop-filter" src/`. Two files, maximum. If a third appears, delete it.
- Glass in one place reads as intentional premium. Glass everywhere reads as a template. The rest of the site earns its sharpness by being solid.

### Glass spec
```css
.glass-nav{
  background: rgba(255,255,255,.55);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255,255,255,.65);
  border-radius: 999px;                      /* the pill is the ONE exception to the 2px rule */
  box-shadow: 0 4px 24px rgba(30,17,21,.06), inset 0 1px 0 rgba(255,255,255,.9);
  transform: translateZ(0); will-change: transform;
  transition: background .45s ease, box-shadow .45s ease, border-color .45s ease;
}
```
- **`saturate(180%)` is mandatory** — blur alone desaturates; saturate restores the video's colour bleeding through. This one detail is the difference between glass and a blurry div.
- **`-webkit-backdrop-filter` is mandatory** — Safari/iOS ship the prefix. Omit it and iPhone gets a flat grey box.
- **1px light border + inset top highlight are mandatory** — they give the glass thickness. On light, a light border, never dark.
- Blur 10–20px. 14px is the target. Under 8 looks like nothing; over 24 stutters on mobile.
- **Never animate `backdrop-filter`.** Animate `background-color`, `box-shadow`, `border-color`. Animating blur forces a full re-composite every frame.
- Fallback: `@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){ .glass-nav{ background:rgba(248,247,247,.94); border-color:rgba(30,17,21,.08);} }`
- **The glass must be a sibling of the video, not nested inside** a filtered/transformed/overflow-hidden hero wrapper. That nesting kills the backdrop. If you pin the hero, keep the nav outside the pin.
- Max **3** `backdrop-filter` elements in the viewport. The navbar is 1.
- The glass only works over something rich. When the user scrolls past the hero onto a flat canvas, transition the navbar **out of glass** into a solid `--canvas` bar with a `--grey-warm` hairline. That transition is a design beat — make it deliberate.

**Nav behaviour** — transparent at top; on scroll past ~40px fill in, gain hairline and shadow, 300–500ms. Mega-panel dropdowns opened from the glass bar are **solid `--surface`**, never glass. Logo in the correct version per background (colour on light, white on burgundy, bright on dark). Full keyboard support, focus trap in the mobile drawer, `aria-expanded`, skip-to-content link first in tab order.

### The video
Bright, warm, high-key, slow. Morning light through a clean moulding hall, plastic pellets, a part lifted out catching a highlight. **Not** a moody dark factory with lens flares. The video is a supporting actor — low contrast, never fighting the headline.

```html
<video class="hero__video" autoplay muted loop playsinline
       preload="metadata" poster="/media/hero-poster.jpg"
       aria-hidden="true" tabindex="-1">
  <source src="/media/hero.webm" type="video/webm">
  <source src="/media/hero.mp4"  type="video/mp4">
</video>
```
- `muted` — browsers block autoplay with audio. `playsinline` — without it iOS full-screens the video and hijacks the page. `preload="metadata"` — **never `auto`; the poster must be the LCP element, not the video.** `aria-hidden` — decorative.
- **Seamless loop via ffmpeg boomerang** (forward + reverse concat, no crossfade needed — it is mathematically seamless):
  ```bash
  ffmpeg -i raw.mp4 -filter_complex "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[out]" \
    -map "[out]" -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart hero.mp4
  ```
  *(If you instead scrub the video on scroll, you must use `-g 1` all-intra or H.264 seeking artifacts look like corruption. Pick one mode; don't mix.)*
- **≤2.5 MB mp4, ≤1.5 MB webm.** Under 3s, 1080p max, 24–30fps, no audio track.
- Pause off-screen via `IntersectionObserver`. **No autoplay below 768px or on coarse pointers** — swap to an optimised still. Show the poster under `prefers-reduced-motion` and `Save-Data`.

### Scrim — what makes the type readable
A raw video behind white type is unreadable. Use a **multi-stop gradient**, not a flat overlay: a soft dark band concentrated in the lower-left where the type sits, fading to nothing top-right so the bright upper region still breathes. Keep total darkening under ~45% at the text zone. Add a second layer — `--burgundy` at 8–12% opacity, `mix-blend-mode: overlay` — which ties burgundy into the footage without recolouring it. This is the move that makes it *this brand's* hero. Do not blur the scrim. Verify headline contrast against the **brightest** frame, not the average.

Plus a 3–5% `feTurbulence` grain overlay across the whole hero. Kills gradient banding, adds a filmic quality. Cheap, high impact.

### Hero content
- Full-bleed, `100svh` — **never `100vh`** (mobile Safari's collapsing toolbar causes a jump).
- Type block left-aligned, sitting low-left. Centred reads as a template.
- Micro-label above: `01 — EST. 1998 · CHANDIGARIH` (or the sharpest equivalent).
- **Headline: "The small parts that keep big machines running."** This is the actual brand idea from the philosophy doc and it is stronger than anything generic. Use it.
- Subhead: what they make, in plain words. Buyers read sizes and materials on phones, in workshops.
- Devanagari tagline + English beneath.
- **Two CTAs:** primary `Enquire Now` (burgundy, white) · secondary `WhatsApp Us` (`#0F7B6C`, white — the only legal green). An optional third micro-link to the catalogue as a plain underlined text link. Three buttons is a wall.
- Scroll cue bottom-left, animated, respects reduced motion, **disappears after first scroll** — a permanent bouncing arrow is a tell.

---

## 7. SECTIONS

Home is the flagship. Every section must earn its height — if content doesn't fill it honestly, cut it. **Do not invent content to justify a section.**

| # | Section | Treatment | Effect |
|---|---|---|---|
| **1** | **Hero** | Video + glass navbar, diagonal clip-path exit | Headline assembles line by line; scrim fades in |
| **2** | **Proof strip** | 6 stats, `tabular-nums`, corner crop marks, 8px grid at 3% | Count up once on first view. Metallic gradient on the numerals |
| **3** | **Products** | §5 taxonomy, 01–04 micro-labels, hairline dividers, 2px radius, 01 card 2× width | Click/hover expands detail **in place**, no page jump. Lazy-load. `01`+`02` cards may use `Glare Card` — cursor-tracked light sweep, a literal fit for "light catching polished metal" |
| **4** | **USP** | *From Requirement to Repeat Supply* on `--canvas` | The 5-step chain draws as a connected path on scroll, direction **up-and-right** per §2. Ending on the pull-quote in metallic gradient |
| **5** | **Industries** | 7 verticals, asymmetric bento, one burgundy block | Hover reveals a one-line application note. Not a grid of 7 equal boxes |
| **6** | **Journey** | Radial/orbital timeline, 1998 → The Future | **The emotional peak.** Give it real height and a pinned scrub. Growth direction up-and-right. See §9 for the component |
| **7** | **Pan-India** | India map, dispatch points draw in on scroll | Subtle, `--grey-metal`. **One burgundy pulse at Chandigarh.** An India map — not a globe, and no flag-colour cliché. The brand doc rejects it explicitly |
| **8** | **Trust** | The verified USP pull-quote, set large | **No fabricated testimonials.** If real ones exist later, they slot into scrolling columns here. Leave a `TODO(client)` comment |
| **9** | **Enquiry** | Full-bleed `--burgundy` block, the one big burgundy moment | White fields, real inline validation, real states (`--success`, `--error`). WhatsApp option in green. `aria-live` on status |
| **10** | **Footer** | `--burgundy`, white logo, `--rose-pale` small text | Address, owner, CEO, nav, social, `--burgundy-deep` hairline |

**Elastic within this map:** type scale application, exact grid, which section gets the burgundy, how much copy to cut, the hero's internal composition. **Locked:** the colour weighting, the glass rule, §1 prohibitions, the accessibility floor, the honesty rule.

Also build real (not stub) inner pages: **About**, **Products** (all four groups), **Industries**, **Contact**. Every page ends in a real next step — *Enquire Now · WhatsApp Us · Get a Quote.* No dead links, no `#`, no "coming soon".

---

## 8. SCROLL SYSTEM — the one correct wiring

```js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);   // ScrollTrigger follows Lenis
  gsap.ticker.add(t => lenis.raf(t * 1000));   // ONE shared loop  (s → ms)
  gsap.ticker.lagSmoothing(0);                 // no catch-up jitter
}
```

Three things people get wrong:
1. **Never** add a standalone `requestAnimationFrame` loop for Lenis. Delete it. Two loops = desync.
2. `gsap.ticker` gives **seconds**; `lenis.raf()` wants **milliseconds**. Multiply by 1000.
3. `lagSmoothing(0)` is mandatory.

Also: `data-lenis-prevent` on modals and native-scroll islands. Don't smooth *touch* — it breaks the mobile address-bar collapse. Under reduced motion, **do not instantiate Lenis at all.** `ScrollTrigger.config({ ignoreMobileResize: true })` so the mobile address bar doesn't shift pinned elements. `ScrollTrigger.refresh()` after fonts and known-size media load.

---

## 9. COMPONENTS — pull, don't reinvent

Wire the 21st.dev MCP so you search a proven catalogue instead of hand-rolling something bland.

```bash
export API_KEY_21ST="sk_..."     # https://21st.dev/settings/api-keys
# then, inside Claude Code:
/plugin marketplace add 21st-dev/claude-code-plugin
/plugin install 21st@21st
# restart; verify with /mcp → search, get_component, get_theme, generate, ...
```

| Search | Where |
|---|---|
| `Radial Orbital Timeline` | **§7 #6 Journey — the emotional peak. Top priority.** |
| `Container Scroll Animation` | Journey, or the hero if video proves too heavy |
| `World Map` | §7 #7 Pan-India |
| `Bento Grid` | §7 #5 Industries |
| `Glare Card` | §7 #3 product cards 01–02 |
| `Marquee` | Industries ticker under the hero |
| `Layout Grid` | §7 #3, expand-in-place |
| `Testimonials Columns` | §7 #8, only when real testimonials exist |
| `Moving Border` | Secondary CTA |
| `Glowing Effect` | Primary CTA, recoloured burgundy |
| `Spotlight Card` | §7 #2 proof stats |
| `Evervault Card` | Founder / about block |

Recolour every one to the §1 tokens. The libraries ship cyan and purple defaults — those are **banned**. **Reject on sight:** Aurora, Sparkles, Liquid Glass, glassmorphism cards, any neon gradient, anything that fills a viewport with dark.

## 10. STACK + SKILLS

**Next.js 15** (App Router) · **TypeScript** · **Tailwind v4** · **GSAP** + ScrollTrigger + SplitText · **`lenis`** (not the deprecated `@studio-freight/lenis`) · **`motion`** for micro-interactions only, never scroll · **`next/font`** self-hosted, no Google Fonts CDN request.

Install these **before** writing code, then actually read the `SKILL.md` files — they exist to stop you defaulting to generic output.

```bash
npx skills add anthropics/skills --agent claude-code      # frontend-design 792k, brand-guidelines 77k

/plugin marketplace add freshtechbro/claudedesignskills
/plugin install core-3d-animation                          # gsap-scrolltrigger, motion-framer
/plugin install animation-components                       # Magic UI, Lottie, scroll-reveal

git clone https://github.com/nateherkai/scroll-craft .claude/skills/scroll-craft
npx skills add https://github.com/alvinindra/modern-frontend-skills   # read `considered-modern`
git clone https://github.com/iart-ai/web-animation-skills .claude/skills/web-animation-skills
```

Read: `scroll-craft/SKILL.md` · `modern-frontend-skills/references/forbidden.md` (the slop filter) · `web-animation-skills/skills/gsap-web/references/scrolltrigger-lenis.md`.

## 11. BUDGETS

**Performance** — this is a B2B site for people on ₹12,000 Androids over 4G, standing in a shop. That is the device you optimise for.
LCP < 2.0s mobile (the **poster** is the LCP element, never the video) · CLS ≈ 0 (explicit dimensions or `aspect-ratio` on every image and the video; `size-adjust` font fallback) · page < 1.5 MB excluding video · 60fps mid-range mobile. `backdrop-filter` is the most expensive thing on the page — budget it explicitly. `force3D: true`, `autoAlpha` over opacity+visibility, never animate `height: auto`, set and clear `will-change`, one staggered timeline instead of N, `once: true` on non-repeating reveals, `gsap.matchMedia()` per breakpoint.

**Accessibility** — a B2B buyer may be on a keyboard or a screen reader.
Skip link first. Full keyboard operability incl. mega-menu, drawer focus trap, form. Visible `:focus-visible` rings in burgundy. **Under reduced motion: no Lenis, no parallax, no counters, no marquee, no video, no pinned sections — the site must be fully usable fully static.** Contrast against *actual* rendered backgrounds including over video. Documented passes: Ink/Soft White 17.1 · Body/Soft White 9.7 · Burgundy/Soft White 12.2 · White/Burgundy 13.1 · Pale Rose/Burgundy 7.2 · Muted/Soft White 5.7. ⚠️ **Metal Grey on Soft White is 4.5 — captions and short text only. Silver `#909090` is 3.0 — never text.** Semantic landmarks, one `h1`, `lang="en"` + `lang="sa-Deva"` on the tagline.

**SEO** — Metadata API, canonical, OG/Twitter, sitemap, `robots.txt`. JSON-LD `Organization` (foundingDate 1998, Chandigarh 160003, owner, CEO) + `Manufacturer`. **No invented certifications, no fake reviews, no aggregateRating without real data.**

## 12. BUILD ORDER

1. Scaffold. Install skills + MCP. Read the SKILL.mds.
2. §1 token layer — then render a swatch page (every colour, hex, contrast ratio). **Do not proceed until the swatches match.**
3. Content config. Every §4 string in it.
4. Lenis + GSAP + reduced-motion gate. Verify scroll before building on it.
5. **Glass navbar + video hero.** Most failure modes on the page — build and verify alone first, across light and dark video frames, and on mobile. Screenshot.
6. Remaining sections, pulling from 21st.dev.
7. Enquiry form with real validation and states.
8. Inner pages.
9. **Verify.** Run the dev server. Screenshot 375 / 768 / 1440. Toggle reduced motion and confirm the static path. Clean console. Lighthouse. `grep -rn "backdrop-filter" src/` → two files. Video paused off-screen.
10. `npm run build` and `npm run lint` clean. **Report actual numbers, not a claim.**

Screenshots to `.screenshots/<section>/`. Never commit them.

## 13. GATES — not done until every line is true

- [ ] Navbar is glass. **Nothing else has `backdrop-filter`.** Grep-verified, two files.
- [ ] Glass has `saturate(180%)`, 1px light border, inset top highlight, `-webkit-` prefix, and is a sibling of the video.
- [ ] Video: `muted loop playsinline preload="metadata" poster aria-hidden`; ≤2.5MB; seamless loop; paused off-screen; absent on mobile; poster under reduced motion.
- [ ] Headline readable over the **brightest** frame. Checked, not assumed.
- [ ] `100svh`, not `100vh`.
- [ ] Lenis on `gsap.ticker` with ×1000 and `lagSmoothing(0)`. No second rAF loop.
- [ ] Reduced motion fully honoured — static, complete, usable.
- [ ] Every colour from a §1 token. Zero hardcoded hex outside it. No purple, cyan, neon, or pure black.
- [ ] Green only on WhatsApp + form status.
- [ ] **Every §2 logo-derived rule applied.** Diagonals, up-and-right motion, squared corners, metallic gradient top-lit, micro-labels, technical drawing marks.
- [ ] Product taxonomy is exactly §5 — 4 groups, 10 parts, 01 card 2× width.
- [ ] Spacing is exactly §3. No 28px gaps anywhere.
- [ ] No invented certifications, specs, clients, or testimonials.
- [ ] Every page ends in a real next step. No `#`.
- [ ] Mobile 375px: no horizontal scroll, ≥44px targets, drawer traps focus.
- [ ] Lighthouse mobile: Perf ≥90 · A11y ≥95 · BP ≥90 · SEO ≥95.
- [ ] `build` + `lint` clean, console clean.
- [ ] Tagline reads **"Crafted in Bharat, made for the world."**

## 14. HONESTY RULE

Absolute. This is a real manufacturer, a real address, real people. Every number, name, date and claim comes from §4. If something is missing, leave a marked `TODO(client)` comment and move on. A shorter honest site beats a longer invented one, every time.

---

## 15. GO

Install, scaffold, build. Then in **4 lines** tell me: what you're building, the one structural decision of yours I'd want to argue about, and the first thing you're unsure of. Then build.
