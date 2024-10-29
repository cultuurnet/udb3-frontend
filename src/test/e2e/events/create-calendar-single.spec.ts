import { expect, test } from '@playwright/test';
import { withTimezone } from '@/test/e2e/withTimezone';

const dummyEvent = {
  name: 'E2E test event with calendarType single',
  address: {
    zip: '9000',
    municipality: '9000 Gent',
    place: 'S.M.A.K. - Stedelijk Museum voor Actuele Kunst',
  },
};

test('create an event with calendarType single', async ({ baseURL, page }) => {
  await page.goto(`${baseURL}/create`);
  // 1. Select event
  await page.getByRole('button', { name: 'Evenement' }).click();
  // 2. Type
  await page.getByRole('button', { name: 'Concert' }).click();
  // 3. Date
  // Use current date

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
  await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Publish
  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();
});

test('create an event with calendarType single in Tokyo', async ({
  baseURL,
  browser,
}) => {
  let url;

  await withTimezone({ browser, timezoneId: 'Asia/Tokyo' }, async (page) => {
    await page.goto(`${baseURL}/create`);
    // 1. Select event
    await page.getByRole('button', { name: 'Evenement' }).click();
    // 2. Type
    await page.getByRole('button', { name: 'Concert' }).click();

    // 3. Date
    // Use current date
    await page.getByLabel('Beginuur').click();
    await page.getByLabel('01:00').click();

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
    await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
    await page.getByRole('button', { name: 'Opslaan' }).click();

    // Publish
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    url = page.url();
  });

  await withTimezone(
    { browser, timezoneId: 'Europe/Brussels' },
    async (page) => {
      await page.goto(url);
      const startHour = page.getByLabel('Beginuur');
      await expect(startHour).toBeVisible();
      expect(await startHour.inputValue()).toEqual('01:00');
    },
  );
});
