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

    const firstPlaceLink = page.locator('a[href*="/places/"]').first();
    await firstPlaceLink.click();

    await page.waitForLoadState('networkidle');

    const placeTitle = await page.getByRole('heading').first().innerText();

    await page.getByRole('button', { name: 'Vertalen' }).click();
    await page.waitForURL(/\/places\/.*\/translate/, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    await page.getByRole('heading', { name: placeTitle }).isVisible();

    for (const translation of translations) {
      const langField = page.getByPlaceholder(translation.placeholder);
      await langField.fill(translation.newTitle);
      await langField.blur();

      await expect(
        page.getByText(`Titel (${translation.lang}) succesvol bijgewerkt`),
      ).toBeVisible();
      await page.locator('.toast svg[data-icon="xmark"]').first().click();
      await expect(page.locator('.toast')).not.toBeVisible();
    }

    await expect(
      page.getByRole('tab', { name: 'Titel' }).locator('.fa-circle-check'),
    ).toBeVisible();

    const descriptionTab = page.getByRole('tab', { name: 'Beschrijving' });

    if (await descriptionTab.isVisible()) {
      await descriptionTab.click();

      for (const translation of translations) {
        const descriptionContainer = page.locator(
          `#description-container-${translation.lang}`,
        );

        await descriptionContainer
          .getByRole('textbox', { name: 'rdw-editor' })
          .fill(translation.newDescription);
        await descriptionContainer
          .getByRole('textbox', { name: 'rdw-editor' })
          .blur();

        await expect(
          page.getByText(
            `Beschrijving (${translation.lang}) succesvol bijgewerkt`,
          ),
        ).toBeVisible();
        await page.locator('.toast svg[data-icon="xmark"]').first().click();
      await expect(page.locator('.toast')).not.toBeVisible();
      }

      await expect(
        page
          .getByRole('tab', { name: 'Beschrijving' })
          .locator('.fa-circle-check'),
      ).toBeVisible();
    }

    await page.getByRole('button', { name: 'Klaar met vertalen' }).click();
    await page.waitForURL(/\/places\/[a-f0-9-]+/, {
      waitUntil: 'domcontentloaded',
    });
  });
});
