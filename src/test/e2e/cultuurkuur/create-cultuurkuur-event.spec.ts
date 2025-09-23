import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test('Create a cultuurkuur event', async ({ baseURL, page }) => {
  await page.goto(`${baseURL}/create`);
  await page.getByRole('button', { name: 'Evenement' }).click();
  await page.getByText('Dit is een evenement voor scholen').click();

  await expect(
    page.getByText(
      'Je evenement zal verschijnen op cultuurkuur.be, het platform voor onderwijs & cultuur',
    ),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Theatervoorstelling' }).click();
  await page.getByRole('button', { name: 'Tekst en muziektheater' }).click();

  await page
    .getByRole('button', { name: 'Tijdstip in overleg met de school' })
    .click();

  await page
    .getByRole('button', { name: 'Op een locatie in overleg met de school' })
    .click();

  await page.getByLabel('Naam van het evenement').click();
  await page.getByLabel('Naam van het evenement').fill('E2E Cultuurkuur Event');

  await page.getByRole('button', { name: 'Opslaan' }).click();

  await page
    .getByRole('button', { name: 'Provincie, regio of gemeente toevoegen' })
    .click();

  // Should get error when trying to save without 'education' regions
  await expect(
    page.getByText('Selecteer minstens één werkingsregio'),
  ).toBeVisible();

  await page.getByText('Regio Leiestreek West-Vlaanderen').click();

  await page.getByRole('button', { name: 'Kortrijk' }).click();
  await page.getByRole('button', { name: 'Zwevegem' }).click();
  await page.getByRole('button', { name: 'Menen' }).click();

  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Opslaan' })
    .click();

  await expect(page.getByText("3 werkingsregio's")).toBeVisible();

  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Should get error when trying to save without education levels
  await expect(
    page.getByText('Selecteer minstens één onderwijsniveau'),
  ).toBeVisible();

  // Add education levels
  await page
    .getByRole('button', { name: 'Onderwijsniveaus toevoegen' })
    .click();

  await page.getByText('Gewoon kleuteronderwijs', { exact: true }).click();
  await page.getByRole('button', { name: 'Kleuter (4-5 jaar)' }).click();
  await page.getByText('Gewoon lager onderwijs', { exact: true }).click();
  await page.getByRole('button', { name: 'Eerste graad' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Opslaan' })
    .click();
  await expect(page.getByText('5 onderwijsniveaus')).toBeVisible();

  // Save event
  await page.getByRole('button', { name: 'Opslaan' }).click();

  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByText('Zorg dat je publiek geen')).toBeVisible();

  await page
    .getByRole('textbox', { name: 'rdw-editor' })
    .fill(faker.lorem.paragraphs(2));

  await expect(page.getByRole('tab', { name: 'Toegang' })).toBeHidden();

  await page.getByRole('tab', { name: 'Prijzen' }).click();

  await expect(
    page.getByText(
      'Voeg een prijs toe voor scholen, per leerling of per groep.',
    ),
  ).toBeVisible();
  await page.getByRole('combobox').selectOption('per leerling');
  await page.getByRole('combobox').selectOption('per groep');

  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

  await page.waitForURL(/\/event\/.*\/preview/, {
    waitUntil: 'domcontentloaded',
  });

  const iframe = page.frameLocator('iframe');
  await expect(iframe.getByText('Specifiek voor scholen')).toBeVisible();
  await expect(
    iframe.getByText('Locatie in overleg met de school.'),
  ).toBeVisible();

  // Edit mode
  await iframe.getByRole('button', { name: 'Bewerken' }).click();

  await page.waitForURL(/\/events\/.*\/edit/, {
    waitUntil: 'domcontentloaded',
  });

  await expect(page.locator('input#scope')).toBeDisabled();
});
