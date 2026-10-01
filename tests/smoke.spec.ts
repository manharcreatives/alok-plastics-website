import { test, expect } from '@playwright/test';

const widths = [375, 768, 1440];

for (const w of widths) {
  test(`home has no horizontal overflow @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
}

test('no raw TODO / invented-claim strings on home', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await page.goto('/');
  const text = await page.locator('body').innerText();
  for (const bad of ['TODO', 'uninterrupted', 'Chandigarh, Chandigarh', '1,998']) {
    expect(text).not.toContain(bad);
  }
});

test('hero has Enquire + WhatsApp CTAs', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Enquire Now/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /WhatsApp Us/i }).first()).toBeVisible();
});
