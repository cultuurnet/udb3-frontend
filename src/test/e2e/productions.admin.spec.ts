import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test('As an admin I can change the name of a production', async ({
  baseURL,
  page,
}) => {
  const newProductionName = `E2E: ${faker.music.songName()} (admin)`;
  await page.goto(baseURL + '/dashboard');

  await page.getByRole('link', { name: 'Producties' }).click();

  await page.getByRole('button', { name: 'Naam wijzigen' }).click();

  await page.locator('input#name').fill(newProductionName);

  await page.getByRole('button', { name: 'Bevestigen' }).click();

  await expect(
    page.locator('ul#productions-list').locator('li').first(),
  ).toContainText(newProductionName);
});
