import { expect, test as base } from '@playwright/test';
import { addDays } from 'date-fns';

import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

type TestFixtures = {
  eventId: string;
  eventEditUrl: string;
  eventPreviewUrl: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    await page.goto(`${baseURL}/create`);

    await page.getByRole('button', { name: 'Evenement' }).click();
    await page.getByRole('button', { name: 'Concert' }).click();

    await page
      .locator('#calendar-step-day-day-1date-period-picker-start')
      .fill(new Date(addDays(new Date(), 1)).toLocaleDateString('nl-BE'));

    await page.getByLabel('Gemeente').click();
    await page.getByLabel('Gemeente').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();
    await page.getByLabel('Kies een locatie').click();
    await page.getByLabel('Kies een locatie').fill('S.M');
    await page
      .getByRole('option', { name: 'S.M.A.K.', exact: true })
      .first()
      .click();

    await page.getByLabel('Naam van het evenement').click();
    await page
      .getByLabel('Naam van het evenement')
      .fill(`E2E Age Options Test ${Date.now()}`);
    await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
    await page.getByRole('button', { name: 'Opslaan' }).click();

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
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'ff_react_event_preview',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
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
