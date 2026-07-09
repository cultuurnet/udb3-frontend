import { expect, test } from '@playwright/test';

import nl from '../../../i18n/nl.json';

test.describe.configure({ mode: 'serial' });

const childcareStartInput = 'input[id$="-childcare-time-span-picker-start"]';
const childcareEndInput = 'input[id$="-childcare-time-span-picker-end"]';
const childcare = nl.create.calendar.days.childcare;

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'ff_boa',
      value: 'true',
      domain: 'localhost',
      path: '/',
    },
  ]);
});

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

  // Errors must NOT be visible before the user touches the inputs
  await expect(
    page.getByText(childcare.validation_messages.start_too_late),
  ).toBeHidden();
  await expect(
    page.getByText(childcare.validation_messages.end_too_early),
  ).toBeHidden();

  // 4. Enable each childcare field independently
  await page.getByRole('checkbox', { name: childcare.before }).click();
  await page.getByRole('checkbox', { name: childcare.after }).click();

  await expect(page.locator(childcareStartInput)).toBeEnabled();
  await expect(page.locator(childcareEndInput)).toBeEnabled();

  await page.locator(childcareStartInput).fill(dummyEvent.hours.childcareStart);
  await page.locator(childcareEndInput).fill(dummyEvent.hours.childcareEnd);
  await page.locator(childcareEndInput).blur();

  // 5. Address
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

  // 6. Name and Age
  await page.getByLabel('Naam van de activiteit').click();
  await page.getByLabel('Naam van de activiteit').fill(dummyEvent.name);
  await page.getByRole('button', { name: 'Volwassenen 18+' }).click();

  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForURL('**/edit');

  // Publish — wait for the button to be ready before clicking
  const publishButton = page.getByRole('button', {
    name: 'Publiceren',
    exact: true,
  });
  await expect(publishButton).toBeEnabled();
  await publishButton.click();
  await expect(publishButton).toBeHidden();
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
  await page.getByLabel('Naam van de activiteit').fill(dummyEvent.name);
  await page.getByRole('button', { name: 'Kinderen 6-11' }).click();

  await page.getByRole('button', { name: 'Opslaan' }).click();

  await page.waitForURL('**/edit');

  // Publish — wait for the button to be ready before clicking
  const publishButton = page.getByRole('button', {
    name: 'Publiceren',
    exact: true,
  });
  await expect(publishButton).toBeEnabled();
  await publishButton.click();
  await expect(publishButton).toBeHidden();
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

  await expect(
    page.getByText(childcare.validation_messages.start_too_late),
  ).toBeHidden();
  await expect(
    page.getByText(childcare.validation_messages.end_too_early),
  ).toBeHidden();

  // 4. Enable and touch the start input with an invalid value — start error
  //    appears, end error stays hidden because it has not been touched yet.
  await page.getByRole('checkbox', { name: childcare.before }).click();
  await expect(page.locator(childcareStartInput)).toBeEnabled();
  await page.locator(childcareStartInput).fill('11:00');
  await page.locator(childcareStartInput).blur();
  await expect(
    page.getByText(childcare.validation_messages.start_too_late),
  ).toBeVisible();
  await expect(
    page.getByText(childcare.validation_messages.end_too_early),
  ).toBeHidden();

  // 5. Enable and touch the end input with an invalid value — end error now
  //    visible too.
  await page.getByRole('checkbox', { name: childcare.after }).click();
  await page.locator(childcareEndInput).fill('15:00');
  await page.locator(childcareEndInput).blur();
  await expect(
    page.getByText(childcare.validation_messages.end_too_early),
  ).toBeVisible();

  // 6. Disabling the start field clears its value and its error
  await page.getByRole('checkbox', { name: childcare.before }).click();
  await expect(page.locator(childcareStartInput)).toBeDisabled();
  await expect(page.locator(childcareStartInput)).toHaveValue('');
  await expect(
    page.getByText(childcare.validation_messages.start_too_late),
  ).toBeHidden();
});
