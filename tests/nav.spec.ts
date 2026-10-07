import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

async function open(page: import('@playwright/test').Page, path = '/about/') {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test('Products in the navbar is a link to /products/ and the chevron is the disclosure control', async ({ page }) => {
  await open(page);
  const nav = page.getByRole('navigation', { name: 'Main navigation' }).first();
  const link = nav.getByRole('link', { name: 'Products', exact: true });
  await expect(link).toHaveAttribute('href', '/products/');
  const chevron = nav.getByRole('button', { name: 'Products menu' });
  await expect(chevron).toHaveAttribute('aria-haspopup', 'true');
  await expect(chevron).toHaveAttribute('aria-expanded', 'false');
  await chevron.click();
  await expect(chevron).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(chevron).toHaveAttribute('aria-expanded', 'false');
});

test('clicking Products navigates to /products/', async ({ page }) => {
  await open(page);
  await page.getByRole('navigation', { name: 'Main navigation' }).first().getByRole('link', { name: 'Products', exact: true }).click();
  await page.waitForURL('**/products/');
});

test('mega menu shows all five categories in a single row', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Products menu' }).click();
  const cols = page.locator('.mega__col');
  await expect(cols).toHaveCount(5);
  const tops = await cols.evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  const box = await page.locator('.mega').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
});
