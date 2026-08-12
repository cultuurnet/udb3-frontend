import { test } from '@playwright/test';

import { takeVrtScreenshot } from './support';

test('sidebar', async ({ page }) => {
  await page.goto('/manage/labels');
  await takeVrtScreenshot(page.getByLabel('Zijbalk'));
});
