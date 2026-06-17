import { expect, Page } from '@playwright/test';

export const addFaqItem = async (
  page: Page,
  question: string,
  answer: string,
) => {
  await page
    .getByRole('button', { name: 'Voeg een veelgestelde vraag toe' })
    .click();
  await page.locator('[role="dialog"]').getByRole('combobox').fill(question);
  await page
    .locator('[role="dialog"]')
    .getByRole('textbox', { name: 'rdw-editor' })
    .fill(answer);
  await page
    .locator('[role="dialog"]')
    .getByRole('button', { name: 'Opslaan' })
    .click();
  await expect(page.getByText(question)).toBeVisible();
};
