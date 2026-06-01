import { test as setup } from '@playwright/test';

const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/login/nl`);

  await page.getByRole('button', { name: 'Start hier' }).click();

  await page.waitForURL(/account-acc.uitid.be\/*/);

  await page
    .locator('input[name="username"]')
    .fill(process.env.E2E_TEST_ADMIN_EMAIL);
  await page
    .getByLabel('Je wachtwoord')
    .fill(process.env.E2E_TEST_ADMIN_PASSWORD);

  await page.getByRole('button', { name: 'Meld je aan', exact: true }).click();

  // The welcome title only renders once useGetUserQuery resolves —
  // by the time it's visible, the auth cookies/tokens are populated, so
  // it's safe to save storage state. Avoid `networkidle`: dashboard polling
  // queries keep the network alive and would never let it settle.
  await page.getByText('Welkom').waitFor({ timeout: 60_000 });

  await page.context().storageState({ path: adminAuthFile });
});
