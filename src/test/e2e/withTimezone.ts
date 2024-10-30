import { type Browser, type Page } from '@playwright/test';

export async function withTimezone(
  ctx: { browser: Browser; timezoneId: string },
  testFn: (page: Page) => Promise<void>,
) {
  const context = await ctx.browser.newContext({ timezoneId: ctx.timezoneId });
  const page = await context.newPage();
  await testFn(page);
  await context.close();
}
