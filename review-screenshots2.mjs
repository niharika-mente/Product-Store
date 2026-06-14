import { chromium } from 'playwright';

const SS = (n) => `C:/Users/Dell/AppData/Local/Temp/reviews-${n}.png`;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Go to first product
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  const link = await page.locator('a[href^="/product/"]').first().getAttribute('href');
  await page.goto(`http://localhost:5173${link}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Screenshot 1: Rating badge near product title
  await page.screenshot({ path: SS('1-rating-badge'), fullPage: false });
  console.log('SS1: Rating badge');

  // Scroll to reviews section
  await page.evaluate(() => {
    const el = document.querySelector('h2');
    const reviewsH2 = [...document.querySelectorAll('h2')].find(h => h.textContent.includes('Customer Reviews'));
    if (reviewsH2) reviewsH2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(1000);

  // Screenshot 2: Full reviews section (list + form side by side)
  await page.screenshot({ path: SS('2-full-reviews-section'), fullPage: false });
  console.log('SS2: Reviews section with list and form');

  // Submit a new review from a different name
  await page.fill('input[placeholder="Enter your name"]', 'Priya');
  await page.locator('[aria-label="Rate 5 out of 5"]').click();
  await page.waitForTimeout(200);
  await page.fill('textarea', 'Outstanding product, exceeded every expectation. Highly recommend!');

  // Screenshot 3: Form filled
  await page.screenshot({ path: SS('3-form-filled'), fullPage: false });
  console.log('SS3: Form filled in');

  await page.click('button:has-text("Submit Review")');
  await page.waitForTimeout(2500);

  // Screenshot 4: After submit - success toast + new review in list
  await page.screenshot({ path: SS('4-after-submit'), fullPage: false });
  console.log('SS4: After submit with success toast');

  // Wait for toast to disappear, then show final list
  await page.waitForTimeout(2000);
  await page.screenshot({ path: SS('5-reviews-list'), fullPage: false });
  console.log('SS5: Final reviews list');

  await browser.close();
})();
