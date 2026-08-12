import { test } from '@playwright/test';

import { takeVrtScreenshot } from './support';

// Deterministic only because the E2E account's Auth0 profile has no `picture`
// claim (falls back to avatar.svg). That claim can't be mocked via
// MOCK_UPSTREAMS — it's decoded from the idToken cookie, not an HTTP call.
test('sidebar', async ({ page }) => {
  await page.goto('/manage/labels');
  await takeVrtScreenshot(page.getByLabel('Zijbalk'));
});
