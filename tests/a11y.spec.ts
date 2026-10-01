import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/about/', '/products/', '/products/water-control/', '/products/water-control/float-valve/', '/industries/', '/career/', '/contact/', '/enquiry/', '/privacy/'];

for (const r of routes) {
  test(`axe: ${r}`, async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
    await page.goto(r);
    await page.waitForLoadState('networkidle');
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const bad = res.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
