# Round 4 (council round 3) - Art Director critique (STATIC only)

Reviewer: `art-director`. Source: `.screenshots/r2d/` (10 routes x 375/768/1440; folds read directly; full pages sliced to 1440x1000 / 375x900 crops and read for Home, About, Products, Group, Industries, Career, Contact, Privacy, footer). Source read-only.
Capture caveats (not defects): pinned Journey and un-revealed GSAP blocks leave blank 1000px bands in full-page PNGs (Home crops 12 and 14, About crops 5 and 7); fixed nav and hero repeat at the end of Home full page; Next "N" dev badge. Motion not reviewed. Because of the blank bands, About Story/Leadership/Record/Culture/Journey and the Products FAQ were NOT re-verified visually this round; their R3 scores are carried over, capped at 8.0.

## Verdict
The 768 pass landed, the part hero is now a real drawing, the map finally has readable continents, duplicated headlines are gone, and the 375 home hero is clean. Still not at the bar: the map does not show dispatch beyond India (third round running), 375 hero sheets are small with 100-150px voids, the footer burgundy block is still half empty, and some mid-page blocks (Contact "Planning a visit" tile, Career teams rows) are thin. No CRITICAL. Site-wide average **8.3 / 10** (R3 7.9). Exit bar (>= 8.5, no section < 7) NOT met: average short by 0.2; lowest section is exactly 7.0.

## Previous MAJORs - status

| R3 MAJOR | Status | Evidence |
|---|---|---|
| 1. /products 768 sheet overlaps search + chips | FIXED | 768 fold: sheet sits above (y 115-480), then breadcrumb, H1, search, chips, all clear; no overlap. |
| 2. Map: no dispatch beyond India; world layer unreadable | PARTLY | World layer FIXED: Europe, Africa, Australia, S. America, Asia are recognisable dot continents. Arcs NOT fixed: all 6-7 arcs still terminate inside India (furthest end ~x1050,y830, inside the NE). Nothing crosses the border or reaches the frame edge; the third legend row ("ambition: globally recognised") has no matching drawn arc. Client ask 13 unmet. |
| 3. Part hero near-empty sheet | FIXED | 1440: sheet holds a large dimensioned F-Bush drawing + MATERIAL/SIZE/SAMPLE column + group strip + title block. Residual: copy column right has ~230px void above the breadcrumb and ~340px below the lead; "FITS MACHINE FIT:" reads as a doubled label. 768 stacks sheet above copy (good). |
| 4. 768 voids (products, group, part, industries, career, privacy) | FIXED (career partly) | Products, Group, Part, Industries (cluster now full width x38-730), Privacy all stack art then copy with no dead band. Career 768 still ~150px gap between lead and ghost "PEOPLE & CRAFT" (MINOR). |
| 5. Repeated headline | FIXED | About core values now "What we hold to." with "Less waste. More value." / "Social employment" cards; Home keeps "We don't just mould plastic." once. |
| 6. Home hero 375 H1 over schematic ring | FIXED | 375: ring is a ghost behind the buttons only; headline, tagline and both CTAs clear. |

## Client literal asks (visual check)
- WhatsApp: none visible in nav, hero, bands, footer, forms. FAB not shown in captures (hidden, no number). PASS.
- Hero buttons: exactly "Enquire Now" + "Browse Products" at 1440/768/375. PASS.
- Nav: "Get a Quote" is a deep-burgundy notched-corner button with highlight on a glass pill; active page = burgundy text + diamond underline on every nav route (Home, About, Products incl. sub-pages, Industries, Career, Contact verified). PASS. Glass is subtle on pale pages (MINOR).
- No numbering in titles/labels: PASS. ("Sheet 01 / 10" on the part drawing and A/B/C/D on the submission sheet are drawing furniture; borderline, the only enumeration left.)
- One-screen first section, next section never peeks, all 10 routes at 375/768/1440: PASS.
- Map: world + India complete (Kashmir, NE, Andamans, southern tip inside the frame): PASS. Beyond-India arcs: FAIL.
- Footer address: pin icon + 3-line address + up-right arrow: PASS (arrow floats ~290px from the text, MINOR).

## Matrix

