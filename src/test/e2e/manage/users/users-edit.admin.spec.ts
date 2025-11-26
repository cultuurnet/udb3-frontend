import { expect, test } from '@playwright/test';

const E2E_ADMIN_USER_ID = 'auth0|64089494e980aedd96740212';

const TEST_ROLE = 'E2E test rol';
const TEST_ROLE_UUID = '8c61bab7-8e22-45a8-82f8-b7d4e6c0a43c';

test.describe('User Edit - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_users_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/users');
  });

  test('Can navigate to user edit page', async ({ page }) => {
    await page.goto(`/manage/users/${E2E_ADMIN_USER_ID}/edit`);

    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Gebruiker bewerken',
    );

    await expect(
      page.getByText(`E-mailadres: ${process.env.E2E_TEST_ADMIN_EMAIL}`, {
        exact: true,
      }),
    ).toBeVisible();

    await page.getByLabel('Rol toevoegen').fill(TEST_ROLE);

    await page.locator(`[aria-label="${TEST_ROLE}"]`).click();

    // Check for success toast
    await expect(
      page.getByText(`Rol '${TEST_ROLE}' succesvol toegevoegd aan gebruiker.`),
    ).toBeVisible();

    // Remove the role again
    await page.locator(`#delete-role-button-${TEST_ROLE_UUID}`).click();

    // Confirm in modal
    await expect(
      page.getByText(
        `Ben je zeker dat je de rol '${TEST_ROLE}' wil verwijderen van deze gebruiker?`,
      ),
    ).toBeVisible();

    await page
      .locator('.modal-dialog')
      .getByRole('button', { name: 'Verwijderen' })
      .click();

    // Check for success toast
    await expect(
      page.getByText(`Rol '${TEST_ROLE}' succesvol verwijderd van gebruiker.`),
    ).toBeVisible();
  });
});
