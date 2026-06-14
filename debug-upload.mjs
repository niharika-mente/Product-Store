import { chromium } from 'playwright';

const imgPath = 'C:/Users/Dell/AppData/Local/Temp/upload-test.jpg';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('response', async (res) => {
  if (res.url().includes('/api/products') && res.request().method() === 'POST') {
    const status = res.status();
    const text = await res.text().catch(() => 'unreadable');
    console.log('Status:', status);
    console.log('Body:', text);
  }
});

await page.goto('http://localhost:5174/create');
await page.waitForLoadState('networkidle');
await page.fill('input[placeholder="Product Name"]', 'Debug Product');
await page.fill('input[type="number"]', '50');
await page.locator('input[type="file"]').setInputFiles(imgPath);
await page.waitForTimeout(1500);
await page.click('button:has-text("Add Product")');
await page.waitForTimeout(5000);
await browser.close();
