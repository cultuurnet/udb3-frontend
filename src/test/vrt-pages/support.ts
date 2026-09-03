import { expect, type Locator, type Page, test } from '@playwright/test';

// Screenshots against a baseline named after the test title.
export const takeVrtScreenshot = async (target: Page | Locator) => {
  if (process.env.VRT_RECORD_MODE === 'true') return;
  const name = `pages--${test.info().title.replace(/\s+/g, '-')}.png`;
  await expect(target).toHaveScreenshot(name);
};

type ScreenshotPage = {
  title: string;
  path: string;
  locator?: (page: Page) => Page | Locator;
  beforeScreenshot?: (page: Page) => Promise<void>;
};

// Declares one test per page: navigate, optionally interact, then screenshot (defaults to `main`).
export const screenshotPages = (pages: ScreenshotPage[]) => {
  for (const {
    title,
    path,
    locator = (page: Page) => page.locator('main'),
    beforeScreenshot,
  } of pages) {
    test(title, async ({ page }) => {
      await page.goto(path);
      await beforeScreenshot?.(page);
      await takeVrtScreenshot(locator(page));
    });
  }
};
