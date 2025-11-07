import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const dummyRole = {
  name: 'e2e ' + faker.lorem.words(2),
  longName: 'e2e ' + faker.string.alphanumeric(300),
};

test.describe('Role Creation - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_roles_create_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/roles/create');
  });

  test('should display the role creation form', async ({ page }) => {
    await expect(page.getByLabel('Naam')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Terug naar de lijst' }),
    ).toBeVisible();
  });

  test('should show validation errors for wrong role name', async ({
    page,
  }) => {
    await page.getByLabel('Naam').fill('b');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('3 tekens');

    await page.getByLabel('Naam').fill(dummyRole.longName);
    const value = await page.getByLabel('Naam').inputValue();
    expect(value).toHaveLength(255);
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeEnabled();
    await expect(
      page.locator('span:above(input[name="name"])').first(),
    ).toContainText('255 / 255');

    await page.getByLabel('Naam').fill('');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('verplicht');
    await page.getByLabel('Naam').fill('Fake Cakes');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Toevoegen' }),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('bestaat al');

    await page.getByLabel('Naam').fill(dummyRole.name);
    await expect(page.getByRole('button', { name: 'Toevoegen' })).toBeEnabled();
  });

  test('should cancel role creation and return to roles list', async ({
    page,
  }) => {
    await page.goto('/manage/roles');
    await page.goto('/manage/roles/create');
    await page.getByLabel('Naam').fill(dummyRole.name);
    await page.getByRole('button', { name: 'Terug naar de lijst' }).click();

    await expect(page).toHaveURL(/\/manage\/roles$/);
  });
});
