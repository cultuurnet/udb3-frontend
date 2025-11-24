import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Users Search - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_users_search',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/users');
  });

  test('can navigate to users search page', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Gebruikers',
    );
  });

  test('has a form to search for users by email', async ({ page }) => {
    const searchInput = page.getByLabel('Zoeken op email');

    await searchInput.fill(faker.lorem.slug());
    await expect(
      page.locator('span:below(input[name="email"])').first(),
    ).toContainText('Geen geldig');

    await searchInput.fill('');
    await expect(
      page.locator('span:below(input[name="email"])').first(),
    ).toContainText('verplicht veld');

    await searchInput.fill(faker.internet.email());
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('alert-warning')).toContainText(
      'Geen gebruiker',
    );

    await searchInput.fill(process.env.E2E_TEST_ADMIN_EMAIL);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // @todo change the expected url when the user edit page is ready
    expect(page.url()).toContain(
      '/manage/users/' + process.env.E2E_TEST_ADMIN_EMAIL,
    );
  });
});
