# Claude Code prompt — fix Pan India map geography and alignment

Paste the prompt below into Claude Code from the `plastic 2` repository root. Attach the screenshot from the user request as the visual reference.

```text
You are working in the Alok Plastics website repository (`plastic 2`). Fix the homepage Pan India map so the geographic illustration is accurate and its map artwork, India/state borders, location markers, and frame all align. Do the implementation, inspect it in a browser, and iterate until it is correct. Do not stop after proposing a diagnosis.

## User-visible defects (see attached screenshot)

- The geographic map artwork does not line up with the border/frame treatment; the mismatch is particularly apparent where India and neighboring coastlines/borders meet the satellite-style background.
- The Chandigarh origin marker is not anchored convincingly to Chandigarh.
- Locations called out by the user—Chandigarh, Gujarat, and Sri Lanka—appear geographically misplaced against the visible geography. Gujarat is a state/region rather than a point city; do not invent a city-level claim for it.
- Several route endpoints appear to drift onto the wrong state, coastline, or neighboring country. Fix the underlying coordinate/rendering issue rather than nudging these few points by eye.

## Start by inspecting the actual implementation

Read the repository `AGENTS.md` and the relevant Next.js 16 documentation under `node_modules/next/dist/docs/` before changing Next.js code. Inspect at least:

- `src/components/sections/PanIndiaMap.tsx`
- `src/components/sections/indiaMapData.ts` (generated; do not hand-edit)
- `scripts/gen-india-map.mjs` (source for the generated geographic paths)
- `public/images/backgrounds/india-map-realistic.webp` and `public/images/backgrounds/india-map-satellite.png`
- `src/app/page.tsx` and the styles/layout that determine the map frame and responsive dimensions
- `docs/PROMPTS-CLIENT-FIXES.md` and `connection.md` only if relevant to constraints

Confirm the active image asset, its intrinsic dimensions, geographic extent/projection if documented, and how it is positioned/scaled/clipped at each viewport. The SVG vector paths use `mapProject(lon, lat)` and the current map projection constants from generated data. Do not assume the raster has the same extent or projection just because it is placed in the SVG. The raster `<image>` currently has explicit x/y/width/height and `preserveAspectRatio="none"`; verify whether this distorts or shifts the image. Also inspect the stage's oversized SVG width, negative margin, masks, clipping, viewBox, and frame bounds. Distinguish a real geographic error from an intentional crop or visual registration-corner decoration.

## Required geographic treatment

1. Establish one explicit geographic-to-screen transform for all geographic layers. The India outline, state/UT borders, satellite/raster background (if retained), origin marker, domestic endpoints, world endpoints, and graticule must agree under that transform. A raster that has no reliable georeferencing must be calibrated from documented bounds/control points or replaced with a map layer that can be aligned accurately; do not stretch an arbitrary image until it merely looks close.
2. Verify the specific reference positions against authoritative geographic coordinates/boundaries: Chandigarh (approximately 76.78° E, 30.73° N), Gujarat within India's western coast, and Sri Lanka south-east of Tamil Nadu, separated from mainland India by the Palk Strait. Treat coordinates as geographic input and let the shared projection place them. If a marker is intended to represent a region, make it an explicitly documented representative point inside that region.
3. Preserve correct India state/UT geometry and the repository's intended Government of India depiction. Ensure Gujarat's state geometry is on the correct side of the India outline and Chandigarh is represented at the Chandigarh location (not confused with a nearby Punjab/Haryana point). Ensure Sri Lanka is shown south-east of Tamil Nadu and is not rendered as part of India.
4. Check longitude/latitude argument order, projection offsets/scaling, raster geographic extent, SVG `viewBox`, CSS scaling/crop, device-pixel ratio, and responsive sizing. Do not “fix” alignment by changing only marker coordinates, adding unexplained offsets, or distorting map proportions.
5. Keep the current visual language and responsive design where possible. Preserve accessible semantics, keyboard interactions, reduced-motion behavior, performance, and the honesty constraint: unlabeled illustrative arcs do not imply real customer or delivery locations. Do not add country/city/export claims, flags, or new factual claims.
6. Keep generated files generated: make durable geographic source changes in the generator and regenerate `src/components/sections/indiaMapData.ts` when necessary. Keep the raster source/attribution/licensing valid if it must be replaced. Avoid adding a heavyweight map dependency unless there is a demonstrated need.

## Required workflow — complete every stage

### 1. CREATE / GENERATE
Trace the map's asset and coordinate pipeline, identify the root cause(s), implement the smallest robust correction, and regenerate any generated map data through its documented script. If the image itself is an unreferenced artistic background, align it using defensible geographic control points or replace it with a properly aligned asset; explain the choice in the final report.

### 2. QUALITY CHECK
- Run the checks already defined by the project (`pnpm typecheck` and `pnpm lint`). Do not add a new test suite unless needed to prove a specific regression.
- Run the site and inspect the homepage Pan India section in a real browser at desktop, tablet, and mobile widths. Capture/compare screenshots before and after if available.
- Verify visible alignment at known controls: Chandigarh marker; India outer coastline and state borders; Gujarat's location and western coast; southern tip of India; Sri Lanka; and at least one eastern/northeastern state boundary. Check that all remain aligned after responsive scaling and cropping.
- Verify no marker/arc is accidentally clipped by the frame, the frame corners/registration accents remain intentional, map proportions are not distorted, and keyboard/reduced-motion behavior remains intact.
- Check browser console and network for asset errors, hydration errors, or layout warnings.

### 3. SELF-CRITIQUE
Before finalizing, list specific remaining risks or issues found: uncertain raster georeferencing, source-data limitations, projection/crop tradeoffs, any control point that cannot be validated, responsive edge cases, accessibility/motion regressions, or anything the screenshot does not let you verify. Do not claim accuracy beyond the evidence.

### 4. AUTO-FIX
Fix every issue found in the self-critique that can be corrected in this repository. If an external source or user-provided data is genuinely required, keep the implementation honest, state the limitation, and identify the precise missing input. Re-run affected checks after fixes.

### 5. RE-REVIEW
Re-open the changed code and re-inspect the map at desktop, tablet, and mobile. Confirm the fix did not break map bounds, framing, interactions, reduced motion, accessibility, or build/lint status. Report exact commands and outcomes; never say a check passed unless it was run successfully.

### 6. FINAL OUTPUT
Summarize the root cause, files changed, correction made, browser widths reviewed, and verification results. Include a concise production-ready checklist with each item marked PASS, FAIL, or NOT VERIFIED. Mention any remaining limitation plainly. Do not commit, deploy, or publish.

## Constraints

- Do not overwrite unrelated pre-existing user changes. Inspect `git status` first and preserve all unrelated modified/untracked files.
- Follow the repository's token, spacing, accessibility, and generated-file conventions. Read project rules before editing.
- Do not modify business copy or unrelated sections.
- Prefer precise visual/geographic verification over assumptions based on the attached screenshot alone.
```
