import { expect, test as base } from '@playwright/test';

import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

type TestFixtures = {
  cultuurkuurEventUrl: string;
  cultuurkuurEventId: string;
};

const test = base.extend<TestFixtures>({
  cultuurkuurEventId: async ({ page, baseURL }, applyFixture) => {
    suppressHydrationErrors(page);
    await page.goto(`${baseURL}/create`);

    await page.getByRole('button', { name: 'Evenement' }).click();

    await page.getByText('Dit is een evenement voor scholen').click();

    await expect(
      page.getByText(
        'Je evenement zal verschijnen op cultuurkuur.be, het platform voor onderwijs & cultuur',
      ),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Theatervoorstelling' }).click();
    await page.getByRole('button', { name: 'Tekst en muziektheater' }).click();

    await page
      .getByRole('button', { name: 'Tijdstip in overleg met de school' })
      .click();

    await page
      .getByRole('button', { name: 'Op een locatie in overleg met de school' })
      .click();

    await page.getByLabel('Naam van het evenement').click();
    await page
      .getByLabel('Naam van het evenement')
      .fill(`E2E Cultuurkuur Publication Test ${Date.now()}`);

    await page.getByRole('button', { name: 'Opslaan' }).click();

    await page
      .getByRole('button', { name: 'Provincie, regio of gemeente toevoegen' })
      .click();

    await page.getByText('Regio Leiestreek West-Vlaanderen').click();
    await page.getByRole('button', { name: 'Kortrijk' }).click();
    await page.getByRole('button', { name: 'Zwevegem' }).click();

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Opslaan' })
      .click();

    await page.getByRole('button', { name: 'Opslaan' }).click();

    await page
      .getByRole('button', { name: 'Onderwijsniveaus toevoegen' })
      .click();

    await page.getByText('Gewoon kleuteronderwijs', { exact: true }).click();
    await page.getByRole('button', { name: 'Kleuter (4-5 jaar)' }).click();

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Opslaan' })
      .click();

    await page.getByRole('button', { name: 'Opslaan' }).click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

    await page.waitForURL(/\/events\/[a-f0-9-]+/);
    const url = page.url();
    const eventId = url.match(/\/events\/([a-f0-9-]+)/)?.[1] ?? '';

    await applyFixture(eventId);
  },

  cultuurkuurEventUrl: async ({ cultuurkuurEventId }, applyFixture) => {
    await applyFixture(`/events/${cultuurkuurEventId}`);
  },
});

test.describe('Cultuurkuur Event - Publication Status Display', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'ff_react_event_preview',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    suppressHydrationErrors(page);
  });

  test('should display Cultuurkuur branded public URL', async ({
    page,
    cultuurkuurEventUrl,
    cultuurkuurEventId,
  }) => {
    await page.goto(cultuurkuurEventUrl);

    await page.getByRole('button', { name: 'Bewerken' }).waitFor();

    const publicUrlLink = page.getByRole('link', {
      name: 'Bekijk op Cultuurkuur',
    });
    await expect(publicUrlLink).toBeVisible();

    await expect(publicUrlLink).toHaveAttribute(
      'href',
      `https://cultuurkuur.be/event/${cultuurkuurEventId}`,
    );

    await expect(publicUrlLink).toHaveAttribute('target', '_blank');
  });

  test('should display Cultuurkuur publication alert after editing', async ({
    page,
    cultuurkuurEventId,
  }) => {
    await page.goto(`/events/${cultuurkuurEventId}/edit`);
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: 'Klaar met bewerken' }).click();

    await page.waitForURL(/\/events\/[a-f0-9-]+\?edited=true/);

    const alert = page.getByText(/binnen een dag.*zichtbaar op.*Cultuurkuur/);
    await expect(alert).toBeVisible();
  });
});
