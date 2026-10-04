import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const vp of [[1920,1080],[1440,900],[1280,800],[834,1112],[390,844]]) {
  const p = await b.newPage({ viewport: { width: vp[0], height: vp[1] } });
  await p.goto('http://localhost:3000/', { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const ink = (sel) => {
      const el = document.querySelector(sel); if (!el) return null;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const rects = []; let n;
      while ((n = w.nextNode())) {
        if (!n.textContent.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const b of rg.getClientRects()) if (b.width > 0.5 && b.height > 0.5) rects.push(b);
      }
      if (!rects.length) return null;
      const x = Math.min(...rects.map(b=>b.left)), x2 = Math.max(...rects.map(b=>b.right));
      const y = Math.min(...rects.map(b=>b.top)), y2 = Math.max(...rects.map(b=>b.bottom));
      return { x0:+(x/innerWidth).toFixed(3), x1:+(x2/innerWidth).toFixed(3), y0:+(y/innerHeight).toFixed(3), y1:+(y2/innerHeight).toFixed(3), lines: rects.length };
    };
    return { h1: ink('.hero__h1'), sub: ink('.hero__sub'), ctas: ink('.hero__ctas'), eyebrow: ink('.hero__eyebrow-text'), tagline: ink('.hero__tagline') };
  });
  console.log(vp.join('x').padEnd(10), JSON.stringify(r));
  await p.close();
}
await b.close();