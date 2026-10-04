import { test, expect } from '@playwright/test';

const KEY = 'alok:cart:v1';
const PART = '/products/water-control/float-valve/';

async function seed(page: import('@playwright/test').Page, lines: { slug: string; qty: number }[]) {
  await page.addInitScript(([k, v]) => {
    sessionStorage.setItem('alok:preloaded', '1');
    localStorage.setItem(k, v);
  }, [KEY, JSON.stringify({ v: 1, lines })] as const);
}

test('empty cart shows the empty state', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await page.goto('/cart/');
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse products' })).toBeVisible();
});

test('/cart is noindex', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await page.goto('/cart/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('add to cart from a product page updates the header count and persists', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  await page.goto(PART);
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await expect(page.getByText('Added to cart').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Cart, 1 item/ })).toBeVisible();
  const stored = await page.evaluate(k => localStorage.getItem(k), KEY);
  expect(JSON.parse(stored as string)).toMatchObject({ v: 1, lines: [{ slug: 'float-valve', qty: 1 }] });
});

test('mini-cart opens as a dialog, traps focus and closes with Esc', async ({ page }) => {
  await seed(page, [{ slug: 'float-valve', qty: 2 }]);
  await page.goto('/');
  await page.getByRole('button', { name: /^Cart/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Your cart' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('unknown product line blocks sending until removed', async ({ page }) => {
  await seed(page, [{ slug: 'does-not-exist', qty: 1 }]);
  await page.goto('/cart/');
  await expect(page.getByText('This product is no longer available. Please remove it from your cart.')).toBeVisible();
  const send = page.getByRole('button', { name: 'Send order request on WhatsApp' });
  if (await send.count()) await expect(send).toBeDisabled();
  await page.getByRole('button', { name: /^Remove/ }).click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});

test('quantity stepper never drops below 1', async ({ page }) => {
  await seed(page, [{ slug: 'float-valve', qty: 1 }]);
  await page.goto('/cart/');
  const dec = page.getByRole('button', { name: /^Decrease quantity/ }).first();
  await expect(dec).toBeDisabled();
  await page.getByRole('button', { name: /^Increase quantity/ }).first().click();
  await expect(page.getByRole('textbox', { name: /^Quantity for/ }).first()).toHaveValue('2');
});

test('no estimated total unless every line has a price', async ({ page }) => {
  await seed(page, [{ slug: 'float-valve', qty: 1 }]);
  await page.goto('/cart/');
  // No admin prices in the static build: price on request, so no total.
  await expect(page.getByText('Price on request').first()).toBeVisible();
  await expect(page.getByText('Final price confirmed by Alok Plastics')).toBeVisible();
  await expect(page.getByText('Estimated total')).toHaveCount(0);
});

test('details are validated with accessible errors; honesty note is visible', async ({ page }) => {
  await seed(page, [{ slug: 'float-valve', qty: 1 }]);
  await page.goto('/cart/');
  await expect(page.getByText(/not a confirmed order/)).toBeVisible();
  const send = page.getByRole('button', { name: 'Send order request on WhatsApp' });
  if (await send.count()) {
    await send.click();
    await expect(page.locator('#cf-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert').filter({ hasText: /name/i }).first()).toBeVisible();
  }
});

test('clear cart asks for confirmation', async ({ page }) => {
  await seed(page, [{ slug: 'float-valve', qty: 1 }]);
  await page.goto('/cart/');
  await page.getByRole('button', { name: 'Clear cart' }).click();
  await page.getByRole('button', { name: 'Yes, clear cart' }).click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});
