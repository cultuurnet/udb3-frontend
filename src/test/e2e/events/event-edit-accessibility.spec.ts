import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import nl from '../../../i18n/nl.json';

const EVENT_ID = 'a0b6534b-3a64-4dfe-9875-968414cc26be';

const accessibility = nl.create.additionalInformation.accessibility;
const departure = accessibility.departure;

const locationHeading = (page: Page, number: number) =>
  page.getByRole('heading', {
    name: departure.location_title.replace('{{number}}', String(number)),
    exact: true,
  });

const waitForSave = (page: Page) =>
  page.waitForResponse(
    (res) => res.url().includes('/departurePlaces') && res.ok(),
  );

const pickDeparturePlace = async (
  page: Page,
  index: number,
  { zip, city, place }: { zip: string; city: string; place: string },
) => {
  await page.getByTestId(`departure-city-${index}`).fill(zip);
  await page.getByRole('option', { name: city }).click();

  await page.getByTestId(`departure-place-${index}`).fill(place.slice(0, 3));
  const saved = waitForSave(page);
  await page.getByRole('option', { name: place, exact: true }).first().click();
  await saved;
};

// A location is only really gone once its PUT has landed: navigating away
// first cancels the request and the location stays on the event.
const deleteDepartureLocation = async (page: Page, index: number) => {
  const saved = waitForSave(page);
  await page.locator(`#departure-delete-${index}`).click();
  await saved;
};

// Deleting the last location leaves an empty one behind, so the panel count
// never drops below 1. Walk down from the end to keep the lower ids stable.
const removeDepartureLocations = async (page: Page) => {
  const count = await page.locator('[id^="departure-delete-"]').count();
  for (let index = count - 1; index >= 0; index--) {
    await deleteDepartureLocation(page, index);
  }
};

const openAccessibilityTab = async (page: Page, baseURL: string) => {
  await page.goto(`${baseURL}/events/${EVENT_ID}/edit`);
  await page.getByRole('tab', { name: accessibility.title }).click();
  await expect(locationHeading(page, 1)).toBeVisible();
  await page.waitForLoadState('networkidle');
};

test.describe('Event Edit - Accessibility', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  test.beforeEach(async ({ context, page, baseURL }) => {
    await context.addCookies([
      { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
    ]);
    await openAccessibilityTab(page, baseURL);
    await removeDepartureLocations(page);
  });

  // The event is shared between runs, so anything left behind piles up until
  // the 20-location maximum disables the add button for good.
  test.afterEach(async ({ page }) => {
    await removeDepartureLocations(page);
  });

  test('adds, saves and deletes a departure place', async ({
    page,
    baseURL,
  }) => {
    await pickDeparturePlace(page, 0, {
      zip: '9000',
      city: '9000 Gent',
      place: 'S.M.A.K.',
    });

    await openAccessibilityTab(page, baseURL);
    await expect(page.getByText('S.M.A.K.').first()).toBeVisible();

    await page.getByRole('button', { name: departure.add }).click();
    await expect(locationHeading(page, 2)).toBeVisible();

    await pickDeparturePlace(page, 1, {
      zip: '1000',
      city: '1000 Brussel',
      place: 'Ancienne Belgique',
    });
    await expect(page.getByText('Ancienne Belgique')).toBeVisible();

    await deleteDepartureLocation(page, 1);
    await expect(locationHeading(page, 2)).toBeHidden();
    await expect(page.getByText('Ancienne Belgique')).toBeHidden();
  });

  test('creates a new departure place when it is not found', async ({
    page,
  }) => {
    const newPlaceName = `E2E Vertreklocatie ${faker.number.int()}`;

    await page.getByTestId('departure-city-0').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();
    await page.getByTestId('departure-place-0').fill(newPlaceName);

    const addNewOption = page.locator('.rbt-menu-custom-option');
    await expect(addNewOption).toContainText(
      'Locatie niet gevonden? Nieuwe locatie toevoegen',
    );
    await addNewOption.click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByLabel('Naam locatie')).toHaveValue(newPlaceName);
    await expect(modal.getByLabel('Postcode')).toHaveValue('9000');
    await expect(modal.getByLabel('Gemeente')).toHaveValue('Gent');

    await modal.getByLabel('Straat en nummer').fill('E2E test street 1');
    await modal.getByRole('button', { name: 'Bioscoop', exact: true }).click();

    const saved = waitForSave(page);
    await modal.getByRole('button', { name: 'Toevoegen', exact: true }).click();
    await saved;

    await expect(page.getByText(newPlaceName)).toBeVisible();
  });
});
