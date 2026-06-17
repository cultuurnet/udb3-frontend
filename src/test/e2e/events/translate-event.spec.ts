import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { addFaqItem } from '../helpers/add-faq-item';
import { createBasicEvent } from '../helpers/create-basic-event';

const translations = [
  { lang: 'fr', placeholder: 'Vertaal titel in fr' },
  { lang: 'de', placeholder: 'Vertaal titel in de' },
  { lang: 'en', placeholder: 'Vertaal titel in en' },
];

test.describe.serial('Event translation', () => {
  let translateUrl: string;

  test.beforeAll(async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
    ]);
    const page = await context.newPage();

    await createBasicEvent(
      page,
      baseURL,
      `E2E Translate ${faker.lorem.words(2)}`,
    );

    await page
      .getByRole('textbox', { name: 'rdw-editor' })
      .fill(faker.lorem.paragraph());
    await page.getByText('Geef een enthousiaste').click();

    await addFaqItem(page, 'Test FAQ vraag?', 'Test FAQ antwoord');

    const eventId = page.url().match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';
    await page.goto(`${baseURL}/events/${eventId}`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Vertalen' }).click();
    await page.waitForURL(/\/events\/.*\/translate/, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    translateUrl = page.url();
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await page
      .context()
      .addCookies([
        { name: 'ff_boa', value: 'true', domain: 'localhost', path: '/' },
      ]);
    await page.goto(translateUrl);
    await page.waitForLoadState('networkidle');
  });

  test('translates title', async ({ page }) => {
    for (const { lang, placeholder } of translations) {
      const langField = page.getByPlaceholder(placeholder);
      await langField.fill(`${faker.lorem.words(5)} ${lang}`);
      await langField.blur();

      await expect(
        page.getByText(`Titel (${lang}) succesvol bijgewerkt`),
      ).toBeVisible();
      await page.locator('.toast svg[data-icon="xmark"]').click();
    }

    await expect(
      page.getByRole('tab', { name: 'Titel' }).locator('.fa-circle-check'),
    ).toBeVisible();
  });

  test('translates description', async ({ page }) => {
    await page.getByRole('tab', { name: 'Beschrijving' }).click();

    for (const { lang } of translations) {
      const descriptionContainer = page.locator(
        `#description-container-${lang}`,
      );

      await descriptionContainer
        .getByRole('textbox', { name: 'rdw-editor' })
        .fill(faker.lorem.paragraphs(2));
      await descriptionContainer
        .getByRole('textbox', { name: 'rdw-editor' })
        .blur();

      await expect(
        page.getByText(`Beschrijving (${lang}) succesvol bijgewerkt`),
      ).toBeVisible();
      await page.locator('.toast svg[data-icon="xmark"]').click();
    }

    await expect(
      page
        .getByRole('tab', { name: 'Beschrijving' })
        .locator('.fa-circle-check'),
    ).toBeVisible();
  });

  test('translates faq', async ({ page }) => {
    await page.getByRole('tab', { name: 'FAQ' }).click();

    for (const { lang } of translations) {
      const faqContainer = page.locator(`#faq-translation-0-${lang}`);

      await faqContainer
        .getByPlaceholder(`Vertaal vraag in ${lang}`)
        .fill(`Test FAQ vraag ${lang}`);

      await faqContainer
        .getByRole('textbox', { name: 'rdw-editor' })
        .fill(`Test FAQ antwoord ${lang}`);
      await faqContainer.getByRole('textbox', { name: 'rdw-editor' }).blur();

      await expect(page.getByText('FAQ succesvol bijgewerkt')).toBeVisible();
      await page.locator('.toast svg[data-icon="xmark"]').click();
    }

    await expect(
      page.getByRole('tab', { name: 'FAQ' }).locator('.fa-circle-check'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Klaar met vertalen' }).click();
    await page.waitForURL(/\/events\/.*/, { waitUntil: 'domcontentloaded' });
  });
});
