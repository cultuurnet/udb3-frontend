import { expect, test } from '@playwright/test';

test.describe('Label Overview - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_labels_create_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
      {
        name: 'ff_react_labels_overview',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('can navigate to labels overview page', async ({ baseURL, page }) => {
    await page.goto(baseURL + '/manage/labels');
    await expect(page.getByRole('heading')).toContainText('Labels');
  });

  test('can search for labels', async ({ baseURL, page }) => {
    await page.goto(baseURL + '/manage/labels');
    await page.getByPlaceholder(/zoek/i).fill('e2e');
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder(/zoek/i)).toHaveValue('e2e');

    const rows = page.getByRole('row');

    const addedOwner = rows.nth(1).filter({
      hasText: 'e2e',
    });

    await expect(addedOwner).toBeVisible({ timeout: 8_000 });
  });

  test('can click create label button', async ({ baseURL, page }) => {
    await page.goto(baseURL + '/manage/labels');
    await page.getByRole('button', { name: /toevoegen/i }).click();
    await expect(page).toHaveURL(/\/manage\/labels\/create/);
  });

  test('can click edit label link', async ({ baseURL, page }) => {
    await page.goto(baseURL + '/manage/labels');
    const editLink = page.getByRole('link', { name: /bewerken/i }).first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page).toHaveURL(/\/manage\/labels\/[^/]+\/edit/);
    }
  });
});
