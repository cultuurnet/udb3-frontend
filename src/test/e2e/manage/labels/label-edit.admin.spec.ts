import { faker } from '@faker-js/faker';
import { expect,test } from '@playwright/test';

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
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue('e2e');
    await expect(page.locator('input[name="isVisible"]')).toBeVisible();
    await expect(page.locator('input[name="isVisible"]')).toBeChecked();
    await expect(page.locator('input[name="isPrivate"]')).toBeVisible();
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeVisible();
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeEnabled();
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toContainText('Bewaren');
  });

  test('should change submit button state when changing name', async ({
    page,
  }) => {
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toBeEnabled();

    await page.fill('input[name="name"]', dummyLabel.name);
    await expect(
      page.locator('main').locator('button[title="submit"]'),
    ).toContainText('Toevoegen');
  });
});
