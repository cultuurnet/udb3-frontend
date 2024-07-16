import 'dotenv/config';

import { publicEncrypt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const isServer = typeof window === 'undefined';

if (isServer) {
  const buffer = Buffer.from(
    JSON.stringify({
      LEGACY_AUTH_SECRET: process.env.LEGACY_AUTH_SECRET,
      LEGACY_AUTH_BASE_URL: process.env.LEGACY_AUTH_BASE_URL,
      LEGACY_AUTH_CLIENT_ID: process.env.LEGACY_AUTH_CLIENT_ID,
      LEGACY_AUTH_CLIENT_SECRET: process.env.LEGACY_AUTH_CLIENT_SECRET,
      LEGACY_AUTH_ISSUER_BASE_URL: process.env.LEGACY_AUTH_ISSUER_BASE_URL,
      NEXT_PUBLIC_LEGACY_AUTH_DOMAIN:
        process.env.NEXT_PUBLIC_LEGACY_AUTH_DOMAIN,
    }),
  );
  const encrypedBuffer = publicEncrypt(
    fs.readFileSync(path.resolve('./public-key.pem'), { encoding: 'utf-8' }),
    buffer,
  );
  console.log('encrypted', encrypedBuffer.toString('base64'));
}

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
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn dev',
    port: 3000,
    env: {
      NEXT_PUBLIC_ENVIRONMENT: 'e2e',
    },
  },
});
