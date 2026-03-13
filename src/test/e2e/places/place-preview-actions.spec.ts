import { expect, test as base } from '@playwright/test';

import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

type TestFixtures = {
  placePreviewUrl: string;
  placeId: string;
};

const test = base.extend<TestFixtures>({
  placeId: async ({ page, baseURL }, applyFixture) => {
    // todo: remove when the styled components hydration errors are fixed.
    suppressHydrationErrors(page);
    await page.goto(`${baseURL}/create`);

    await page.getByRole('button', { name: 'Locatie' }).click();
    await page.getByRole('button', { name: 'Bioscoop' }).click();

    await page.getByLabel('Gemeente').click();
    await page.getByLabel('Gemeente').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();

    await page.getByLabel('Straat').fill('Citadelpark 9');

    await page.getByLabel('Naam van de locatie').click();
    await page
      .getByLabel('Naam van de locatie')
      .fill(`E2E Place Preview Test ${Date.now()}`);

    await page.getByRole('button', { name: 'Opslaan' }).click();

    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/places\/[a-f0-9-]+/);
    await page.waitForLoadState('domcontentloaded');

    const url = page.url();
    const placeId = url.match(/\/places\/([a-f0-9-]+)/)?.[1] ?? '';

    await applyFixture(placeId);
  },

  placePreviewUrl: async ({ placeId }, applyFixture) => {
    await applyFixture(`/places/${placeId}`);
  },
});

test.describe('Place Preview Sidebar Actions', () => {
  test.beforeEach(async ({ page, placePreviewUrl, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_place_preview',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    // todo: remove when the styled components hydration errors are fixed.
    suppressHydrationErrors(page);

    await page.goto(placePreviewUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: 'Bewerken' }).waitFor();
  });

  test('should display all action buttons and be enabled', async ({ page }) => {
    const editButton = page.getByRole('button', { name: 'Bewerken' });
    await expect(editButton).toBeVisible();
    await expect(editButton).not.toBeDisabled();

    const translateButton = page.getByRole('button', { name: 'Vertalen' });
    await expect(translateButton).toBeVisible();
    await expect(translateButton).not.toBeDisabled();

    const availabilityButton = page.getByRole('button', {
      name: 'Beschikbaarheid wijzigen',
    });
    await expect(availabilityButton).toBeVisible();
    await expect(availabilityButton).not.toBeDisabled();

    const deleteButton = page.getByRole('button', { name: 'Verwijderen' });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).not.toBeDisabled();
  });

  test('should have correct href attributes on action links', async ({
    page,
    placeId,
  }) => {
    const editLink = page.getByRole('link', { name: 'Bewerken' });
    await expect(editLink).toHaveAttribute('href', `/places/${placeId}/edit`);

    const translateLink = page.getByRole('link', { name: 'Vertalen' });
    await expect(translateLink).toHaveAttribute(
      'href',
      `/places/${placeId}/translate`,
    );
  });

  test('should open delete confirmation modal when delete button is clicked', async ({
    page,
  }) => {
    const deleteButton = page.getByRole('button', { name: 'Verwijderen' });
    await deleteButton.click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    const modalTitle = modal.getByText('Locatie verwijderen');
    await expect(modalTitle).toBeVisible();

    const confirmButton = modal.getByRole('button', { name: 'Verwijderen' });
    await expect(confirmButton).toBeVisible();

    const cancelButton = modal.getByRole('button', { name: 'Annuleren' });
    await expect(cancelButton).toBeVisible();

    await cancelButton.click();
    await expect(modal).not.toBeVisible();
  });
});
