import { expect, type Locator, type Page, test } from '@playwright/test';
import { format } from 'date-fns';

import nl from '../../../i18n/nl.json';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const calendar = nl.create.calendar;
const age = nl.create.name_and_age.age;

const cookies = [
  { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
];

const timestamp = Date.now();

const dummyEvent = {
  name: `E2E Preview Content Test ${timestamp}`,
  description: 'Dit is een testbeschrijving voor de E2E preview test.',
  theme: 'Dance muziek',
  location: 'S.M.A.K.',
  municipality: '9000 Gent',
  contactEmail: `contact-${timestamp}@example.com`,
  bookingEmail: `booking-${timestamp}@example.com`,
  bookingPhone: '+32123456789',
  bookingUrl: 'https://www.example.com',
  imageDescription: 'Testafbeelding beschrijving',
  imageCopyright: 'Test copyright',
  video: 'https://www.youtube.com/watch?v=lkIFF4maKMU',
  organizerName: 'Democrazy',
  label: 'publiq',
};

const getRowByLabel = (page: Page, detailsTable: Locator, label: string) =>
  detailsTable.locator('> tbody > tr').filter({
    has: page.locator('td:first-child', { hasText: label }),
  });

test.describe.serial('Event Preview Content', () => {
  let eventPreviewUrl: string;
  let detailsTable: Locator;

  test.beforeAll(async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await context.addCookies(cookies);
    const page = await context.newPage();
    suppressHydrationErrors(page);

    await page.goto(`${baseURL}/create`);
    await page
      .getByRole('button', { name: nl.steps.offerTypeStep.types.event })
      .click();
    await page.getByRole('button', { name: 'Concert' }).click();
    await page.getByRole('button', { name: dummyEvent.theme }).click();
    await page.getByRole('button', { name: calendar.types.fixed_days }).click();
    await page
      .getByRole('radio', { name: calendar.fixed_days.permanent })
      .click();

    await page.getByLabel(nl.city_picker.label_be).click();
    await page.getByLabel(nl.city_picker.label_be).fill('9000');
    await page.getByRole('option', { name: dummyEvent.municipality }).click();
    await page.getByLabel(nl.create.location.recent_locations.pick).click();
    await page
      .getByLabel(nl.create.location.recent_locations.pick)
      .fill('S.M.A');
    await page
      .getByRole('option', { name: dummyEvent.location, exact: true })
      .first()
      .click();

    await page
      .getByLabel(nl.create.name_and_age.name.title_events)
      .fill(dummyEvent.name);
    await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
    await page.getByRole('button', { name: nl.create.actions.save }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: calendar.fixed_days.button_add_hours })
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
    await modal
      .getByLabel(calendar.opening_hours_modal.end_time, { exact: true })
      .first()
      .blur();

    await expect(
      modal.getByRole('button', {
        name: calendar.opening_hours_modal.button_confirm,
      }),
    ).toBeEnabled();

    await modal
      .getByRole('button', {
        name: calendar.opening_hours_modal.button_confirm,
      })
      .click();
    await expect(modal).toBeHidden();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText(calendar.days.short.monday, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('09:00 - 17:00')).toBeVisible();

    await page
      .getByRole('textbox', { name: 'rdw-editor' })
      .fill(dummyEvent.description);
    await page.getByText('Geef een enthousiaste').click();

    await page.getByRole('tab', { name: 'Afbeelding & video' }).click();
    await page.getByRole('button', { name: 'Afbeelding toevoegen' }).click();
    await page.setInputFiles('input[type="file"]', 'upload/e2e-image.jpg');
    await page
      .getByRole('textbox', { name: 'Beschrijving' })
      .fill(dummyEvent.imageDescription);
    await page.getByLabel('Copyright').fill(dummyEvent.imageCopyright);
    await page.getByRole('button', { name: 'Uploaden' }).click();
    await expect(page.getByText(dummyEvent.imageDescription)).toBeVisible();

    await page.getByRole('button', { name: 'Videolink toevoegen' }).click();
    await page
      .getByLabel('Link')
      .locator('visible=true')
      .fill(dummyEvent.video);
    await page.getByRole('button', { name: 'Toevoegen', exact: true }).click();

    await page.getByRole('tab', { name: 'Prijzen' }).click();
    await page.getByTestId('basic-rate').fill('10');

    await page.getByRole('tab', { name: 'Organisatie' }).click();
    await page.getByRole('button', { name: 'Democrazy 9000 Gent' }).click();

    await page.getByRole('tab', { name: 'Contact' }).click();
    await page
      .getByRole('button', { name: 'Contactgegevens toevoegen' })
      .click();
    await page.getByTestId('contact-info-value').fill(dummyEvent.contactEmail);

    await page.getByRole('tab', { name: 'Reservatie' }).click();
    await page.getByPlaceholder('E-mailadres').fill(dummyEvent.bookingEmail);
    await page.getByPlaceholder('Telefoonnummer').fill(dummyEvent.bookingPhone);
    await page.getByPlaceholder('Website').fill(dummyEvent.bookingUrl);

    await page.getByRole('tab', { name: 'Labels' }).click();
    await page.getByLabel('Verfijn met labels').fill(dummyEvent.label);
    await page.getByRole('option', { name: dummyEvent.label }).click();

    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(age.audience.question)).toBeVisible();

    const audiencePut = page.waitForResponse(
      (res) =>
        res.url().includes('/audience') &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await page.locator('#audience-children-only').click();
    await audiencePut;

    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+/);

    const eventId = page.url().match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';
    eventPreviewUrl = `/events/${eventId}`;

    await context.close();
  });

  test.beforeEach(async ({ context, page }) => {
    await context.addCookies(cookies);
    suppressHydrationErrors(page);
    await page.goto(eventPreviewUrl);
    await page.getByRole('button', { name: 'Bewerken' }).waitFor();
    detailsTable = page.locator('section table.details-table').first();
  });

  test('shows event title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: dummyEvent.name }),
    ).toBeVisible();
  });

  test('shows publication status', async ({ page }) => {
    await expect(
      page.getByText(
        nl.dashboard.row_status.PUBLISHED.replace(
          '{{date}}',
          format(new Date(), 'dd/MM/yyyy'),
        ),
      ),
    ).toBeVisible();
  });

  test('shows event type and theme', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.type).locator(
        'td:nth-child(2)',
      ),
    ).toContainText('Concert');

    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.theme).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.theme);
  });

  test('shows event description', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.description).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.description);
  });

  test('shows event location', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.location).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.location);
  });

  test('shows age range and children-only label', async ({ page }) => {
    const ageCell = getRowByLabel(
      page,
      detailsTable,
      nl.preview.labels.age,
    ).locator('td:nth-child(2)');

    await expect(ageCell).toContainText(
      nl.preview.ages.replace('{{ages}}', '6-11'),
    );
    await expect(ageCell).toContainText(nl.preview.children_only);
  });

  test('shows opening hours summary in calendar row', async ({ page }) => {
    await expect(
      page.getByText(calendar.fixed_days.overview.weekly_on),
    ).toBeVisible();
    await expect(
      page.getByText(calendar.days.short.monday, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('09:00 - 17:00')).toBeVisible();
  });

  test('shows organizer', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.organizer).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.organizerName);
  });

  test('shows price info with nested table', async ({ page }) => {
    const priceRow = getRowByLabel(page, detailsTable, nl.preview.labels.price);

    await expect(priceRow.locator('td:nth-child(2)').first()).toContainText(
      '10',
    );
  });

  test('shows booking info', async ({ page }) => {
    const bookingCell = getRowByLabel(
      page,
      detailsTable,
      nl.preview.labels.booking_info,
    ).locator('td:nth-child(2)');

    await expect(bookingCell.first()).toContainText(dummyEvent.bookingEmail);
    await expect(bookingCell.first()).toContainText(dummyEvent.bookingPhone);
    await expect(bookingCell.first()).toContainText(dummyEvent.bookingUrl);
  });

  test('shows contact info', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.contact).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.contactEmail);
  });

  test('shows label', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.labels).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.label);
  });

  test('shows image with description', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.image).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.imageDescription);
  });

  test('shows video', async ({ page }) => {
    await expect(
      getRowByLabel(page, detailsTable, nl.preview.labels.video).locator(
        'td:nth-child(2)',
      ),
    ).toContainText(dummyEvent.video);
  });
});
