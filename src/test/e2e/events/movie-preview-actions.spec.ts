import { expect, test as base } from '@playwright/test';

type TestFixtures = {
  moviePreviewUrl: string;
  movieEventId: string;
};

const test = base.extend<TestFixtures>({
  movieEventId: async ({ page, baseURL }, applyFixture) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        return;
      }
    });
    await page.goto(`${baseURL}/create`);

    await page.getByRole('button', { name: 'Evenement' }).click();
    await page.getByRole('button', { name: 'Film' }).click();
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
      .fill(`E2E Movie Sidebar Actions Test ${Date.now()}`);
    await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
    await page.getByRole('button', { name: 'Opslaan' }).click();

    await page.getByRole('tab', { name: 'Labels' }).click();
    await page.getByLabel('Verfijn met labels').fill('udb-filminvoer');
    await page.getByRole('option', { name: 'udb-filminvoer' }).click();

    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/event\/[a-f0-9-]+\/preview/);
    const url = page.url();
    const movieEventId = url.match(/\/event\/([a-f0-9-]+)\/preview/)?.[1] ?? '';

    await applyFixture(movieEventId);
  },

  moviePreviewUrl: async ({ movieEventId }, applyFixture) => {
    await applyFixture(`/events/${movieEventId}`);
  },
});

test.describe('Movie Preview Sidebar Actions', () => {
  test.beforeEach(async ({ page, moviePreviewUrl }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        return;
      }
    });

    await page.goto(moviePreviewUrl);
    await page.waitForLoadState('networkidle');
  });

  test('should display all movie action buttons and be enabled', async ({
    page,
  }) => {
    const editButton = page.getByRole('button', {
      name: 'Bewerken',
      exact: true,
    });
    await expect(editButton).toBeVisible();
    await expect(editButton).not.toBeDisabled();
    await expect(editButton.locator('svg.fa-pencil')).toBeVisible();

    const editMovieButton = page.getByRole('button', {
      name: 'Bewerken als film',
    });
    await expect(editMovieButton).toBeVisible();
    await expect(editMovieButton).not.toBeDisabled();
    await expect(editMovieButton.locator('svg.fa-video')).toBeVisible();

    const translateButton = page.getByRole('button', { name: 'Vertalen' });
    await expect(translateButton).toBeVisible();
    await expect(translateButton).not.toBeDisabled();
    await expect(translateButton.locator('svg.fa-globe')).toBeVisible();

    const duplicateButton = page.getByRole('button', {
      name: 'Kopiëren en aanpassen',
      exact: true,
    });
    await expect(duplicateButton).toBeVisible();
    await expect(duplicateButton).not.toBeDisabled();
    await expect(duplicateButton.locator('svg.fa-copy')).toBeVisible();

    const duplicateAsMovieButton = page.getByRole('button', {
      name: 'Kopiëren en aanpassen als film',
    });
    await expect(duplicateAsMovieButton).toBeVisible();
    await expect(duplicateAsMovieButton).not.toBeDisabled();
    await expect(duplicateAsMovieButton.locator('svg.fa-video')).toBeVisible();

    const availabilityButton = page.getByRole('button', {
      name: 'Beschikbaarheid wijzigen',
    });
    await expect(availabilityButton).toBeVisible();
    await expect(availabilityButton).not.toBeDisabled();
    await expect(
      availabilityButton.locator('svg.fa-calendar-check'),
    ).toBeVisible();

    const deleteButton = page.getByRole('button', { name: 'Verwijderen' });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).not.toBeDisabled();
    await expect(deleteButton.locator('svg.fa-trash')).toBeVisible();
  });

  test('should navigate to edit page when Edit button is clicked', async ({
    page,
    movieEventId,
  }) => {
    await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
    await page.waitForURL(`**/events/${movieEventId}/edit`);
  });

  test('should navigate to edit-movie page when Edit Movie button is clicked', async ({
    page,
    movieEventId,
  }) => {
    await page.getByRole('button', { name: 'Bewerken als film' }).click();
    await page.waitForURL(`**/manage/movies/${movieEventId}/edit`);
  });

  test('should navigate to translate page when Translate button is clicked', async ({
    page,
    movieEventId,
  }) => {
    await page.getByRole('button', { name: 'Vertalen' }).click();
    await page.waitForURL(`**/events/${movieEventId}/translate`);
  });

  test('should navigate to duplicate page when Duplicate button is clicked', async ({
    page,
    movieEventId,
  }) => {
    await page
      .getByRole('button', { name: 'Kopiëren en aanpassen', exact: true })
      .click();
    await page.waitForURL(`**/events/${movieEventId}/duplicate`);
  });

  test('should navigate to duplicate-movie page when Duplicate as Movie button is clicked', async ({
    page,
    movieEventId,
  }) => {
    await page
      .getByRole('button', { name: 'Kopiëren en aanpassen als film' })
      .click();
    await page.waitForURL(`**/events/${movieEventId}/duplicate-movie`);
  });

  test('should navigate to availability page when Change Availability button is clicked', async ({
    page,
    movieEventId,
  }) => {
    await page
      .getByRole('button', { name: 'Beschikbaarheid wijzigen' })
      .click();
    await page.waitForURL(`**/events/${movieEventId}/availability`);
  });

  test('should only show two duplicate buttons for expired movie event', async ({
    page,
    movieEventId,
  }) => {
    const editButton = page.getByRole('button', {
      name: 'Bewerken',
      exact: true,
    });
    await editButton.click();
    await page.waitForURL(`**/events/${movieEventId}/edit`);

    const pastDate = new Date(Date.now() - 86400000 * 30);
    await page
      .locator('#calendar-step-day-day-2date-period-picker-start')
      .fill(pastDate.toLocaleDateString('nl-BE'));
    await page
      .locator('#calendar-step-day-day-2date-period-picker-end')
      .fill(pastDate.toLocaleDateString('nl-BE'));

    await page.getByRole('button', { name: 'Klaar met bewerken' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto(`/events/${movieEventId}`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: 'Bewerken', exact: true }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Bewerken als film', exact: false }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Vertalen' }),
    ).not.toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Kopiëren en aanpassen', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Kopiëren en aanpassen als film',
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Beschikbaarheid wijzigen' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Verwijderen' }),
    ).not.toBeVisible();
  });
});
