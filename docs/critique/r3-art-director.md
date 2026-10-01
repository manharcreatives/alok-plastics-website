# Round 3 (council round 2) - Art Director critique (STATIC only)

Reviewer: `art-director`. Source: rendered PNGs `.screenshots/r2c/` (10 routes x 375/768/1440; folds read directly, full pages sliced to 1440x1000 / 375x900 crops). Source code read only to locate selectors.
Capture caveats (not defects): pinned Journey leaves a blank pin-spacer in full-page PNGs; fixed nav and hero repeat at the end of the home full page (stitching); Next "N" dev badge. Motion is not reviewed.
Scoring: sub-scores /5, Score /10. Tags CRITICAL / MAJOR / MINOR.

## Verdict
A visible step up from 7.0. Every R2 CRITICAL is closed, the catalogue is fully drawn, the map finally reads as India, the FAQ, Core values and Why-choose are redesigned, hero collisions are gone. What remains: (a) one real overlap at 768 on /products, (b) the map still does not say "beyond India", (c) the part-page hero sheet is now an empty frame, (d) tablet (768) compositions leave 250-400px voids on six routes, (e) one headline is now used on two pages. Strong 7.9; Awwwards 8.5 needs the map, the 768 pass and the repetition cull.

Site-wide average: **7.9 / 10** (46 scored sections; R2 was 7.0).

## R2 CRITICAL / MAJOR - status

| R2 item | Status | Evidence |
|---|---|---|
| CRITICAL logo < 120px (nav, footer) | FIXED | Nav lockup renders ~128px (x 68-193) at 1440 and ~125px at 768/375; footer white lockup ~148px (x 68-213). |
| CRITICAL Industries caption ellipsis | FIXED | "PACKAGING & SPECIALIZED APPLICATIONS" wraps to two full lines at 1440; cluster right edge 1376 = container edge; captions ~12px. |
| CRITICAL product summary line-clamp | FIXED | Full sentences on every card ("...smooth door travel.", "...heat exchange and moisture ingress."). |
| MAJOR gradient-text tails | FIXED (small residue) | Tails end ~#9C4D57 (`--metal-gradient-text`). "possibilities.", "keep coming back", "big machines" fully legible. Residual: Enquiry hero "it from there." still thins to a mid-rose at the full stop (readable) - MINOR. |
| MAJOR hero "running." vs diagonal | FIXED | 1440: "running." sits alone on line 3, ends x=370 vs diagonal x>=790 at that y. 768: "that" ends x=452 vs diagonal ~530. 375: headline overlaps the faint schematic ring (new MAJOR below). |
| MAJOR dead 250px above hero eyebrow | FIXED at 1440; acceptable at 768/375 | 1440 eyebrow at y=182. At 768 the stack is centred with ~280px air above on a 1024px viewport. |
| MAJOR Pan-Bharat map | PARTLY | India now ~460px tall and complete (Kashmir tip, NE, Andamans all inside the frame), stray "!" gone, tagline repetition gone. NOT fixed: no arc leaves India (all 6 arcs end inside the border), and the world dot field has no recognisable continents (a near-uniform grid). The brief ("show dispatch beyond India") is still unmet. |
| MAJOR Why-choose three-icon row | FIXED | Replaced by headline + chevron drawing + 4-row spec table ("What you can hold us to"). Hairlines no longer cross text. New issue: its headline now also headlines About core values. |
| MAJOR 9/16 catalogue tiles text-only | FIXED | All 16 parts carry a burgundy pictogram; Waste Coupling now has one; the Sealing card is capped to a third width. |
| MAJOR same bottom-left hero on 9 pages | FIXED | Layouts vary: About (art right), Products (finder), Group (art right), Part (art left), Industries (cluster right), Career (stack), Contact/Enquiry (sheet left, text right), Privacy (title block low-right). |
| MAJOR stats three times | FIXED | About "In numbers" replaced by "On the record" title-block table; Proof strip remains once. |
| MAJOR duplicate CTAs (band + footer) | PARTLY | Footer CTA gone; each page has one band CTA + nav CTA. Career/Contact/Enquiry still show a band directly after a form (MINOR). |
| MAJOR micro-type below 12px floor | PARTLY | Labels, Industries captions, schedule tags are now >=12px. Remaining small type is inside decorative SVG art (Contact site-plan, catalogue sheet) which scales to ~6-8px at 375 - MINOR. |
| MAJOR generic icons (R2R, Why choose) | PARTLY | R2R icons are now bespoke drawn and read as Alok; still thin 28px and lighter than the part pictograms - MINOR. |
| MAJOR FoldEdge monotony | PARTLY | Still the same 3-degree line between nearly every section (About, Products, Group each show 4-6 identical edges). Only the Vision/Mission 75-degree split and the Industries slab diagonal vary. |
| MAJOR About Core values layout | FIXED | Single hero statement + two notched cards, no floating captions. Residual: right 45% of the statement card is only a faint hatch (MINOR). |
| MAJOR Contact "Find us" empty box | FIXED | Replaced with "Planning a visit?" (directions + hours table) + click-to-map tile. |
| MAJOR Part hero repeats gallery | PARTLY (new regression) | Hero no longer duplicates the pictogram, but the sheet is now a thumbnail strip floating in a mostly empty frame (see Part - Hero). |
| MAJOR Career Supportive / ghost | FIXED | "Supportive" is solid metal grey; "PEOPLE & CRAFT" outline is a visible rose-grey stroke and clear of the nav. |
| MAJOR Get a Quote glass too washed | FIXED | Reads as deep burgundy with notched corner and highlight. |
| MINOR FAQ six boxes | FIXED | Ruled accordion list with arrow markers. |

