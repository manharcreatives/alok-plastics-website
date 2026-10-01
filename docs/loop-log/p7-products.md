# P7 Products pages — loop log

## Pass 1 (implement)
- /products (PageHero, Fuse part-finder, machine + material filters, 4 group sections, EnquiryBand)
- /products/[group]/ (dynamicParams=false, 4 params), /products/[group]/[part]/ (17 params)
- Components in src/components/products/: PartCard, PartFinder, GroupSection, ProductGallery, StickyEnquiryBar, EnquiryFormPrefilled, products.css
- src/lib/products-search.ts; helpers appended to bottom of src/content/products.ts (labels, getGroupBySlug, productPath, knownMachines)

## Pass 2 (tsc / lint / self-critique)
- tsc clean; check-hex/spacing/glass/forbidden pass; eslint clean on touched files.
- Found: layout already provides <main> -> removed duplicate main from /products.
- Titles: all <= 60 incl. layout template (max 60). Descriptions clipped to 155.
- No prices rendered; no "TODO" strings in output; unknown spec rows omitted; machine filter never claims TODO-machine parts (they show under All only).
- Sticky bar right padding clears the WhatsApp FAB.

## Open
- /enquiry/?product=<slug>: page.tsx must swap <FullEnquiryForm /> for <EnquiryFormPrefilled /> (src/components/products/EnquiryFormPrefilled.tsx).
- Not browser-tested (no build allowed): verify 375px overflow and sticky bar after integration build.
