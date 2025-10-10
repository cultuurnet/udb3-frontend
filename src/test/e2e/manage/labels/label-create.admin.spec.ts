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
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="isVisible"]')).toBeVisible();
    await expect(page.locator('input[name="isVisible"]')).toBeChecked();
    await expect(page.locator('input[name="isPrivate"]')).toBeVisible();
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeVisible();
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeDisabled();

    await page.fill('input[name="name"]', dummyLabel.name);
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeEnabled();
  });

  // Skipped because this will create a ne label for each run.
  test.skip('should create a new label successfully', async ({ page }) => {
    await page.fill('input[name="name"]', dummyLabel.name);
    await page.click('button[title="submit"]');

    await expect(page).toHaveURL(/\/manage\/labels/);
    await expect(page.locator(`text=${dummyLabel.name}`)).toBeVisible();
  });

  test('should show validation errors for wrong label name', async ({
    page,
  }) => {
    await page.fill('input[name="name"]', 'b');
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('2 tekens');

    await page.fill('input[name="name"]', dummyLabel.longName);
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeEnabled();
    await expect(
      page.locator('span:above(input[name="name"])').first(),
    ).toContainText('255 / 255');

    await page.fill('input[name="name"]', 'b;');
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('puntkomma');

    await page.fill('input[name="name"]', '');
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('verplicht');

    await page.fill('input[name="name"]', 'FakeNews');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('al gebruikt');

    await page.fill('input[name="name"]', dummyLabel.name);
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeEnabled();
  });

  test('should cancel label creation and return to labels list', async ({
    page,
  }) => {
    await page.fill('input[name="name"]', dummyLabel.name);
    await page.click('button[title="cancel"]');

    await expect(page).toHaveURL(/\/manage\/labels$/);
  });
});