## Brief checks
- First section exactly one screen, nothing from the next peeking in: PASS on all 10 routes at 375, 768, 1440. Only the 3-degree fold hairline touches the bottom edge. (Industries 375: the next burgundy slab begins exactly on the fold line; no fill visible.)
- No clipped / overlapping text at any width: ONE FAIL - /products at 768 (below). Home hero at 375 has text over the faint schematic ring (MAJOR). No ellipsis anywhere.
- Logo >= 120px: PASS (128 / 125 / 125 / 148).
- WhatsApp buttons: none visible anywhere. PASS.
- Numbering in titles: PASS (no "01 -", "02 -" in any title or label).
- Gradient text legible: PASS.
- Map India large and complete: PASS. Beyond-India: FAIL.
- Icons consistent: PASS. Phosphor-light for UI (nav chevrons, fits icons, list rows), bespoke pictograms for parts, up-right arrow for every forward action. Only inconsistency: the "fits" mini-icons on the home schedule look heavier than the 1.5px line art around them (MINOR).

## Matrix

| Route - Section | Composition | Brand | Type | A11y | Score | Top 3 fixes |
|---|---|---|---|---|---|---|
| Global - Header pill | 5 | 5 | 4 | 4 | 9.0 | PROTECT (logo 128px, notched burgundy CTA, diamond active state). 1 MINOR: at 375 the hamburger box crowds the pill's right padding; nudge to 16px. |
| Home - Hero | 4 | 5 | 4 | 4 | 8.5 | 1 MAJOR: at 375 the first two H1 lines overlap the schematic ring (`HeroMedia.tsx` drawing); hide it below 480px or set opacity .25 and move bottom-right. 2 MINOR: left grid texture heavier than on inner pages; match 4%. 3 MINOR: Devanagari line 20px at 1440; step to 24px. |
| Home - Parts schedule | 4 | 5 | 4 | 4 | 8.0 | PROTECT. 1 MINOR: ~100px void between part name and material tag in every cell; cell `min-height` ~230px to ~176px. 2 MINOR: "fits" glyphs heavy; use Light weight. 3 MINOR: two-material cell (Connecting Bush) breaks the tag baseline; `margin-top:auto`. |
| Home - About intro | 4 | 5 | 4 | 4 | 8.5 | PROTECT the giant gradient आलोक, now clear of the table. MINOR: "Read our story" underline consistent with Industries slab link; keep. |
| Home - Proof strip | 5 | 5 | 4 | 4 | 8.5 | PROTECT gradient numerals + end caps. 1 MINOR: second-row labels 13px caps; raise to 14px. 2 MINOR: 70px leftover canvas band under the strip; reduce to 40px. |
| Home - Product groups | 5 | 5 | 4 | 4 | 8.5 | PROTECT the stagger and 44-degree cut corners. 1 MINOR: "All 10 parts" and "View parts" compete in the card footer. 2 MINOR: chips 11px; make 12px. |
| Home - Two-path block | 4 | 5 | 4 | 4 | 8.0 | 310px tall now, good. MINOR: pictograms 28px read light next to bold headings; 40px. |
| Home - Requirement to Repeat | 4 | 4 | 4 | 4 | 8.0 | 1 MINOR: widen "Repeat" 1.2x so the stair ends on a landing. 2 MINOR: connector diamonds float 8px off the card edges; seat on edge. 3 MINOR: dashed repeat arc starts with a stray arrowhead under card 1 (x=170,y=767). |
| Home - Trust quote | 5 | 5 | 5 | 4 | 9.0 | PROTECT slashes + statement. |
| Home - Industries slab + bento | 4 | 5 | 4 | 4 | 8.5 | 1 MINOR: bento cards show only a 20px dash under each title leaving ~60px dead space; use the one-line description (`src/content/industries.ts`) or trim padding-bottom to `--space-md`. 2 MINOR: wheel halo artifact gone. |
| Home - Journey (static) | 4 | 4 | 4 | 4 | 7.5 | PROTECT the road. 1 MINOR: skyline still hard-cut by a straight line across the road (`JourneyBackdrop.tsx`); add `mask-image:linear-gradient(to bottom,#000 70%,transparent)`. 2 MINOR: era labels ~3.8:1; use `--ink` 70%. |
| Home - Pan-Bharat map | 4 | 4 | 4 | 4 | 6.5 | 1 MAJOR: no dispatch beyond India. Draw 3-4 unlabelled thin arcs from Chandigarh that cross the India border toward the left and right edges of the frame (`PanIndiaMap.tsx`; arcs currently end at points inside India). 2 MAJOR: the world layer is a uniform dot grid with no readable landmasses; regenerate with `scripts/gen-world-dots.mjs` at finer pitch and drop ocean cells. 3 MINOR: footnote "Illustrative..." 12px at 55% grey; use `--muted`. |
| Home - Why choose (recast) | 4 | 4 | 4 | 4 | 7.5 | 1 MAJOR: headline "We don't just mould plastic. We mould possibilities." repeated on About core values; use it once. 2 MINOR: chevron drawing ends in a flat cut; add a ground line. 3 MINOR: at 375 the label wraps to two lines; shorten to "WHY ALOK". |
| Home - Enquiry section | 4 | 5 | 4 | 4 | 8.0 | 1 MINOR: heading "Let's talk parts." small beside the form; h2 3.5rem. 2 MINOR: burgundy card has 24px type in a 200px box; add the 3 key fields from the Enquiry page. |
| Global - Enquiry band | 4 | 4 | 4 | 4 | 7.5 | Layout now varied (rule + button; blush card; hatch). 1 MINOR: hide on /enquiry/ and /contact/ (form already above). 2 MINOR: use the blush-card variant on Career. |
| Global - Footer | 4 | 5 | 4 | 4 | 8.0 | PROTECT two-tone Devanagari. 1 MINOR: right half of the burgundy block above the link grid is empty (~800x330px); move address up or shorten. 2 MINOR: address arrow floats ~240px right of the text; pull inline. |
| About - Hero | 5 | 5 | 4 | 4 | 9.0 | PROTECT (best image on the site). At 768 the folded-A moves above the text and fills 55% of the fold; good. |
| About - Brand idea | 4 | 5 | 4 | 4 | 8.5 | 1 MINOR: add clear-space crop-marks (height of "P") on the logo card to honour the brand doc. |
| About - Story | 4 | 4 | 4 | 4 | 8.0 | 1 MINOR: left column empty for ~600px while the long body runs right; make the headline sticky. |
| About - Vision / Mission | 5 | 5 | 4 | 4 | 8.5 | PROTECT the 75-degree split. MINOR: "recognized" vs "recognised" elsewhere; one spelling. |
| About - Core values | 4 | 4 | 4 | 4 | 7.5 | 1 MAJOR: headline duplicated with Home. 2 MINOR: statement card right half empty hatch; place "Smarter manufacturing." there as a 24px caption. |
| About - Leadership | 4 | 5 | 4 | 4 | 8.0 | PROTECT title-block cards with OWNER / CEO. MINOR: role line 12px under a 48px name; step to 14px. |
| About - Company record | 4 | 5 | 4 | 4 | 8.5 | PROTECT. MINOR: left column holds a heading and one line; sticky heading. |
| About - Culture teaser | 4 | 4 | 4 | 4 | 8.0 | MINOR: hairlines run to the container edge; stop 24px short. |
| About - Journey | 4 | 4 | 4 | 4 | 7.5 | Same as Home Journey (hard-cut skyline). |
| Products - Hero | 4 | 5 | 4 | 3 | 7.0 | PROTECT the sheet. 1 MAJOR: at 768 the catalogue sheet overlaps the search field, the "FITS MACHINE" label and the chips ("Deep freezer" sits on the sheet) because `layout="top"` keeps `.ph__art` at padding-top 200px and width 54%. In `src/components/page/PageHero.tsx` add `@media (min-width:768px) and (max-width:1023px){ .ph[data-layout="top"] .ph__art{left:0;width:100%;top:auto;height:44%;bottom:calc(var(--fold-h) + var(--space-md));padding:0 var(--grid-page-padding);justify-content:center} }`. 2 MINOR: ~430px blank canvas under the chips at 768 (same fix). 3 MINOR: 375 shows a tiny unreadable sheet above the breadcrumb; scale to full width. |
| Products - Group sections | 4 | 5 | 4 | 4 | 8.5 | PROTECT sticky left rail + 16 drawn cards. 1 MINOR: ghost pictogram at ~12% in the left rail is lost; remove or raise to 25%. 2 MINOR: orphan card on Sliding's last row. 3 MINOR: lone Sealing card sits left in a 3-col grid with 60% empty at right; add a blush "Ask for other seals" card. |
| Products - FAQ | 4 | 4 | 4 | 4 | 8.0 | 1 MINOR: the 2px ink rule on top of the list is the only 2px rule; 1px. 2 MINOR: style the open state (burgundy question text). |
| Group - Hero | 4 | 5 | 3 | 4 | 7.5 | 1 MAJOR (768/375): art sits alone at the top with a 120-250px dead band before the breadcrumb; at 768 the sheet is pushed to x 330-720 leaving the left 40% empty. Centre it and cut `.ph__art` height to ~36%. |
| Group - Part grid | 4 | 5 | 4 | 4 | 8.5 | PROTECT (10 parts as 2x5). |
| Group - Other groups list | 4 | 4 | 4 | 4 | 8.0 | MINOR: add part count in micro-caps at right; hover fill `--blush`. |
| Part - Hero | 2 | 4 | 4 | 3 | 6.5 | 1 MAJOR: after de-duplicating the gallery the sheet is a 6-thumbnail strip in an otherwise empty frame (large voids above the label and above the title block at 1440; 300px void below the copy at 768). Draw one large dimensioned part drawing in the sheet (`PartSheetArt.tsx`) and keep the strip small, or shrink the frame to the strip. 2 MAJOR (768): copy column squeezed to ~270px with a 4-line lead and a two-line breadcrumb; stack the sheet above the copy as on the group page. |
| Part - Gallery + spec | 4 | 4 | 4 | 4 | 8.0 | PROTECT placeholder honesty. MINOR: "Sizes and variants" heading 20px and light vs table title; step up. |
| Part - Related parts | 4 | 5 | 4 | 4 | 8.0 | Fixed (all drawn). MINOR: first card double-width. |
| Industries - Hero | 4 | 5 | 4 | 3 | 8.0 | PROTECT. 1 MAJOR (768): the 7-card cluster collapses to a ~360px block mid-right with ~250px blank above and ~170px below; scale to full width at 768. |
| Industries - Core market | 5 | 5 | 4 | 4 | 9.0 | PROTECT (best use of the single burgundy block). MINOR: same wording as the Home slab; vary one. |
| Industries - Seven industries | 5 | 4 | 4 | 4 | 8.5 | PROTECT the asymmetric 2-3-2-1 bento. MINOR: Packaging art half-size; scale 1.3x. |
| Industries - Process | 4 | 5 | 4 | 4 | 8.0 | PROTECT the rising stair-step. 1 MINOR: ~170px dead space between intro and steps. 2 MINOR: repeats Home R2R title and copy verbatim; retitle "How an order moves". |
| Career - Hero | 4 | 4 | 4 | 4 | 8.0 | 1 MINOR (768): ~300px void between lead and ghost text. 2 MINOR (375): teams card precedes H1 with a 220px gap. |
| Career - Culture | 5 | 5 | 4 | 4 | 8.5 | PROTECT staggered Joyful / Supportive / Trustworthy with arrows. |
| Career - Teams list | 4 | 5 | 4 | 4 | 8.0 | MINOR: description baselines sit 30px below name baselines; baseline-align. |
| Career - Open roles | 4 | 4 | 4 | 4 | 8.0 | Honest blush callout is right. MINOR: "Want to work with us?" band under it duplicates the callout. |
| Contact - Hero | 5 | 5 | 4 | 4 | 8.5 | PROTECT site-plan. MINOR: plan labels 9-10px at 1440, ~5px at 375; bump SVG type. |
| Contact - Details + form | 4 | 4 | 4 | 4 | 8.0 | 1 MINOR: left column ~450px empty beside the 820px form at 1440; make the details card sticky. |
| Contact - Planning a visit | 4 | 4 | 4 | 4 | 7.5 | Good replacement. MINOR: 360px tile with only a pin and button; add 8px grid at 6% so it reads as a map tile. |
| Enquiry - Hero | 5 | 5 | 4 | 4 | 8.5 | PROTECT leader-line callouts. MINOR: gradient thins at the full stop. |
| Enquiry - Form | 5 | 4 | 4 | 4 | 8.5 | Structured (Contact information / Products required / add-another). MINOR: sidebar rule 2px ink; 1px. |
| Privacy - Hero | 4 | 5 | 4 | 4 | 8.0 | FIXED (title block "LEGAL / BEING FINALISED / REV TBD"). MINOR: block floats mid-right with a 280px void under it at 1440. |
| Privacy - Body | 4 | 4 | 4 | 4 | 8.0 | FIXED (one callout + headings). MINOR: TOC active state. |

