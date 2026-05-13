import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import nl from '../../../i18n/nl.json';

const calendar = nl.create.calendar;

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

const createPermanentEvent = async (page: Page, baseURL: string) => {
  await page.goto(`${baseURL}/create`);
  await page.getByRole('button', { name: nl.steps.offerTypeStep.types.event }).click();
  await page.getByRole('button', { name: 'Concert' }).click();
  await page
    .getByRole('button', { name: calendar.types.fixed_days })
    .click();
  await page.getByRole('radio', { name: calendar.fixed_days.permanent }).click();
  await page.getByLabel(nl.city_picker.label_be).click();
  await page.getByLabel(nl.city_picker.label_be).fill('9000');
  await page.getByRole('option', { name: '9000 Gent' }).click();
  await page.getByLabel(nl.create.location.recent_locations.pick).click();
  await page.getByLabel(nl.create.location.recent_locations.pick).fill('S.M');
  await page
    .getByRole('option', { name: 'S.M.A.K.', exact: true })
    .first()
    .click();
  await page.getByLabel(nl.create.name_and_age.name.title_events).click();
  await page
    .getByLabel(nl.create.name_and_age.name.title_events)
    .fill('E2E test CalendarOpeningHoursModal');
  await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
};

test('add opening hours to a permanent event', async ({ baseURL, page }) => {
  await createPermanentEvent(page, baseURL);

  await page
    .getByRole('button', { name: calendar.fixed_days.button_add_opening_hours })
    .click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  await modal
    .getByRole('button', { name: calendar.opening_hours_modal.button_confirm })
    .click();
  await expect(
    modal.getByText(
      calendar.opening_hours_modal.validation_messages.day_of_week.min,
    ),
  ).toBeVisible();

  await modal
    .getByRole('button', { name: calendar.opening_hours_modal.select_days })
    .click();
  await modal.getByRole('checkbox', { name: calendar.days.full.monday }).click();

  await modal
    .locator('#openinghours-row-timespan-openinghours-2-time-span-picker-start')
    .fill('09:00');
  await modal
    .locator('#openinghours-row-timespan-openinghours-2-time-span-picker-end')
    .fill('17:00');

  await modal.getByLabel(calendar.days.childcare.label).click();
  await expect(
    modal.getByText(calendar.days.childcare.validation_messages.set_times_required),
  ).toBeVisible();
  await modal
    .locator(
      'input#openinghours-childcare-timespan-openinghours-2-time-span-picker-start',
    )
    .fill('08:00');
  await modal
    .locator(
      'input#openinghours-childcare-timespan-openinghours-2-time-span-picker-end',
    )
    .fill('18:00');
  await modal
    .locator(
      'input#openinghours-childcare-timespan-openinghours-2-time-span-picker-end',
    )
    .blur();
  await expect(
    modal.getByText(calendar.days.childcare.validation_messages.set_times_required),
  ).toBeHidden();
  await modal.getByLabel(calendar.days.childcare.label).click();

  await modal
    .getByRole('button', { name: calendar.opening_hours_modal.button_add_hours })
    .click();
  await expect(
    modal.locator(
      '#openinghours-row-timespan-openinghours-3-time-span-picker-start',
    ),
  ).toBeVisible();

  await modal
    .getByRole('button', { name: calendar.opening_hours_modal.select_days })
    .click();
  await modal.getByRole('checkbox', { name: calendar.days.full.tuesday }).click();

  await modal
    .getByRole('button', { name: calendar.opening_hours_modal.button_confirm })
    .click();
  await expect(modal).toBeHidden();
  await page.getByRole('button', { name: nl.create.actions.save }).click();
  await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('button', { name: calendar.fixed_days.button_change_opening_hours }),
  ).toBeVisible();
  await expect(page.getByText(calendar.days.full.monday)).toBeVisible();
  await expect(page.getByText(calendar.days.full.tuesday)).toBeVisible();
  await expect(page.getByText('09:00 - 17:00')).toBeVisible();
});
