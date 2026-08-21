import fs from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

const AUTH_STORAGE_STATE_PATH = 'playwright/.auth/user.json';
const APP_HOST = process.env.VRT_APP_HOST ?? 'localhost';

const buildStorageState = () => {
  const storageState = JSON.parse(
    fs.readFileSync(AUTH_STORAGE_STATE_PATH, 'utf-8'),
  );
  const cookies = storageState.cookies.map(
    (cookie: Record<string, unknown> & { domain: string }) =>
      cookie.domain === 'localhost' ? { ...cookie, domain: APP_HOST } : cookie,
  );
  return { ...storageState, cookies };
};

export default defineConfig({
  testDir: 'src/test/vrt-pages',
  timeout: 60 * 1000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixels: 20,
      maxDiffPixelRatio: 0.002,
      threshold: 0.1,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  snapshotPathTemplate: '.vrt-pages/baseline/{arg}--{testFileName}{ext}',
  outputDir: '.vrt-pages/test-results/',
  reporter: [['html', { outputFolder: '.vrt-pages/report', open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://${APP_HOST}:3000`,
    storageState: buildStorageState(),
  },
});
