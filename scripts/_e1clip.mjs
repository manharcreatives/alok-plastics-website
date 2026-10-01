// Usage: node scripts/_e1clip.mjs <route> <width> <outPrefix> [step]  -> viewport-sized slices of the page
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const [,, route = '/about/', w = '1440', out = 'e1clip', step = '900'] = process.argv;
const width = Number(w), height = width < 600 ? 812 : width < 1000 ? 1024 : 900;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
await page.goto(`http://localhost:3000${route}?nopreload=1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const h = await page.evaluate(() => document.documentElement.scrollHeight);
fs.mkdirSync('.screenshots/' + out, { recursive: true });
let i = 0;
for (let y = 0; y < h; y += Number(step)) {
  await page.evaluate(v => window.scrollTo(0, v), y);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `.screenshots/${out}/s${String(i++).padStart(2, '0')}.png` });
}
await browser.close();
console.log('slices', i, 'height', h);
