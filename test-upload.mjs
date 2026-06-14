import { chromium } from 'playwright';
import fs from 'fs';
import https from 'https';

const imgPath = 'C:\\Users\\Dell\\AppData\\Local\\Temp\\upload-test.jpg';

const downloadImage = () => new Promise((resolve, reject) => {
  if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 0) return resolve();
  const file = fs.createWriteStream(imgPath);
  https.get('https://picsum.photos/seed/ssoc/400/400', (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      https.get(res.headers.location, (res2) => { res2.pipe(file); file.on('finish', () => { file.close(); resolve(); }); });
    } else {
      res.pipe(file); file.on('finish', () => { file.close(); resolve(); });
    }
  }).on('error', reject);
});

(async () => {
  await downloadImage();

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('response', async (res) => {
    if (res.url().includes('/api/products') && res.request().method() === 'POST') {
      const body = await res.json().catch(() => ({}));
      console.log('API Response:', JSON.stringify(body));
    }
  });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:\\Users\\Dell\\AppData\\Local\\Temp\\ss1-home.png' });
  console.log('Step 1: Homepage loaded');

  await page.click('a[href="/create"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.fill('input[placeholder="Product Name"]', 'Wireless Earbuds Pro');
  await page.fill('input[type="number"]', '79');
  await page.waitForTimeout(500);

  const fileInput = await page.waitForSelector('input[type="file"]');
  await fileInput.setInputFiles(imgPath);

  await page.waitForSelector('img[alt="Product preview"]', { timeout: 5000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:\\Users\\Dell\\AppData\\Local\\Temp\\ss3-preview.png' });
  console.log('Step 3: Image preview showing');

  await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'POST', { timeout: 15000 }),
    page.click('button:has-text("Add Product")')
  ]);

  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'C:\\Users\\Dell\\AppData\\Local\\Temp\\ss4-submitted.png' });
  console.log('Step 4: After submit');

  await page.click('a[href="/"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:\\Users\\Dell\\AppData\\Local\\Temp\\ss5-result.png' });
  console.log('Step 5: Homepage with new product');

  await page.waitForTimeout(3000);
  await browser.close();
})();
