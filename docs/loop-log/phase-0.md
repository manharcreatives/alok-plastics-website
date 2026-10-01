# Phase 0 Loop Log — Setup, Research & Team

**Date:** 2026-10-01  
**Status:** COMPLETE ✅

## Exit criteria (§22.1)

| Criterion | Status |
|-----------|--------|
| Repo builds (`pnpm run build`) | ✅ Next.js 16.3.7 — 4/4 static pages |
| TypeScript strict mode passes | ✅ `tsc --noEmit` clean |
| 4 lint scripts all pass | ✅ hex / spacing / glass / forbidden |
| 12 agent files exist in `.claude/agents/` | ✅ |
| Content files typed and complete | ✅ types / site / products / industries / journey / navigation / career |
| `docs/design-research.md` placeholder exists | ✅ (full run deferred to design-researcher agent) |
| Client-questions list started | ✅ 25 TODOs in `docs/client-questions.md` |
| ADRs written | ✅ ADR-001–004 in `docs/decisions.md` |
| Tokens locked in `src/styles/tokens.css` | ✅ 24 tokens + 2 gradients |

## Files created this phase

### Project skeleton
- `next.config.ts` — static export, trailingSlash, unoptimized images
- `package.json` — all deps + lint/test scripts
- `.gitignore` — secrets excluded (config.php, content/source/, brand/)
- `tsconfig.json` — strict mode

### Design system
- `src/styles/tokens.css` — 24 colour tokens + 2 gradients (LOCKED)
- `src/app/globals.css` — Tailwind v4 @theme inline + base styles + skip link
- `src/app/layout.tsx` — self-hosted fonts (Archivo/Inter/Noto/JetBrains), metadata, preloading script
- `src/app/page.tsx` — Phase 0 placeholder

### Content model
- `src/content/types.ts` — all typed interfaces
- `src/content/site.ts` — §5.1 site config
- `src/content/products.ts` — 19 published + 3 unpublished products, 4 groups
- `src/content/industries.ts` — 7 industries
- `src/content/journey.ts` — 6 journey markers, 5 USP steps
- `src/content/navigation.ts` — primary nav, footer, legal links
- `src/content/career.ts` — culture text, 4 teams

### Lint scripts
- `scripts/check-hex.mjs` — fails on any hex not in token set
- `scripts/check-spacing.mjs` — fails on 28–36px forbidden zone
- `scripts/check-glass.mjs` — fails if backdrop-filter in > 2 files
- `scripts/check-forbidden.mjs` — fails on 100vh / rounded-2xl / lorem ipsum / blue/purple / slop effects

### Documentation
- `docs/decisions.md` — ADR-001–004
- `docs/client-questions.md` — 25 TODOs (Critical/High/Medium/Lower)
- `docs/agent-log.md`
- `docs/qa.md` — performance targets from §16
- `docs/catalogue-reconciliation.md` — catalogue PDF missing
- `docs/credits.md` — font and library licences
- `docs/redirects.md` — 301 redirect strategy
- `docs/hero-video-brief.md` — video brief for client shoot
- `docs/design-research.md` — placeholder

### Agent definitions (`.claude/agents/`)
design-researcher, brand-systems, content-architect, motion-engineer,
hero-nav-engineer, ui-builder, sections-builder, pages-builder,
forms-integrations, seo-geo, qa-auditor, design-critic

## Issues resolved
- `pnpm create next-app` rejected "alok plastics" (spaces) — scaffolded into `alok-plastics/` subdirectory, moved files up
- `next.config.ts` had `eslint` key not in `NextConfig` type in Next.js 16 — removed

## Awaiting from client
- Logo PNG/vector (all agents carry placeholder fallback)
- Catalogue PDF (`/content/source/catalogue.pdf`)
- Phone, WhatsApp, email, Google Maps URL, GSTIN
- Product photography
- Hero video (brief in `docs/hero-video-brief.md`)
- WordPress URL list (for 301 redirects)
- GA4 measurement ID

## Next: Phase 1 — Brand Systems
- Logo component (placeholder SVG until client delivers PNG)
- 20 pictograms (10 parts + 7 industries + 3 machines)
- `/_lab/swatches` and `/_lab/type` lab pages
- Verify all lint scripts still pass
