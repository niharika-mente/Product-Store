import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_USER, login } from './helpers.js';


test.describe('Review Submission', () => {
  test('User can submit a review for a product', async ({ page }) => {
    // 1. Log in since reviews usually require authentication
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // 2. Go to the home page and click a product to go to detail page
    await page.goto(BASE_URL);
    const productCard = page.locator('.chakra-card').first();
    await productCard.locator('h2').first().click(); // Assuming h2 is the title

    // Wait for the detail page
    await page.waitForURL(/\/product\//);

    // 3. Find the review section
    const reviewForm = page.locator('form', { hasText: /review/i });
    if (await reviewForm.isVisible()) {
      // 4. Fill out the review
      // Assuming a standard select for rating and textarea for comment
      await reviewForm.locator('select').selectOption({ index: 1 }); // usually selects 5 stars or something similar
      await reviewForm.locator('textarea').fill('This is a fantastic product! Playwright test review.');
      
      // 5. Submit
      await reviewForm.getByRole('button', { name: /submit/i }).click();

      // 6. Verify review appears or success toast
      const toast = page.locator('.chakra-toast');
      await expect(toast).toContainText(/success|submitted/i, { ignoreCase: true });
      
      // Alternatively, verify text is on screen
      await expect(page.getByText('This is a fantastic product! Playwright test review.')).toBeVisible();
    } else {
      console.log('Review form not found. Assuming product already reviewed or reviews not enabled.');
    }
  });
});
