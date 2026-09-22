import { chromium } from '@playwright/test';

import { pinClockToVrtNow } from './pins/clock.mjs';
import { pinReducedMotion } from './pins/motion.mjs';
import {
  BASE_URL,
  cleanup,
  ensureAppAndMockServer,
  ensureAuthSession,
  registerCleanupTask,
} from './shared.mjs';
import { buildStorageState } from './storage-state.mjs';

const APP_HOST = new URL(BASE_URL).hostname;
const startPath = process.argv[2] ?? '/dashboard';

// Required: signing in by hand is not an option, Google blocks OAuth in an
// automated browser.
const storedSession = async () => {
  if (!(await ensureAuthSession())) {
    console.error(
      '\nCould not get an authenticated session, and you cannot sign in by hand here. Check E2E_TEST_EMAIL and E2E_TEST_PASSWORD.\n',
    );
    process.exit(1);
  }
  return buildStorageState(APP_HOST);
};

const main = async () => {
  await ensureAppAndMockServer();

  const browser = await chromium.launch({ headless: false });
  // cleanup() exits, so Ctrl-C would otherwise leave the window behind.
  registerCleanupTask(() => browser.close().catch(() => {}));

  try {
    const context = await browser.newContext({
      baseURL: BASE_URL,
      storageState: await storedSession(),
      viewport: null,
    });

    // Best effort: a handler cannot hold the page back, so a pin can land late.
    context.on('page', (page) => {
      pinClockToVrtNow(page).catch(() => {});
      pinReducedMotion(page).catch(() => {});
    });

    // The terminal is behind the window, so say it in the page too.
    context.on('response', async (response) => {
      try {
        if (response.headers()['x-vrt-absorbed-write'] !== 'true') return;
        await response
          .frame()
          .page()
          .evaluate(
            (message) => console.warn(message),
            `VRT mock server answered ${response.request().method()} ${response.url()} with 200 and wrote nothing. A reload shows the fixture again.`,
          );
      } catch {}
    });

    const page = await context.newPage();
    await pinClockToVrtNow(page);
    await pinReducedMotion(page);
    await page.goto(startPath);

    console.log(
      `\nBrowsing ${BASE_URL}${startPath} against the mock server.\n` +
        'Anything not mocked goes to the real backend and is listed when you close the browser.\n' +
        'This is for looking, not for baselines: the rendering is your machine, not the container.\n' +
        'Opening devtools drops the reduced-motion pin, so the gauge animates again.\n',
    );

    // A launched browser outlives its pages, so wait on the last window instead.
    await new Promise((resolve) => {
      const resolveWhenAllClosed = () =>
        context.pages().length === 0 && resolve();

      context.on('page', (opened) => opened.on('close', resolveWhenAllClosed));
      page.on('close', resolveWhenAllClosed);
      browser.on('disconnected', resolve);
    });
  } finally {
    await browser.close().catch(() => {});
    cleanup();
  }
};

await main();
