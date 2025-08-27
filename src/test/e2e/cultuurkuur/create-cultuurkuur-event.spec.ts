import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test('create a cultuurkuur event', async ({ baseURL, page }) => {
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
    .getByRole('button', { name: 'Op een locatie in overleg met de school' })
    .click();

  await page.getByLabel('Naam van het evenement').click();
  await page.getByLabel('Naam van het evenement').fill('E2E Cultuurkuur Event');

  await page.getByRole('button', { name: 'Opslaan' }).click();
  // Should get error when trying to save without 'education' regions

  await page
    .getByRole('button', { name: 'Provincie, regio of gemeente toevoegen' })
    .click();

  await expect(
    page.getByText('Selecteer minstens één werkingsregio'),
  ).toBeVisible();

  await page.getByText('Regio Leiestreek West-Vlaanderen').click();

  await page.getByRole('button', { name: 'Kortrijk' }).click();
  await page.getByRole('button', { name: 'Zwevegem' }).click();
  await page.getByRole('button', { name: 'Menen' }).click();

  await page.getByRole('button', { name: 'Opslaan' }).click();

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
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await expect(page.getByText('5 onderwijsniveaus')).toBeVisible();

  // Save event
  await page.getByRole('button', { name: 'Opslaan' }).click();

  await expect(
    page.getByText('Zorg dat je publiek geen informatie mist'),
  ).toBeVisible();

  await page
    .getByRole('textbox', { name: 'rdw-editor' })
    .fill(faker.lorem.paragraphs(2));

  await page.getByRole('tab', { name: 'Prijzen' }).click();

  await expect(
    page.getByText(
      'Voeg een prijs toe voor scholen, per leerling of per groep.',
    ),
  ).toBeVisible();

  // Verify labels
  //   await page.getByRole('tab', { name: 'Labels' }).click();

  //   await expect(page.getByText('cultuurkuur_op_verplaatsing')).toBeVisible();

  //   await expect(
  //     page.getByText('cultuurkuur_werkingsregio_nis-34042'),
  //   ).toBeVisible();
  //   await expect(
  //     page.getByText('cultuurkuur_werkingsregio_nis-34027'),
  //   ).toBeVisible();
  //   await expect(
  //     page.getByText('cultuurkuur_werkingsregio_nis-34022'),
  //   ).toBeVisible();
  //   await expect(
  //     page.getByText('cultuurkuur_werkingsregio_nis-30000'),
  //   ).toBeVisible();
  //   await expect(page.getByText('cultuurkuur_Kleuter-4-5-jaar')).toBeVisible();
  //   await expect(
  //     page.getByText('cultuurkuur_Gewoon-kleuteronderwijs'),
  //   ).toBeVisible();
  //   await expect(page.getByText('cultuurkuur_1ste-graad')).toBeVisible();
  //   await expect(
  //     page.getByText('cultuurkuur_Gewoon-basisonderwijs'),
  //   ).toBeVisible();
  //   await expect(
  //     page.getByText('cultuurkuur_Gewoon-lager-onderwijs'),
  //   ).toBeVisible();

  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'ck-preview.png' });

  await expect(page.getByText('Specifiek voor scholen')).toBeVisible();
  await expect(
    page.getByText('Bekijk je evenement op cultuurkuur.be'),
  ).toBeVisible();

  await expect(
    page.getByText('Locatie in overleg met de school.'),
  ).toBeVisible();
});
