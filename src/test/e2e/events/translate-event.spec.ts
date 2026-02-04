import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Event translation', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'ff_react_translate_events',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

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

    await page.goto(`${baseURL}/dashboard`);

    // Sort events by availableTo descending to get an event that is likely not yet past.
    const sorting_select = page.locator('select#sorting');
    await sorting_select.selectOption('availableTo_desc');
    await page.waitForLoadState('networkidle');

    // Select first link with /preview in href
    const firstEventLink = page.locator('a[href*="/preview"]').first();
    await firstEventLink.click();

    await page.waitForLoadState('networkidle');

    const iframe = page.frameLocator('iframe');

    // get title of event
    const eventTitle = await iframe.locator('h1').first().innerText();

    await iframe.getByRole('button', { name: 'Vertalen' }).click();

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
    await page.waitForURL(/\/event\/.*\/preview/, {
      waitUntil: 'domcontentloaded',
    });
  });
});
