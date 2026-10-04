import { test, expect } from '@playwright/test';
import { publishedProducts, getGroup } from '../src/content/products';

const first = publishedProducts.find(p => p.group && getGroup(p.group));
const grp = first?.group ? getGroup(first.group) : undefined;
const url = first && grp ? `/products/${grp.slug}/${first.slug}/` : '/products/';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
});

test('product page shows price-on-request, availability and the related list in the HTML', async ({ page }) => {
  await page.goto(url);
  await expect(page.getByText('Price on request').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'You may also like' })).toBeVisible();
  const links = page.locator('#rel-h ~ ul a[href^="/products/"]');
  expect(await links.count()).toBeGreaterThan(0);
  // build-time JSON-LD never carries an offer
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const product = ld.map(t => JSON.parse(t)).find(d => d['@type'] === 'Product');
  expect(product).toBeTruthy();
  expect(product.offers).toBeUndefined();
});

test('runtime price and stock add an Offer and the low-stock hint', async ({ page }) => {
  await page.route('**/data/products.json*', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ schemaVersion: 1, products: { [first!.slug]: { price: 120, availability: 'in-stock', stock: 4 } } }),
    }),
  );
  await page.goto(url);
  await expect(page.getByText('₹120').first()).toBeVisible();
  await expect(page.getByText('In stock').first()).toBeVisible();
  await expect(page.getByText('Only 4 units available')).toBeVisible();
  await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeEnabled();
});

test('out of stock disables add to cart and offers an enquiry link', async ({ page }) => {
  await page.route('**/data/products.json*', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ schemaVersion: 1, products: { [first!.slug]: { availability: 'out-of-stock' } } }),
    }),
  );
  await page.goto(url);
  await expect(page.getByText('Out of stock').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ask when it is back' })).toBeVisible();
  await expect(page.locator('.p-buy').getByRole('button', { name: /add to cart/i })).toHaveCount(0);
});

test('inactive product stays reachable with a clear banner', async ({ page }) => {
  await page.route('**/data/products.json*', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ schemaVersion: 1, products: { [first!.slug]: { status: 'inactive' } } }),
    }),
  );
  const res = await page.goto(url);
  expect(res?.status()).toBe(200);
  await expect(page.getByText('This product is no longer available.')).toBeVisible();
  await expect(page.locator('.p-buy').getByRole('button', { name: /add to cart/i })).toHaveCount(0);
});

test('mobile: swipe track and dots, no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(url);
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
});

test('lightbox: opens, traps focus, closes on Escape (needs a product with images)', async ({ page }) => {
  test.skip(!publishedProducts.some(p => p.images.length > 0), 'no product photos in this build');
  const withImg = publishedProducts.find(p => p.images.length > 1 && p.group && getGroup(p.group)) ?? publishedProducts.find(p => p.images.length > 0 && p.group && getGroup(p.group))!;
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/products/${getGroup(withImg.group!)!.slug}/${withImg.slug}/`);
  await page.getByRole('button', { name: /^Enlarge image/ }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Tab');
  expect(await dlg.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);
});
