import { chromium } from '@playwright/test';
import fs from 'node:fs';

const OUT = 'C:/Users/HARSHI~1/AppData/Local/Temp/opencode/hero2';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(6000);

const rows = await page.evaluate(async () => {
  const v = document.querySelector('video');
  v.pause();

  // WCAG relative luminance from an sRGB triple
  const lin = (ch) => { const s = ch / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relL = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  const INK = [0x1e, 0x11, 0x15];       // --ink  (current hero text)
  const WHITE = [0xff, 0xff, 0xff];    // white  (onMedia text)
  const BODY = [0x4a, 0x3d, 0x40];     // --body (current hero sub)
  const SCRIM_RGB = [0x1e, 0x11, 0x15];// rgba(30,17,21,...) hard-coded in Scrim

  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });

  const seek = (time) => new Promise((r) => {
    const done = () => { v.removeEventListener('seeked', done); r(); };
    v.addEventListener('seeked', done); v.currentTime = time; setTimeout(done, 2000);
  });

  /* sample a rect of the frame and return the distribution of linear relative luminance */
  const sample = (x0, y0, x1, y1) => {
    const X = Math.floor(x0 * c.width), Y = Math.floor(y0 * c.height);
    const W = Math.max(1, Math.floor((x1 - x0) * c.width)), H = Math.max(1, Math.floor((y1 - y0) * c.height));
    const px = ctx.getImageData(X, Y, W, H).data;
    const out = [];
    for (let i = 0; i < px.length; i += 4) out.push(relL(px[i], px[i + 1], px[i + 2]));
    out.sort((a, b) => a - b);
    const q = (p) => out[Math.floor((out.length - 1) * p)];
    return { p05: q(0.05), p25: q(0.25), p50: q(0.5), p75: q(0.75), p95: q(0.95), max: out[out.length - 1] };
  };

  /* composite the existing Scrim over the frame the way the browser would:
     layer1 = radial-gradient(120% 90% at 0% 100%, rgba(30,17,21,.55) 0%, .25 45%, transparent 75%)
     layer2 = --burgundy #581C25 at .10 with mix-blend-mode: overlay                        */
  const scrimAlpha = (nx, ny) => {
    // radial centred at 0% 100%, rx = 120% of width, ry = 90% of height
    const dx = nx / 1.20, dy = ny / 0.90;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d <= 0) return 0.55;
    if (d < 0.45) return 0.55 + (0.25 - 0.55) * (d / 0.45);
    if (d < 0.75) return 0.25 * (1 - (d - 0.45) / 0.30);
    return 0;
  };
  const overlay = (base, top, a) => { // blend-mode: overlay approximation on 0..1 linear values
    return base <= 0.5 ? 2 * base * a : 1 - 2 * (1 - base) * (1 - a);
  };
  const sLin = relL(SCRIM_RGB[0], SCRIM_RGB[1], SCRIM_RGB[2]);
  const bLin = relL(0x58, 0x1c, 0x25); // --burgundy

  const zoneLum = (x0, y0, x1, y1) => {
    const X = Math.floor(x0 * c.width), Y = Math.floor(y0 * c.height);
    const W = Math.max(1, Math.floor((x1 - x0) * c.width)), H = Math.max(1, Math.floor((y1 - y0) * c.height));
    const px = ctx.getImageData(X, Y, W, H).data;
    const out = [];
    for (let i = 0, n = 0; i < px.length; i += 4, n++) {
      const nx = (X + (n % W)) / c.width, ny = (Y + Math.floor(n / W)) / c.height;
      let L = relL(px[i], px[i + 1], px[i + 2]);
      const a = scrimAlpha(nx, ny);
      if (a > 0) L = L * (1 - a) + sLin * a;
      const bl = overlay(L, bLin, 0.10);
      out.push(bl);
    }
    out.sort((p, q2) => p - q2);
    const q = (p) => out[Math.floor((out.length - 1) * p)];
    return { p05: q(0.05), p50: q(0.5), p95: q(0.95), max: out[out.length - 1] };
  };

  const res = [];
  for (let t = 0; t <= 71; t += 3.5) {
    await seek(t);
    ctx.drawImage(v, 0, 0);
    // TEXT COLUMN = the left-aligned content block. Video is object-fit:cover into 1440x~900 (16:9 -> 1440x810 letterboxed by overflow hidden, but hero is 100svh so cover crops). Approximate the visible crop.
    const txt = zoneLum(0.04, 0.30, 0.46, 0.78);
    const raw = sample(0.04, 0.30, 0.46, 0.78);
    res.push({
      t: +t.toFixed(1),
      rawP50: +raw.p50.toFixed(3), rawP95: +raw.p95.toFixed(3), rawMax: +raw.max.toFixed(3),
      scrimP05: +txt.p05.toFixed(3), scrimP50: +txt.p50.toFixed(3), scrimP95: +txt.p95.toFixed(3),
      inkVsWorst: +ratio(relL(...INK), txt.p95).toFixed(2),   // dark ink vs BRIGHTEST backdrop pixel
      inkVsMed: +ratio(relL(...INK), txt.p50).toFixed(2),
      whiteVsWorst: +ratio(1.0, txt.p05).toFixed(2),           // white vs DARKEST backdrop pixel
      whiteVsMed: +ratio(1.0, txt.p50).toFixed(2),
      bodyVsMed: +ratio(relL(...BODY), txt.p50).toFixed(2),
      white85VsWorst: +ratio(0.85 * 0.85 + 0.15 * 1.0, txt.p05).toFixed(2),
    });
  }
  return res;
});

fs.writeFileSync(`${OUT}/lum.json`, JSON.stringify(rows, null, 1));
console.log('t     rawP50 rawP95 | scrP05 scrP50 scrP95 | inkWorst inkMed | whtWorst whtMed');
for (const r of rows) {
  console.log(
    String(r.t).padEnd(5),
    String(r.rawP50).padEnd(6), String(r.rawP95).padEnd(6), '|',
    String(r.scrimP05).padEnd(5), String(r.scrimP50).padEnd(6), String(r.scrimP95).padEnd(6), '|',
    String(r.inkVsWorst).padEnd(8), String(r.inkVsMed).padEnd(7), '|',
    String(r.whiteVsWorst).padEnd(8), String(r.whiteVsMed),
  );
}
await browser.close();