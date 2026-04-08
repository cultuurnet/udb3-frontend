import { expect, test } from '@playwright/test';

import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const eventId = '351915e1-b839-47f2-b20a-df874b556e84';

test.describe('Event Preview - History Tab', () => {
  test.beforeEach(async ({ page }) => {
    suppressHydrationErrors(page);
    await page.goto(`/events/${eventId}`);
  });

  test('displays the History tab', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Historiek' })).toBeVisible();
  });

  test('shows history entries when History tab is clicked', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Historiek' }).click();

    const historyItems = page.getByRole('listitem');
    await expect(historyItems.first()).toBeVisible();
  });
});
