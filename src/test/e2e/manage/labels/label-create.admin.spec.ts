import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const dummyLabel = {
  name: 'e2e ' + faker.lorem.words(2),
  longName: 'e2e ' + faker.string.alphanumeric(300),
};

test.describe('Label Creation - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_labels_create_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/labels/create');
  });

  test('should display the label creation form', async ({ page }) => {
    await expect(page.getByLabel('Naam')).toBeVisible();
    await expect(page.getByLabel('Tonen op publicatiekanalen')).toBeVisible();
    await expect(page.getByLabel('Tonen op publicatiekanalen')).toBeChecked();
    await expect(
      page.getByLabel('Voorbehouden aan specifieke gebruikersgroepen'),
    ).toBeVisible();
    await expect(
      page.getByLabel('Voorbehouden aan specifieke gebruikersgroepen'),
    ).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Terug naar de lijst' }),
    ).toBeVisible();

    await page.getByLabel('Naam').fill(dummyLabel.name);
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeEnabled();
  });

  // Skipped because this will create a ne label for each run.
  test.skip('should create a new label successfully', async ({ page }) => {
    await page.getByLabel('Naam').fill(dummyLabel.name);
    await page.getByRole('button', { name: 'Toevoegen' }).click();

    await expect(page).toHaveURL(/\/manage\/labels/);
    await expect(page.locator(`text=${dummyLabel.name}`)).toBeVisible();
  });

  test('should show validation errors for wrong label name', async ({
    page,
  }) => {
    await page.getByLabel('Naam').fill('b');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(page.locator('ul.name-errors li')).toContainText('2 tekens');

    await page.getByLabel('Naam').fill(';');
    await expect(page.locator('ul.name-errors li')).toHaveCount(2);

    await page.getByLabel('Naam').fill(dummyLabel.longName);
    const value = await page.getByLabel('Naam').inputValue();
    expect(value).toHaveLength(255);
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeEnabled();
    await expect(
      page.locator('span:above(input[name="name"])').first(),
    ).toContainText('255 / 255');

    await page.getByLabel('Naam').fill('b;');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(page.locator('ul.name-errors li')).toContainText('puntkomma');

    await page.getByLabel('Naam').fill('');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(page.locator('ul.name-errors li').first()).toContainText(
      'verplicht',
    );
    await expect(page.locator('ul.name-errors li').nth(1)).toContainText(
      '2 tekens',
    );

    await page.getByLabel('Naam').fill('FakeNews');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(page.locator('ul.name-errors li')).toContainText(
      'al gebruikt',
    );

    await page.getByLabel('Naam').fill(dummyLabel.name);
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeEnabled();
  });

  test('should cancel label creation and return to labels list', async ({
    page,
  }) => {
    await page.getByLabel('Naam').fill(dummyLabel.name);
    await page.getByRole('button', { name: 'Terug naar de lijst' }).click();

    await expect(page).toHaveURL(/\/manage\/labels$/);
  });
});
