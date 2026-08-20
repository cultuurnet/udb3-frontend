import { expect, type Locator, type Page, test } from '@playwright/test';

export const takeVrtScreenshot = async (target: Page | Locator) => {
  const name = `pages--${test.info().title.replace(/\s+/g, '-')}.png`;
  await expect(target).toHaveScreenshot(name);
};
