import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/about/', '/products/', '/products/water-control/', '/products/water-control/float-valve/', '/industries/', '/career/', '/contact/', '/enquiry/', '/privacy/'];

for (const r of routes) {
  test(`axe: ${r}`, async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
    await page.goto(r);
    await page.waitForLoadState('networkidle');
    // let entrance fades finish: axe otherwise measures text mid-fade (e.g. filter chips at 2:1)
    await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity));
    await page.waitForTimeout(1200); // GSAP tweens are not Web Animations
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const bad = res.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
