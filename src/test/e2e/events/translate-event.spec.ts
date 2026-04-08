import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Event translation', () => {
  test('Go to dashboard and select event to translate', async ({
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

    // Go to a permanent event preview page.
    await page.goto(`${baseURL}/events/e9f0f4e6-8f4e-4f4f-9aae-901f90f1c48b`);

    await page.waitForLoadState('networkidle');
    // get title of event
    const eventTitle = await page.locator('h1').first().innerText();

    await page.getByRole('button', { name: 'Vertalen' }).click();

    await page.waitForURL(/\/events\/.*\/translate/, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForLoadState('networkidle');

    await page.getByRole('heading', { name: eventTitle }).isVisible();

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
    await page.waitForURL(/\/events\/.*/, {
      waitUntil: 'domcontentloaded',
    });
  });
});
