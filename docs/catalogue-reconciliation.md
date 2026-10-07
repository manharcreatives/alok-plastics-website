# Alok Plastics — Catalogue Reconciliation

Reconciles `src/content/products.ts` (40 products) with the client-supplied sources. The sources are the single source of truth. Anything unclear is held back from the site and logged in `docs/client-questions.md` (rows 47-64).

## Sources

| Id | Source | Covers |
|---|---|---|
| WC | Water cooler and deep freezer spare parts catalogue (PDF, 22 pages) | Groups 01 and 02 |
| GS | Gas stove catalogue (PDF) | Group 03 stoves and bhattis |
| S1 | Screenshot 078a01db (catalogue p.16) | Jumbo Lite / Jumbo Heavy burners |
| S2 | Screenshot 97829e08 (catalogue p.32) | Delux / Jumbo Canteen Heavy with Ring |
| S3 | Screenshot b466c103 (catalogue pp.6-7) | Korian ring burner set, SS puffer plate |
| S4 | Screenshot e7c56909 (catalogue p.4) | Brass canteen valves |
| S5 | Screenshot 6f011728 (catalogue p.14) | Pilot burner, HP adaptor |

Catalogue crops under `/catalogue/spares` are no longer used in the UI (`images: []` for every product). Product photos follow `/images/products/<slug>.webp` (1:1, 1200x1200) and are layered over the pictogram placeholder by `PhotoBg`. Prompts and source references are in `docs/images/manifest.products.json`.

## Group assignment

| Group | Products | Count |
|---|---|---|
| 01 Water Cooler | connecting-bush, float-valve, push-cock, waste-pipe, waste-coupling, three-core-plug*, ventilation-jalli, adjustable-leg-insert | 8 |
| 02 Deep freezer and Display counter | f-bush, door-lock, hinge, handle-lock, bracket-handle, ss-kabja, l-type-hinge, u-type-door-spring, l-hinge-door-spring, gasket, puf-chemical*, bright-chrome* | 12 |
| 03 Commercial Kitchen | 10 burners, valves and fittings, 10 stoves and bhattis | 20 |
| 04 Caster wheel | none supplied | 0 |
| 05 On-demand Customized | none supplied | 0 |

\* Provisional group; the catalogue does not state the machine. See client question 57.

## Water cooler / deep freezer catalogue (WC)

| Product | Page | Reconciled as printed |
|---|---|---|
| Adjustable Leg Insert | 2 | Round and square; 1", 1.25", 1.5", 1.75", 2"; HDPE; Rs. 12/pc |
| F-Bush | 3 | Nylon; Rs. 10/pc |
| Ventilation Jalli | 4 | PPCP; 11"x11" Rs. 60, 14"x14" Rs. 75, 14"x17" Rs. 80, 18.5"x10" Rs. 130 |
| Connecting Bush | 5 | Brass Rs. 200 and nylon Rs. 190; sizes 2", 2.5", 3" |
| Handle Lock | 6 | Nylon; Rs. 70 |
| Bracket Handle | 7 | PPCP; 3" Rs. 15, 4" Rs. 20, 5" Rs. 30, 6" Rs. 35 |
| Float Valve | 8 | Nylon; Rs. 180/set |
| Waste Pipe | 9 | PPCP; Rs. 20/pc |
| Three Core Plug | 10 | 2.5 m Rs. 160, 3 m Rs. 200 |
| Push Cocks | 11 | Brass; Light Rs. 280, Heavy Rs. 300 |
| Door Locks | 12 | Big Rs. 260, Small Rs. 160 |
| Waste Coupling | 13 | SS; Rs. 60 |
| L-Type Hinges | 14 | SS; Rs. 95 |
| Gasket | 15-16 | 47 profile codes, listed exactly as printed |
| U-Type Door Spring | 17 | SS; Rs. 100 |
| PUF Chemical | 18 | Rs. 270/kg; POL and ISO |
| SS Kabja | 19 | Shown as "SS Kabja 202"; 3" Rs. 24, 4" Rs. 32; "12 gauge heavy duty" |
| L-Hinge Door Spring | 20 | SS; Rs. 249 |
| Bright Chrome | 21-22 | 318 spray paint Rs. 110, acrylic lacquer Rs. 120 |

Corrections against the earlier (pre-catalogue) data:

- Previously unpublished or price-less entries now have printed prices and variants (the older note "catalogue PDF not found" is obsolete).
- Ventilation Jalli: the "RS 60 / 75 / 80 / 130" codes are the prices, not size codes, so variants are labelled by dimensions with these prices.
- The catalogue names the page-12 product "Door Locks" and the page-6 product "Handle Lock"; names kept as printed (client question 58).
- There is no generic "Hinge" page. The `hinge` entry is retained as an overview and carries no invented specification (client question 59).
- Three Core Plug, PUF Chemical and Bright Chrome were previously unpublished and are now published in provisional groups.

## Commercial kitchen: parts (S1-S5)

| Product | Source | Notes |
|---|---|---|
| Jumbo Lite Burner | S1 | Rs. 490; MOQ and packing 8 pcs; 4 kg |
| Jumbo Heavy Burner | S1 | Rs. 540; 4.5 kg |
| Delux Canteen Heavy with Ring | S2 | Two unlabelled prices (1060 / 1105) kept as an internal `catalogNote`, not shown |
| Jumbo Canteen Heavy with Ring | S2 | Two unlabelled prices (1532 / 1582) kept as an internal `catalogNote`, not shown |
| Korian Ring Burner 3 pcs Set | S3 | 8", 14", 21" rings Rs. 1550 / 2750 / 4000; set Rs. 8300 |
| SS Puffer Plate with SS Capsule | S3 | Rs. 6.5 per inch; 7 sizes |
| Brass Canteen Nojal Valve | S4 | 65 / 87, 75 / 98, 85 / 114 (gm / Rs.); pouch of 25 pcs; MOQ 100 |
| Brass Canteen Valve 3/8 Nut | S4 | Same weights and prices as above |
| Pilot Burner (Full Brass) | S5 | Lite / Medium / Heavy; weights unclear, held in `catalogNote` (question 53) |
| HP Adaptor CI Nojal | S5 | Rs. 97; cast iron; 190 gm; packing 200 |

## Commercial kitchen: stoves and bhattis (GS)

| Product | Pages |
|---|---|
| SS Square Lite | 2-3 |
| SS Square Heavy | 4-5 |
| SS Square Heavy Extra Height | 6-7 |
| SS Round Casting | 8-9 |
| SS Round Stove | 10-11 |
| SS Bhatti Twin Burner | 12-13 |
| SS Bhatti Twin Burner, Shelf | 14-15 |
| SS Dosa Bhatti (Rs. 8830) | 16 |
| SS Chapati Bhatti (Rs. 9570) | 17 |
| SS Bhatti Round Extra Heavy | 18-19 |

## Deliberately not published

- "5year Guarantee" on the stove catalogue: not shown anywhere until the client confirms scope and terms (question 51).
- Unlabelled price pairs, cut-off cards and probable weight typos (questions 52, 54, 55): kept out of the UI, either in `catalogNote` (never rendered) or omitted.
- Materials not printed in the source: left unset (question 56).
- Third-party branding visible in source photos: photo prompts forbid brands and text (question 61).
- Prices are stored in data but not displayed while `site.showPrices` is false.

## Checks

`tests/products-data.spec.ts` verifies unique slugs, groups 01-05, valid variant prices, label coverage for all materials and machines, pictogram coverage, and that the photo manifest matches the product list.
