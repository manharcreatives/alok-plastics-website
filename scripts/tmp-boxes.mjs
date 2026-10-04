import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const vp of [[1920,1080],[1440,900],[1280,800],[834,1112],[390,844]]) {
  const p = await b.newPage({ viewport: { width: vp[0], height: vp[1] } });
  await p.goto('http://localhost:3000/', { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const out = {};
    for (const [k, s] of [['eyebrow','.hero__eyebrow-text'],['h1','.hero__h1'],['sub','.hero__sub'],['tagline','.hero__tagline'],['ctas','.hero__ctas']]) {
      const e = document.querySelector(s); if (!e) continue;
      const rg = document.createRange(); rg.selectNodeContents(e);
      const l = [...rg.getClientRects()].filter(b => b.width > 1);
      const x = Math.min(...l.map(b=>b.left)), x2 = Math.max(...l.map(b=>b.right));
      out[k] = { x0: +(x/innerWidth).toFixed(3), x1: +(x2/innerWidth).toFixed(3), y0: +(Math.min(...l.map(b=>b.top))/innerHeight).toFixed(3), y1: +(Math.max(...l.map(b=>b.bottom))/innerHeight).toFixed(3) };
    }
    const v = document.querySelector('video');
    return { out, heroH: document.querySelector('.hero').clientHeight, vw: v.videoWidth, vh: v.videoHeight };
  });
  console.log(vp.join('x').padEnd(10), 'heroH=' + r.heroH, 'text x/y extents:', JSON.stringify(r.out));
  await p.close();
}
await b.close();