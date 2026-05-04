import { expect, test } from '@playwright/test';

const dummyEvent = {
  name: 'E2E test event with childcare hours',
  address: {
    zip: '9000',
    municipality: '9000 Gent',
    place: 'S.M.A.K. - Stedelijk Museum voor Actuele Kunst',
  },
  hours: {
    activityStart: '10:00',
    activityEnd: '16:00',
    childcareStart: '08:00',
    childcareEnd: '18:00',
  },
};

test('create an event with calendarType single and childcare hours', async ({
  baseURL,
  page,
}) => {
  await page.goto(`${baseURL}/create`);

  // 1. Select event
  await page.getByRole('button', { name: 'Activiteit' }).click();

  // 2. Type
  await page.getByRole('button', { name: 'Concert' }).click();

  // 3. Activity hours — set explicit times so childcare can sit outside the range
  await page.getByLabel('Beginuur').fill(dummyEvent.hours.activityStart);
  await page.getByLabel('Einduur').fill(dummyEvent.hours.activityEnd);

  // 4. Toggle Kinderopvang
  await page.getByLabel('Kinderopvang').click();

  // 5. Childcare hours
  await page
    .locator('#calendar-step-day-day-1-childcare-time-span-picker-start')
    .fill(dummyEvent.hours.childcareStart);
  await page
    .locator('#calendar-step-day-day-1-childcare-time-span-picker-end')
    .fill(dummyEvent.hours.childcareEnd);

  // 6. Address
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

  // 7. Name and Age
  await page.getByLabel('Naam van de activiteit').click();
  await page.getByLabel('Naam van de activiteit').fill(dummyEvent.name);
  await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
});

test('create a Kamp of vakantie event with overnight stay', async ({
  baseURL,
  page,
}) => {
  await page.goto(`${baseURL}/create`);

  // 1. Select event
  await page.getByRole('button', { name: 'Activiteit' }).click();

  // 2. Type — Kamp of vakantie (only this type shows the Overnachting column)
  await page.getByRole('button', { name: 'Kamp of vakantie' }).click();

  // 3. Toggle Overnachting
  await page.getByLabel('Met overnachting').click();

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
  await page
    .getByLabel('Naam van de activiteit')
    .fill('E2E test event with overnight stay');
  await page.getByRole('button', { name: 'Kinderen 6-11' }).click();
});

test('does not show Overnachting column for a non-Kamp event type', async ({
  baseURL,
  page,
}) => {
  await page.goto(`${baseURL}/create`);

  await page.getByRole('button', { name: 'Activiteit' }).click();
  await page.getByRole('button', { name: 'Concert' }).click();

  await expect(page.getByText('Overnachting')).toBeHidden();
});

test('shows childcare validation errors when times overlap activity hours', async ({
  baseURL,
  page,
}) => {
  await page.goto(`${baseURL}/create`);

  // 1. Select event
  await page.getByRole('button', { name: 'Activiteit' }).click();

  // 2. Type
  await page.getByRole('button', { name: 'Concert' }).click();

  // 3. Activity hours — 10:00–16:00
  await page.getByLabel('Beginuur').fill('10:00');
  await page.getByLabel('Einduur').fill('16:00');

  // 4. Toggle Kinderopvang
  await page.getByLabel('Kinderopvang').click();

  // 5. Set invalid childcare hours — start after activity start, end before activity end
  await page
    .locator('#calendar-step-day-day-1-childcare-time-span-picker-start')
    .fill('11:00');
  await page
    .locator('#calendar-step-day-day-1-childcare-time-span-picker-end')
    .fill('15:00');

  // 6. Both validation errors should be visible
  await expect(
    page.getByText(
      'Het startuur van de kinderopvang moet voor het startuur van de activiteit liggen.',
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Het einduur van de kinderopvang moet na het einduur van de activiteit liggen.',
    ),
  ).toBeVisible();
});
