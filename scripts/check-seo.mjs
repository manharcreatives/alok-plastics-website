#!/usr/bin/env node
// check-seo.mjs — audits the static export in ./out (run `pnpm build` first).
// Errors fail the process (exit 1); warnings are reported only.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');
if (!existsSync(OUT)) { console.error('check-seo: ./out not found — run `pnpm build` first.'); process.exit(1); }

const errors = [];
const warns = [];
const err = (page, msg) => errors.push(`${page}  ${msg}`);
const warn = (page, msg) => warns.push(`${page}  ${msg}`);

const decode = s => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

function walk(dir) {
  return readdirSync(dir).flatMap(n => {
    const f = join(dir, n);
    return statSync(f).isDirectory() ? walk(f) : [f];
  });
}

const files = walk(OUT);
const htmlFiles = files.filter(f => f.endsWith('index.html') || f.endsWith('404.html'));
const toUrl = f => {
  const rel = f.slice(OUT.length).replace(/\\/g, '/');
  if (rel === '/404.html') return '/404.html';
  return rel.replace(/index\.html$/, '');
};

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] ?? m[3]) : null;
};
const metaTag = (html, key, val) => {
  for (const t of html.match(/<meta\b[^>]*>/gi) ?? []) if ((attr(t, key) ?? '').toLowerCase() === val) return t;
  return null;
};

const FORBIDDEN_KEYS = ['aggregateRating', 'review', 'reviews', 'offers', 'award', 'hasCredential', 'ratingValue'];
const hasKey = (o, keys) => {
  if (Array.isArray(o)) return o.some(x => hasKey(x, keys));
  if (o && typeof o === 'object') return Object.entries(o).some(([k, v]) => keys.includes(k) || hasKey(v, keys));
  return false;
};

const resolves = href => {
  let p = href.split('#')[0].split('?')[0];
  if (!p) return true;
  try { p = decodeURIComponent(p); } catch { /* keep */ }
  const abs = join(OUT, p);
  if (p.endsWith('/')) return existsSync(join(abs, 'index.html'));
  return existsSync(abs) && statSync(abs).isFile() || existsSync(join(abs, 'index.html'));
};

const indexable = new Map(); // url -> { title, desc }
const titles = new Map();
const descs = new Map();
let pageCount = 0;
let linkCount = 0;

for (const f of htmlFiles) {
  const url = toUrl(f);
  const html = readFileSync(f, 'utf8');
  const robots = (attr(metaTag(html, 'name', 'robots') ?? '', 'content') ?? '').toLowerCase();
  const noindex = robots.includes('noindex');
  const is404 = url === '/404.html' || url.startsWith('/_not-found') || url === '/404/';
  pageCount++;

  // links + images (all pages, incl. noindex)
  for (const t of html.match(/<(?:a|link)\b[^>]*>/gi) ?? []) {
    const href = attr(t, 'href');
    if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
    linkCount++;
    if (!resolves(href)) err(url, `broken internal link: ${href}`);
  }
  for (const t of html.match(/<(?:img|script|source)\b[^>]*>/gi) ?? []) {
    const src = attr(t, 'src');
    if (src && src.startsWith('/') && !src.startsWith('//') && !resolves(src)) err(url, `missing asset: ${src}`);
  }
  for (const t of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (attr(t, 'alt') === null) err(url, `<img> without alt: ${t.slice(0, 80)}`);
  }

  // JSON-LD (all pages)
  const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const seen = new Set();
  const types = [];
  ld.forEach((raw, i) => {
    let data;
    try { data = JSON.parse(raw); } catch (e) { err(url, `JSON-LD #${i + 1} does not parse: ${e.message}`); return; }
    if (seen.has(raw)) err(url, `duplicate JSON-LD block #${i + 1}`);
    seen.add(raw);
    for (const d of Array.isArray(data) ? data : [data]) {
      if (!d['@context'] && !Array.isArray(data)) err(url, `JSON-LD #${i + 1} has no @context`);
      types.push(d['@type']);
    }
    if (hasKey(data, FORBIDDEN_KEYS)) err(url, `JSON-LD #${i + 1} contains a forbidden key (rating/review/offers/award/credential)`);
  });
  for (const t of ['Product', 'BreadcrumbList', 'FAQPage', 'Organization', 'LocalBusiness', 'WebSite']) {
    if (types.filter(x => x === t).length > 1) err(url, `more than one ${t} JSON-LD`);
  }

  if (is404 || noindex) continue; // remaining checks are for indexable pages

  // h1
  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1s !== 1) err(url, `expected exactly 1 <h1>, found ${h1s}`);

  // title
  const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = tm ? decode(tm[1]).trim() : '';
  if (!title) err(url, 'missing <title>');
  else {
    if (title.length > 65) err(url, `title ${title.length} chars (>65): "${title}"`);
    else if (title.length > 60) warn(url, `title ${title.length} chars (61-65, target ≤60): "${title}"`);
    if (titles.has(title)) err(url, `duplicate title with ${titles.get(title)}: "${title}"`);
    titles.set(title, url);
  }

  // description
  const desc = attr(metaTag(html, 'name', 'description') ?? '', 'content') ?? '';
  if (!desc) err(url, 'missing meta description');
  else {
    if (desc.length < 50 || desc.length > 160) err(url, `meta description ${desc.length} chars (need 50-160)`);
    if (descs.has(desc)) err(url, `duplicate meta description with ${descs.get(desc)}`);
    descs.set(desc, url);
  }

  // canonical
  const canon = (html.match(/<link\b[^>]*rel="canonical"[^>]*>/i) ?? [])[0];
  const canonHref = canon ? attr(canon, 'href') : null;
  if (!canonHref) err(url, 'missing canonical');
  else if (!canonHref.startsWith('https://alokplastics.com/') || canonHref !== `https://alokplastics.com${url}`) err(url, `canonical "${canonHref}" does not match page URL`);

  // social
  if (!metaTag(html, 'property', 'og:title')) err(url, 'missing og:title');
  if (!metaTag(html, 'property', 'og:image')) err(url, 'missing og:image');
  if (!metaTag(html, 'name', 'twitter:card')) err(url, 'missing twitter:card');

  indexable.set(url, { title, desc });
}

