import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Label Overview - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('/manage/labels');
  });

  test('can navigate to labels overview page', async ({ page }) => {
    await expect(page.getByRole('heading')).toContainText('Labels');
  });

  test('can search for labels', async ({ page }) => {
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
    await expect(e2eResultRow).toBeVisible({ timeout: 8_000 });

    // Search shouldn't happen when less than 2 characters are typed.
    await searchInput.fill('i');

    const stillE2eRows = page.getByRole('row');
    const stillE2EResultRow = stillE2eRows.nth(1).filter({
      hasText: 'e2e',
    });
    await expect(stillE2EResultRow).toBeVisible({ timeout: 8_000 });

    await searchInput.fill(faker.lorem.words(10));
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Geen labels gevonden.')).toBeVisible();

    await searchInput.fill('');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Geen labels gevonden.')).not.toBeVisible();
    const resetRows = page.getByRole('row');
    const resetFirstRow = resetRows.nth(1);
    await expect(resetFirstRow).toHaveText(initialFirstRow);
  });

  test('can paginate labels', async ({ page }) => {
    const searchInput = page.getByLabel('Zoeken');
    await searchInput.fill('de');
    await page.waitForTimeout(300);
    await page.waitForLoadState('networkidle');

    const firstRow = page.getByRole('row').nth(1);
    const initialFirstRow = await firstRow.textContent();

    const page2Button = page.getByRole('button', { name: '2' });
    await expect(page2Button).toBeVisible();
    await page2Button.click();
    await expect(searchInput).toHaveValue('de');
    await expect(firstRow).not.toHaveText(initialFirstRow);

    const page1Button = page.getByRole('button', { name: /^1$/ });
    await expect(page1Button).toBeVisible();
    await page1Button.click();
    await expect(searchInput).toHaveValue('de');
    await expect(firstRow).toHaveText(initialFirstRow);
  });

  test('can click create label button', async ({ page }) => {
    await page.getByRole('button', { name: /toevoegen/i }).click();
    await expect(page).toHaveURL(/\/manage\/labels\/create/);
  });

  test('can click edit label link', async ({ page }) => {
    const editLink = page.getByRole('link', { name: /bewerken/i }).first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page).toHaveURL(/\/manage\/labels\/[^/]+\/edit/);
    }
  });
});
