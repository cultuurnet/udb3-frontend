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

const childrenOnlyRadio = (page: Page) => page.locator('#children-only');
const withFamilyRadio = (page: Page) => page.locator('#with-family');

const waitForTypicalAgeRangePut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/typicalAgeRange') &&
      response.request().method() === 'PUT' &&
      response.ok(),
  );

const waitForChildrenOnlyPut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      /\/events\/[a-f0-9-]+\/children-only$/.test(response.url()) &&
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

  test('shows an error and does not persist non-numeric input', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // A freshly created event starts at the "Volwassenen 18+" preset (18-).
    await expect(minAgeInput(page)).toHaveValue('18');

    await minAgeInput(page).fill('abc');
    await minAgeInput(page).blur();

    await expect(page.getByText(age.error_invalid)).toBeVisible();

    await page.goto(eventEditUrl);

    // The invalid value was never saved, so the previous range is untouched.
    await expect(page.getByText(age.error_invalid)).toBeHidden();
    await expect(minAgeInput(page)).toHaveValue('18');
    await expect(maxAgeInput(page)).toHaveValue('');
  });

  test('shows the children-only radios only when the age overlaps 2–16', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // Initial "Volwassenen 18+" range does not overlap BOA → section hidden.
    await expect(minAgeInput(page)).toHaveValue('18');
    await expect(childrenOnlyRadio(page)).toBeHidden();

    // Switch to "Kinderen 6-11" → overlaps BOA → section appears.
    const put = waitForTypicalAgeRangePut(page);
    await page.getByRole('button', { name: new RegExp(age.kids) }).click();
    await put;

    await expect(childrenOnlyRadio(page)).toBeVisible();
    await expect(withFamilyRadio(page)).toBeVisible();
    await expect(withFamilyRadio(page)).toBeChecked();
  });

  test('persists the "for children only" audience across a reload', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    const ageRangePut = waitForTypicalAgeRangePut(page);
    await page.getByRole('button', { name: new RegExp(age.kids) }).click();
    await ageRangePut;

    const childrenOnlyPut = waitForChildrenOnlyPut(page);
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;

    await expect(childrenOnlyRadio(page)).toBeChecked();

    await page.goto(eventEditUrl);

    await expect(childrenOnlyRadio(page)).toBeChecked();
  });

  test('age outside 2–12 while "children only": confirm resets audience and saves the new age', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // Setup: 6-11 + children only.
    const ageRangePut = waitForTypicalAgeRangePut(page);
    await page.getByRole('button', { name: new RegExp(age.kids) }).click();
    await ageRangePut;

    const childrenOnlyPut = waitForChildrenOnlyPut(page);
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Move out of BOA range — preset "Volwassenen 18+" triggers the warning.
    await page.getByRole('button', { name: new RegExp(age.adults) }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(
      age.children_only.age_range_warning_modal.body,
    );

    const confirmChildrenOnlyPut = waitForChildrenOnlyPut(page);
    const confirmAgePut = waitForTypicalAgeRangePut(page);
    await modal
      .getByRole('button', {
        name: age.children_only.age_range_warning_modal.confirm,
      })
      .click();
    await confirmChildrenOnlyPut;
    await confirmAgePut;

    await page.goto(eventEditUrl);

    // Age now "Volwassenen 18+" (no longer overlaps BOA) → section hidden.
    await expect(minAgeInput(page)).toHaveValue('18');
    await expect(maxAgeInput(page)).toHaveValue('');
    await expect(childrenOnlyRadio(page)).toBeHidden();
  });

  test('age outside 2–12 while "children only": cancel keeps the previous age and audience', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    const ageRangePut = waitForTypicalAgeRangePut(page);
    await page.getByRole('button', { name: new RegExp(age.kids) }).click();
    await ageRangePut;

    const childrenOnlyPut = waitForChildrenOnlyPut(page);
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;
    await expect(childrenOnlyRadio(page)).toBeChecked();

    await page.getByRole('button', { name: new RegExp(age.adults) }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal
      .getByRole('button', {
        name: age.children_only.age_range_warning_modal.cancel,
      })
      .click();
    await expect(modal).toBeHidden();

    // Previous "Kinderen 6-11" range survives + the preset stays active.
    await expect(minAgeInput(page)).toHaveValue('6');
    await expect(maxAgeInput(page)).toHaveValue('11');
    await expect(
      page.getByRole('button', { name: new RegExp(age.kids) }),
    ).toHaveClass(/(?:^|\s)active(?:\s|$)/);

    // childrenOnly flag stayed true.
    await expect(childrenOnlyRadio(page)).toBeChecked();
  });
});
