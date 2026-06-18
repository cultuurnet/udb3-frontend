import { expect, Page, test as base } from '@playwright/test';

import nl from '../../../i18n/nl.json';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const age = nl.create.name_and_age.age;
const childrenOnly = age.children_only;

const audienceQuestionLocator = childrenOnly.question;

const childrenOnlyRadio = (page: Page) => page.locator('#children-only');
const withFamilyRadio = (page: Page) => page.locator('#with-family');

type TestFixtures = {
  eventId: string;
  eventEditUrl: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    await createBasicEvent(
      page,
      baseURL,
      `E2E ChildrenOnly Test ${Date.now()}`,
    );
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
    {
      name: 'ff_boa',
      value: 'true',
      domain: 'localhost',
      path: '/',
    },
  ]);
});

test.describe('Children-only audience section', () => {
  test('is hidden for non-BOA age ranges', async ({ page, eventEditUrl }) => {
    await page.goto(eventEditUrl);

    // createBasicEvent ends on "Volwassenen 18+" → no BOA-aged children → hidden
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();

    // "Alle leeftijden" is too broad to be children-specific → hidden
    await page.getByRole('button', { name: new RegExp(`^${age.all}`) }).click();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();

    // "Senioren 65+" → hidden
    await page
      .getByRole('button', { name: new RegExp(`^${age.seniors}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();

    // "Jongeren 16-26" → min > 12 → hidden
    await page
      .getByRole('button', { name: new RegExp(`^${age.youngsters}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('appears when the age range overlaps with the BOA range (2-12)', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // "Peuters 0-2" → max ≥ 2 → visible
    await page
      .getByRole('button', { name: new RegExp(`^${age.toddlers}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Kleuters 3-5" → entirely inside BOA → visible
    await page
      .getByRole('button', { name: new RegExp(`^${age.preschoolers}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Kinderen 6-11" → entirely inside BOA → visible
    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Tieners 12-15" → min = 12 → visible (overlaps at 12)
    await page
      .getByRole('button', { name: new RegExp(`^${age.teenagers}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();
  });

  test('appears for a custom range that overlaps with the BOA range', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    const fromInput = page.getByLabel(age.from, { exact: true });
    const tillInput = page.getByLabel(age.till, { exact: true });

    // Custom range 8-15 → min ≤ 12, max ≥ 2 → visible
    await fromInput.fill('8');
    await tillInput.fill('15');
    await tillInput.blur();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // Custom range 13-20 → min > 12 → hidden
    await fromInput.fill('13');
    await tillInput.fill('20');
    await tillInput.blur();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('persists "Voor kinderen alleen" selection and switches back via the radio', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // Default is "with family"
    await expect(withFamilyRadio(page)).toBeChecked();

    // Select children-only and verify it sticks
    await childrenOnlyRadio(page).click();
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Reload — selection should persist because the audience mutation fired
    await page.waitForLoadState('networkidle');
    await page.goto(eventEditUrl);
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Switch back to "with family"
    await withFamilyRadio(page).click();
    await expect(withFamilyRadio(page)).toBeChecked();
  });

  test('hides the section again when the age range moves outside the BOA range', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // Switch into BOA range → section visible
    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // Switch out → section hidden
    await page
      .getByRole('button', { name: new RegExp(`^${age.adults}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('warns before switching away from "kinderen alleen" when departurePlaces exist', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    // Put the age range in the BOA window and pick "kinderen alleen"
    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // Wait for both the children-only PUT and the follow-up offer refetch
    const childrenOnlyPut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/children-only`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Add a departure place via the Bereikbaarheid tab and explicitly wait
    // for the PUT and the cache-invalidated GET refetch to complete — the
    // modal logic in AgeRangeStep reads departurePlaces from that offer
    // query, so we can't open the modal until the refetch lands.
    await page.getByRole('tab', { name: 'Bereikbaarheid' }).click();
    await page.getByTestId('departure-city-0').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();
    await page.getByTestId('departure-place-0').fill('S.M');

    const departurePut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/departurePlaces`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await page
      .getByRole('option', { name: 'S.M.A.K.', exact: true })
      .first()
      .click();
    await departurePut;

    // Wait for the cache-invalidated GET so the AgeRangeStep observer sees
    // the new departurePlaces on the offer.
    await page.waitForResponse(
      (res) =>
        new RegExp(`/events/${eventId}(?:\\?|$)`).test(res.url()) &&
        res.request().method() === 'GET' &&
        res.ok(),
    );

    await expect(
      page.getByRole('heading', { name: 'Vertreklocatie 1' }),
    ).toBeVisible();

    // Try to switch back to "with family" → warning modal must appear
    await withFamilyRadio(page).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText(childrenOnly.departure_places_warning_modal.title),
    ).toBeVisible();
    await expect(
      modal.getByText(childrenOnly.departure_places_warning_modal.body),
    ).toBeVisible();

    // Cancel → modal closes, audience selection stays at "kinderen alleen"
    await modal
      .getByRole('button', {
        name: childrenOnly.departure_places_warning_modal.cancel,
      })
      .click();
    await expect(modal).toBeHidden();
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Click again, then confirm → audience flips and departure places are cleared
    await withFamilyRadio(page).click();
    await expect(modal).toBeVisible();
    await modal
      .getByRole('button', {
        name: childrenOnly.departure_places_warning_modal.confirm,
      })
      .click();
    await expect(modal).toBeHidden();
    await expect(withFamilyRadio(page)).toBeChecked();

    await page.waitForLoadState('networkidle');

    // Optional sanity: the accessibility tab should be gone now that we're
    // no longer in "kinderen alleen" mode.
    await expect(
      page.getByRole('tab', { name: 'Bereikbaarheid' }),
    ).toBeHidden();
  });

  test('age outside 2–12 while "kinderen alleen": confirm resets audience and saves the new age', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    // Setup: 6–11 + children-only.
    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    const childrenOnlyPut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/children-only`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;
    // Wait for the childrenOnly update to commit before clicking the next
    // preset — otherwise commitTypicalAgeRange may still read a stale value
    // from useWatch and skip the warning modal.
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Move out of BOA range — preset "Volwassenen 18+" triggers the warning.
    await page
      .getByRole('button', { name: new RegExp(`^${age.adults}`) })
      .click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText(childrenOnly.age_range_warning_modal.body),
    ).toBeVisible();

    // Confirm: children-only reset PUT + typicalAgeRange PUT fire in sequence.
    const confirmChildrenOnlyPut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/children-only`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    const confirmAgePut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/typicalAgeRange`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await modal
      .getByRole('button', {
        name: childrenOnly.age_range_warning_modal.confirm,
      })
      .click();
    await confirmChildrenOnlyPut;
    await confirmAgePut;

    await page.goto(eventEditUrl);

    // New age (18+) no longer overlaps BOA → children-only section is hidden.
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('age outside 2–12 while "kinderen alleen": cancel keeps the previous age and audience', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    await page
      .getByRole('button', { name: new RegExp(`^${age.kids}`) })
      .click();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    const childrenOnlyPut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/children-only`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Trigger the modal.
    await page
      .getByRole('button', { name: new RegExp(`^${age.adults}`) })
      .click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Cancel → modal closes, previous range + audience preserved.
    await modal
      .getByRole('button', {
        name: childrenOnly.age_range_warning_modal.cancel,
      })
      .click();
    await expect(modal).toBeHidden();

    // "Kinderen 6-11" preset stays active and the audience remains
    // "kinderen alleen" — proves field.onChange revert actually updated the
    // Controller's field.value (a setValue-based revert would not have).
    await expect(
      page.getByRole('button', { name: new RegExp(`^${age.kids}`) }),
    ).toHaveClass(/(?:^|\s)active(?:\s|$)/);
    await expect(childrenOnlyRadio(page)).toBeChecked();
  });
});
