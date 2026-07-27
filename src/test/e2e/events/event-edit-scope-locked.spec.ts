import { expect, test } from '@playwright/test';

const EVENT_ID = 'a0b6534b-3a64-4dfe-9875-968414cc26be';

test.describe('Event scope is locked when editing', () => {
  test('should not allow changing the offer type of an existing event', async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/events/${EVENT_ID}/edit`);

    const eventToggle = page.getByRole('button', {
      name: 'Activiteit',
      exact: true,
    });
    const placeToggle = page.getByRole('button', {
      name: 'Locatie',
      exact: true,
    });

    await expect(eventToggle).toBeVisible();
    await expect(placeToggle).toBeVisible();

    await expect(eventToggle).toBeDisabled();
    await expect(placeToggle).toBeDisabled();
  });
});
