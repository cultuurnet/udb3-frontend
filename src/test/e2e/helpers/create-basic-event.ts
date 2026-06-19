import type { Page } from '@playwright/test';
import { addDays } from 'date-fns';

export const createBasicEvent = async (
  page: Page,
  baseURL: string,
  name: string,
  date: Date = addDays(new Date(), 1),
  additionalDates: Date[] = [],
) => {
  await page.goto(`${baseURL}/create`);
  await page.getByRole('button', { name: 'Activiteit' }).click();
  await page.getByRole('button', { name: 'Concert' }).click();
  await page
    .locator('#calendar-step-day-day-1date-period-picker-start')
    .fill(date.toLocaleDateString('nl-BE'));
  for (const [index, additionalDate] of additionalDates.entries()) {
    await page.getByRole('button', { name: 'Dag toevoegen' }).click();
    await page
      .locator(`#calendar-step-day-day-${index + 2}date-period-picker-start`)
      .fill(additionalDate.toLocaleDateString('nl-BE'));
  }
  await page.getByLabel('Gemeente').click();
  await page.getByLabel('Gemeente').fill('9000');
  await page.getByRole('option', { name: '9000 Gent' }).click();
  await page.getByLabel('Kies een locatie').click();
  await page.getByLabel('Kies een locatie').fill('S.M');
  await page
    .getByRole('option', { name: 'S.M.A.K.', exact: true })
    .first()
    .click();
  await page.getByLabel('Naam van de activiteit').click();
  await page.getByLabel('Naam van de activiteit').fill(name);
  await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();
};
