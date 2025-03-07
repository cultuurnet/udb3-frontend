import { expect, test } from '@playwright/test';

test('can see deletion modal', async ({ baseURL, page }) => {
  await page.goto(baseURL + '/dashboard');
  await page.getByTestId('row-actions').getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Verwijderen' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
