import { expect, Page, test as base } from '@playwright/test';
import { addDays } from 'date-fns';

import nl from '../../../i18n/nl.json';
import {
  ageRangeLabels,
  expectSelectedAgeRange,
  maxAgeInput,
  minAgeInput,
  openAgeRangeForm,
  pickAgePreset,
  presetButton,
} from '../helpers/age-range';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const age = nl.create.name_and_age.age;
const childrenOnly = age.children_only;
const confirmModal = age.confirm_modal;

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
    await pickAgePreset(page, age.all);
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();

    // "Senioren 65+" → hidden
    await pickAgePreset(page, age.seniors);
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('appears when the age range overlaps with the BOA range (2-16)', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // "Peuters 0-2" → max ≥ 2 → visible
    await pickAgePreset(page, age.toddlers);
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Kleuters 3-5" → entirely inside BOA → visible
    await pickAgePreset(page, age.preschoolers);
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Kinderen 6-11" → entirely inside BOA → visible
    await pickAgePreset(page, age.kids);
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Tieners 12-15" → min = 12 ≤ 16 → visible
    await pickAgePreset(page, age.teenagers);
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // "Jongeren 16-26" → min = 16 ≤ 16 → visible (overlaps at 16)
    await pickAgePreset(page, age.youngsters);
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();
  });

  test('appears for a custom range that overlaps with the BOA range', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    await openAgeRangeForm(page);

    const fromInput = minAgeInput(page);
    const tillInput = maxAgeInput(page);

    // Custom range 8-15 → min ≤ 16, max ≥ 2 → visible
    await fromInput.fill('8');
    await tillInput.fill('15');
    await tillInput.blur();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // Custom range 17-20 → min > 16 → hidden
    await fromInput.fill('17');
    await tillInput.fill('20');
    await tillInput.blur();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('clearing an entered age while "kinderen alleen" does not warn', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    await openAgeRangeForm(page);
    await minAgeInput(page).fill('12');
    await minAgeInput(page).blur();
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    const childrenOnlyPut = page.waitForResponse(
      (res) =>
        res.url().includes(`/events/${eventId}/children-only`) &&
        res.request().method() === 'PUT' &&
        res.ok(),
    );
    await childrenOnlyRadio(page).click();
    await childrenOnlyPut;

    // Emptying the field leaves no age to warn about, so no modal appears and
    // the question disappears with it.
    await minAgeInput(page).fill('');
    await minAgeInput(page).blur();

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('persists "Voor kinderen alleen" selection and switches back via the radio', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    await pickAgePreset(page, age.kids);
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
    await pickAgePreset(page, age.kids);
    await expect(page.getByText(audienceQuestionLocator)).toBeVisible();

    // Switch out → section hidden
    await pickAgePreset(page, age.adults);
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('warns before switching away from "kinderen alleen" when departurePlaces exist', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    // Put the age range in the BOA window and pick "kinderen alleen"
    await pickAgePreset(page, age.kids);
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

    // Add a departure place via the Begeleid vervoer tab and explicitly wait
    // for the PUT and the cache-invalidated GET refetch to complete — the
    // modal logic in AgeRangeStep reads departurePlaces from that offer
    // query, so we can't open the modal until the refetch lands.
    await page.getByRole('tab', { name: 'Begeleid vervoer' }).click();
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
      modal.getByText(confirmModal.departure_places.title),
    ).toBeVisible();
    await expect(
      modal.getByText(confirmModal.departure_places.body),
    ).toBeVisible();

    // Cancel → modal closes, audience selection stays at "kinderen alleen"
    await modal
      .getByRole('button', {
        name: confirmModal.departure_places.cancel,
      })
      .click();
    await expect(modal).toBeHidden();
    await expect(childrenOnlyRadio(page)).toBeChecked();

    // Click again, then confirm → audience flips and departure places are cleared
    await withFamilyRadio(page).click();
    await expect(modal).toBeVisible();
    await modal
      .getByRole('button', {
        name: confirmModal.departure_places.confirm,
      })
      .click();
    await expect(modal).toBeHidden();
    await expect(withFamilyRadio(page)).toBeChecked();

    await page.waitForLoadState('networkidle');

    // Optional sanity: the accessibility tab should be gone now that we're
    // no longer in "kinderen alleen" mode.
    await expect(
      page.getByRole('tab', { name: 'Begeleid vervoer' }),
    ).toBeHidden();
  });

  test('age outside 2–16 while "kinderen alleen": confirm resets audience and saves the new age', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    // Setup: 6–11 + children-only.
    await pickAgePreset(page, age.kids);
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

    // Move out of BOA range — preset "Volwassenen 18+" triggers the warning.
    await pickAgePreset(page, age.adults);

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(confirmModal.age_range.body)).toBeVisible();

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
        name: confirmModal.age_range.confirm,
      })
      .click();
    await confirmChildrenOnlyPut;
    await confirmAgePut;

    await page.goto(eventEditUrl);

    // New age (18+) no longer overlaps BOA → children-only section is hidden.
    await expect(page.getByText(audienceQuestionLocator)).toBeHidden();
  });

  test('age outside 2–16 while "kinderen alleen": cancel keeps the previous age and audience', async ({
    page,
    eventEditUrl,
    eventId,
  }) => {
    await page.goto(eventEditUrl);

    await pickAgePreset(page, age.kids);
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
    await pickAgePreset(page, age.adults);

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Cancel → modal closes, previous range + audience preserved.
    await modal
      .getByRole('button', {
        name: confirmModal.age_range.cancel,
      })
      .click();
    await expect(modal).toBeHidden();

    // "Kinderen 6-11" stays selected and the audience remains "kinderen
    // alleen" — proves field.onChange revert actually updated the
    // Controller's field.value (a setValue-based revert would not have).
    await expectSelectedAgeRange(page, ageRangeLabels.kids);
    await expect(childrenOnlyRadio(page)).toBeChecked();
  });

  test('blocks saving a new event until the question is answered', async ({
    page,
    baseURL,
  }) => {
    suppressHydrationErrors(page);

    await page.goto(`${baseURL}/create`);
    await page.getByRole('button', { name: 'Activiteit' }).click();
    await page.getByRole('button', { name: 'Concert' }).click();
    await page
      .locator('#calendar-step-day-day-1date-period-picker-start')
      .fill(addDays(new Date(), 1).toLocaleDateString('nl-BE'));
    await page.getByLabel('Gemeente').click();
    await page.getByLabel('Gemeente').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();
    await page.getByLabel('Kies een locatie').click();
    await page.getByLabel('Kies een locatie').fill('S.M');
    await page
      .getByRole('option', { name: 'S.M.A.K.', exact: true })
      .first()
      .click();
    await page.getByLabel('Naam van de activiteit').click();
    await page
      .getByLabel('Naam van de activiteit')
      .fill(`E2E ChildrenOnly Required ${Date.now()}`);
    // A new event has no age range yet, so the buttons are shown right away.
    await presetButton(page, age.kids).click();

    // A new event starts without an answer
    await expect(childrenOnlyRadio(page)).not.toBeChecked();
    await expect(withFamilyRadio(page)).not.toBeChecked();

    await page.getByRole('button', { name: 'Opslaan' }).click();

    await expect(page.getByText(childrenOnly.error)).toBeVisible();
    await expect(page).toHaveURL(/\/create/);

    // Answering the question unblocks the save
    await withFamilyRadio(page).click();
    await expect(page.getByText(childrenOnly.error)).toBeHidden();

    await page.getByRole('button', { name: 'Opslaan' }).click();
    await page.waitForURL('**/edit');
  });
});
