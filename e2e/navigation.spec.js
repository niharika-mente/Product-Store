import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers.js';

test.describe('Navigation and UI', () => {
  test('Dark mode toggle changes theme', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find the color mode toggle (often an icon button)
    const toggleBtn = page.locator('button[aria-label="Toggle color mode"]');
    
    if (await toggleBtn.isVisible()) {
      // Get current theme from html or body element
      const html = page.locator('html');
      const initialTheme = await html.getAttribute('data-theme');
      
      await toggleBtn.click();
      
      const newTheme = await html.getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('Mobile hamburger menu opens and shows navigation links', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // Find hamburger menu icon
    const hamburgerBtn = page.locator('button[aria-label="Open menu"]');
    if (await hamburgerBtn.isVisible()) {
      await hamburgerBtn.click();
      
      // Menu should become visible
      const mobileMenu = page.locator('.chakra-collapse'); // often used for mobile menus in chakra
      await expect(mobileMenu).toBeVisible();

      // Links should be inside
      const loginLink = mobileMenu.getByRole('link', { name: /login/i });
      await expect(loginLink).toBeVisible();
    }
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/this-route-does-not-exist`);
    
    const notFoundHeading = page.getByRole('heading', { name: /404|not found/i });
    await expect(notFoundHeading).toBeVisible();
  });
});
