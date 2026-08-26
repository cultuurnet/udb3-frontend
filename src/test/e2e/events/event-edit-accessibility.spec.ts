import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const EVENT_ID = 'a0b6534b-3a64-4dfe-9875-968414cc26be';

test.describe('Event Edit - Accessibility', () => {
  test.describe.configure({ mode: 'serial' });

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

    await page.getByRole('tab', { name: 'Begeleid vervoer' }).click();

    await expect(
      page.getByRole('heading', { name: 'Vertreklocatie 1', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('E2E Place Preview Test')).toBeVisible();

    const existingLocationCount = await page
      .getByRole('heading', { name: /Vertreklocatie \d+/ })
      .count();

    // Add a new location
    await page
      .getByRole('button', { name: 'Voeg nog een locatie toe' })
      .click();

    await expect(
      page.getByRole('heading', {
        name: `Vertreklocatie ${existingLocationCount}`,
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByTestId(`departure-city-${existingLocationCount}`)
      .fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();

    await page
      .getByTestId(`departure-place-${existingLocationCount}`)
      .fill('S.M');
    await page
      .getByRole('option', { name: 'S.M.A.K.', exact: true })
      .first()
      .click();

    // Delete the last location
    await page.locator(`#departure-delete-${existingLocationCount}`).click();
    await expect(
      page.getByRole('heading', {
        name: `Vertreklocatie ${existingLocationCount + 1}`,
        exact: true,
      }),
    ).toBeHidden();

    await page
      .getByRole('button', { name: 'Klaar met bewerken' })
      .click({ force: true });
  });

  test('creates a new departure place when it is not found', async ({
    page,
    baseURL,
  }) => {
    const newPlaceName = `E2E Vertreklocatie ${faker.number.int()}`;

    await page.goto(`${baseURL}/events/${EVENT_ID}/edit`);

    await page.getByRole('tab', { name: 'Begeleid vervoer' }).click();

    const newIndex = await page
      .getByRole('heading', { name: /Vertreklocatie \d+/ })
      .count();

    await page
      .getByRole('button', { name: 'Voeg nog een locatie toe' })
      .click();

    try {
      await page.getByTestId(`departure-city-${newIndex}`).fill('9000');
      await page.getByRole('option', { name: '9000 Gent' }).click();

      await page.getByTestId(`departure-place-${newIndex}`).fill(newPlaceName);

      const addNewOption = page.locator('.rbt-menu-custom-option');
      await expect(addNewOption).toContainText(
        'Locatie niet gevonden? Nieuwe locatie toevoegen',
      );
      await addNewOption.click();

      const modal = page.getByRole('dialog');
      await expect(modal.getByLabel('Naam locatie')).toHaveValue(newPlaceName);
      await expect(modal.getByLabel('Postcode')).toHaveValue('9000');
      await expect(modal.getByLabel('Gemeente')).toHaveValue('Gent');

      await modal.getByLabel('Straat en nummer').fill('E2E test street 1');
      await modal
        .getByRole('button', { name: 'Bioscoop', exact: true })
        .click();
      await modal
        .getByRole('button', { name: 'Toevoegen', exact: true })
        .click();

      await expect(page.getByText(newPlaceName)).toBeVisible();
    } finally {
      await page.locator(`#departure-delete-${newIndex}`).click();
    }

    await expect(page.getByText(newPlaceName)).toBeHidden();

    await page
      .getByRole('button', { name: 'Klaar met bewerken' })
      .click({ force: true });
  });
});
