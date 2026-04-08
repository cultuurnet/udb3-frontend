import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Places translation', () => {
  test('Go to dashboard and select place to translate', async ({
    baseURL,
    page,
  }) => {
    const translations = [
      {
        lang: 'fr',
        newTitle: `${faker.lorem.words(5)} fr`,
        newDescription: faker.lorem.paragraphs(2),
        placeholder: 'Vertaal titel in fr',
      },
      {
        lang: 'de',
        newTitle: `${faker.lorem.words(5)} de`,
        newDescription: faker.lorem.paragraphs(2),
        placeholder: 'Vertaal titel in de',
      },
      {
        lang: 'en',
        newTitle: `${faker.lorem.words(5)} en`,
        newDescription: faker.lorem.paragraphs(2),
        placeholder: 'Vertaal titel in en',
      },
    ];

    await page.goto(`${baseURL}/dashboard?tab=places`);

    // Select first place link
    const firstPlaceLink = page.locator('a[href*="/places/"]').first();
    await firstPlaceLink.click();

    await page.waitForLoadState('networkidle');

    // get title of place
    const placeTitle = await page.getByRole('heading').first().innerText();

    await page.getByRole('button', { name: 'Vertalen' }).click();

    await page.waitForURL(/\/places\/.*\/translate/, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForLoadState('networkidle');

    await page.getByRole('heading', { name: placeTitle }).isVisible();

    // Test each language translation
    for (const translation of translations) {
      // Add translation for current language
      const langField = page.getByPlaceholder(translation.placeholder);
      await langField.fill(translation.newTitle);
      await langField.blur();

      //   Check for success toast on title update
      await expect(
        page.getByText(`Titel (${translation.lang}) succesvol bijgewerkt`),
      ).toBeVisible();

      const descriptionContainer = page.locator(
        `#description-editor-container-${translation.lang}`,
      );

      await descriptionContainer
        .getByRole('textbox', { name: 'rdw-editor' })
        .fill(translation.newDescription);
      await descriptionContainer
        .getByRole('textbox', { name: 'rdw-editor' })
        .blur();

      // Check for success toast on description update
      await expect(
        page.getByText(
          `Beschrijving (${translation.lang}) succesvol bijgewerkt`,
        ),
      ).toBeVisible();
    }

    // Go back to preview
    await page.getByRole('button', { name: 'Klaar met vertalen' }).click();
    await page.waitForURL(/\/places\/[a-f0-9-]+/, {
      waitUntil: 'domcontentloaded',
    });
  });
});
