import { chromium } from '@playwright/test';
import sharp from 'sharp';

const lin = (ch) => { const s = ch / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const relL = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(7000);
await page.addStyleTag({ content: `
  .hero__content, .hero__cue, .glass-nav, #preloader-overlay { visibility: hidden !important; }
`});
await page.waitForTimeout(300);

/* union of the actual rendered text boxes, not the element box */
const rectsFor = async (sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = document.createRange(); r.selectNodeContents(el);
  const list = [...r.getClientRects()].filter((b) => b.width > 1 && b.height > 1);
  if (!list.length) return null;
  const x = Math.min(...list.map((b) => b.left)), y = Math.min(...list.map((b) => b.top));
  const x2 = Math.max(...list.map((b) => b.right)), y2 = Math.max(...list.map((b) => b.bottom));
  return { x, y, width: x2 - x, height: y2 - y, lines: list.length };
}, sel);

const stats = async (box) => {
  const { data, info } = await sharp(await page.screenshot({ clip: box })).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels, lums = [];
  for (let i = 0; i < data.length; i += ch) lums.push(relL(data[i], data[i + 1], data[i + 2]));
  lums.sort((a, b) => a - b);
  const q = (p) => lums[Math.floor((lums.length - 1) * p)];
  return { p50: q(0.5), p90: q(0.9), p95: q(0.95), p99: q(0.99) };
};

const WHITE = 1.0;
const W85 = relL(217, 217, 217);
const W65 = relL(166, 166, 166);
const targets = {};
for (const [k, sel] of [['h1', '.hero__h1'], ['sub', '.hero__sub'], ['tagline', '.hero__tagline'], ['ctas', '.hero__ctas']]) {
  targets[k] = await rectsFor(sel);
}
console.log('GLYPH BOXES:', JSON.stringify(targets, null, 1), '\n');

const rows = [];
for (const t of [0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70]) {
  await page.evaluate(async (time) => {
    const v = document.querySelector('video'); v.pause();
    await new Promise((r) => { const d = () => { v.removeEventListener('seeked', d); r(); };
      v.addEventListener('seeked', d); v.currentTime = time; setTimeout(d, 2000); });
  }, t);
  const s = {};
  for (const k of Object.keys(targets)) s[k] = await stats(targets[k]);
  rows.push({ t, ...s });
}

const line = (k, txtL, label) => {
  const worst95 = Math.min(...rows.map((r) => ratio(txtL, r[k].p95)));
  const worstMed = Math.min(...rows.map((r) => ratio(txtL, r[k].p50)));
  const worst99 = Math.min(...rows.map((r) => ratio(txtL, r[k].p99)));
  console.log(`  ${label.padEnd(16)} median ${worstMed.toFixed(2)}:1   p95 ${worst95.toFixed(2)}:1   p99 ${worst99.toFixed(2)}:1`);
};

console.log('WORST CONTRAST OVER THE 72s LOOP (text vs composited backdrop behind the glyphs)\n');
line('h1', WHITE, 'H1 white');
line('sub', W85, 'sub 85% white');
line('tagline', W65, 'tagline 65%');
line('ctas', WHITE, 'CTA label');

console.log('\nBACKDROP p50 / p95 per region (want p95 <= 0.183 for 4.5:1)');
for (const r of rows) {
  console.log(`  t=${String(r.t).padStart(2)}  h1 ${r.h1.p50.toFixed(3)}/${r.h1.p95.toFixed(3)}  sub ${r.sub.p50.toFixed(3)}/${r.sub.p95.toFixed(3)}  cta ${r.ctas.p50.toFixed(3)}/${r.ctas.p95.toFixed(3)}`);
}
await browser.close();