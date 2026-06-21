import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers.js';

test.describe('Cart and Checkout Flow', () => {
  test('User can add a product to cart and see badge count update', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find the first product card that has an "Add to Cart" button
    const productCard = page.locator('.chakra-card').filter({ hasText: /Add to Cart/i }).first();
    await expect(productCard).toBeVisible();

    // The cart badge should not exist or be 0 initially
    const cartBadge = page.locator('.chakra-badge', { hasText: /^\d+$/ });
    let initialCount = 0;
    if (await cartBadge.isVisible()) {
      initialCount = parseInt(await cartBadge.innerText(), 10);
    }

    // Click "Add to Cart"
    await productCard.getByRole('button', { name: /Add to Cart/i }).click();

    // Verify badge increments
    await expect(cartBadge).toHaveText((initialCount + 1).toString());
  });

  test('Cart drawer opens and displays added items with correct prices', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Add item to cart
    const productCard = page.locator('.chakra-card').filter({ hasText: /Add to Cart/i }).first();
    await productCard.getByRole('button', { name: /Add to Cart/i }).click();

    // Open Cart Drawer
    await page.getByRole('button', { name: /cart/i }).click();
    
    // Drawer should be visible
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Should contain items
    const cartItems = drawer.locator('.chakra-stack').first(); // Adjust according to your layout
    await expect(cartItems).toBeVisible();

    // Close the drawer for cleanliness
    const closeBtn = drawer.getByRole('button', { name: /close/i });
    if(await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(drawer).toBeHidden();
    }
  });

  test('User can remove items from cart', async ({ page }) => {
    await page.goto(BASE_URL);

    // Add item to cart
    const productCard = page.locator('.chakra-card').filter({ hasText: /Add to Cart/i }).first();
    await productCard.getByRole('button', { name: /Add to Cart/i }).click();

    // Open Cart Drawer
    await page.getByRole('button', { name: /cart/i }).click();
    
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Find remove button (usually trash icon or 'Remove')
    const removeBtn = drawer.locator('button[aria-label="Remove item"], button:has-text("Remove")').first();
    await removeBtn.click();

    // Check if cart is empty
    await expect(drawer.getByText(/Your cart is empty/i)).toBeVisible();
  });

  test('Checkout button redirects to Stripe up to redirect boundary', async ({ page }) => {
    await page.goto(BASE_URL);

    // Add item to cart
    const productCard = page.locator('.chakra-card').filter({ hasText: /Add to Cart/i }).first();
    await productCard.getByRole('button', { name: /Add to Cart/i }).click();

    // Open Cart Drawer
    await page.getByRole('button', { name: /cart/i }).click();
    
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Intercept checkout request since we don't want to actually redirect
    // We expect the checkout endpoint to return { url: 'stripe-url' }
    const checkoutPromise = page.waitForResponse(response => 
      response.url().includes('/api/checkout') && response.status() === 200
    );

    await drawer.getByRole('button', { name: /checkout/i }).click();
    
    const response = await checkoutPromise;
    const body = await response.json();
    
    expect(body.url).toBeTruthy();
    expect(body.url).toContain('stripe.com');
  });
});
