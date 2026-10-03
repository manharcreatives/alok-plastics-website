import { test, expect, type Page } from '@playwright/test';
import { getGroup, publishedProducts } from '../src/content/products';

const json = (body: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

async function stub(page: Page, files: Partial<Record<'settings' | 'careers' | 'product-overrides' | 'products' | 'products', unknown>>) {
  await page.addInitScript(() => sessionStorage.setItem('alok:preloaded', '1'));
  for (const name of ['settings', 'careers', 'product-overrides', 'products'] as const) {
    await page.route(`**/data/${name}.json`, r => (name in files ? r.fulfill(json(files[name])) : r.fulfill({ status: 404, body: '' })));
  }
}

test('runtime phone and email appear on /contact/', async ({ page }) => {
  await stub(page, { settings: { schemaVersion: 1, contact: { phone: '+91 98765 43210', email: 'panel@example.com' } } });
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: '+91 98765 43210' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'panel@example.com' }).first()).toBeVisible();
});

for (const [label, files] of [
  ['404', {}],
  ['invalid', { settings: 'not an object', careers: 42, 'product-overrides': [] }],
  ['null values', { settings: { schemaVersion: 1, contact: { phone: null, email: '' } } }],
] as const) {
  test(`build-time content stays when runtime files are ${label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await stub(page, files);
    await page.goto('/contact/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('address.ct-addr__t')).toContainText('Alok Plastics');
    expect(errors).toEqual([]);
  });
}

test('active role shows with description; inactive role is hidden', async ({ page }) => {
  await stub(page, {
    careers: {
      schemaVersion: 1,
      roles: [
        { id: 'a', title: 'Mould Designer', team: 'product', type: 'full-time', location: 'Chandigarh', description: 'Design tooling.', active: true },
        { id: 'b', title: 'Paused Role', team: 'sales', type: 'full-time', location: 'Delhi', description: '', active: false },
      ],
    },
  });
  await page.goto('/career/');
  await expect(page.getByText('Mould Designer')).toBeVisible();
  await expect(page.getByText('Design tooling.')).toBeVisible();
  await expect(page.getByText('Paused Role')).toHaveCount(0);
});

test('hidden product disappears from the list but its page stays reachable', async ({ page }) => {
  const p = publishedProducts.find(x => x.group);
  test.skip(!p, 'no published product');
  await stub(page, { 'product-overrides': { schemaVersion: 1, hidden: [p!.slug] } });
  await page.goto('/products/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator(`a[href*="/${p!.slug}"]`)).toHaveCount(0);
  const res = await page.goto(`/products/${getGroup(p!.group!)!.slug}/${p!.slug}/`);
  expect(res?.status()).toBeLessThan(400);
});

/* ── products.json ─────────────────────────────────────────────────────── */

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

function target() {
  const p = publishedProducts.find(x => x.group && x.summary);
  if (!p) throw new Error('no published product with a summary');
  return { p, url: `/products/${getGroup(p.group!)!.slug}/${p.slug}/` };
}

test('product overrides replace name, summary, description, SEO tags and image', async ({ page }) => {
  const { p, url } = target();
  await page.route('**/api/media.php**', r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  await stub(page, {
    products: {
      schemaVersion: 1,
      products: {
        [p.slug]: {
          name: 'Edited Part Name',
          summary: 'Edited summary text.',
          description: 'Edited long description.',
          seoTitle: 'Edited SEO Title',
          seoDescription: 'Edited SEO description.',
          images: [{ id: 'abc_1', url: '/api/media.php?id=abc_1', alt: 'Edited alt' }],
        },
      },
    },
  });
  await page.goto(url);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edited Part Name');
  await expect(page.getByText('Edited summary text.')).toBeVisible();
  await expect(page.getByText('Edited long description.')).toBeVisible();
  await expect(page).toHaveTitle('Edited SEO Title');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Edited SEO description.');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Edited SEO Title');
  await expect(page.locator('img[alt="Edited alt"]').first()).toHaveAttribute('src', '/api/media.php?id=abc_1');
  const ld = await page.locator('script[type="application/ld+json"]').evaluateAll(els =>
    els.map(e => JSON.parse(e.textContent ?? '')).find(d => d['@type'] === 'Product'));
  expect(ld.name).toBe('Edited Part Name');
  expect(ld.description).toBe('Edited SEO description.');
});

test('edited name shows on the products grid', async ({ page }) => {
  const { p } = target();
  await stub(page, { products: { schemaVersion: 1, products: { [p.slug]: { name: 'Grid Edited Name' } } } });
  await page.goto('/products/');
  await expect(page.getByText('Grid Edited Name').first()).toBeAttached();
});

for (const [label, files] of [
  ['404', {}],
  ['invalid', { products: 'nope' }],
  ['empty', { products: { schemaVersion: 1, products: {} } }],
  ['blank values', { products: { schemaVersion: 1, products: { x: {} } } }],
] as const) {
  test(`product page keeps build-time content when products.json is ${label}`, async ({ page }) => {
    const { p, url } = target();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    const title = p.name;
    await stub(page, label === 'blank values'
      ? { products: { schemaVersion: 1, products: { [p.slug]: { name: '  ', summary: '', images: [] } } } }
      : files);
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByText(p.summary!).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('image with a bad url is rejected', async ({ page }) => {
  const { p, url } = target();
  await stub(page, {
    products: {
      schemaVersion: 1,
      products: {
        [p.slug]: {
          name: 'Still Edited',
          images: [
            { id: 'ok', url: 'https://evil.example/x.png', alt: 'evil-alt' },
            { id: 'ok2', url: '/api/media.php?id=ok2&x=1', alt: 'evil-alt' },
            { id: 'BAD ID', url: '/api/media.php?id=BAD ID', alt: 'evil-alt' },
          ],
        },
      },
    },
  });
  await page.goto(url);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Still Edited');
  await expect(page.locator('img[alt="evil-alt"]')).toHaveCount(0);
  await expect(page.locator('img[src*="evil.example"]')).toHaveCount(0);
});

test('inactive product leaves the product lists and the mega menu', async ({ page }) => {
  const p = publishedProducts.find(x => x.group);
  test.skip(!p, 'no published product');
  await stub(page, { products: { schemaVersion: 1, products: { [p!.slug]: { status: 'inactive' } } } });
  await page.goto('/products/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator(`ul.p-grid a[href*="/${p!.slug}"]`)).toHaveCount(0);
});
