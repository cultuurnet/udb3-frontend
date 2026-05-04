import { expect, test as base } from '@playwright/test';

import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

type TestFixtures = {
  eventId: string;
  eventEditUrl: string;
  eventPreviewUrl: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    await createBasicEvent(page, baseURL, `E2E Age Options Test ${Date.now()}`);
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/events\/[a-f0-9-]+/);
    const url = page.url();
    const eventId = url.match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';

    await applyFixture(eventId);
  },

  eventEditUrl: async ({ eventId }, applyFixture) => {
    await applyFixture(`/events/${eventId}/edit`);
  },

  eventPreviewUrl: async ({ eventId }, applyFixture) => {
    await applyFixture(`/events/${eventId}`);
  },
});

test.describe('Event Preview - Age Display Options', () => {
  test.beforeEach(async ({ page }) => {
    suppressHydrationErrors(page);
  });

  test('should display all age option variations', async ({
    page,
    eventEditUrl,
    eventPreviewUrl,
  }) => {
    // Case 1: All ages
    await page.goto(eventEditUrl);
    await page.getByRole('button', { name: /Alle leeftijden/ }).click();
    await page.waitForLoadState('networkidle');

    await page.goto(eventPreviewUrl);
    await expect(page.getByText('Alle leeftijden')).toBeVisible();

    // Case 2: Specific predefined age range (Kinderen 6-11)
    await page.goto(eventEditUrl);
    await page.getByRole('button', { name: /Kinderen 6-11/ }).click();
    await page.waitForLoadState('networkidle');

    await page.goto(eventPreviewUrl);
    await expect(page.getByText('Leeftijden: 6-11')).toBeVisible();

    // Case 3: Custom age range (6-12)
    await page.goto(eventEditUrl);
    await page.getByRole('button', { name: /Andere/ }).click();
    await page.getByPlaceholder('Van').fill('6');
    await page.getByPlaceholder('Tot').fill('12');
    await page.getByPlaceholder('Tot').blur();
    await page.waitForLoadState('networkidle');

    await page.goto(eventPreviewUrl);
    await expect(page.getByText('Leeftijden: 6-12')).toBeVisible();

    // Case 4: Custom age from (25+)
    await page.goto(eventEditUrl);
    await page.getByRole('button', { name: /Andere/ }).click();
    await page.getByPlaceholder('Tot').clear();
    await page.getByPlaceholder('Van').fill('25');
    await page.getByPlaceholder('Van').blur();
    await page.waitForLoadState('networkidle');

    await page.goto(eventPreviewUrl);
    await expect(page.getByText('Leeftijden: 25+')).toBeVisible();
  });
});
