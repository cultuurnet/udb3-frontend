import { expect, Page, test as base } from '@playwright/test';

import { AgeRanges } from '../../../constants/AgeRange';
import nl from '../../../i18n/nl.json';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const age = nl.create.name_and_age.age;
const birthDate = age.birth_date;
const switchModal = age.confirm_modal.input_mode;

const ageInputModeAgeToggle = '[data-testid="age-input-mode-age"]';
const ageInputModeDOBToggle = '[data-testid="age-input-mode-date_of_birth"]';
const birthDateMinInput = '#age-birth-date-min';
const birthDateMaxInput = '#age-birth-date-max';

const adultsCategory = `${age.adults} ${AgeRanges.ADULTS.label}`;
const kidsCategory = `${age.kids} ${AgeRanges.KIDS.label}`;

const minAgeInput = (page: Page) =>
  page.getByPlaceholder(age.from, { exact: true });
const maxAgeInput = (page: Page) =>
  page.getByPlaceholder(age.till, { exact: true });

const selectedCategory = (page: Page, label: string) =>
  page.getByText(label, { exact: true });

const waitForBirthdateRangePut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/birthdateRange') &&
      response.request().method() === 'PUT' &&
      response.ok(),
  );

const waitForTypicalAgeRangePut = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes('/typicalAgeRange') &&
      response.request().method() === 'PUT' &&
      response.ok(),
  );

const confirmSwitch = async (page: Page) => {
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: switchModal.confirm }).click();
  await expect(modal).toBeHidden();
};

const switchToBirthdateInput = async (page: Page) => {
  await expect(selectedCategory(page, adultsCategory)).toBeVisible();
  await page.locator(ageInputModeDOBToggle).click();
  await confirmSwitch(page);
  await expect(page.getByText(birthDate.title)).toBeVisible();
};

const switchToAgeInput = async (page: Page) => {
  await expect(page.getByText(birthDate.title)).toBeVisible();
  await page.locator(ageInputModeAgeToggle).click();
  await confirmSwitch(page);
  await expect(page.getByText(birthDate.title)).toBeHidden();
};

const saveBirthdateRange = async (page: Page, from: string, to: string) => {
  const minPut = waitForBirthdateRangePut(page);
  await page.locator(birthDateMinInput).fill(from);
  await page.locator(birthDateMinInput).press('Enter');
  await minPut;

  const maxPut = waitForBirthdateRangePut(page);
  await page.locator(birthDateMaxInput).fill(to);
  await page.locator(birthDateMaxInput).press('Enter');
  await maxPut;
};

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
    await switchToBirthdateInput(page);
    await expect(page.locator(birthDateMinInput)).toBeVisible();
    await expect(page.locator(birthDateMaxInput)).toBeVisible();

    // Switching back hides the birth-date controls
    await page.locator(ageInputModeAgeToggle).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(birthDate.title)).toBeHidden();
  });

  test('shows inline error when "tot" date is before "van" date', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);
    await switchToBirthdateInput(page);

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

  test('saving a birthdate range clears the age range', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);
    await switchToBirthdateInput(page);
    await saveBirthdateRange(page, '01/01/2010', '31/12/2015');

    await page.goto(eventEditUrl);

    await expect(page.getByText(birthDate.title)).toBeVisible();
    await expect(page.locator(birthDateMinInput)).toHaveValue('01/01/2010');
    await expect(page.locator(birthDateMaxInput)).toHaveValue('31/12/2015');

    await switchToAgeInput(page);
    await expect(minAgeInput(page)).toHaveValue('');
    await expect(maxAgeInput(page)).toHaveValue('');
  });

  test('saving an age range clears the birthdate range', async ({
    page,
    eventEditUrl,
  }) => {
    await page.goto(eventEditUrl);
    await switchToBirthdateInput(page);
    await saveBirthdateRange(page, '01/01/2010', '31/12/2015');

    await page.goto(eventEditUrl);
    await switchToAgeInput(page);

    const agePut = waitForTypicalAgeRangePut(page);
    await page.getByRole('button', { name: new RegExp(age.kids) }).click();
    await agePut;

    await page.goto(eventEditUrl);

    await expect(selectedCategory(page, kidsCategory)).toBeVisible();
    await expect(page.getByText(birthDate.title)).toBeHidden();
  });

  test('cancel keeps the age range', async ({ page, eventEditUrl }) => {
    await page.goto(eventEditUrl);
    await expect(selectedCategory(page, adultsCategory)).toBeVisible();

    await page.locator(ageInputModeDOBToggle).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(switchModal.body);

    await modal.getByRole('button', { name: switchModal.cancel }).click();
    await expect(modal).toBeHidden();

    await expect(page.getByText(birthDate.title)).toBeHidden();
    await expect(selectedCategory(page, adultsCategory)).toBeVisible();
  });

  test('saves only after a date changes', async ({ page, eventEditUrl }) => {
    await page.goto(eventEditUrl);

    const ageWrites: string[] = [];
    page.on('request', (request) => {
      const { pathname } = new URL(request.url());
      if (
        request.method() !== 'GET' &&
        /\/(typicalAgeRange|birthdateRange)$/.test(pathname)
      ) {
        ageWrites.push(`${request.method()} ${pathname}`);
      }
    });

    await switchToBirthdateInput(page);
    await expect(page.locator(birthDateMinInput)).toBeVisible();
    expect(ageWrites).toEqual([]);

    await page.goto(eventEditUrl);
    await expect(page.getByText(birthDate.title)).toBeHidden();
    await expect(selectedCategory(page, adultsCategory)).toBeVisible();
  });

  test('cancel keeps the birthdate range', async ({ page, eventEditUrl }) => {
    await page.goto(eventEditUrl);
    await switchToBirthdateInput(page);
    await saveBirthdateRange(page, '01/01/2010', '31/12/2015');

    await page.locator(ageInputModeAgeToggle).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(switchModal.body);

    await modal.getByRole('button', { name: switchModal.cancel }).click();
    await expect(modal).toBeHidden();

    await expect(page.getByText(birthDate.title)).toBeVisible();
    await expect(page.locator(birthDateMinInput)).toHaveValue('01/01/2010');
  });
});
