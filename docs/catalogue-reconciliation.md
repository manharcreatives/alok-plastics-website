# Alok Plastics — Catalogue Reconciliation

This file records all reconciliation notes between the product data in `src/content/products.ts` and the client's physical catalogue.

---

## Status

**Catalogue PDF found:** No — the water cooler / deep freezer spare parts catalogue PDF has not been placed in `/content/source/`. 

`TODO(client): Please provide the product catalogue PDF at /content/source/catalogue.pdf`

---

## Data sourced from §6.2 of the Master Prompt (transcribed from the catalogue)

| Product | Material | Sizes/Variants | Price | Source |
|---|---|---|---|---|
| Adjustable Leg Insert | HDPE | Round & Square; 1", 1.25", 1.5", 1.75", 2" | — | §6.2 |
| F-Bush | Nylon | — | Rs. 10/pc | §6.2 |
| Ventilation Jalli | PPCP | RS 60, RS 75, RS 80, RS 130 | — | §6.2 |
| Connecting Bush | Brass + nylon | 2", 2.5", 3" | Variant-wise | §6.2 |
| Float Valve | Nylon | — | Rs. 180/set | §6.2 |
| Waste Pipe | PPCP | — | Rs. 20/pc | §6.2 |
| Push Cocks | Brass | Light / Heavy | Listed | §6.2 |

## Products with incomplete data (awaiting catalogue)

| Product | What's missing |
|---|---|
| Gasket | Material, variants, sizes |
| Door Lock | Material, variants, sizes |
| Hinge | Material, variants, sizes (L-Type, other types) |
| Handle Lock | Material, variants |
| Bracket Handle | Material, variants |
| SS Kabja | Material (SS = stainless steel implied but not confirmed), variants |
| L-Type Hinges | Sizes, material |
| U-Type Door Spring | Material, variants |
| L-Hinge Door Spring | Material, variants |
| Waste Coupling | Material, variants |
| Three Core Plug | Material, group assignment |
| PUF Chemical | Material, group assignment, description |
| Bright Chrome | Material, group assignment, description |

---

_When the catalogue PDF is available, run: `pdftotext content/source/catalogue.pdf -` and reconcile every item above. Update `src/content/products.ts` with confirmed data and remove TODO flags where resolved._
