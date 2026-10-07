#!/usr/bin/env node
// Generates sitemap.xml from src/content + the static routes in src/app.
// Run as `postbuild` (writes ./out/sitemap.xml) and on demand (also refreshes public/sitemap.xml).
// /lab/* and any noindex page are never listed. lastmod = build date (UTC).
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadContent, scanStaticRoutes, writeBoth, ROOT } from './lib/content.mjs';

const { site, productGroups, publishedProducts, productPath } = await loadContent();
// loadContent() has just transpiled every src/content/*.ts into the cache; blogs.ts is read from there.
const { blogPosts } = await import(pathToFileURL(join(ROOT, 'node_modules', '.cache', 'alok-content', 'blogs.mjs')).href);
const origin = site.domain.replace(/\/+$/, '');
const lastmod = new Date().toISOString().slice(0, 10);

// priority / changefreq per static route; anything not listed gets the default.
const STATIC = {
  '/': [1.0, 'weekly'],
  '/products/': [0.9, 'weekly'],
  '/blogs/': [0.7, 'weekly'],
  '/enquiry/': [0.8, 'monthly'],
  '/about/': [0.7, 'monthly'],
  '/industries/': [0.6, 'monthly'],
  '/contact/': [0.7, 'monthly'],
  '/career/': [0.4, 'monthly'],
};
const DEFAULT = [0.5, 'monthly'];

const entries = new Map();
const NOINDEX = new Set(['/privacy/', '/terms/', '/refund/', '/cart/', '/products/item/']); // privacy/terms/refund: noindex until legal text is published; cart: always noindex
for (const r of scanStaticRoutes()) if (!NOINDEX.has(r)) entries.set(r, STATIC[r] ?? DEFAULT);
for (const g of productGroups) entries.set(`/products/${g.slug}/`, [0.8, 'weekly']);
for (const p of publishedProducts) {
  const path = productPath(p);
  if (p.group && path !== '/products/') entries.set(path, [0.7, 'monthly']);
}

// Each guide is dated by its own publish date (lastmod is not the build date for posts).
const lastmods = new Map();
for (const b of blogPosts) {
  const path = `/blogs/${b.slug}/`;
  entries.set(path, [0.6, 'monthly']);
  lastmods.set(path, b.publishDate);
}

const body = [...entries]
  .sort((a, b) => b[1][0] - a[1][0] || a[0].localeCompare(b[0]))
  .map(([path, [prio, freq]]) =>
    `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${lastmods.get(path) ?? lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio.toFixed(1)}</priority>\n  </url>`)
  .join('\n');

writeBoth('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
console.log(`sitemap.xml: ${entries.size} URLs (lastmod ${lastmod})`);
