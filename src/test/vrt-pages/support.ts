import { expect, type Locator, type Page, test } from '@playwright/test';

import { pinClockToVrtNow } from '../../../scripts/vrt/pins/clock.mjs';
import { pinReducedMotion } from '../../../scripts/vrt/pins/motion.mjs';
import {
  expectNoUnexpectedHosts,
  trackUnexpectedHosts,
} from './unexpected-hosts';

// Screenshots against a baseline named after the test title.
export const takeVrtScreenshot = async (target: Page | Locator) => {
  if (process.env.VRT_RECORD_MODE === 'true') return;
  const name = `pages--${test.info().title.replace(/\s+/g, '-')}.png`;
  await expect(target).toHaveScreenshot(name);
};

const fitViewportToContent = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  const height = await page
    .locator('main')
    .evaluate((element) => element.scrollHeight);
  await page.setViewportSize({ width: page.viewportSize().width, height });
};

type ScreenshotPage = {
  title: string;
  path: string;
  locator?: (page: Page) => Page | Locator;
  beforeScreenshot?: (page: Page) => Promise<void>;
  fitContent?: boolean;
};

// Declares one test per page: navigate, optionally interact, then screenshot (defaults to `main`).
export const screenshotPages = (pages: ScreenshotPage[]) => {
  let unexpectedHosts = new Set<string>();

  test.beforeEach(async ({ page }) => {
    await pinClockToVrtNow(page);
    await pinReducedMotion(page);
    unexpectedHosts = trackUnexpectedHosts(page);
  });

  test.afterEach(() => expectNoUnexpectedHosts(unexpectedHosts));

  for (const {
    title,
    path,
    locator = (page: Page) => page.locator('main'),
    beforeScreenshot,
    fitContent,
  } of pages) {
    test(title, async ({ page }) => {
      await page.goto(path);
      await beforeScreenshot?.(page);
      if (fitContent) await fitViewportToContent(page);
      await takeVrtScreenshot(locator(page));
    });
  }
};
