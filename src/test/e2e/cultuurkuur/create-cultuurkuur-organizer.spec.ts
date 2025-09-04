import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test('Create a cultuurkuur organizer', async ({ baseURL, page }) => {
  const organizerName = `Cultuurkuur E2E organizer: ${faker.company.name()}`;

  await page.goto(`${baseURL}/organizers/create`);

  await expect(
    page.getByText('Welke organisatie wil je toevoegen?'),
  ).toBeVisible();

  await page.getByRole('textbox', { name: 'Naam' }).fill(organizerName);

  await page
    .getByRole('textbox', { name: 'Website' })
    .fill(`https://${faker.internet.domainName()}`);

  await page
    .getByText('Deze organisatie heeft ook aanbod voor scholen')
    .click();

  await expect(
    page.getByText(
      'Je organisatie zal verschijnen op cultuurkuur.be, het platform voor onderwijs & cultuur. ',
    ),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Opslaan' }).click();

  await page.waitForLoadState('networkidle');

  await expect(
    page.getByText(
      'Voeg een e-mailadres toe waarop scholen je kunnen contacteren.',
    ),
  ).toBeVisible();

  await page.getByRole('tab', { name: 'Voor scholen' }).click();

  await page.getByLabel('Ik werk activiteiten uit op maat van scholen').click();

  await page
    .getByLabel('Ik organiseer ook activiteiten op verplaatsing')
    .click();

  await page
    .getByRole('button', { name: 'Provincie, regio of gemeente toevoegen' })
    .click();

  await page.getByText('Westhoek').click();
  await page.getByRole('button', { name: 'Wervik' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();

  await expect(page.getByText("1 werkingsregio's")).toBeVisible();

  await page
    .getByRole('textbox', { name: 'rdw-editor' })
    .fill(faker.lorem.paragraphs(2));

  await page.getByRole('button', { name: 'Klaar met bewerken' }).click();

  // Preview page
  await page.waitForURL(/\/organizers\/.*\/preview/, {
    waitUntil: 'domcontentloaded',
  });

  await expect(
    page.getByRole('heading', { name: organizerName, exact: false }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Bewerken' }).click();

  await page.waitForURL(/\/organizers\/.*\/edit/, {
    waitUntil: 'domcontentloaded',
  });

  // check if cultuurkuur checkbox is disabled
  await expect(
    page.getByLabel('Deze organisatie heeft ook aanbod voor scholen'),
  ).toBeDisabled();
});
