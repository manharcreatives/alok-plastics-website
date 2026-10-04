# client-kit

Client-supplied source material from Manhar Creatives. **Reference only** — nothing in
here is imported by the app, linted, built, or deployed. It lives outside `src/` and
`public/` on purpose, so it cannot leak into the static export in `out/`.

## What's here

| Path | What it is |
|---|---|
| `brand-identity/` | The Alok Plastics brand & identity master folder: primary / transparent / monochrome / icon-only logos (PNG, SVG, PDF), wallpapers, LinkedIn cover, and the brand documentation (`.docx` + `.pdf`). |
| `Brand color theme & Logo_Designs_Alok_Plastics.pdf` | Brand colour theme and logo design rationale, as supplied. |
| `Brand color theme & Logo_Designs_Alok_Plastics_2.pdf` | Second revision of the above. |
| `source-docs/` | The specification documents this build was made against: SRS v1.0, the requirements checklist, Requirements v1 (Web), and the water cooler / deep freezer spare parts catalogue. |
| `qa-screenshots/` | Playwright captures of `/career` and `/enquiry` at 375 / 768 / 1440, plus the one-off `screenshot.mjs` used to take the `/enquiry` shots. Kept as QA evidence for the round-5 fixes. |

For day-to-day screenshots use the sanctioned tool instead — `node scripts/shoot.mjs`.
`screenshot.mjs` is kept only to document how the round-5 `/enquiry` captures were
produced.

The web-ready derivatives the site actually serves are **not** here — they live in
`public/brand/` (`alok-logo-primary.png`, `alok-mark.svg`, etc.) and are committed
normally.

## What is deliberately NOT here

Commercial documents stay on the local machine and must never be committed:

- `Alok_Plastics_Website_Quotation_Manhar_Creatives.pdf` — **quotation, contains pricing**
- `MC_0019_2026-27 - Alok Plastics.pdf` — contract / invoice
- `GooglePay_QR.png` — live payment code

This repository is **public**. A pricing or GST document in a commit cannot be cleanly
retracted, so keep them out. Note that `.gitignore` already reserves `/brand/` and
`/content/source/` for exactly this reason — this folder is the committed counterpart
for brand and reference material, and it is intentionally **not** named `brand/` so
that ignore rule does not swallow it.

Build output and dependencies are also excluded by policy and never committed:
`node_modules/`, `.next/` and `out/`. The Turbopack cache under `.next/dev/` contains
files over 100 MB, which GitHub rejects outright.

## Provenance

Received from the client via Manhar Creatives. Treat as read-only master material:
derive from it, never edit in place.