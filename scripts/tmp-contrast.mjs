import { chromium } from '@playwright/test';
import sharp from 'sharp';

const lin = (ch) => { const s = ch / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const relL = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
/** composite a possibly-translucent text colour over a backdrop pixel, return its relative luminance */
const over = (fr, fg, fb, alpha) => relL(fr * (1 - alpha) + fr * 0 + (fr * 0) + (fr * (1 - alpha) + 0 * alpha), 0, 0); // unused

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(7000);

/* hide foreground so the screenshot is the pure composited backdrop */
await page.addStyleTag({ content: `
  .hero__content, .hero__cue, .glass-nav, .whatsapp-fab, .announcement, #preloader-overlay { visibility: hidden !important; }
`});
await page.waitForTimeout(400);

const boxes = await page.evaluate(() => {
  const pick = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, width: Math.max(2, r.width), height: Math.max(2, r.height) }; };
  return {
    eyebrow: pick('.hero__eyebrow-text'),
    h1: pick('.hero__h1'),
    sub: pick('.hero__sub'),
    tagline: pick('.hero__tagline'),
    ctas: pick('.hero__ctas'),
    right: pick('.hero__h1'),
  };
});

const analyse = async (buf, box) => {
  const img = sharp(buf);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const lums = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      lums.push(relL(data[i], data[i + 1], data[i + 2]));
    }
  }
  lums.sort((a, b) => a - b);
  const q = (p) => lums[Math.floor((lums.length - 1) * p)];
  return { p01: q(0.01), p50: q(0.5), p99: q(0.99), max: lums[lums.length - 1] };
};

const WHITE = relL(255, 255, 255);
const WHITE_85 = relL(255 * 0.85 + 0, 255 * 0.85, 255 * 0.85); // approx of rgba(255,255,255,.85) over itself
const WHITE_65 = relL(255 * 0.65, 255 * 0.65, 255 * 0.65);
const ROSE_PALE = relL(0xe3, 0xb5, 0xb8);
const INK = relL(0x1e, 0x11, 0x15);
const BODY = relL(0x4a, 0x3d, 0x40);

const rows = [];
for (const t of [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]) {
  await page.evaluate(async (time) => {
    const v = document.querySelector('video'); v.pause();
    await new Promise((r) => { const d = () => { v.removeEventListener('seeked', d); r(); };
      v.addEventListener('seeked', d); v.currentTime = time; setTimeout(d, 2000); });
  }, t);

  const sub = await analyse(await page.screenshot({ clip: boxes.sub }), boxes.sub);
  const h1 = await analyse(await page.screenshot({ clip: boxes.h1 }), boxes.h1);
  const cta = await analyse(await page.screenshot({ clip: boxes.ctas }), boxes.ctas);

  rows.push({
    t,
    h1: h1,
    sub: sub,
    cta: cta,
    subWorst: +ratio(WHITE_85, sub.p99).toFixed(2),
    subMed: +ratio(WHITE_85, sub.p50).toFixed(2),
    h1Worst: +ratio(WHITE, h1.p99).toFixed(2),
    h1Med: +ratio(WHITE, h1.p50).toFixed(2),
    eyebrowWorst: +ratio(WHITE_65, sub.p99).toFixed(2),
    ctaWorst: +ratio(WHITE, cta.p99).toFixed(2),
    ctaMed: +ratio(WHITE, cta.p50).toFixed(2),
  });
}

console.log('BACKDROP LUMINANCE (relative, 0..1) — text column\n');
console.log('  t   h1 p01  h1 p99 | sub p99 | CTA p99 | h1 white  sub@85%  eyebrow@65%  CTA white');
let minH1 = 99, minSub = 99, minEy = 99, minCta = 99;
for (const r of rows) {
  minH1 = Math.min(minH1, r.h1Worst); minSub = Math.min(minSub, r.subWorst);
  minEy = Math.min(minEy, r.eyebrowWorst); minCta = Math.min(minCta, r.ctaWorst);
  console.log(
    String(r.t).padStart(4),
    r.h1.p01.toFixed(3).padStart(7), r.h1.p99.toFixed(3).padStart(7), '|',
    r.sub.p99.toFixed(3).padStart(7), '|', r.cta.p99.toFixed(3).padStart(7), '|',
    String(r.h1Worst).padStart(8), String(r.subWorst).padStart(8),
    String(r.eyebrowWorst).padStart(10), String(r.ctaWorst).padStart(10),
  );
}
console.log('\nWORST CASE OVER THE 72s LOOP');
console.log('  H1 (white, large) :', minH1.toFixed(2) + ':1');
console.log('  sub @85% white    :', minSub.toFixed(2) + ':1');
console.log('  eyebrow @65%      :', minEy.toFixed(2) + ':1');
console.log('  CTA label (white) :', minCta.toFixed(2) + ':1');
console.log('\n  (pre-change --ink on same backdrops would be:',
  ratio(INK, rows[0].h1.p99).toFixed(2), ':1 at best)');

await browser.close();