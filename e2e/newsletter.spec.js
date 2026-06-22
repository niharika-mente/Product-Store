import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers.js';

test.describe('Newsletter Subscription', () => {
  test('User can subscribe via footer email form', async ({ page }) => {
    await page.goto(BASE_URL);

    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    const emailInput = footer.locator('input[type="email"]');
    await emailInput.fill('newsletter@example.com');

    const subscribeBtn = footer.getByRole('button', { name: /subscribe/i });
    await subscribeBtn.click();

    // Verify success toast or message
    const toast = page.locator('.chakra-toast');
    await expect(toast).toContainText(/subscribed/i, { ignoreCase: true });
  });

  test('Empty email shows validation error', async ({ page }) => {
    await page.goto(BASE_URL);

    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    const subscribeBtn = footer.getByRole('button', { name: /subscribe/i });
    await subscribeBtn.click();

    // Check HTML5 validation or custom toast
    // If native HTML5, we can check for the validity pseudoclass
    const emailInput = footer.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate(el => el.validationMessage !== '');
    
    // Or if there's a toast
    const toast = page.locator('.chakra-toast');
    if (await toast.isVisible()) {
      await expect(toast).toBeVisible();
    } else {
      expect(isInvalid).toBe(true);
    }
  });
});
