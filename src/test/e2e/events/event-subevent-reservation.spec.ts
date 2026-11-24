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

const dayRows = (page: Page) =>
  page.locator('li').filter({
    has: page.locator(
      '[id^="calendar-step-day-day-"][id$="date-period-picker-start"]',
    ),
  });

const setWaitingListUrl = async (page: Page, id: string, url: string) => {
  await page.locator(id).fill(url);
  const patch = waitForSubEventsPatch(page);
  await page.locator(id).blur();
  return (await patch).request();
};

const ticketmaticHost =
  process.env.NEXT_PUBLIC_TICKETMATIC_RESERVATION_LINK_HOSTS?.split(
    ',',
  )[0]?.trim();

const recordSubEventsPatches = (page: Page) => {
  const bodies: unknown[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/sub-events') && request.method() === 'PATCH') {
      bodies.push(request.postDataJSON());
    }
  });
  return bodies;
};

const setReservationLink = async (page: Page, index: number, url: string) => {
  await page.locator(`#subevent-${index}-link`).fill(url);
  await page.locator(`#subevent-${index}-link`).blur();
};

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
  ]);
});

test.describe('Single-date event reservation', () => {
  test('stores a waiting list url on the subEvent level', async ({
    page,
    baseURL,
    singleEventId,
  }) => {
    const url = faker.internet.url();

    await page.goto(`${baseURL}/events/${singleEventId}/edit`);
    await openReservationTab(page);

    await setWaitingListUrl(page, '#offer-waiting-list-url', url);

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#offer-waiting-list-url')).toHaveValue(url);
  });
});

test.describe('Multiple-date event reservation', () => {
  test('sets a reservation link per subEvent', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const urls = [faker.internet.url(), faker.internet.url()];

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await expect(page.locator('#offer-link')).toHaveCount(0);

    for (const [index, url] of urls.entries()) {
      const id = `#subevent-${index}-link`;
      await page.locator(id).fill(url);
      const patch = waitForSubEventsPatch(page);
      await page.locator(id).blur();
      await patch;
    }

    await page.reload();
    await openReservationTab(page);

    for (const [index, url] of urls.entries()) {
      await expect(page.locator(`#subevent-${index}-link`)).toHaveValue(url);
    }
  });

  test('sets a waiting list url per subEvent', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const urls = [faker.internet.url(), faker.internet.url()];

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    for (const [index, url] of urls.entries()) {
      await setWaitingListUrl(page, `#subevent-${index}-waiting-list-url`, url);
    }

    await page.reload();
    await openReservationTab(page);

    for (const [index, url] of urls.entries()) {
      await expect(
        page.locator(`#subevent-${index}-waiting-list-url`),
      ).toHaveValue(url);
    }
  });

  test('removes a waiting list url when it is cleared', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await setWaitingListUrl(
      page,
      '#subevent-0-waiting-list-url',
      faker.internet.url(),
    );

    const request = await setWaitingListUrl(
      page,
      '#subevent-0-waiting-list-url',
      '',
    );
    expect(request.postDataJSON()[0].bookingAvailability.waitingListUrl).toBe(
      '',
    );

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-waiting-list-url')).toHaveValue('');
  });

  test('does not save an invalid waiting list url', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await page.locator('#subevent-0-waiting-list-url').fill('not-a-url');
    await page.locator('#subevent-0-waiting-list-url').blur();

    await expect(page.getByText('Geen geldige url')).toBeVisible();

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-waiting-list-url')).toHaveValue('');
  });
});

test.describe('Calendar edits preserve subEvent reservation', () => {
  test("preserves a subEvent's status when its date changes", async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

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

    await expect(page.locator('#subevent-0-status')).toHaveValue('Unavailable');
  });

  test("preserves a subEvent's waiting list url when its date changes", async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const url = faker.internet.url();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await setWaitingListUrl(page, '#subevent-0-waiting-list-url', url);

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

    await expect(page.locator('#subevent-0-waiting-list-url')).toHaveValue(url);
  });

  test('saves the calendar after a waiting list url was cleared', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    await setWaitingListUrl(
      page,
      '#subevent-0-waiting-list-url',
      faker.internet.url(),
    );
    await setWaitingListUrl(page, '#subevent-0-waiting-list-url', '');

    const startDateInput = page
      .locator('[id^="calendar-step-day-day-"][id$="date-period-picker-start"]')
      .first();
    const calendarPut = waitForCalendarPut(page);
    await startDateInput.fill(
      addDays(new Date(), 5).toLocaleDateString('nl-BE'),
    );
    await startDateInput.press('Enter');
    expect((await calendarPut).ok()).toBe(true);

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-waiting-list-url')).toHaveValue('');
  });

  test("keeps the survivors' waiting list urls when a middle subEvent is deleted", async ({
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

    const urls = [
      faker.internet.url(),
      faker.internet.url(),
      faker.internet.url(),
    ];

    await page.goto(`${baseURL}/events/${eventId}/edit`);
    await openReservationTab(page);

    for (const [index, url] of urls.entries()) {
      await setWaitingListUrl(page, `#subevent-${index}-waiting-list-url`, url);
    }

    // Delete the middle subEvent without reloading, so the PUT must preserve
    // the survivors' waiting list urls by matching each on its start date.
    const calendarPut = waitForCalendarPut(page);
    await dayRows(page)
      .nth(1)
      .locator('button:has(svg.lucide-trash-2)')
      .click();
    await calendarPut;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-2-waiting-list-url')).toHaveCount(0);
    await expect(page.locator('#subevent-0-waiting-list-url')).toHaveValue(
      urls[0],
    );
    await expect(page.locator('#subevent-1-waiting-list-url')).toHaveValue(
      urls[2],
    );
  });

  test('keeps the surviving waiting list url when reduced to a single date', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const urls = [faker.internet.url(), faker.internet.url()];

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    for (const [index, url] of urls.entries()) {
      await setWaitingListUrl(page, `#subevent-${index}-waiting-list-url`, url);
    }

    // Delete the last date, collapsing to a single-date event.
    const calendarPut = waitForCalendarPut(page);
    await dayRows(page)
      .last()
      .locator('button:has(svg.lucide-trash-2)')
      .click();
    await calendarPut;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-1-waiting-list-url')).toHaveCount(0);
    await expect(page.locator('#offer-waiting-list-url')).toHaveValue(urls[0]);
  });
});

