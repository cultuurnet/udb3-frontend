import type { Page } from '@playwright/test';

import nl from '../../../i18n/nl.json';
import { isBoaEnabled } from '../setup/feature-flags';

const calendar = nl.create.calendar;
const fixedDays = calendar.fixed_days;
const openingHoursModal = calendar.opening_hours_modal;

export const addWeeklyOpeningHours = async (page: Page, days: string[]) => {
  await page
    .getByRole('button', {
      name: isBoaEnabled
        ? fixedDays.button_add_hours
        : fixedDays.button_add_opening_hours,
    })
    .click();

  if (isBoaEnabled) {
    const modal = page.getByRole('dialog');
    await modal
      .getByRole('button', { name: openingHoursModal.select_days })
      .click();
    for (const day of days) {
      await modal.getByRole('checkbox', { name: day }).click();
    }
    await modal
      .getByRole('button', { name: openingHoursModal.button_confirm })
      .click();
    return;
  }

  for (const day of days) {
    await page.getByText(day, { exact: true }).click();
  }
  await page.getByRole('button', { name: nl.create.actions.save }).click();
};
