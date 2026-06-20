import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',
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
      env: {
        NODE_ENV: 'development',
        PORT: '5000',
        JWT_SECRET: 'testsecret12345678901234567890123',
        VITE_API_URL: 'http://localhost:5173',
      },
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
