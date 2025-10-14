import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const dummyLabel = {
  name: 'e2e ' + faker.lorem.words(2),
};

test.describe('Label Editing - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_labels_create_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/labels/324920da-385d-4adc-8cc1-e03e0cde8836/edit');
  });

  test('should display the label editing form', async ({ page }) => {
    await expect(page.getByLabel('Naam')).toBeVisible();
    await expect(page.getByLabel('Naam')).toHaveValue('e2e');
    await expect(page.getByLabel('Tonen op publicatiekanalen')).toBeVisible();
    await expect(page.getByLabel('Tonen op publicatiekanalen')).toBeChecked();
    await expect(
      page.getByLabel('Voorbehouden aan specifieke gebruikersgroepen'),
    ).toBeVisible();
    await expect(
      page.getByLabel('Voorbehouden aan specifieke gebruikersgroepen'),
    ).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Bewaren' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bewaren' })).toBeEnabled();
  });

  test('should change submit button state when changing name', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: 'Bewaren' })).toBeEnabled();

    await page.getByLabel('Naam').fill(dummyLabel.name);
    await expect(
      page.getByRole('button', { name: 'Bewaren' }),
    ).not.toBeVisible();

    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeEnabled();
  });
});
