# E2E Testing Guide

This project uses [Playwright](https://playwright.dev/) for End-to-End (E2E) testing. The tests simulate real user interactions and verify that critical flows are working correctly.

## Prerequisites

- Node.js 20.x
- MongoDB running locally (for local test execution)

## How to run E2E tests locally

First, make sure your dependencies are installed, including the Playwright browsers:

```bash
npm install
npx playwright install
```

To run the tests in headless mode (like CI):

```bash
npm run test:e2e
```

To run the tests with the Playwright UI (recommended for local development and debugging):

```bash
npm run test:e2e:ui
```

> **Note**: The tests automatically start the backend and frontend servers. They connect to `mongodb://localhost:27017/test_db`. Make sure your local MongoDB instance is running before starting the tests.

## How to write new test cases

1. Create a new file in the `e2e/` directory ending in `.spec.js`.
2. Import `test` and `expect` from `@playwright/test`.
3. Use the shared utilities in `e2e/helpers.js` to simplify setup (e.g., `login`).
4. Avoid using `waitForTimeout` or hardcoded delays. Prefer Playwright's auto-waiting web-first assertions (e.g., `await expect(locator).toBeVisible()`).

Example:

```javascript
import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers.js';

test('My new feature works', async ({ page }) => {
  await page.goto(BASE_URL);
  // Interact with elements using ARIA roles and text where possible
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Test data fixtures guide

All static test data should be kept in `e2e/fixtures/test-data.json`. This makes tests deterministic and easy to update.

- **Test User**: Used for login tests. Ensure this user is seeded in `e2e/global-setup.js`.
- **Products**: Sample products with various edge cases (negative prices, out of stock).

If you need a new product for a specific test, add it to the JSON file and import it directly into your `.spec.js` file.

## CI pipeline explanation

E2E tests run automatically on every Pull Request to `main`. The CI pipeline is defined in `.github/workflows/ci.yml`.

The workflow:
1. Provisions an Ubuntu runner.
2. Starts a MongoDB service container.
3. Installs dependencies and Playwright browsers.
4. Builds the frontend (`npm run build --prefix FRONTEND`).
5. Runs the tests (`npm run test:e2e`).
6. Uploads the Playwright report as an artifact if tests fail (useful for debugging).

## Debugging tips

- **UI Mode**: Run `npm run test:e2e:ui` to visually inspect test execution, step back in time, and inspect network requests.
- **Traces**: By default, Playwright records traces on the first retry of a failed test. You can view these traces using `npx playwright show-trace trace.zip`.
- **Screenshots**: Screenshots are automatically taken on test failure and are available in the `playwright-report/` directory or downloaded from GitHub Actions artifacts.
- **Selectors**: Use the "Pick Locator" tool in Playwright UI mode to find robust selectors instead of guessing them.
