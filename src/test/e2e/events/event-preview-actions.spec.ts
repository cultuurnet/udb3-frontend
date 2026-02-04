import { expect, test as base } from '@playwright/test';

type TestFixtures = {
  eventPreviewUrl: string;
  eventId: string;
};

const test = base.extend<TestFixtures>({
  eventId: async ({ page, baseURL }, applyFixture) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        return;
      }
    });
    await page.goto(`${baseURL}/create`);

    await page.getByRole('button', { name: 'Evenement' }).click();
    await page.getByRole('button', { name: 'Concert' }).click();
    await page
      .locator('#calendar-step-day-day-1date-period-picker-start')
      .fill(new Date(Date.now() + 86400000).toLocaleDateString('nl-BE'));

    await page.getByLabel('Gemeente').click();
    await page.getByLabel('Gemeente').fill('9000');
    await page.getByRole('option', { name: '9000 Gent' }).click();
    await page.getByLabel('Kies een locatie').click();
    await page.getByLabel('Kies een locatie').fill('S.M');
    await page
      .getByRole('option', { name: 'S.M.A.K.', exact: true })
      .first()
      .click();

    await page.getByLabel('Naam van het evenement').click();
    await page
      .getByLabel('Naam van het evenement')
      .fill(`E2E Sidebar Actions Test ${Date.now()}`);
    await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
    await page.getByRole('button', { name: 'Opslaan' }).click();

    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/event\/[a-f0-9-]+\/preview/);
    const url = page.url();
    const eventId = url.match(/\/event\/([a-f0-9-]+)\/preview/)?.[1] ?? '';

    await applyFixture(eventId);
  },

  eventPreviewUrl: async ({ eventId }, applyFixture) => {
    await applyFixture(`/events/${eventId}`);
  },
});

test.describe('Event Preview Sidebar Actions', () => {
  test.beforeEach(async ({ page, eventPreviewUrl }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        return;
      }
    });

    await page.goto(eventPreviewUrl);
    await page.waitForLoadState('networkidle');
  });

  test('should display all action buttons and be enabled', async ({ page }) => {
    const editButton = page.getByRole('button', { name: 'Bewerken' });
    await expect(editButton).toBeVisible();
    await expect(editButton).not.toBeDisabled();

    const translateButton = page.getByRole('button', { name: 'Vertalen' });
    await expect(translateButton).toBeVisible();
    await expect(translateButton).not.toBeDisabled();

    const duplicateButton = page.getByRole('button', {
      name: 'Kopiëren en aanpassen',
    });
    await expect(duplicateButton).toBeVisible();
    await expect(duplicateButton).not.toBeDisabled();

    const availabilityButton = page.getByRole('button', {
      name: 'Beschikbaarheid wijzigen',
    });
    await expect(availabilityButton).toBeVisible();
    await expect(availabilityButton).not.toBeDisabled();

    const deleteButton = page.getByRole('button', { name: 'Verwijderen' });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).not.toBeDisabled();
  });

  test.skip('should navigate to edit page when Edit button is clicked', async ({
    page,
    eventId,
  }) => {
    await page.getByRole('button', { name: 'Bewerken' }).click();
    await page.waitForURL(`**/events/${eventId}/edit`);
  });

  test.skip('should navigate to translate page when Translate button is clicked', async ({
    page,
    eventId,
  }) => {
    await page.getByRole('button', { name: 'Vertalen' }).click();
    await page.waitForURL(`**/events/${eventId}/translate`);
  });

  test.skip('should navigate to duplicate page when Duplicate button is clicked', async ({
    page,
    eventId,
  }) => {
    await page.getByRole('button', { name: 'Kopiëren en aanpassen' }).click();
    await page.waitForURL(`**/events/${eventId}/duplicate`);
  });

  test.skip('should navigate to availability page when Change Availability button is clicked', async ({
    page,
    eventId,
  }) => {
    await page
      .getByRole('button', { name: 'Beschikbaarheid wijzigen' })
      .click();
    await page.waitForURL(`**/events/${eventId}/availability`);
  });

  test.skip('should only show duplicate button for expired event', async ({
    page,
    eventId,
  }) => {
    const editButton = page.getByRole('button', { name: 'Bewerken' });
    await editButton.click();
    await page.waitForURL(`**/events/${eventId}/edit`);

    const pastDate = new Date(Date.now() - 86400000 * 30);
    await page
      .locator('#calendar-step-day-day-2date-period-picker-start')
      .fill(pastDate.toLocaleDateString('nl-BE'));
    await page
      .locator('#calendar-step-day-day-2date-period-picker-end')
      .fill(pastDate.toLocaleDateString('nl-BE'));

    await page.getByRole('button', { name: 'Klaar met bewerken' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: 'Bewerken' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Vertalen' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Kopiëren en aanpassen' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Beschikbaarheid wijzigen' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Verwijderen' }),
    ).not.toBeVisible();
  });
});
