import { expect } from '@playwright/test';
import testData from './fixtures/test-data.json' assert { type: 'json' };

export const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
export const TEST_USER = testData.user;

export async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect to home page or until navbar shows user options
  await page.waitForURL(BASE_URL + '/');
}

export async function registerUser(page, name, email, password) {
  await page.goto(`${BASE_URL}/signup`);
  await page.fill('input[placeholder="Enter your name"]', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(BASE_URL + '/');
}

export async function createProductViaAPI(request, productData) {
  const response = await request.post(`${API_URL}/api/products`, {
    data: productData,
  });
  expect(response.ok()).toBeTruthy();
  return await response.json();
}

export async function waitForToast(page, text) {
  const toast = page.locator('.chakra-toast');
  await expect(toast).toContainText(text);
}
