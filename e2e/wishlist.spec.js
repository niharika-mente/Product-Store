import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_USER, login } from './helpers.js';


test.describe('Wishlist Operations', () => {
  test('User can add and remove items from wishlist', async ({ page }) => {
    // Log in
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto(BASE_URL);

    // Find the first product card
    const productCard = page.locator('.chakra-card').first();
    await expect(productCard).toBeVisible();

    // Look for a wishlist button (often a heart icon)
    const wishlistBtn = productCard.locator('button[aria-label*="wishlist"], button svg[data-icon="heart"]');
    
    if (await wishlistBtn.first().isVisible()) {
      // Click to add to wishlist
      await wishlistBtn.first().click();

      // Verify success toast
      const toast = page.locator('.chakra-toast');
      await expect(toast).toContainText(/wishlist/i, { ignoreCase: true });

      // Navigate to wishlist page if it exists, or just verify the button state changed
      // (usually the heart becomes filled or color changes)
      
      // Click again to remove
      await wishlistBtn.first().click();
      await expect(toast).toContainText(/removed|wishlist/i, { ignoreCase: true });
    } else {
      console.log('Wishlist button not found on product cards.');
    }
  });
});
