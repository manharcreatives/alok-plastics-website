# Round 2 — "Unforgettable" brief (shared by every agent)

Read `docs/MASTER_PROMPT.md` §2, §3, §3.2, §7, §12, §17, §19 first. Brand lock §2 and honesty §19 are absolute.
Repo: Next 16 static export (Hostinger: static + PHP only), pnpm, Tailwind v4, GSAP/Lenis. Dev server already running on http://localhost:3000 (do NOT start another; do NOT `git push`/deploy/install global tools).
Icons: `@phosphor-icons/react` is installed — use **Light/Regular weight, `currentColor`**, import per-icon (tree-shake). Arrows that mean "forward" must be the up-right ↗ (`ArrowUpRight`). Keep the custom part pictograms (`src/components/brand/Pictogram.tsx`) — those are brand-specific.
Screenshots: `powershell: $env:CHROMIUM_PATH="C:/Users/mohit/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"; node scripts/shoot.mjs <name> "/route/,/other/" "375,1440"` → `.screenshots/<name>/`. **Read the PNGs** — never judge from code. (Use PowerShell, not Git Bash, for route args.)
Gates you must keep green for your files: `pnpm typecheck`, `pnpm lint` (check-hex/spacing/glass/forbidden: no raw hex outside tokens.css, no 28–36px gaps, `backdrop-filter` only in glass-nav.css + Drawer.tsx, no `100vh`, no `#000`).
Only edit files you own. Report: files changed, decisions, open questions, self-check.

## The client's 17 asks (Hinglish originals paraphrased)
1. Remove "Since 1998 · Pan-Bharat dispatch · Moulded plastic & steel parts, Chandigarh" (the utility bar above the nav) — from the hero/top.
2. "Get a Quote" nav button: glassmorphism + a bit of corner cut / shape (not a plain rectangle).
3. Products nav item: on hover the mega panel disappears before you can click into it (hover gap bug). Fix so the panel is reachable.
4. Nav: clear "which page am I on" effect — highlight, aesthetic.
5. Hero tagline: the Devanagari line is fine, but the English line beneath is misaligned — centre it properly under the Devanagari block.
6. Hero: remove WhatsApp button; hero has exactly 2 buttons: **Enquire Now** + **Browse Products**. WhatsApp lives only in the floating button at bottom-right.
7. Replace the marquee strip under the hero ("Repeat Customers 70%+ / Since 1998 / Pan-Bharat Dispatch / Moulded Plastic & Steel / Water Cooler Parts…") — looks AI-generated. Rethink from scratch; something only Alok could have.
8. NEW section right after hero: a *short* "about us" intro (not the full about page), strong visual design; numbers inside it should count up **slowly/smoothly on scroll-in**, not jump.
9. Remove the numbering ("01 —", "02 —" …) from all section titles / micro-labels site-wide.
10. Admin panel (PHP, Hostinger-compatible) — think through what Alok's admin actually needs.
11. Industries cards: add images that look good + redesign the cards properly (no photos exist → drawn illustration, with a photo slot in the content schema).
12. Journey: background image + proper roadmap visual, smooth. Replace the side box (year + description card) with a cinematic scroll: the year/description move along the road/roadmap as you scroll, no box.
13. Pan-Bharat map: the India map is cut off at the top — fix with an accurate outline; put a world map behind; show dispatch beyond India too (unlabelled arcs, honest copy — no export claims, no country names).
14. Icons site-wide look AI-generated — replace with a clean free library (Phosphor) and consistent usage.
15. Footer location/address must be clickable (Maps link; fall back to a Google Maps search URL built from the address while `mapsUrl` is null).
16. Every page's first section must fill exactly one screen (`100svh` minus nav) so nothing from the next section peeks in. Spacing between all sections is too tight/generic — craft it. Nothing generic; every section must feel hand-designed by an expert designer/coder/artist.
17. Remove WhatsApp buttons from everywhere except the floating FAB.

## Standing bar
Test: *if this section were recoloured and dropped into a bank/SaaS/law-firm site and still looked at home, it failed.* Logo-derived language only: 44° diagonals, folded-sheet edges, burgundy vs machined silver-grey, top-lit metal gradient, ↗ motion, engineering-drawing furniture (restrained), 2px radius. Vary reveals (mask rise, draw, diagonal wipe, lock, light sweep, odometer, nudge); easings `expo.out/expo.inOut/power3.inOut/back.out(1.4)`; durations 200/400/700/900/1200ms; animate only transform/opacity/clip-path/stroke-dashoffset; full `prefers-reduced-motion` fallback; mobile-first (375). Content honesty: no invented facts/numbers/clients/cities.

## File ownership (never touch another agent's files)
- **A · nav-hero**: `src/components/layout/{Header,Drawer,NavMegaPanel,UtilityBar}.tsx`, `glass-nav.css`, `src/components/hero/**`, `src/components/sections/WhatsAppFAB.tsx`, `src/content/navigation.ts`
- **B · home-core**: `src/components/sections/{ProofStrip,ProductGroups,RequirementToRepeat,TrustQuote}.tsx`, NEW `src/components/sections/AboutIntro.tsx`, `src/app/page.tsx`
- **C · home-story**: `src/components/sections/{IndustriesBento,JourneyOrbit,PanIndiaMap}.tsx`, `indiaDots.ts`, `src/content/{industries,journey}.ts`, `src/content/types.ts` (additive only), NEW assets under `src/components/art/**`, `public/maps/**`, `scripts/gen-*.mjs`
- **D · admin**: everything under `public/admin/**`, `public/api/**`, `docs/admin-panel.md`
- **E (wave 2)** · pages/footer/forms: `src/app/**` (except page.tsx home), `src/components/{page,products,forms,contact,about,ui}/**`, `Footer.tsx`, `EnquirySection.tsx`, `src/lib/**`
