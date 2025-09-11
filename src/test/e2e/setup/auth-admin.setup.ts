import { expect, test as setup } from '@playwright/test';

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

  // Now we're back to our own app
  // Wait that the main page has loaded
  // await page.waitForURL(new RegExp(`${baseURL}/dashboard*`), {
  //   timeout: 60_000,
  // });

  // Wait for network to be idle, if we save storage too early, needed storage values might not yet be available
  await page.waitForLoadState('networkidle');

  await page.getByText('Welkom').waitFor();

  await page.context().storageState({ path: adminAuthFile });
});
