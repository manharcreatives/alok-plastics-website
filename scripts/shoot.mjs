// Usage: node scripts/shoot.mjs <change-name> [routes comma-sep] [widths comma-sep] [baseUrl]
// Full-page + above-the-fold (first viewport) screenshots into .screenshots/<change-name>/
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const [,, name = 'shot', routesArg = '/', widthsArg = '375,768,1440', base = 'http://localhost:3000'] = process.argv;
const routes = routesArg.split(',');
const widths = widthsArg.split(',').map(Number);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 812 : w < 1000 ? 1024 : 900 } });
  const page = await ctx.newPage();
  for (const r of routes) {
    const slug = (r === '/' ? 'home' : r.replace(/^\/|\/$/g, '').replace(/\//g, '_'));
    const dir = `.screenshots/${name}`; fs.mkdirSync(dir, { recursive: true });
    await page.goto(`${base}${r}${r.includes('?') ? '&' : '?'}nopreload=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // scroll through to trigger reveals, then back to top
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    await page.screenshot({ path: `${dir}/${slug}-${w}-fold.png` });
    await page.screenshot({ path: `${dir}/${slug}-${w}-full.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log('done');
