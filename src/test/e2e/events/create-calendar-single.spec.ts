import { expect, Page, test } from '@playwright/test';

const dummyEvent = {
  name: 'E2E test event with calendarType single',
  address: {
    zip: '9000',
    municipality: '9000 Gent',
    place: 'S.M.A.K. - Stedelijk Museum voor Actuele Kunst',
  },
};

test('create an event with calendarType single', async ({
  baseURL,
  browser,
}) => {
  let url;

  async function withTimezone(
    url: string,
    timezoneId: string,
    testFn: (page: Page) => Promise<void>,
  ) {
    const context = await browser.newContext({ timezoneId });
    const page = await context.newPage();
    await page.goto(url);
    await page.clock.install({ time: new Date('2023-09-02T12:00:00') });
    await page.waitForLoadState('networkidle');

    await testFn(page);
    await context.close();
  }

  await withTimezone(`${baseURL}/create`, 'Asia/Tokyo', async (page) => {
    // 1. Select event
    await page.getByRole('button', { name: 'Evenement' }).click();
    // 2. Type
    await page.getByRole('button', { name: 'Concert' }).click();

    // 3. Date
    // Use current date
    await page.getByLabel('Start').click();
    await page.getByLabel('Start').fill('2024-01-01');
    await page.getByLabel('Einde').click();
    await page.getByLabel('Einde').fill('2024-01-02');

    await page.getByLabel('Beginuur').click();
    await page.getByLabel('01:00').click();
    await page.getByLabel('Einduur').click();
    await page.getByLabel('02:00').click();

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
    await page.waitForLoadState('networkidle');

    url = page.url();
  });

  await withTimezone(
    url.replace('preview', 'edit'),
    'Europe/Brussels',
    async (page) => {
      expect(await page.getByLabel('Beginuur').inputValue()).toEqual('01:00');

      await page.goto(url);
      await page.waitForLoadState('networkidle');
      expect(
        page.frameLocator('#iframe').getByText('van 01:00 tot 02:00'),
      ).toBeVisible();
    },
  );
});
