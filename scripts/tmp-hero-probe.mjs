import { chromium } from '@playwright/test';
import fs from 'node:fs';

const OUT = 'C:/Users/HARSHI~1/AppData/Local/Temp/opencode/hero';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(6000);

// Sample the video at several timestamps and measure luminance of the TEXT ZONE (left half, middle band)
const samples = [0, 6, 12, 18, 24, 30, 40, 50, 60, 70];
const report = [];

for (const t of samples) {
  const stats = await page.evaluate(async (time) => {
    const v = document.querySelector('video');
    if (!v) return { err: 'no video' };
    v.pause();
    v.currentTime = time;
    await new Promise((r) => {
      const done = () => { v.removeEventListener('seeked', done); r(); };
      v.addEventListener('seeked', done);
      setTimeout(done, 2500);
    });
    // draw current frame to canvas and measure
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0);
    const region = (x0, y0, x1, y1, label) => {
      const px = ctx.getImageData(Math.floor(x0 * c.width), Math.floor(y0 * c.height),
        Math.max(1, Math.floor((x1 - x0) * c.width)), Math.max(1, Math.floor((y1 - y0) * c.height))).data;
      let sum = 0, min = 255, max = 0, n = 0, clipped = 0;
      for (let i = 0; i < px.length; i += 4) {
        const L = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
        sum += L; n++; if (L < min) min = L; if (L > max) max = L;
        if (L > 245) clipped++;
      }
      return { label, mean: +(sum / n).toFixed(1), min: +min.toFixed(0), max: +max.toFixed(0), hotPct: +((clipped / n) * 100).toFixed(1) };
    };
    return {
      dims: [v.videoWidth, v.videoHeight],
      textZone: region(0.02, 0.28, 0.52, 0.80, 'left-middle (text block)'),
      fullFrame: region(0, 0, 1, 1, 'full frame'),
      topRight: region(0.55, 0.02, 0.98, 0.35, 'top-right'),
    };
  }, t);

  report.push({ t, ...stats });
  await page.screenshot({ path: `${OUT}/hero-t${String(t).padStart(2, '0')}.png` });
}

console.log(JSON.stringify(report, null, 1));
await browser.close();