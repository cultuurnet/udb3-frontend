import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Roles Overview - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_roles_overview',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/roles');
  });

  test('can navigate to roles overview page', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Rollen',
    );
  });

  test('can search for roles', async ({ page }) => {
    const initialRows = page.getByRole('row');
    const initialFirstRow = await initialRows.nth(1).textContent();

    const searchInput = page.getByLabel('Zoeken');
    await searchInput.fill('e2e');
    await page.waitForLoadState('networkidle');
    await expect(searchInput).toHaveValue('e2e');
    const e2eRows = page.getByRole('row');
    const e2eResultRow = e2eRows.nth(1).filter({
      hasText: 'e2e',
    });
    await page.waitForLoadState('networkidle');
    await expect(e2eResultRow).toBeVisible();
    // Search shouldn't happen when less than 3 characters are typed.
    await searchInput.fill('ie');

    const stillE2ERows = page.getByRole('row');
    const stillE2EResultRow = stillE2ERows.nth(1).filter({
      hasText: 'e2e',
    });
    await page.waitForLoadState('networkidle');
    await expect(stillE2EResultRow).toBeVisible();

    await searchInput.fill(faker.lorem.words(10));
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Geen rollen gevonden.')).toBeVisible();

    await searchInput.fill('');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Geen rollen gevonden.')).not.toBeVisible();
    const resetRows = page.getByRole('row');
    const resetFirstRow = resetRows.nth(1);
    await expect(resetFirstRow).toHaveText(initialFirstRow);
  });

  test('can paginate roles', async ({ page }) => {
    const searchInput = page.getByLabel('Zoeken');
    await searchInput.fill('eer');
    await page.waitForTimeout(300);
    await page.waitForLoadState('networkidle');

    const firstPageRows = page.getByRole('row');
    const firstPageFirstRow = await firstPageRows.nth(1).textContent();

    const page2Button = page.getByRole('button', { name: /^2$/ });
    await expect(page2Button).toBeVisible();
    await page2Button.click();
    await page.waitForLoadState('networkidle');
    await expect(searchInput).toHaveValue('eer');

    const secondPageRows = page.getByRole('row');
    const secondPageFirstRow = await secondPageRows.nth(1).textContent();
    expect(secondPageFirstRow).not.toEqual(firstPageFirstRow);

    const page1Button = page.getByRole('button', { name: /^1$/ });
    await expect(page1Button).toBeVisible();
    await page1Button.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await expect(searchInput).toHaveValue('eer');

    const resetRows = page.getByRole('row');
    const resetFirstRow = await resetRows.nth(1).textContent();
    expect(resetFirstRow).toEqual(firstPageFirstRow);
  });

  test('can click create role button', async ({ page }) => {
    await page.getByRole('button', { name: 'toevoegen' }).click();
    await expect(page).toHaveURL(/\/manage\/roles\/create/);
  });

  test('can click edit role link', async ({ page }) => {
    const editLink = page.getByRole('link', { name: 'Bewerken' }).first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page).toHaveURL(/\/manage\/roles\/[^/]+/);
    }
  });

  test('can open a modal to delete a role', async ({ page }) => {
    const roleRows = page.getByRole('row');
    const firstRoleRow = roleRows.nth(1);
    const roleName = await firstRoleRow.textContent();

    await firstRoleRow.getByRole('button', { name: 'Verwijderen' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'annuleren' }).click();
    await page.waitForLoadState('networkidle');

    const updatedRoleRows = page.getByRole('row');
    const matchingRoleRow = updatedRoleRows.nth(1).filter({
      hasText: roleName,
    });
    expect(await matchingRoleRow.count()).toBe(1);
  });
});
