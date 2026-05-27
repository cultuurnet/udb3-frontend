import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { addDays, format } from 'date-fns';

import nl from '../../../i18n/nl.json';

const formatDate = (date: Date) => format(date, 'dd/MM/yyyy');
const today = new Date();

const calendar = nl.create.calendar;
const dp = nl.date_period_picker;

const cookies = [
  { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
];

const createPermanentEvent = async (page: Page, baseURL: string) => {
  await page.goto(`${baseURL}/create`);
  await page
    .getByRole('button', { name: nl.steps.offerTypeStep.types.event })
    .click();
  await page.getByRole('button', { name: 'Concert' }).click();
  await page.getByRole('button', { name: calendar.types.fixed_days }).click();
  await page
    .getByRole('radio', { name: calendar.fixed_days.permanent })
    .click();
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

test.describe.serial('Calendar opening hours modal', () => {
  let editUrl: string;

  test.beforeAll(async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await context.addCookies(cookies);
    const page = await context.newPage();
    await createPermanentEvent(page, baseURL);
    await page.getByRole('button', { name: nl.create.actions.save }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    editUrl = page.url();
    await context.close();
  });

  test.beforeEach(async ({ context, page }) => {
    await context.addCookies(cookies);
    await page.goto(editUrl);
    await page.waitForLoadState('networkidle');
  });

  test('add opening hours to a permanent event', async ({ page }) => {
    await page
      .getByRole('button', {
        name: calendar.fixed_days.button_add_hours,
      })
      .click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await expect(
      modal.getByRole('button', {
        name: calendar.opening_hours_modal.button_confirm,
      }),
    ).toBeDisabled();

    await modal
      .getByRole('button', { name: calendar.opening_hours_modal.select_days })
      .click();
    await modal
      .getByRole('checkbox', { name: calendar.days.full.monday })
      .click();

    await modal
      .getByLabel(calendar.opening_hours_modal.start_time, { exact: true })
      .first()
      .fill('09:00');
    await modal
      .getByLabel(calendar.opening_hours_modal.end_time, { exact: true })
      .first()
      .fill('17:00');

    await modal.getByLabel(calendar.days.childcare.label).click();
    await expect(
      modal.getByText(
        calendar.days.childcare.validation_messages.set_times_required,
      ),
    ).toBeVisible();
    await modal
      .getByLabel(calendar.days.childcare.from, { exact: true })
      .nth(1)
      .fill('08:00');
    await modal
      .getByLabel(calendar.days.childcare.to, { exact: true })
      .nth(1)
      .fill('18:00');
    await modal
      .getByLabel(calendar.days.childcare.to, { exact: true })
      .nth(1)
      .blur();
    await expect(
      modal.getByText(
        calendar.days.childcare.validation_messages.set_times_required,
      ),
    ).toBeHidden();

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.button_add_hours,
      })
      .click();
    await expect(
      modal
        .getByLabel(calendar.opening_hours_modal.start_time, { exact: true })
        .and(modal.locator(':not([disabled])'))
        .nth(1),
    ).toBeVisible();

    await modal
      .getByRole('button', { name: calendar.opening_hours_modal.select_days })
      .click();
    await modal
      .getByRole('checkbox', { name: calendar.days.full.tuesday })
      .click();

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.button_confirm,
      })
      .click();
    await expect(modal).toBeHidden();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', {
        name: calendar.fixed_days.overview.edit,
      }),
    ).toBeVisible();
    await expect(page.getByText(calendar.days.full.monday)).toBeVisible();
    await expect(page.getByText(calendar.days.full.tuesday)).toBeVisible();
    await expect(page.getByText('09:00 - 17:00')).toBeVisible();
    await expect(
      page.getByText(
        calendar.fixed_days.overview.childcare_before.replace(
          '{{start}}',
          '08:00',
        ),
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        calendar.fixed_days.overview.childcare_after.replace(
          '{{end}}',
          '18:00',
        ),
      ),
    ).toBeVisible();
  });

  test('add deviating period to a permanent event', async ({ page }) => {
    await page
      .getByRole('button', {
        name: calendar.fixed_days.overview.edit,
      })
      .click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.deviating.title,
      })
      .click();
    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.deviating.add_period,
      })
      .click();

    await modal.getByLabel(dp.start).fill(formatDate(addDays(today, 7)));
    await modal.getByLabel(dp.end).fill(formatDate(addDays(today, 12)));
    await modal
      .getByPlaceholder(
        calendar.opening_hours_modal.deviating.description_placeholder,
      )
      .fill('E2E deviating period description');

    await modal
      .getByRole('button', { name: calendar.opening_hours_modal.select_days })
      .last()
      .click();
    await modal
      .getByRole('checkbox', { name: calendar.days.full.monday })
      .click();

    await modal
      .getByLabel(calendar.opening_hours_modal.start_time, { exact: true })
      .and(modal.locator(':not([disabled])'))
      .last()
      .fill('10:00');
    await modal
      .getByLabel(calendar.opening_hours_modal.end_time, { exact: true })
      .and(modal.locator(':not([disabled])'))
      .last()
      .fill('16:00');

    await modal.getByLabel(calendar.days.childcare.label).last().click();
    await modal
      .getByLabel(calendar.days.childcare.from, { exact: true })
      .last()
      .fill('09:00');
    await modal
      .getByLabel(calendar.days.childcare.to, { exact: true })
      .last()
      .fill('17:00');
    await modal
      .getByLabel(calendar.days.childcare.to, { exact: true })
      .last()
      .blur();

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.button_confirm,
      })
      .click();
    await expect(modal).toBeHidden();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText(calendar.fixed_days.overview.deviating_except),
    ).toBeVisible();
    await expect(
      page.getByText(
        `${formatDate(addDays(today, 7))} - ${formatDate(addDays(today, 12))}`,
      ),
    ).toBeVisible();
    await expect(
      page.getByText('(E2E deviating period description)'),
    ).toBeVisible();
    await expect(
      page.getByText(calendar.fixed_days.overview.deviating_then_weekly),
    ).toBeVisible();
    await expect(
      page.getByText(calendar.days.full.monday).last(),
    ).toBeVisible();
    await expect(page.getByText('10:00 - 16:00')).toBeVisible();
    await expect(
      page.getByText(
        calendar.fixed_days.overview.childcare_before.replace(
          '{{start}}',
          '09:00',
        ),
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        calendar.fixed_days.overview.childcare_after.replace(
          '{{end}}',
          '17:00',
        ),
      ),
    ).toBeVisible();
  });

  test('add closing period to a permanent event', async ({ page }) => {
    await page
      .getByRole('button', {
        name: calendar.fixed_days.overview.edit,
      })
      .click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.closing.title,
      })
      .click();
    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.closing.add_period,
      })
      .click();

    await modal
      .getByLabel(dp.start)
      .last()
      .fill(formatDate(addDays(today, 14)));
    await modal
      .getByLabel(dp.end)
      .last()
      .fill(formatDate(addDays(today, 18)));
    await modal
      .getByPlaceholder(
        calendar.opening_hours_modal.closing.description_placeholder,
      )
      .last()
      .fill('E2E closing period description');

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.button_confirm,
      })
      .click();
    await expect(modal).toBeHidden();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText(calendar.fixed_days.overview.closed),
    ).toBeVisible();
    await expect(
      page.getByText(
        `${formatDate(addDays(today, 14))} - ${formatDate(addDays(today, 18))}`,
      ),
    ).toBeVisible();
    await expect(
      page.getByText('(E2E closing period description)'),
    ).toBeVisible();
  });

  test('delete all opening hours', async ({ page }) => {
    await page
      .getByRole('button', { name: calendar.fixed_days.overview.delete })
      .click();

    const confirmModal = page.getByRole('dialog');
    await expect(confirmModal).toBeVisible();
    await confirmModal
      .getByRole('button', {
        name: calendar.fixed_days.overview.delete_modal.confirm,
      })
      .click();
    await expect(confirmModal).toBeHidden();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: calendar.fixed_days.button_add_hours }),
    ).toBeVisible();
  });
});
