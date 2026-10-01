
## art-director (round 2) — MINOR items
- About Story: orphan vertical hairline under the heading goes nowhere; delete or make it a measurement rule.
- Industries/Home cards: filler "APPLICATION" micro-label on every industry card; remove.
- Spelling consistency: "recognized" (vision text, client copy) vs "recognised" (map legend) vs British "moulded"; confirm with client and unify.
- Products FAQ: six identical boxes; recast as a two-column hairline accordion.
- Privacy hero: generic document pictogram; replace with a drawing-sheet title block ("LEGAL / REV TBD").
- Hatch fill in EnquiryBand is ~3% and invisible; commit (6%) or remove.
- Part detail: sticky enquiry bar content is off the container grid (button ends at x=995 vs 1051 edge).
- Career mobile: teams card top bracket touches the nav pill at 375 (y~75).
- Group page: last row of the 5-col grid leaves a single orphan card on 1440.
- Journey mono era labels (2000S/2010S) grey on grey ~3.8:1; use --ink.

## motion-designer (round 2) - MINOR
- Pause infinite SVG pulses (jrn-pulse, pim-pulse) and hero ambient sweep when off-screen (IntersectionObserver).
- Hero ambient light sweep: single 1200ms expo.inOut pass instead of a 9s infinite loop.
- Journey: shorten half-masked window at credit swap; 40px between body and the "20 Cr+" stat; remove stray 2px burgundy dash in skyline (desktop x~778,y~775; mobile x~215,y~420).
- Nav: start ink glide on click rather than after route paint (about 450ms late).
- Count-up ease power3.out to expo.out 1200ms (or power3.inOut 2400ms).
- Replace remaining CSS ease / ease-in-out transitions (~35) with cubic-bezier(.16,1,.3,1) at 200/400ms.
- RequirementToRepeat: confirm per-node once:true reveal does not double-fire against the scrubbed timeline.
- Industries: draw the core-market illustration once (stroke-dashoffset 900ms power3.inOut).

## Art director R3 (council round 2) - MINOR
- FoldEdge: still one 3-degree line between nearly every section; give two per page a real 44-degree cut or a stepped (L+O) interlock.
- JourneyBackdrop.tsx: skyline hard-cut by a straight line across the road; mask-image fade over last 120px. Era labels 2000S/2010S to --ink 70%.
- Home parts schedule: cell min-height 230px to ~176px; tags margin-top:auto; fits glyphs Light weight.
- Home bento (IndustriesBento): 60px dead band under each card title; add one-line description or trim padding-bottom to --space-md.
- Home R2R: widen Repeat card 1.2x; seat connector diamonds on card edges; remove stray arrowhead on dashed repeat arc.
- Home Why choose: chevron drawing ends in a flat cut; shorten label to WHY ALOK at 375.
- Footer: right half of burgundy block empty above link grid; move address up or shorten; pull address arrow inline.
- Enquiry band: hide on /enquiry/ and /contact/; blush-card variant on Career.
- About: sticky Story headline; statement card right half hatch only; unify recognized/recognised.
- Part page: Sizes and variants heading step up; first related card double-width.
- Group: lone Sealing card centred or add blush Ask-for-other-seals card; orphan card on Sliding last row.
- Contact: sticky details card; visit tile add 8px grid at 6%; site-plan SVG labels 12px-equivalent at 375.
- Privacy: TOC active state; title block baseline alignment.
- Enquiry hero gradient tail thins at full stop; FAQ and sidebar 2px ink rules to 1px.
- Home hero grid texture heavier than inner pages; Devanagari tagline 24px at 1440.

## motion-designer (round 3) - MINOR
- useMotion.ts: power2.inOut (L177) and power3.out 1.4s (L217) -> power3.inOut / expo.out 1200ms.
- /products/ and /career/ h1 have no mask-rise entrance (match /about/ staging).
- Journey: year/title half-masked mid-scroll for ~300ms; add short hold.
- Mobile 375: 156ms long task on load; defer below-fold GSAP setup.
- Hero ken-burns 20s infinite: pause off-screen.
- Industries: first card should demonstrate the hover line wipe; one-time draw of core illustration.

## art-director (round 4) - MINOR
- Map: arcs must exit India polygon (MAJOR in report); fade left edge of world dots; legend ambition row needs matching lighter arc; footnote colour --muted.
- Footer: fill right half of burgundy block; inline address arrow; All products link clipped.
- Contact: visit tile needs drawn street grid + plot marker; sticky/filled left column; hide enquiry band on /contact/ and /enquiry/.
- Career: teams rows baseline mismatch + empty middle; 768 gap lead-to-ghost 150px.
- Part hero: copy column vertical alignment (230px above, 340px below); drop doubled FITS MACHINE FIT wording.
- 375 page-hero sheets (Products/Group/Part/Contact): scale to content width, cut 110-150px void.
- Products: 4th Water Control card orphaned (add blush Ask-for-another-part card); rail ghost pictogram 25%.
- Home: hero schematic 1.25x at 1440; Devanagari 24px; Why-choose chevron align to table top; bento text block thin; skyline hard cut at base.
- Header glass barely visible on pale routes: add 1px inner highlight.
- Privacy 1440: title block top aligned with H1; recognized/recognised spelling.
