
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
