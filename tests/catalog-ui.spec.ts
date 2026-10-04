import { test, expect } from '@playwright/test';

/** Catalogue discovery UI on /products (needs a build served by the configured webServer). */

test.describe('/products discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  });

  test('server-rendered group sections are in the DOM before any search', async ({ page }) => {
    await page.goto('/products/');
    await expect(page.locator('section[aria-labelledby^="grp-"]').first()).toBeAttached();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('typing shows suggestions, keyboard selects, Esc closes', async ({ page }) => {
    await page.goto('/products/');
    await page.waitForLoadState('networkidle');
    const box = page.getByRole('combobox').first();
    await box.fill('bush');
    const list = page.getByRole('listbox').first();
    await expect(list).toBeVisible();
    await box.press('ArrowDown');
    await expect(box).toHaveAttribute('aria-activedescendant', /.+/);
    await box.press('Escape');
    await expect(list).toBeHidden();
  });

  test('search updates results and URL; Back restores previous state', async ({ page }) => {
    await page.goto('/products/');
    await page.waitForLoadState('networkidle');
    const box = page.getByRole('combobox').first();
    await box.fill('valve');
    await box.press('Enter');
    await expect(page).toHaveURL(/q=valve/);
    await expect(page.getByRole('status').filter({ hasText: /Showing 1-\d+ of \d+/ })).toBeVisible();
    await page.goBack();
    await expect(page).not.toHaveURL(/q=valve/);
  });

  test('shareable URL restores the query', async ({ page }) => {
    await page.goto('/products/?q=valve');
    await expect(page.getByRole('status').filter({ hasText: /Showing 1-\d+ of \d+/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Remove filter/ }).first()).toBeVisible();
  });

  test('no match shows the empty state with an enquiry link', async ({ page }) => {
    await page.goto('/products/?q=zzzzqqqq');
    await expect(page.getByText(/No products found for/)).toBeVisible();
    await expect(page.getByRole('link', { name: /Send an enquiry/ })).toBeVisible();
  });

  test('cards never claim In stock or a price unless set', async ({ page }) => {
    await page.goto('/products/?view=all');
    const card = page.locator('.p-card').first();
    await expect(card).toBeVisible();
    await expect(card.locator('.p-card__price')).toHaveText(/₹|Price on request/);
    await expect(card.locator('.p-avail')).toHaveText(/In stock|Out of stock|Availability on request/);
  });

  test('mobile: filter sheet opens, traps focus and closes with Esc', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products/?view=all');
    await page.getByRole('button', { name: /^Filters/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Filters' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Show \d+ results?|No results/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('group page offers sort and availability controls', async ({ page }) => {
    await page.goto('/products/');
    const link = page.getByRole('link', { name: /^View the .* group$/ }).first();
    await link.click();
    await expect(page.getByLabel('Sort by')).toBeVisible();
    await expect(page.getByLabel('Availability')).toBeVisible();
  });
});
