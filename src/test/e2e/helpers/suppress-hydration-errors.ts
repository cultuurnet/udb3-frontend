import type { Page } from '@playwright/test';

export const suppressHydrationErrors = (page: Page) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('Hydration')) {
      return;
    }
  });
};
