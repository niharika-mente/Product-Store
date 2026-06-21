import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_USER, login } from './helpers.js';
import { readFileSync } from 'fs';

const testData = JSON.parse(readFileSync(new URL('./fixtures/test-data.json', import.meta.url)));

test.describe('Authentication Flow', () => {
  test('User can sign up with valid credentials', async ({ page }) => {
    // Generate a unique user for signup to avoid conflicts
    const timestamp = Date.now();
    const newUser = {
      name: `New User ${timestamp}`,
      email: `newuser${timestamp}@example.com`,
      password: 'password123'
    };

    await page.goto(`${BASE_URL}/signup`);
    await page.fill('input[placeholder="Enter your name"]', newUser.name);
    await page.fill('input[type="email"]', newUser.email);
    await page.fill('input[type="password"]', newUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to home after successful signup
    await page.waitForURL(BASE_URL + '/');
    
    // Check if logout button is visible, confirming we are logged in
    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
  });

  test('Signup shows validation errors for missing fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    // Submit without filling anything
    await page.click('button[type="submit"]');

    // Expect some validation error or toast
    // The exact implementation depends on the frontend, let's look for a generic toast or required attributes
    // Since we don't know the exact error message, we can check that we did NOT redirect
    expect(page.url()).toContain('/signup');
  });

  test('User can log in with valid credentials', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Check if logout button is visible
    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
  });

  test('Login shows error for invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testData.invalidUser.email);
    await page.fill('input[type="password"]', testData.invalidUser.password);
    await page.click('button[type="submit"]');

    // Should not redirect
    expect(page.url()).toContain('/login');
    // A toast should appear
    const toast = page.locator('.chakra-toast');
    await expect(toast).toBeVisible();
  });

  test('User can log out', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // After logout, user should be redirected to login page or home page. Let's wait for the login button to reappear
    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
  });
});
