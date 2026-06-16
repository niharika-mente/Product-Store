import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run start --prefix BACKEND',
      port: 5000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev --prefix FRONTEND',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    }
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
