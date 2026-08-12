import { expect, type Page, test } from '@playwright/test';

export const takeVrtScreenshot = async (page: Page) => {
  if (process.env.VRT_RECORD_MODE === 'true') return;
  const name = `pages--${test.info().title.replace(/\s+/g, '-')}.png`;
  await expect(page).toHaveScreenshot(name);
};
