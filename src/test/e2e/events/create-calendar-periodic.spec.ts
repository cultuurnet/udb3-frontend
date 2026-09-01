import { faker } from '@faker-js/faker';
import { test } from '@playwright/test';

import nl from '../../../i18n/nl.json';
import { isBoaEnabled } from '../setup/feature-flags';

const calendar = nl.create.calendar;
const fixedDays = calendar.fixed_days;
const shortDays = calendar.days.short;
const openingHoursModal = calendar.opening_hours_modal;

const dummyEvent = {
  name: 'E2E test event with calendarType permanent and openinghours',
  address: {
    zip: '8500',
    municipality: '8500 Kortrijk',
    place: 'Kreun',
  },
};

const startDate = faker.date.future();
const endDate = faker.date.future({ refDate: startDate });

test('create an event with calendarType permanent and openinghours', async ({
  baseURL,
  page,
}) => {
  await page.goto(`${baseURL}/create`);
  // 1. Select event
  await page.getByRole('button', { name: 'Activiteit' }).click();

  // 2. Type
  await page.getByRole('button', { name: 'Beurs', exact: true }).click();

  // 3. Date
  // Select fixed days
  await page
    .getByRole('button', { name: 'Op vaste wekelijkse momenten of doorlopend' })
    .click();

  await page
    .locator('#calendar-step-fixeddate-period-picker-start')
    .fill(startDate.toLocaleDateString('nl-BE'));

  await page
    .locator('#calendar-step-fixeddate-period-picker-end')
    .fill(endDate.toLocaleDateString('nl-BE'));

  await page
    .getByRole('button', {
      name: isBoaEnabled
        ? fixedDays.button_add_hours
        : fixedDays.button_add_opening_hours,
    })
    .click();
  // // openinghours
  const selectedDays = [
    shortDays.monday,
    shortDays.wednesday,
    shortDays.friday,
  ];

  if (isBoaEnabled) {
    const modal = page.getByRole('dialog');
    await modal
      .getByRole('button', { name: openingHoursModal.select_days })
      .click();
    for (const day of selectedDays) {
      await modal.getByRole('checkbox', { name: day }).click();
    }
    await modal
      .getByRole('button', { name: openingHoursModal.button_confirm })
      .click();
  } else {
    for (const day of selectedDays) {
      await page.getByText(day, { exact: true }).click();
    }
    await page.getByRole('button', { name: 'Opslaan' }).click();
  }

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
    .getByRole('option', { name: dummyEvent.address.place })
    .first()
    .click();

  // 5. Name and Age
  await page.getByLabel('Naam van de activiteit').click();
  await page.getByLabel('Naam van de activiteit').fill(dummyEvent.name);
  await page.getByRole('button', { name: 'Alle leeftijden' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Publish
  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();
});
