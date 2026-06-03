import { expect, test as base } from '@playwright/test';
import { format } from 'date-fns';

import nl from '../../../i18n/nl.json';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const age = nl.create.name_and_age.age;

type TestFixtures = {
  eventId: string;
  eventPreviewUrl: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);

    await page.context().addCookies([
      {
        name: 'ff_boa',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await createBasicEvent(
      page,
      baseURL,
      `E2E Preview Content Test ${Date.now()}`,
    );
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+/);
    const eventId = page.url().match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';

    await page.goto(`/events/${eventId}/edit`);
    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(age.audience.question)).toBeVisible();

    const audiencePut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/audience`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await page.locator('#audience-children-only').click();
    await audiencePut;

    await applyFixture(eventId);
  },

  eventPreviewUrl: async ({ eventId }, applyFixture) => {
    await applyFixture(`/events/${eventId}`);
  },
});

test.describe('Event Preview Content', () => {
  test.beforeEach(async ({ page, eventPreviewUrl }) => {
    suppressHydrationErrors(page);
    await page.goto(eventPreviewUrl);
    await page.getByRole('button', { name: 'Bewerken' }).waitFor();
  });

  test('shows age range and children-only label for a children-only event', async ({
    page,
  }) => {
    await expect(
      page.getByText(nl.preview.ages.replace('{{ages}}', '6-11')),
    ).toBeVisible();

    await expect(page.getByText(nl.preview.children_only)).toBeVisible();
  });

  test('shows date and publication status', async ({ page }) => {
    await expect(
      page.getByText(
        nl.dashboard.row_status.PUBLISHED.replace('{{date}}', format(new Date(), 'dd/MM/yyyy')),
      ),
    ).toBeVisible();
  });
});