| Route · Section | Composition | Brand | Type | A11y | Score | Top 3 fixes |
|---|---|---|---|---|---|---|
| Global · Header pill | 5 | 5 | 4 | 4 | 9.0 | PROTECT. MINOR: glass barely distinguishable on pale routes; add 1px inner highlight. |
| Home · Hero | 5 | 5 | 4 | 4 | 9.0 | PROTECT. MINOR: bottom-right 40% of the 1440 fold is faint ghost drawing; enlarge schematic 1.25x. MINOR: Devanagari ~20px, step to 24px. |
| Home · Parts schedule | 4 | 5 | 4 | 4 | 8.0 | PROTECT. MINOR: ~100px void between part name and material tag in every cell. MINOR: "fits" glyphs heavy. |
| Home · About intro | 5 | 5 | 4 | 4 | 9.0 | PROTECT giant gradient आलोक and the title-block table. |
| Home · Proof strip | 5 | 5 | 4 | 4 | 8.5 | PROTECT (carried, not re-viewed). |
| Home · Product groups | 5 | 5 | 4 | 4 | 8.5 | PROTECT stagger + drawn strips. MINOR: strip pictograms mid-grey vs burgundy on Products page; unify. |
| Home · Trust quote | 5 | 5 | 5 | 4 | 9.0 | PROTECT slashes. |
| Home · Requirement to Repeat | 4 | 4 | 4 | 4 | 8.0 | MINOR: connector diamonds off card edges; stray arrowhead on dashed arc. |
| Home · Industries slab + bento | 4 | 5 | 4 | 4 | 8.5 | PROTECT burgundy slab. MINOR: bento text block thin. |
| Home · Journey | 4 | 4 | 4 | 4 | 8.0 | PROTECT road + diamond markers (375 vertical road is lovely). MINOR: skyline hard-cut at base across the road. |
| Home · Pan-Bharat map | 4 | 4 | 4 | 4 | 7.5 | MAJOR: draw 3 thin unlabelled arcs from Chandigarh that cross the border and run toward W/NW, E and SE frame edges (`PanIndiaMap.tsx`; endpoints OUTSIDE the India polygon). MINOR: matching lighter arc for the "ambition" legend row. MINOR: left edge of world layer is a grey smear (S. America); add edge fade; footnote use `--muted`. |
| Home · Why choose | 4 | 4 | 4 | 4 | 8.0 | PROTECT table. MINOR: chevron drawing floats with ~220px air above; align to table top. MINOR: 375 table header wraps to two lines. |
| Home · Enquiry section | 4 | 5 | 4 | 4 | 8.0 | MINOR: burgundy "Tell us the part." card is 200px beside an 800px form; extend or add a contact line. |
| Global · Enquiry band | 4 | 4 | 4 | 4 | 7.5 | MINOR: Contact and Privacy show a "Get a Quote" band right after content that already has the form/CTA; hide on /contact/ and /enquiry/. |
| Global · Footer | 3 | 5 | 4 | 4 | 7.5 | 1 MAJOR-if-unfixed: right 55% of the burgundy block above the links (~800x330) is empty; put address/phone there. 2 MINOR: address arrow 290px from text; inline it. 3 MINOR: "All products" link clipped at row edge. PROTECT two-tone Devanagari + 148px lockup. |
| About · Hero | 5 | 5 | 4 | 4 | 9.0 | PROTECT. |
| About · Vision / Mission | 5 | 5 | 4 | 4 | 8.5 | PROTECT 75-degree split. MINOR: "recognized" here vs "recognised" elsewhere. |
| About · Core values | 4 | 5 | 4 | 4 | 8.5 | FIXED. PROTECT burgundy card with tree diagram. |
| About · Brand idea / Story / Leadership / Record / Culture / Journey | 4 | 4 | 4 | 4 | 8.0 | Not re-viewable (blank capture bands); carried. |
| Products · Hero | 5 | 5 | 4 | 4 | 8.5 | FIXED at 768. PROTECT sheet. MINOR: 375 sheet ~290px wide, 6-7px labels, ~110px void below; widen to content width. |
| Products · Group sections | 4 | 5 | 4 | 4 | 8.5 | PROTECT sticky rail + drawn cards. MINOR: rail ghost pictogram ~12% (lost); raise to 25%. MINOR: 4th Water card orphaned on row 2; add blush "Ask for another part" card. |
| Products · FAQ | 4 | 4 | 4 | 4 | 8.0 | Not re-viewed; carried. |
| Group · Hero | 5 | 5 | 4 | 4 | 8.5 | FIXED (768 stacks; 1440 art right with 3 side cards). MINOR: 375 art 290px wide, 120px void before breadcrumb. |
| Group · Part grid / other groups | 4 | 5 | 4 | 4 | 8.5 | PROTECT. |
| Part · Hero | 4 | 5 | 4 | 4 | 8.5 | FIXED. MINOR: copy column floats mid-right with ~230px above / 340px below; align to sheet top. MINOR: drop doubled "FITS MACHINE FIT:" wording. |
| Part · Gallery + spec / Related | 4 | 4 | 4 | 4 | 8.0 | Carried. PROTECT placeholder honesty. |
| Industries · Hero | 5 | 5 | 4 | 4 | 9.0 | FIXED at 768. PROTECT. |
| Industries · Core market / bento | 5 | 5 | 4 | 4 | 9.0 | PROTECT 2-3-2-1 bento. MINOR: Packaging art half-size; scale 1.3x. |
| Industries · Process | 4 | 5 | 4 | 4 | 8.0 | Carried; stair-step PROTECT. |
| Career · Hero | 4 | 4 | 4 | 4 | 8.0 | PROTECT outline PEOPLE & CRAFT + four-teams card (375 puts card above H1: good). MINOR: 768 gap lead-to-ghost ~150px. |
| Career · Culture | 5 | 5 | 4 | 4 | 8.5 | PROTECT (carried). |
| Career · Teams list | 3 | 4 | 4 | 4 | 7.5 | MINOR x3: names (36px) and descriptions (15px) baselines differ ~30px; empty middle 50% of each row; add left index/pictogram or tighten to 2 columns. |
| Career · Open roles | 4 | 4 | 4 | 4 | 8.0 | Honest callout right; band beneath duplicates it (MINOR). |
| Contact · Hero | 5 | 5 | 4 | 4 | 8.5 | PROTECT site-plan. MINOR: plan labels ~9px at 1440, ~5px at 375. |
| Contact · Details + form | 3 | 4 | 4 | 4 | 7.5 | MINOR: left column holds one 230px card beside an 820px form (~480px dead); make sticky and add real contact rows / hours. |
| Contact · Planning a visit | 3 | 3 | 4 | 4 | 7.0 | MINOR (lowest section): right tile is a 720x360 near-white box with a pin and a button and an almost invisible grid; reuse the hero site-plan street grid with the burgundy plot marker so it reads as a map tile. |
| Enquiry · Hero | 5 | 5 | 4 | 4 | 9.0 | PROTECT leader-line sheet; gradient tail thins at the full stop (MINOR). |
| Enquiry · Form | 5 | 4 | 4 | 4 | 8.5 | Carried. |
| Privacy · Hero | 4 | 5 | 4 | 4 | 8.0 | 1440 title block floats right with ~300px empty under it; align block top with H1. |
| Privacy · Body | 4 | 4 | 4 | 4 | 8.0 | Carried; TOC active state MINOR. |

