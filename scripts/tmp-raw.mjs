import { chromium } from '@playwright/test';

const lin = (ch) => { const s = ch / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const relL = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(7000);

const out = await page.evaluate(async () => {
  const lin = (ch) => { const s = ch / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relL = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const v = document.querySelector('video'); v.pause();

  // cover-fit math: video 1280x720 (16:9) into a 1440x~900 box, object-fit cover
  const boxAspect = innerWidth / v.clientHeight;
  const vAspect = v.videoWidth / v.videoHeight;
  let sw, sh, sx, sy;
  if (vAspect > boxAspect) { sh = 1; sw = boxAspect / vAspect; sx = (1 - sw) / 2; sy = 0; }
  else { sw = 1; sh = vAspect / boxAspect; sx = 0; sy = (1 - sh) / 2; }

  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const seek = (t) => new Promise((r) => { const d = () => { v.removeEventListener('seeked', d); r(); };
    v.addEventListener('seeked', d); v.currentTime = t; setTimeout(d, 2000); });

  // glyph rects in CSS px, captured live
  const box = (sel) => { const el = document.querySelector(sel); const r = document.createRange();
    r.selectNodeContents(el); const l = [...r.getClientRects()].filter((b) => b.width > 1 && b.height > 1);
    return { x: Math.min(...l.map((b) => b.left)), y: Math.min(...l.map((b) => b.top)),
             x2: Math.max(...l.map((b) => b.right)), y2: Math.max(...l.map((b) => b.bottom)) }; };
  const zones = { h1: box('.hero__h1'), sub: box('.hero__sub'), ctas: box('.hero__ctas') };

  const res = [];
  for (let t = 0; t <= 71; t += 3.5) {
    await seek(t); ctx.drawImage(v, 0, 0);
    const row = { t: +t.toFixed(1) };
    for (const [k, z] of Object.entries(zones)) {
      // map the CSS rect back into video pixels through the cover transform
      const X = Math.floor((z.x / innerWidth * sw + sx) * c.width);
      const Y = Math.floor((z.y / v.clientHeight * sh + sy) * c.height);
      const W = Math.max(1, Math.floor((z.x2 - z.x) / innerWidth * sw * c.width));
      const H = Math.max(1, Math.floor((z.y2 - z.y) / v.clientHeight * sh * c.height));
      const px = ctx.getImageData(X, Y, Math.min(W, c.width - X), Math.min(H, c.height - Y)).data;
      const L = [];
      for (let i = 0; i < px.length; i += 4) L.push(relL(px[i], px[i + 1], px[i + 2]));
      L.sort((a, b) => a - b);
      const q = (p) => +L[Math.floor((L.length - 1) * p)].toFixed(4);
      row[k] = { p01: q(0.01), p05: q(0.05), p50: q(0.5), p95: q(0.95), p99: q(0.99) };
    }
    res.push(row);
  }
  return res;
});

const INK = relL(0x1e, 0x11, 0x15);
const BODY = relL(0x4a, 0x3d, 0x40);
const WHITE = 1.0;

console.log('RAW VIDEO (no scrim) luminance percentiles in each glyph zone\n');
console.log('  t    |  h1 p01   p05   p50   p95   p99  |  sub p05   p95  | cta p05   p95');
for (const r of out) {
  console.log(`  ${String(r.t).padStart(4)} | ${r.h1.p01.toFixed(3)} ${r.h1.p05.toFixed(3)} ${r.h1.p50.toFixed(3)} ${r.h1.p95.toFixed(3)} ${r.h1.p99.toFixed(3)} | ${r.sub.p05.toFixed(3)} ${r.sub.p95.toFixed(3)} | ${r.ctas.p05.toFixed(3)} ${r.ctas.p95.toFixed(3)}`);
}

const stat = (zone, key) => ({
  min: Math.min(...out.map((r) => r[zone][key])),
  max: Math.max(...out.map((r) => r[zone][key])),
});

console.log('\n=== WORST CASE, RAW VIDEO, NO SCRIM AT ALL ===\n');
for (const zone of ['h1', 'sub', 'ctas']) {
  const lo = stat(zone, 'p05'), hi = stat(zone, 'p95');
  console.log(`  ${zone.toUpperCase()}`);
  console.log(`    raw p05 spans ${lo.min.toFixed(3)} .. ${lo.max.toFixed(3)}`);
  console.log(`    raw p95 spans ${hi.min.toFixed(3)} .. ${hi.max.toFixed(3)}`);
  console.log(`    --ink   (#1E1115) vs DARKEST raw (p05 worst): ${ratio(INK, lo.min).toFixed(2)}:1`);
  console.log(`    --ink   (#1E1115) vs p95 typical           : ${ratio(INK, hi.max).toFixed(2)}:1`);
  console.log(`    white         vs BRIGHTEST raw (p95 worst): ${ratio(WHITE, hi.max).toFixed(2)}:1`);
  console.log(`    white         vs p05 typical                : ${ratio(WHITE, lo.max).toFixed(2)}:1`);
  console.log('');
}
await browser.close();