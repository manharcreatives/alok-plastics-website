# Catalogue + cart + WhatsApp order request — shared brief (all agents read this)

Source request: owner's reference prompt (Amazon/Flipkart-grade discovery, NO payments, cart -> WhatsApp order request to the owner).
Adapted to OUR stack (static Next.js export on Hostinger, PHP admin, runtime JSON overlays) and OUR honesty rules.

## Non-negotiables
- Read AGENTS.md (this Next.js has breaking changes; check node_modules/next/dist/docs/ before Next code) and match surrounding style.
- Never invent prices, stock, specs. A product has a price/stock ONLY if the admin set it (runtime `data/products.json`). No price => show "Price on request" (never 0, never hide the card). No stock number => availability is "On request" (not "In stock").
- Wording: "Order request" / "Send order request on WhatsApp". Never "order confirmed", "payment", "checkout success". Add a visible note: price, stock, delivery and payment are confirmed by Alok Plastics on WhatsApp.
- No payment gateway, no accounts, no server-side orders. Cart is client-side (localStorage key `alok:cart:v1`, try/catch every access, SSR-safe).
- Design: site tokens only (src/app/globals.css), `pnpm check` scripts must stay green (check-hex, check-spacing, check-glass, check-forbidden), no #000, green only on WhatsApp/success, prefers-reduced-motion respected, 44px touch targets, WCAG AA.
- Do NOT run `pnpm build` (the lead does it at the end). `pnpm typecheck` and `pnpm lint` must pass with 0 errors. Do not commit. You MAY write Playwright specs under tests/ but do not run them (they need a build).
- Stay inside your file ownership; re-read a shared file right before editing it; keep shared edits small.

## Data contract (runtime `data/products.json`, per slug override; all optional; extends the existing one)
name, summary, description, material, sku, hsn, moq, packing, seoTitle, seoDescription, images[{id,url,alt}] (existing)
+ NEW: `price` (number >= 0, INR, max 9999999), `availability` ('in-stock'|'out-of-stock'|'on-request'), `stock` (integer 0..100000 | absent), `keywords` (string[] max 20 items, each <= 40 chars), `brand` (<=60), `featured` (bool), `status` ('active'|'inactive'|'archived'; inactive/archived = not in public catalogue/search/menus/related, product page + cart show "no longer available").
Build-time `Product` type (src/content/types.ts) gets the same optional fields so merged products are uniform. `hidden` list in product-overrides.json keeps working (treated like inactive).

## Shared module signatures (the lead fixed these so agents can work in parallel)
- `src/lib/catalog-search.ts` (owner: agent SEARCH):
  ```ts
  export type Availability = 'in-stock' | 'out-of-stock' | 'on-request';
  export type SortKey = 'relevance' | 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';
  export interface CatalogQuery { q: string; groups: string[]; materials: string[]; machines: string[]; availability: Availability[]; priceMin?: number; priceMax?: number; sort: SortKey; page: number; pageSize: number }
  export interface CatalogResult { items: Product[]; total: number; page: number; pageCount: number; facets: { groups: {id:string;name:string;count:number}[]; materials: {id:string;label:string;count:number}[]; machines: {id:string;label:string;count:number}[]; availability: {id:Availability;count:number}[]; priceRange: [number, number] | null }; didYouMean: string | null }
  export const DEFAULT_QUERY: CatalogQuery;
  export function searchCatalog(products: Product[], q: CatalogQuery): CatalogResult;   // products = already override-merged, status-filtered by caller via isListable()
  export function suggest(products: Product[], q: string, limit?: number): { label: string; kind: 'product'|'group'|'material'; href: string }[];
  export function queryFromParams(p: URLSearchParams): CatalogQuery;  export function queryToParams(q: CatalogQuery): URLSearchParams;
  export function isListable(p: Product): boolean; // published && status active (or unset)
  export function availabilityOf(p: Product): Availability;  export function maxOrderQty(p: Product): number | null; // null = no limit known
  export function formatPrice(n: number): string; // "₹1,250"
  ```
- `src/components/cart/AddToCart.tsx` default export `AddToCart({ product, compact? })` and `src/components/cart/QtyStepper.tsx` default export `QtyStepper({ value, onChange, min?, max?, label })` (owner: agent CART; created FIRST so others can import). `src/components/cart/useCart.ts` exports `useCart()` -> { lines, count, add(product, qty), setQty(slug, qty), remove(slug), clear(), open(), close() }.
- `src/components/runtime/useRuntime.ts` already exports useRuntimeProduct / useRuntimeProducts / useRuntimeProductMap (agent SEARCH extends them for the new fields; others consume).

## Ownership
- ADMIN: public/admin/** (products screens/lib), scripts/generate-catalogue.mjs, public/data/products.example.json, docs/admin-panel.md.
- SEARCH: src/lib/catalog-search.ts (+ src/lib/products-search.ts migration), src/lib/runtime-schema.ts, src/lib/runtime-data.ts, src/content/types.ts, src/components/runtime/useRuntime.ts, tests/catalog-search.spec.ts (pure logic, Playwright test runner without browser).
- CATALOG: src/app/products/page.tsx, src/components/products/{PartFinder,PartCard,GroupSection,*Filter*,*Sort*,*Search*}.tsx + new files, products.css additions. Uses catalog-search + AddToCart.
- CART: src/components/cart/**, src/app/cart/**, src/lib/whatsapp.ts (+waOrder), header/mobile cart indicator (src/components/layout/* minimal edits), src/app/layout.tsx (provider), analytics events.
- PDP: src/app/products/[group]/[part]/page.tsx, src/components/products/{ProductGallery,ProductSpecs,Related*,StickyEnquiryBar,ProductCta}.tsx, Product JSON-LD in src/lib/seo.ts (offers only when price set).