test.describe('Ticketmatic reservation link', () => {
  test.skip(
    !ticketmaticHost,
    'NEXT_PUBLIC_TICKETMATIC_RESERVATION_LINK_HOSTS is not set',
  );

  const ticketmaticUrl = () => `https://${ticketmaticHost}/event/${Date.now()}`;

  const clearedAvailabilityPatch = (url: string) => [
    expect.objectContaining({
      id: 0,
      bookingInfo: expect.objectContaining({ url }),
      bookingAvailability: { type: 'Available', waitingListUrl: '' },
    }),
  ];

  test('stores the link and disables status and waiting list of that date only', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const url = ticketmaticUrl();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    const patch = waitForSubEventsPatch(page);
    await setReservationLink(page, 0, url);
    await patch;

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-link')).toHaveValue(url);
    await expect(page.locator('#subevent-0-status')).toBeDisabled();
    await expect(page.locator('#subevent-0-waiting-list-url')).toBeDisabled();
    await expect(page.locator('#subevent-1-status')).toBeEnabled();
    await expect(page.locator('#subevent-1-waiting-list-url')).toBeEnabled();
  });

  test('clears availability without confirmation when nothing is filled in', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const url = ticketmaticUrl();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    const patch = waitForSubEventsPatch(page);
    await setReservationLink(page, 0, url);
    const request = (await patch).request();

    await expect(page.getByRole('dialog')).toBeHidden();
    expect(request.postDataJSON()).toEqual(clearedAvailabilityPatch(url));
  });

  test('asks confirmation before clearing a filled in waiting list url', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const url = ticketmaticUrl();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);
    await setWaitingListUrl(
      page,
      '#subevent-0-waiting-list-url',
      faker.internet.url(),
    );
    const patches = recordSubEventsPatches(page);

    await setReservationLink(page, 0, url);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(patches).toHaveLength(0);

    const patch = waitForSubEventsPatch(page);
    await dialog.getByRole('button', { name: 'Opslaan' }).click();
    const request = (await patch).request();

    await expect(dialog).toBeHidden();
    expect(request.postDataJSON()).toEqual(clearedAvailabilityPatch(url));

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-link')).toHaveValue(url);
    await expect(page.locator('#subevent-0-waiting-list-url')).toBeDisabled();
  });

  test('keeps everything as it was when the confirmation is cancelled', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const waitingListUrl = faker.internet.url();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);
    await setWaitingListUrl(
      page,
      '#subevent-0-waiting-list-url',
      waitingListUrl,
    );
    const patches = recordSubEventsPatches(page);

    await setReservationLink(page, 0, ticketmaticUrl());

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Annuleren' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.locator('#subevent-0-link')).toHaveValue('');
    expect(patches).toHaveLength(0);

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-link')).toHaveValue('');
    await expect(page.locator('#subevent-0-waiting-list-url')).toHaveValue(
      waitingListUrl,
    );
    await expect(page.locator('#subevent-0-waiting-list-url')).toBeEnabled();
  });

  test('does not clear availability for other links', async ({
    page,
    baseURL,
    multipleEventId,
  }) => {
    const url = faker.internet.url();

    await page.goto(`${baseURL}/events/${multipleEventId}/edit`);
    await openReservationTab(page);

    const patch = waitForSubEventsPatch(page);
    await setReservationLink(page, 0, url);
    const request = (await patch).request();

    expect(request.postDataJSON()[0].bookingAvailability).toBeUndefined();

    await page.reload();
    await openReservationTab(page);

    await expect(page.locator('#subevent-0-link')).toHaveValue(url);
    await expect(page.locator('#subevent-0-status')).toBeEnabled();
  });
});