## Remaining findings, priority order

CRITICAL: none.

MAJOR
1. /products at 768: catalogue sheet overlaps search field and chips (`PageHero.tsx` `data-layout="top"`). Fix in matrix.
2. Pan-Bharat map: no dispatch beyond India; world layer unreadable (`PanIndiaMap.tsx`, `worldDots.ts`, `scripts/gen-world-dots.mjs`).
3. Part page hero (`PartSheetArt.tsx`): near-empty sheet; add a large drawing; stack at 768.
4. 768 pass: 250-430px voids on /products, group, part, industries, career, privacy heroes. Fix in `PageHero.tsx` within `(min-width:768px) and (max-width:1023px)`: art fills the width or sits beside the text.
5. Repeated copy: "We don't just mould plastic. We mould possibilities." (Home + About), "From Requirement to Repeat Supply" (Home + Industries).
6. Home hero at 375: H1 overlaps the schematic ring.

## What is EXCELLENT and MUST BE PROTECTED
- About hero folded-A with fan lines and outline आलोक (best single image).
- Drawing-sheet heroes: Products (catalogue sheet), Group, Contact site-plan, Enquiry leader-lines, Privacy title block.
- Home parts schedule; gradient numerals with end caps on the Proof strip; Trust quote slashes.
- The 16 part pictograms as a family (1.5px line, corner crop marks).
- Notched 44-degree cards and buttons including the nav Get a Quote; the glass pill with diamond active state; the 128px logo.
- Vision / Mission 75-degree split; Industries core-market burgundy slab; the 2-3-2-1 bento.
- Industries rising up-right stair-step; Career staggered values.
- Burgundy footer with two-tone Devanagari and the 148px white lockup.
- Honest empty states ("PRODUCT PHOTO COMING SOON", "BEING FINALISED / REV TBD", "No open roles right now").
- The new India outline (complete, Andamans, dotted fill, burgundy origin).
