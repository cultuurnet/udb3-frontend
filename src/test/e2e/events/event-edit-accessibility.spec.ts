import { expect, test } from '@playwright/test';

const EVENT_ID = 'a0b6534b-3a64-4dfe-9875-968414cc26be';

test.describe('Event Edit - Accessibility', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'ff_boa',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('shows existing departure place and supports add and delete', async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/events/${EVENT_ID}/edit`);

    await page.getByRole('tab', { name: 'Bereikbaarheid' }).click();

    await expect(
      page.getByRole('heading', { name: 'Vertreklocatie 1' }),
    ).toBeVisible();
    await expect(page.getByText('E2E Place Preview Test')).toBeVisible();

    await page
      .getByRole('button', { name: 'Voeg nog een locatie toe' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Vertreklocatie 2' }),
    ).toBeVisible();

    await page.locator('input[name="departure-city-1"]').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();

    await page.locator('input[name="departure-place-1"]').fill('S.M');
    await page
      .getByRole('option', { name: 'S.M.A.K.', exact: true })
      .first()
      .click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Verwijder vertreklocatie' })
      .nth(1)
      .click();

    await expect(
      page.getByRole('heading', { name: 'Vertreklocatie 2' }),
    ).toBeHidden();
  });
});
