import { expect } from '@playwright/test';

export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

export async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('input[placeholder="Email address"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('/');
  // Wait for the user to be logged in (e.g. check for logout button)
  await expect(page.locator('button:has-text("Logout")')).toBeVisible();
}

export async function registerUser(page, name, email, password) {
  await page.goto('/signup');
  await page.fill('input[placeholder="Full name"]', name);
  await page.fill('input[placeholder="Email address"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button:has-text("Sign up")');
  // Wait for redirect to login or home
  await page.waitForLoadState('networkidle');
}

export async function createProductViaAPI(productData) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create product via API: ${response.statusText}`);
  }
  return response.json();
}

export async function waitForToast(page, text) {
  const toast = page.locator(`[role="status"]:has-text("${text}")`);
  await expect(toast).toBeVisible();
}
