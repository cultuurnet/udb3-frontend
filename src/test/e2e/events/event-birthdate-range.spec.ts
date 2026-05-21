import { expect, test as base } from '@playwright/test';

import nl from '../../../i18n/nl.json';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const birthDate = nl.create.name_and_age.age.birth_date;

const ageInputModeAgeToggle = 'label[for="age-input-mode-age"]';
const ageInputModeDOBToggle = 'label[for="age-input-mode-date_of_birth"]';
const birthDateMinInput = '#age-birth-date-min';
const birthDateMaxInput = '#age-birth-date-max';

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
      `E2E Birthdate Range Test ${Date.now()}`,
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

test.describe('Birthdate range', () => {
  test('toggles between age input and birth-date input', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);

    // Default mode is age — birth-date controls are hidden
    await expect(page.getByText(birthDate.title)).toBeHidden();

    // Switch to birth-date mode — heading and two date inputs become visible
    await page.locator(ageInputModeDOBToggle).click();
    await expect(page.getByText(birthDate.title)).toBeVisible();
    await expect(page.locator(birthDateMinInput)).toBeVisible();
    await expect(page.locator(birthDateMaxInput)).toBeVisible();

    // Switching back hides the birth-date controls
    await page.locator(ageInputModeAgeToggle).click();
    await expect(page.getByText(birthDate.title)).toBeHidden();
  });

  test('shows inline error when "tot" date is before "van" date', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);
    await page.locator(ageInputModeDOBToggle).click();

    // No error visible on initial valid state
    await expect(page.getByText(birthDate.error_max_before_min)).toBeHidden();

    // Pick van = 2020-01-01
    await page.locator(birthDateMinInput).fill('01/01/2020');
    await page.locator(birthDateMinInput).press('Enter');

    // Pick tot = 2019-01-01 (earlier than van) → error
    await page.locator(birthDateMaxInput).fill('01/01/2019');
    await page.locator(birthDateMaxInput).press('Enter');

    await expect(page.getByText(birthDate.error_max_before_min)).toBeVisible();

    // Fix the range → error clears
    await page.locator(birthDateMaxInput).fill('31/12/2020');
    await page.locator(birthDateMaxInput).press('Enter');

    await expect(page.getByText(birthDate.error_max_before_min)).toBeHidden();
  });

  test('persists the birthdate range after a page reload', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);
    await page.locator(ageInputModeDOBToggle).click();

    await page.locator(birthDateMinInput).fill('01/01/2010');
    await page.locator(birthDateMinInput).press('Enter');

    await page.locator(birthDateMaxInput).fill('31/12/2015');
    await page.locator(birthDateMaxInput).press('Enter');

    // Wait for the PUT /birthdateRange mutation to complete
    await page.waitForResponse(
      (response) =>
        response.url().includes('/birthdateRange') &&
        response.request().method() === 'PUT' &&
        response.ok(),
    );

    await page.goto(eventEditUrl);

    // Birth-date controls should still be visible (component auto-switches
    // back to DOB mode when the offer carries a birthdateRange).
    await expect(page.getByText(birthDate.title)).toBeVisible();
    await expect(page.locator(birthDateMinInput)).toHaveValue('01/01/2010');
    await expect(page.locator(birthDateMaxInput)).toHaveValue('31/12/2015');
  });
});
