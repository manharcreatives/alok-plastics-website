# Alok Plastics — Website

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind v4 · GSAP/Lenis.
Built for Hostinger Premium (static files + one PHP endpoint). Brand: Alok Plastics — *भारते शिल्पितम्, विश्वय निर्मितम्*.

## Run
```bash
pnpm install
pnpm dev            # dev server (lab pages enabled)
pnpm build          # static export → ./out  (runs postbuild: prune-lab, sitemap, llms.txt)
pnpm check:seo      # audit ./out: titles, descriptions, canonicals, JSON-LD, links, sitemap
pnpm lint           # eslint + brand lint scripts (hex / spacing / glass / forbidden)
pnpm test           # Playwright (smoke + axe a11y) — serves ./out on :4173
```
`NEXT_PUBLIC_SHOW_LAB=1 pnpm build` keeps the internal `/lab/*` design pages (noindex). Off by default.

## Content = source of truth
All copy/data lives in `src/content/*.ts` (site, products, industries, journey, career, navigation). Components never hard-code claims.
Unknown values are `null` and render nothing — see `docs/client-questions.md` for what the client must supply (phone, WhatsApp, email, Maps URL, GSTIN, photos, video, legal text, GA4 ID, socials).

## Deploy (Hostinger)
Upload the contents of `./out` (including `.htaccess`) to `public_html`. Copy `public/api/config.php.example` → `api/config.php` on the server and set the enquiry inbox. See `docs/deploy-hostinger.md`.

## Brand rules enforced by lint
Colours only from `src/styles/tokens.css`; backdrop-filter only in the navbar and mobile drawer; no 28–36px spacing; no `100vh`; no invented claims (honesty rule).

## Key docs
`docs/MASTER_PROMPT.md` · `docs/decisions.md` · `docs/seo-geo.md` · `docs/qa.md` · `docs/loop-log/*` · `CHANGELOG.md`
