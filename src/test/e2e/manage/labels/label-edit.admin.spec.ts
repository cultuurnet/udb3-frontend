import { expect, test } from '@playwright/test';

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
    await expect(page.getByLabel('Naam')).not.toBeVisible();
    await expect(page.getByRole('main')).toContainText('e2e');
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
});
