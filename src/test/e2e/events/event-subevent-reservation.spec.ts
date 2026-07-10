import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect, test as base } from '@playwright/test';
import { addDays } from 'date-fns';

import { createBasicEvent } from '../helpers/create-basic-event';

type TestFixtures = {
  singleEventId: string;
  multipleEventId: string;
};

const publishAndGetId = async (page: Page) => {
  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();
  await page.waitForURL(/\/events\/[a-f0-9-]+/);
  return page.url().match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';
};

const test = base.extend<TestFixtures>({
  singleEventId: async ({ page, baseURL }, applyFixture) => {
    await createBasicEvent(
      page,
      baseURL!,
      `E2E Single Reservation ${Date.now()}`,
      addDays(new Date(), 1),
    );
    await applyFixture(await publishAndGetId(page));
  },
  multipleEventId: async ({ page, baseURL }, applyFixture) => {
    await createBasicEvent(
      page,
      baseURL!,
      `E2E Multiple Reservation ${Date.now()}`,
      addDays(new Date(), 1),
      [addDays(new Date(), 10)],
    );
    await applyFixture(await publishAndGetId(page));
  },
});

const openReservationTab = (page: Page) =>
  page.getByRole('tab', { name: 'Reservatie' }).click();

const waitForSubEventsPatch = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/sub-events') &&
      response.request().method() === 'PATCH',
  );

const waitForCalendarPut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/calendar') &&
      response.request().method() === 'PUT',
  );

const waitForBookingInfoPut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/bookingInfo') &&
      response.request().method() === 'PUT',
  );

const dayRows = (page: Page) =>
  page.locator('li').filter({
    has: page.locator(
      '[id^="calendar-step-day-day-"][id$="date-period-picker-start"]',
    ),
  });

const setCapacity = async (page: Page, id: string, capacity: string) => {
  await page.locator(id).fill(capacity);
  const patch = waitForSubEventsPatch(page);
  await page.locator(id).blur();
  await patch;
};

const randomCapacity = () => String(faker.number.int({ min: 1, max: 500 }));

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
  ]);
});

test.describe('Single-date event reservation', () => {
  test('stores capacity on the subEvent level', async ({
    page,
    baseURL,
    singleEventId,
  }) => {
    const capacity = randomCapacity();

    await page.goto(`${baseURL}/events/${singleEventId}/edit`);
    await openReservationTab(page);

    await expect(page.locator('#offer-max-capacity')).toBeVisible();
    await expect(page.locator('#subevent-0-max-capacity')).toHaveCount(0);

    await setCapacity(page, '#offer-max-capacity', capacity);

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#offer-max-capacity')).toHaveValue(capacity);
  });
});

test.describe('Multiple-date event reservation', () => {
  test('sets capacity and status per subEvent', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const capacities = [randomCapacity(), randomCapacity()];

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-max-capacity')).toBeVisible();
    await expect(page.locator('#subevent-1-max-capacity')).toBeVisible();

    for (const [index, capacity] of capacities.entries()) {
      await setCapacity(page, `#subevent-${index}-max-capacity`, capacity);
    }

    await page.reload();
    await openReservationTab(page);

    for (const [index, capacity] of capacities.entries()) {
      await expect(page.locator(`#subevent-${index}-max-capacity`)).toHaveValue(
        capacity,
      );
    }
  });

  test('saves an offer-level reservation link', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const url = faker.internet.url();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    const bookingInfoPut = waitForBookingInfoPut(page);
    await page.locator('#offer-link').fill(url);
    await page.locator('#offer-link').blur();
    await bookingInfoPut;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#offer-link')).toHaveValue(url);
  });
});

test.describe('Calendar edits preserve subEvent capacity', () => {
  test("preserves a subEvent's capacity and status when its date changes", async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const capacity = randomCapacity();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await setCapacity(page, '#subevent-0-max-capacity', capacity);

    const statusPatch = waitForSubEventsPatch(page);
    await page
      .locator('#subevent-0-status')
      .selectOption({ label: 'Volzet of uitverkocht' });
    await statusPatch;

    const startDateInput = page
      .locator('[id^="calendar-step-day-day-"][id$="date-period-picker-start"]')
      .first();
    const calendarPut = waitForCalendarPut(page);
    await startDateInput.fill(
      addDays(new Date(), 5).toLocaleDateString('nl-BE'),
    );
    await startDateInput.press('Enter');
    await calendarPut;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-max-capacity')).toHaveValue(
      capacity,
    );
    await expect(page.locator('#subevent-0-status')).toHaveValue('Unavailable');
  });

  test("keeps the survivors' capacities when a middle subEvent is deleted", async ({
    page,
    baseURL,
  }) => {
    await createBasicEvent(
      page,
      baseURL!,
      `E2E Middle Delete ${Date.now()}`,
      addDays(new Date(), 1),
      [addDays(new Date(), 10), addDays(new Date(), 20)],
    );
    const eventId = await publishAndGetId(page);

    const capacities = [randomCapacity(), randomCapacity(), randomCapacity()];

    await page.goto(`${baseURL}/events/${eventId}/edit`);
    await openReservationTab(page);

    for (const [index, capacity] of capacities.entries()) {
      await setCapacity(page, `#subevent-${index}-max-capacity`, capacity);
    }

    // Delete the middle subEvent without reloading, so the PUT must preserve
    // the survivors' capacities by matching each on its start date.
    const calendarPut = waitForCalendarPut(page);
    await dayRows(page)
      .nth(1)
      .locator('button:has(svg[data-icon="trash"])')
      .click();
    await calendarPut;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-2-max-capacity')).toHaveCount(0);
    await expect(page.locator('#subevent-0-max-capacity')).toHaveValue(
      capacities[0],
    );
    await expect(page.locator('#subevent-1-max-capacity')).toHaveValue(
      capacities[2],
    );
  });

  test('keeps the surviving capacity when reduced to a single date', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const capacities = [randomCapacity(), randomCapacity()];

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    for (const [index, capacity] of capacities.entries()) {
      await setCapacity(page, `#subevent-${index}-max-capacity`, capacity);
    }

    // Delete the last date, collapsing to a single-date event.
    const calendarPut = waitForCalendarPut(page);
    await dayRows(page)
      .last()
      .locator('button:has(svg[data-icon="trash"])')
      .click();
    await calendarPut;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-1-max-capacity')).toHaveCount(0);
    await expect(page.locator('#offer-max-capacity')).toBeVisible();
    await expect(page.locator('#offer-max-capacity')).toHaveValue(
      capacities[0],
    );
  });
});
