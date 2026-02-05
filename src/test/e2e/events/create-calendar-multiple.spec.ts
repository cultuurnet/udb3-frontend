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
  await page.getByRole('button', { name: 'Evenement' }).click();

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
  await page.getByLabel('Naam van het evenement').click();
  await page.getByLabel('Naam van het evenement').fill(dummyEvent.name);
  await page.getByRole('button', { name: 'Jongeren' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // 6. Publish
  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

  // 7. Validate created event details
  await page.waitForURL(/\/event\/[a-f0-9-]+\/preview/);
  const url = page.url();
  const eventId = url.match(/\/event\/([a-f0-9-]+)\/preview/)?.[1];
  // Navigate to a different path using the captured UUID
  await page.goto(`/events/${eventId}`);
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
    'Publicatie',
    'Reservatie',
    'Contactgegevens',
    'Geschikt voor',
    'Afbeeldingen',
    "Video's",
  ];

  const firstColumnCells = await page
    .locator('table.table > tbody > tr > td:first-child')
    .allTextContents();

  for (const label of expectedLabels) {
    expect(firstColumnCells).toContain(label);
  }

  // Validate that some rows have "Geen" when empty
  const tableRows = await page.locator('table.table > tbody > tr').count();

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
    const firstColumnValue = await page
      .locator(`table.table > tbody > tr:nth-child(${i + 1}) > td:nth-child(1)`)
      .textContent();

    const secondColumnValue = await page
      .locator(`table.table > tbody > tr:nth-child(${i + 1}) > td:nth-child(2)`)
      .textContent();

    if (expectedEmptyFields.includes(firstColumnValue?.trim() ?? '')) {
      expect(secondColumnValue).toContain('Geen');
    } else {
      expect(secondColumnValue?.trim()).not.toBe('');
    }
  }
});
