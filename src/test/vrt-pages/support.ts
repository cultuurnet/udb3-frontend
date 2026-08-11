import { expect, type Page } from '@playwright/test';

export const takeVrtScreenshot = async (page: Page, name: string) => {
  if (process.env.VRT_RECORD_MODE === 'true') return;
  await expect(page).toHaveScreenshot(name);
};
