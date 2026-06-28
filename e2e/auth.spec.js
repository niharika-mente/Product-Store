import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_USER, login, registerUser } from './helpers.js';
import { readFileSync } from 'fs';

const testData = JSON.parse(
  readFileSync(new URL('./fixtures/test-data.json', import.meta.url))
);

test.describe('Authentication Flow', () => {
  test('User can sign up with valid credentials', async ({ page }) => {
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

    await page.waitForURL(BASE_URL + '/');

    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
  });

  test('Signup shows validation errors for missing fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    await page.click('button[type="submit"]');

    expect(page.url()).toContain('/signup');
  });

  test('User can log in with valid credentials', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
  });

  test('Login shows error for invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[type="email"]', testData.invalidUser.email);
    await page.fill('input[type="password"]', testData.invalidUser.password);
    await page.click('button[type="submit"]');

    expect(page.url()).toContain('/login');

    const toast = page.locator('.chakra-toast');
    await expect(toast).toBeVisible();
  });

  test('User can log out', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();

    await logoutBtn.click();

    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
  });

  test('User can register, logout, and login again', async ({ page }) => {
    const timestamp = Date.now();

    const user = {
      name: `E2E User ${timestamp}`,
      email: `e2euser${timestamp}@example.com`,
      password: 'password123'
    };

    await registerUser(
      page,
      user.name,
      user.email,
      user.password
    );

    const logoutBtn = page.getByRole('button', { name: /logout/i });
    await expect(logoutBtn).toBeVisible();

    await logoutBtn.click();

    await expect(
      page.getByRole('link', { name: /login/i })
    ).toBeVisible();

    await login(
      page,
      user.email,
      user.password
    );

    await expect(
      page.getByRole('button', { name: /logout/i })
    ).toBeVisible();
  });
});