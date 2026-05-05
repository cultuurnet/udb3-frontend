import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';

import { createBasicEvent } from '../helpers/create-basic-event';

const faqData = {
  question: 'Wat zijn de openingsuren?',
  answer: 'We zijn open van 9u tot 17u.',
  editedQuestion: 'Wat zijn de openingstijden?',
};

const addFaqItem = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Voeg een veelgestelde vraag toe' })
    .click();
  await page
    .locator('[role="dialog"]')
    .getByRole('combobox')
    .fill(faqData.question);
  await page
    .locator('[role="dialog"]')
    .getByRole('textbox', { name: 'rdw-editor' })
    .fill(faqData.answer);
  await page
    .locator('[role="dialog"]')
    .getByRole('button', { name: 'Opslaan' })
    .click();
  await expect(page.getByText(faqData.question)).toBeVisible();
};

test.describe('FAQ', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.context().addCookies([
      {
        name: 'ff_boa',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await createBasicEvent(
      page,
      baseURL,
      `E2E FAQ test ${faker.lorem.words(2)}`,
    );
  });

  test('can add a FAQ item', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Voeg een veelgestelde vraag toe' })
      .click();

    await page
      .locator('[role="dialog"]')
      .getByRole('combobox')
      .fill(faqData.question);
    await page
      .locator('[role="dialog"]')
      .getByRole('textbox', { name: 'rdw-editor' })
      .fill(faqData.answer);

    await page
      .locator('[role="dialog"]')
      .getByRole('button', { name: 'Opslaan' })
      .click();

    await expect(page.getByText(faqData.question)).toBeVisible();
  });

  test('can edit a FAQ item', async ({ page }) => {
    await addFaqItem(page);

    await page.getByRole('button', { name: 'Bewerken' }).click();
    await page
      .locator('[role="dialog"]')
      .getByRole('combobox')
      .fill(faqData.editedQuestion);
    await page
      .locator('[role="dialog"]')
      .getByRole('button', { name: 'Opslaan' })
      .click();

    await expect(page.getByText(faqData.editedQuestion)).toBeVisible();
    await expect(page.getByText(faqData.question)).not.toBeVisible();
  });

  test('can delete a FAQ item', async ({ page }) => {
    await addFaqItem(page);

    await page.getByRole('button', { name: 'Verwijderen' }).click();
    await page.getByRole('button', { name: 'Definitief verwijderen' }).click();

    await expect(page.getByText(faqData.question)).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Voeg een veelgestelde vraag toe' }),
    ).toBeVisible();
  });
});
