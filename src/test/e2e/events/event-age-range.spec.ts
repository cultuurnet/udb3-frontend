import { expect, Page, test as base } from '@playwright/test';

import nl from '../../../i18n/nl.json';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const age = nl.create.name_and_age.age;

type TestFixtures = {
  eventId: string;
  eventEditUrl: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    await createBasicEvent(page, baseURL, `E2E Age Range Test ${Date.now()}`);
    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();
    await page.waitForURL(/\/events\/[a-f0-9-]+/);
    const eventId = page.url().match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';
    await applyFixture(eventId);
  },

  eventEditUrl: async ({ eventId }, applyFixture) => {
    await applyFixture(`/events/${eventId}/edit`);
  },
});

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
  ]);
});

const minAgeInput = (page: Page) =>
  page.getByPlaceholder(age.from, { exact: true });
const maxAgeInput = (page: Page) =>
  page.getByPlaceholder(age.till, { exact: true });

const waitForTypicalAgeRangePut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/typicalAgeRange') &&
      response.request().method() === 'PUT' &&
      response.ok(),
  );

test.describe('Age range', () => {
  test('persists a custom age range after a page reload', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);
    await expect(page.getByText(age.input_range_title)).toBeVisible();
    // Wait for the initial "Volwassenen 18+" range to hydrate before editing.
    await expect(minAgeInput(page)).toHaveValue('18');

    const minPut = waitForTypicalAgeRangePut(page);
    await minAgeInput(page).fill('6');
    await minAgeInput(page).blur();
    await minPut;

    const maxPut = waitForTypicalAgeRangePut(page);
    await maxAgeInput(page).fill('12');
    await maxAgeInput(page).blur();
    await maxPut;

    await page.goto(eventEditUrl);

    await expect(minAgeInput(page)).toHaveValue('6');
    await expect(maxAgeInput(page)).toHaveValue('12');
  });

  test('fills the inputs when a preset is selected and persists it', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    const kidsButton = page.getByRole('button', { name: new RegExp(age.kids) });

    const put = waitForTypicalAgeRangePut(page);
    await kidsButton.click();
    await put;

    await expect(kidsButton).toHaveClass(/(?:^|\s)active(?:\s|$)/);
    await expect(minAgeInput(page)).toHaveValue('6');
    await expect(maxAgeInput(page)).toHaveValue('11');

    await page.goto(eventEditUrl);

    await expect(
      page.getByRole('button', { name: new RegExp(age.kids) }),
    ).toHaveClass(/(?:^|\s)active(?:\s|$)/);
    await expect(minAgeInput(page)).toHaveValue('6');
    await expect(maxAgeInput(page)).toHaveValue('11');
  });

  test('shows an error and does not persist when "from" is lower than "to"', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    const put = waitForTypicalAgeRangePut(page);
    await page.getByRole('button', { name: new RegExp(age.kids) }).click();
    await put;

    await maxAgeInput(page).fill('5');
    await maxAgeInput(page).blur();

    await expect(page.getByText(age.error_max_lower_than_min)).toBeVisible();

    await page.goto(eventEditUrl);

    await expect(page.getByText(age.error_max_lower_than_min)).toBeHidden();
    await expect(minAgeInput(page)).toHaveValue('6');
    await expect(maxAgeInput(page)).toHaveValue('11');
  });

  test('shows an error and does not persist an age above the maximum', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // A freshly created event starts at the "Volwassenen 18+" preset (18-).
    await expect(minAgeInput(page)).toHaveValue('18');

    await minAgeInput(page).fill('200');
    await minAgeInput(page).blur();

    await expect(page.getByText(age.error_max_age)).toBeVisible();

    await page.goto(eventEditUrl);

    // The invalid value was never saved, so the previous range is untouched.
    await expect(page.getByText(age.error_max_age)).toBeHidden();
    await expect(minAgeInput(page)).toHaveValue('18');
    await expect(maxAgeInput(page)).toHaveValue('');
  });
});
