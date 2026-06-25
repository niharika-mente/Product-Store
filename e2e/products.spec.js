import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_USER, login } from './helpers.js';
import { readFileSync } from 'fs';

const testData = JSON.parse(readFileSync(new URL('./fixtures/test-data.json', import.meta.url)));

test.describe('Product CRUD', () => {
  test('Homepage loads and displays product cards', async ({ page }) => {
    await page.goto(BASE_URL);
    // At least one product card should be visible
    const productCard = page.locator('.chakra-card').first();
    await expect(productCard).toBeVisible();
  });

  test('User can create a product via the Create page', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Go to Create Product page
    await page.getByRole('link', { name: /\+/ }).click(); // Usually the create button is a plus or "Create"
    // Wait for the form
    await expect(page.locator('form')).toBeVisible();

    const p = testData.newProduct;
    await page.fill('input[name="name"]', p.name);
    await page.fill('input[name="price"]', p.price);
    await page.fill('input[name="image"]', p.image);
    await page.fill('input[name="category"]', p.category);
    await page.fill('input[name="brand"]', p.brand);
    await page.fill('input[name="stock"]', p.stock);
    await page.fill('textarea[name="description"]', p.description);

    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await page.waitForURL(BASE_URL + '/');

    // Verify the product is visible on the home page
    const newProductCard = page.locator('.chakra-card', { hasText: p.name });
    await expect(newProductCard).toBeVisible();
  });

  test('User can edit a product via the edit modal', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto(BASE_URL);

    // Find the product we just created (or any product), click edit
    const p = testData.newProduct;
    const newProductCard = page.locator('.chakra-card', { hasText: p.name });
    await expect(newProductCard).toBeVisible();

    // Click edit button (assuming there's an edit button inside the card, often an icon)
    const editBtn = newProductCard.getByRole('button', { name: /edit/i });
    if(await editBtn.isVisible()) {
      await editBtn.click();
    } else {
      // Fallback selector for edit icon
      await newProductCard.locator('button[aria-label="Edit product"]').click();
    }

    // Modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    const pEdited = testData.editedProduct;
    await modal.locator('input[name="name"]').fill(pEdited.name);
    await modal.locator('input[name="price"]').fill(pEdited.price);
    await modal.getByRole('button', { name: /update/i }).click();

    // Modal should close
    await expect(modal).toBeHidden();

    // Verify the updated name is visible
    const editedCard = page.locator('.chakra-card', { hasText: pEdited.name });
    await expect(editedCard).toBeVisible();
  });

  test('User can delete a product via the delete confirmation dialog', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto(BASE_URL);

    const pEdited = testData.editedProduct;
    const editedCard = page.locator('.chakra-card', { hasText: pEdited.name });
    await expect(editedCard).toBeVisible();

    // Click delete button
    const deleteBtn = editedCard.getByRole('button', { name: /delete/i });
    if(await deleteBtn.isVisible()) {
      await deleteBtn.click();
    } else {
      await editedCard.locator('button[aria-label="Delete product"]').click();
    }

    // Since Chakra UI might just show a toast or have a confirm dialog
    // We assume there's a delete confirmation or it deletes immediately. Let's see if there's a dialog.
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await modal.getByRole('button', { name: /delete/i }).click();
    }

    // Verify the product is removed
    await expect(editedCard).toBeHidden();
  });

  test('Product detail page loads correctly when clicking a product name', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Find a product card
    const productCard = page.locator('.chakra-card').first();
    const productName = await productCard.locator('h2').first().innerText(); // Assuming h2 is the title
    
    // Click on the product name or the image
    await productCard.locator('h2').first().click();

    // Expect URL to change to /product/:id
    await page.waitForURL(/\/product\//);
    
    // Expect the product name to be on the page
    const heading = page.getByRole('heading', { name: productName });
    await expect(heading).toBeVisible();
  });
});
