import 'dotenv/config';

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/test/e2e',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['list'], // Shows each test as it runs
        ['github'], // GitHub Actions annotations
        ['html'], // Generates HTML report
        [
          'json',
          {
            outputFile: 'playwright-report/test-results.json',
          },
        ],
      ]
    : [
        ['list'], // Shows each test as it runs
        ['html'], // Generates HTML report
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    {
      name: 'setup-user',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'setup-admin',
      testMatch: /auth-admin\.setup\.ts/,
    },
    // Regular user tests
    {
      name: 'chromium-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup-user'],
      testIgnore: /.*admin.*\.spec\.ts/, // Ignore admin test files
    },

    // Admin user tests
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
      testMatch: /.*admin.*\.spec\.ts/, // Only run admin test files
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    reuseExistingServer: !process.env.CI,
    command: process.env.CI ? 'yarn start' : 'yarn build && yarn start',
    port: 3000,
    timeout: process.env.CI ? 60 * 1000 : 240 * 1000,
    env: {
      NEXT_PUBLIC_ENVIRONMENT: 'e2e',
    },
  },
});
