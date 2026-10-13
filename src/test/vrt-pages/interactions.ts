import type { Page } from '@playwright/test';

// Common beforeScreenshot case: type into a search box, wait for the matching result to appear.
export const fillAndWaitForText =
  (placeholder: string, value: string, expectedText: string) =>
  async (page: Page) => {
    await page.getByPlaceholder(placeholder).fill(value);
    await page.getByText(expectedText).waitFor();
  };
