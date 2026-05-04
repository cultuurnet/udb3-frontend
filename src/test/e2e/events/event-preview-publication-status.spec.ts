import { expect, test as base } from '@playwright/test';
import { addDays, subDays } from 'date-fns';

import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

type TestFixtures = {
  publishedEventUrl: string;
  publishedEventId: string;
  plannedEventUrl: string;
  plannedEventId: string;
};

const test = base.extend<TestFixtures>({
  publishedEventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    await createBasicEvent(
      page,
      baseURL,
      `E2E Publication Status Test ${Date.now()}`,
    );
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/events\/[a-f0-9-]+/);
    const url = page.url();
    const eventId = url.match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';

    await applyFixture(eventId);
  },

  publishedEventUrl: async ({ publishedEventId }, applyFixture) => {
    await applyFixture(`/events/${publishedEventId}`);
  },

  plannedEventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    const futureDate = addDays(new Date(), 30);
    await createBasicEvent(
      page,
      baseURL,
      `E2E Planned Event ${Date.now()}`,
      futureDate,
    );
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/events\/[a-f0-9-]+/);

    const url = page.url();
    const eventId = url.match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';

    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);
    await page
      .getByRole('button', { name: 'Later publiceren', exact: true })
      .click();
    await page
      .locator('#publish-later-date')
      .fill(futureDate.toLocaleDateString('nl-BE'));
    await page.getByRole('button', { name: 'Bevestigen' }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+/);

    await applyFixture(eventId);
  },

  plannedEventUrl: async ({ plannedEventId }, applyFixture) => {
    await applyFixture(`/events/${plannedEventId}`);
  },
});

test.describe('Event Preview - Publication Status Display', () => {
  test.beforeEach(async ({ page }) => {
    suppressHydrationErrors(page);
  });

  test('should display published status for current event', async ({
    page,
    publishedEventUrl,
    publishedEventId,
  }) => {
    await page.goto(publishedEventUrl);

    await page.getByRole('button', { name: 'Bewerken' }).waitFor();

    const publicationRow = page.locator('table').first();
    await expect(publicationRow).toBeVisible();

    const statusIndicator = page.getByText('Gepubliceerd');
    await expect(statusIndicator).toBeVisible();

    const eventIdText = page.getByText(publishedEventId);
    await expect(eventIdText).toBeVisible();

    const publicUrlLink = page.getByRole('link', {
      name: 'Bekijk op UiTinVlaanderen',
    });
    await expect(publicUrlLink).toBeVisible();

    await expect(publicUrlLink).toHaveAttribute(
      'href',
      `${process.env.NEXT_PUBLIC_UIV_URL}/agenda/e/x/${publishedEventId}`,
    );

    await expect(publicUrlLink).toHaveAttribute('target', '_blank');
  });

  test('should display planned status with date for future event', async ({
    page,
    plannedEventUrl,
    plannedEventId,
  }) => {
    await page.goto(plannedEventUrl);

    await page.getByRole('button', { name: 'Bewerken' }).waitFor();

    const statusText = page.getByText(/Publicatie vanaf \d{2}\/\d{2}\/\d{4}/);
    await expect(statusText).toBeVisible();

    const statusContent = await statusText.textContent();
    expect(statusContent).toMatch(/Publicatie vanaf \d{2}\/\d{2}\/\d{4}/);

    const eventIdText = page.getByText(plannedEventId);
    await expect(eventIdText).toBeVisible();

    const publicUrlLink = page.getByRole('link', {
      name: 'Bekijk op UiTinVlaanderen',
    });
    await expect(publicUrlLink).toBeVisible();
  });

  test('should display draft status for unpublished event', async ({
    page,
    baseURL,
  }) => {
    suppressHydrationErrors(page);
    await createBasicEvent(page, baseURL, `E2E Draft Event ${Date.now()}`);
    await page.waitForEvent('domcontentloaded');

    const url = page.url();
    const eventId = url.match(/\/events\/([a-f0-9-]+)\/edit/)?.[1] ?? '';
    await page.goto(`/events/${eventId}`);
    await page.waitForURL(/\/events\/[a-f0-9-]+/);

    const draftStatus = page.getByText('Kladversie');
    await expect(draftStatus).toBeVisible();
  });

  test('should still display event ID for finished event', async ({
    page,
    publishedEventId,
  }) => {
    suppressHydrationErrors(page);

    await page.goto(`/events/${publishedEventId}/edit`);
    await page.waitForLoadState('domcontentloaded');

    const pastDate = subDays(new Date(), 30);
    await page
      .locator('#calendar-step-day-day-2date-period-picker-start')
      .fill(pastDate.toLocaleDateString('nl-BE'));
    await page
      .locator('#calendar-step-day-day-2date-period-picker-end')
      .fill(pastDate.toLocaleDateString('nl-BE'));

    await page.getByRole('button', { name: 'Klaar met bewerken' }).click();
    await page.waitForLoadState('domcontentloaded');

    await page.goto(`/events/${publishedEventId}`);
    await page.waitForLoadState('domcontentloaded');

    const eventIdText = page.getByText(publishedEventId);
    await expect(eventIdText).toBeVisible();

    const publicUrlLink = page.getByRole('link', {
      name: 'Bekijk op UiTinVlaanderen',
    });
    await expect(publicUrlLink).toBeVisible();
  });
});
