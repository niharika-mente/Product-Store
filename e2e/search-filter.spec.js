import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers.js';

test.describe('Search and Filter', () => {
  test('Search bar filters products by name', async ({ page }) => {
    await page.goto(BASE_URL);

    // Ensure products are loaded
    await expect(page.locator('.chakra-card').first()).toBeVisible();

    // Find the search input
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Laptop');

    // Wait for debounce
    await page.waitForTimeout(600); // 500ms debounce usually

    // Verify only matching products are visible
    const products = page.locator('.chakra-card h2');
    const count = await products.count();
    for (let i = 0; i < count; i++) {
      await expect(products.nth(i)).toContainText(/Laptop/i);
    }
  });

  test('Sort dropdown changes product order', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for products to load
    await expect(page.locator('.chakra-card').first()).toBeVisible();

    // Select sort order (e.g., Price Low to High)
    const sortSelect = page.locator('select');
    await sortSelect.selectOption({ label: 'Price (Low to High)' });

    // Wait for products to re-render
    await page.waitForTimeout(500);

    // Verify prices are in ascending order
    const prices = page.locator('.chakra-card p:has-text("$")');
    const count = await prices.count();
    let prevPrice = -1;

    for (let i = 0; i < count; i++) {
      const priceText = await prices.nth(i).innerText();
      const priceVal = parseFloat(priceText.replace('$', ''));
      expect(priceVal).toBeGreaterThanOrEqual(prevPrice);
      prevPrice = priceVal;
    }
  });

  test('Empty search results show No matching products message', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.locator('.chakra-card').first()).toBeVisible();

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('NonExistentProduct12345');

    // Wait for debounce
    await page.waitForTimeout(600);

    // Expect empty message
    const emptyMsg = page.getByText(/no matching products/i);
    await expect(emptyMsg).toBeVisible();
    await expect(page.locator('.chakra-card')).toBeHidden();
  });
});
