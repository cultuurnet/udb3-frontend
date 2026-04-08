import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const dummyEvent = {
  name: 'E2E test event with calendarType multiple',
  address: {
    zip: '1000',
    municipality: '1000 Brussel',
    place: 'Ancienne Belgique',
  },
};

test('create an event with calendarType multiple', async ({
  baseURL,
  page,
}) => {
  await page.goto(`${baseURL}/create`);
  // 1. Select event
  await page.getByRole('button', { name: 'Activiteit' }).click();

  // 2. Type
  await page
    .getByRole('button', { name: 'Fiets- of wandelroute', exact: true })
    .click();

  // 3. Date
  // Add 3 dates in the future
  await page
    .locator('#calendar-step-day-day-1date-period-picker-start')
    .fill(faker.date.future().toLocaleDateString('nl-BE'));
  await page.getByRole('button', { name: 'Dag toevoegen' }).click();

  await page
    .locator('#calendar-step-day-day-2date-period-picker-start')
    .fill(faker.date.future().toLocaleDateString('nl-BE'));
  await page.getByRole('button', { name: 'Dag toevoegen' }).click();

  await page
    .locator('#calendar-step-day-day-3date-period-picker-start')
    .fill(faker.date.future().toLocaleDateString('nl-BE'));

  // 4. Address
  await page.getByLabel('Gemeente').click();
  await page.getByLabel('Gemeente').fill(dummyEvent.address.zip);
  await page
    .getByRole('option', { name: dummyEvent.address.municipality })
    .click();
  await page.getByLabel('Kies een locatie').click();

  await page
    .getByLabel('Kies een locatie')
    .fill(dummyEvent.address.place.substring(0, 3));

  await page
    .getByRole('option', { name: dummyEvent.address.place, exact: true })
    .first()
    .click();

  // 5. Name and Age
  await page.getByLabel('Naam van de activiteit').click();
  await page.getByLabel('Naam van de activiteit').fill(dummyEvent.name);
  await page.getByRole('button', { name: 'Jongeren' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // 6. Publish
  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

  // 7. Validate created event details
  await page.waitForURL(/\/events\/[a-f0-9-]+/);
  await page.waitForLoadState('networkidle');

  // Validate table first column values
  const expectedLabels = [
    'Titel',
    'Type',
    'Thema',
    'Labels',
    'Beschrijving',
    'Waar',
    'Wanneer',
    'Organisatie',
    'Prijsinfo',
    'Tickets & plaatsen',
    'Reservatie',
    'Contactgegevens',
    'Geschikt voor',
    'Afbeeldingen',
    "Video's",
  ];

  const detailsTable = page.locator('section table.details-table').first();
  await detailsTable.waitFor();

  const firstColumnCells = await detailsTable
    .locator('> tbody > tr > td:first-child')
    .allTextContents();

  for (const label of expectedLabels) {
    expect(firstColumnCells).toContain(label);
  }

  // Validate that some rows have "Geen" when empty
  const tableRows = await detailsTable.locator('> tbody > tr').count();

  const expectedEmptyFields = [
    'Thema',
    'Beschrijving',
    'Organisatie',
    'Prijsinfo',
    'Reservatie',
    'Contactgegevens',
    'Afbeeldingen',
    "Video's",
  ];

  for (let i = 0; i < tableRows; i++) {
    const row = detailsTable.locator(`> tbody > tr:nth-child(${i + 1})`);
    const firstColumnValue = await row.locator('> td:first-child').textContent();
    const secondColumnValue = await row.locator('> td:nth-child(2)').textContent();

    if (expectedEmptyFields.includes(firstColumnValue?.trim() ?? '')) {
      expect(secondColumnValue).toContain('Geen');
    } else {
      expect(secondColumnValue?.trim()).not.toBe('');
    }
  }
});