Average of the scored rows: 8.3.

## Remaining findings, priority order

CRITICAL: none.

MAJOR
1. Pan-Bharat map: dispatch beyond India still not drawn (`src/components/sections/PanIndiaMap.tsx`). Third round running; unmet client ask 13. Fixing lifts the section from 7.5 to about 8.5.
2. Footer half-empty burgundy block (`Footer.tsx`), composition 3, appears on every page.
3. Contact "Planning a visit" tile (7.0) and Contact left column void (7.5): weakest content-bearing sections; clears the "no section below 7" margin only barely.
4. Career Teams list (7.5): thin rows, empty middle.
5. 375 hero sheets on Products/Group/Part/Contact are ~290px wide with unreadable labels and a 110-150px void beneath; scale to the 335px content width and cut the gap to 24px (`PageHero.tsx` mobile rule).

## Protect
- About hero folded-A with fan lines; Home hero (clean at 375 now); giant gradient आलोक + title-block table.
- Drawing-sheet heroes: Products catalogue sheet, Group, Part (dimensioned drawing), Contact site-plan, Enquiry leader-lines, Privacy title block.
- Notched 44-degree cards and buttons, glass pill with diamond active marker, 128px logo, 148px footer lockup, two-tone Devanagari.
- Industries hero cluster, 2-3-2-1 bento, burgundy core-market slab, stair-step.
- Home parts schedule, Proof numerals, Trust quote slashes, Journey road (incl. 375 vertical road).
- The 16 pictograms; honest empty states.
