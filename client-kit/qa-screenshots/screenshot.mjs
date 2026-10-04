import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();

// Large viewport to see the schematic clearly
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/enquiry/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

// Crop just the left art panel
const artEl = await page.$('.ph__art');
if (artEl) {
  await artEl.screenshot({ path: './enquiry-art-crop.png' });
}

// Full page screenshot
await page.screenshot({ path: './enquiry-full.png', fullPage: true });

await browser.close();
console.log('done');
