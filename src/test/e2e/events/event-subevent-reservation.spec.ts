import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect, test as base } from '@playwright/test';
import { addDays } from 'date-fns';

import { createBasicEvent } from '../helpers/create-basic-event';

type TestFixtures = {
  eventId: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    await createBasicEvent(
      page,
      baseURL!,
      `E2E SubEvent Reservation Test ${Date.now()}`,
      addDays(new Date(), 1),
      [addDays(new Date(), 10)],
    );
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/events\/[a-f0-9-]+/);
    const eventId = page.url().match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';

    await applyFixture(eventId);
  },
});

const waitForSubEventsPatch = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/sub-events') &&
      response.request().method() === 'PATCH',
  );

test.describe('Per-subEvent reservation info', () => {
  test('sets reservation info per subEvent (card variant)', async ({
    page,
    baseURL,
    eventId,
  }) => {
    const reservations = [
      { url: faker.internet.url(), capacity: String(faker.number.int(500)) },
      { url: faker.internet.url(), capacity: String(faker.number.int(500)) },
    ];

    await page.goto(`${baseURL}/events/${eventId}/edit`);
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    await expect(page.locator('#subevent-0-link')).toBeVisible();
    await expect(page.locator('#subevent-1-link')).toBeVisible();

    for (const [index, reservation] of reservations.entries()) {
      await page.locator(`#subevent-${index}-link`).fill(reservation.url);
      let patch = waitForSubEventsPatch(page);
      await page.locator(`#subevent-${index}-link`).blur();
      await patch;

      await page
        .locator(`#subevent-${index}-max-capacity`)
        .fill(reservation.capacity);
      patch = waitForSubEventsPatch(page);
      await page.locator(`#subevent-${index}-max-capacity`).blur();
      await patch;

      patch = waitForSubEventsPatch(page);
      await page
        .locator(`#subevent-${index}-url-label`)
        .selectOption({ label: 'Koop tickets' });
      await patch;
    }

    await page.reload();
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    for (const [index, reservation] of reservations.entries()) {
      await expect(page.locator(`#subevent-${index}-link`)).toHaveValue(
        reservation.url,
      );
      await expect(page.locator(`#subevent-${index}-max-capacity`)).toHaveValue(
        reservation.capacity,
      );
    }
  });

  test('preserves subEvent reservation info when a date changes in the calendar', async ({
    page,
    baseURL,
    eventId,
  }) => {
    const capacity = String(faker.number.int({ min: 1, max: 500 }));

    await page.goto(`${baseURL}/events/${eventId}/edit`);
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    await page.locator('#subevent-0-max-capacity').fill(capacity);
    let patch = waitForSubEventsPatch(page);
    await page.locator('#subevent-0-max-capacity').blur();
    await patch;

    patch = waitForSubEventsPatch(page);
    await page
      .locator('#subevent-0-status')
      .selectOption({ label: 'Volzet of uitverkocht' });
    await patch;

    const calendarPut = page.waitForResponse(
      (response) =>
        response.url().includes('/calendar') &&
        response.request().method() === 'PUT',
    );

    const startDateInput = page
      .locator('[id^="calendar-step-day-day-"][id$="date-period-picker-start"]')
      .first();
    await startDateInput.fill(
      addDays(new Date(), 5).toLocaleDateString('nl-BE'),
    );
    await startDateInput.press('Enter');
    await calendarPut;

    await page.reload();
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    await expect(page.locator('#subevent-0-max-capacity')).toHaveValue(
      capacity,
    );
    await expect(page.locator('#subevent-0-status')).toHaveValue('Unavailable');
  });

  test('removes the reservation info of a subEvent when it is deleted from the calendar', async ({
    page,
    baseURL,
    eventId,
  }) => {
    const kept = {
      url: faker.internet.url(),
      capacity: String(faker.number.int(500)),
    };
    const removed = {
      url: faker.internet.url(),
      capacity: String(faker.number.int(500)),
    };

    await page.goto(`${baseURL}/events/${eventId}/edit`);
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    // subEvent 0 keeps its info, subEvent 1 is the one that gets deleted.
    for (const [index, reservation] of [kept, removed].entries()) {
      await page.locator(`#subevent-${index}-link`).fill(reservation.url);
      let patch = waitForSubEventsPatch(page);
      await page.locator(`#subevent-${index}-link`).blur();
      await patch;

      await page
        .locator(`#subevent-${index}-max-capacity`)
        .fill(reservation.capacity);
      patch = waitForSubEventsPatch(page);
      await page.locator(`#subevent-${index}-max-capacity`).blur();
      await patch;
    }

    // Reload so the calendar machine is seeded with the saved reservation info.
    await page.reload();

    // Delete the last subEvent (subEvent 1) in the calendar step.
    const calendarPut = page.waitForResponse(
      (response) =>
        response.url().includes('/calendar') &&
        response.request().method() === 'PUT',
    );
    const lastDayRow = page
      .locator('li')
      .filter({
        has: page.locator(
          '[id^="calendar-step-day-day-"][id$="date-period-picker-start"]',
        ),
      })
      .last();
    await lastDayRow.locator('button:has(svg[data-icon="trash"])').click();
    await calendarPut;

    await page.reload();
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    // The deleted subEvent and its reservation info are gone...
    await expect(page.locator('#subevent-1-link')).toHaveCount(0);

    // The remaining subEvent keeps its own reservation info.
    await expect(page.locator('#subevent-0-link')).toHaveValue(kept.url);
    await expect(page.locator('#subevent-0-max-capacity')).toHaveValue(
      kept.capacity,
    );
  });

  test('shows a new reservation section when a subEvent is added in the calendar', async ({
    page,
    baseURL,
    eventId,
  }) => {
    await page.goto(`${baseURL}/events/${eventId}/edit`);
    await page.getByRole('tab', { name: 'Reservatie' }).click();

    // The fixture event has two subEvents, so two reservation cards.
    await expect(page.locator('#subevent-0-link')).toBeVisible();
    await expect(page.locator('#subevent-1-link')).toBeVisible();
    await expect(page.locator('#subevent-2-link')).toHaveCount(0);

    // Add a day in the calendar step.
    const calendarPut = page.waitForResponse(
      (response) =>
        response.url().includes('/calendar') &&
        response.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: 'Dag toevoegen' }).click();
    await calendarPut;

    // A reservation section appears for the newly added subEvent.
    await expect(page.locator('#subevent-2-link')).toBeVisible();
  });
});
