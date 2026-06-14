import { chromium } from 'playwright';

const SS = (n) => `C:/Users/Dell/AppData/Local/Temp/reviews-${n}.png`;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Go to a product page
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');

  // Click first product
  await page.locator('a[href^="/product/"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Screenshot 1: Product page with empty reviews section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
  await page.waitForTimeout(800);
  await page.screenshot({ path: SS('1-empty-reviews') });
  console.log('SS1: Empty reviews section');

  // Fill the review form
  await page.fill('input[placeholder="Enter your name"]', 'Swetalin');
  await page.waitForTimeout(300);

  // Click 4 stars
  const stars = page.locator('[aria-label="Rate 4 out of 5"]');
  await stars.click();
  await page.waitForTimeout(300);

  // Fill comment
  await page.fill('textarea', 'Really happy with this product! Great quality and fast delivery. Would definitely recommend to others.');
  await page.waitForTimeout(300);

  // Screenshot 2: Form filled
  await page.screenshot({ path: SS('2-form-filled') });
  console.log('SS2: Form filled');

  // Submit
  await page.click('button:has-text("Submit Review")');
  await page.waitForTimeout(2500);

  // Screenshot 3: Review submitted, toast shown
  await page.screenshot({ path: SS('3-after-submit') });
  console.log('SS3: After submit');

  // Add another review
  await page.fill('input[placeholder="Enter your name"]', 'Rahul');
  await page.locator('[aria-label="Rate 5 out of 5"]').click();
  await page.fill('textarea', 'Excellent product, exceeded my expectations. The build quality is top notch.');
  await page.click('button:has-text("Submit Review")');
  await page.waitForTimeout(2500);

  // Screenshot 4: Two reviews showing
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
  await page.waitForTimeout(800);
  await page.screenshot({ path: SS('4-reviews-list') });
  console.log('SS4: Reviews list with two reviews');

  // Scroll up to show rating badge near title
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: SS('5-rating-badge') });
  console.log('SS5: Rating badge on product title');

  await page.waitForTimeout(2000);
  await browser.close();
})();