// ── sitemap ↔ indexable pages ───────────────────────────────────────────────
const sitemapPath = join(OUT, 'sitemap.xml');
if (!existsSync(sitemapPath)) err('/sitemap.xml', 'missing');
else {
  const locs = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const listed = new Set(locs.map(l => l.replace('https://alokplastics.com', '')));
  if (listed.size !== locs.length) err('/sitemap.xml', 'duplicate <loc> entries');
  for (const u of indexable.keys()) if (!listed.has(u)) err('/sitemap.xml', `indexable page not listed: ${u}`);
  for (const u of listed) if (!indexable.has(u)) err('/sitemap.xml', `lists a URL that is not an indexable page: ${u}`);
  if ([...listed].some(u => u.startsWith('/lab'))) err('/sitemap.xml', 'lists /lab/*');
}

// ── root files ──────────────────────────────────────────────────────────────
for (const f of ['robots.txt', 'llms.txt', '.htaccess', 'site.webmanifest', 'og-image.png', 'favicon.ico', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', '404.html']) {
  if (!existsSync(join(OUT, f))) err(`/${f}`, 'missing from ./out');
}
if (existsSync(join(OUT, 'robots.txt'))) {
  const r = readFileSync(join(OUT, 'robots.txt'), 'utf8');
  if (!/^Sitemap:\s*https:\/\/alokplastics\.com\/sitemap\.xml/m.test(r)) err('/robots.txt', 'no Sitemap line');
  if (!/Disallow:\s*\/lab\//.test(r) || !/Disallow:\s*\/api\//.test(r)) err('/robots.txt', 'must disallow /api/ and /lab/');
}
const labFiles = files.filter(f => f.slice(OUT.length).startsWith('/lab/') && f.endsWith('.html'));
for (const f of labFiles) {
  const h = readFileSync(f, 'utf8');
  if (!/noindex/i.test(h)) err(toUrl(f), 'lab page shipped without noindex');
}

// ── report ──────────────────────────────────────────────────────────────────
console.log(`check-seo: ${pageCount} HTML files, ${indexable.size} indexable pages, ${linkCount} internal links checked`);
if (labFiles.length) console.log(`  note: ${labFiles.length} lab HTML file(s) in ./out (NEXT_PUBLIC_SHOW_LAB=1 build)`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const e of errors) console.log(`  FAIL  ${e}`);
if (errors.length) { console.log(`check-seo FAILED — ${errors.length} error(s), ${warns.length} warning(s)`); process.exit(1); }
console.log(`check-seo passed — 0 errors, ${warns.length} warning(s)`);
