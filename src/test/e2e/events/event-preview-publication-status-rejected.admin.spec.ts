import { expect, test as base } from '@playwright/test';

import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

type TestFixtures = {
  rejectedEventId: string;
  rejectedEventUrl: string;
  deletedEventId: string;
  deletedEventUrl: string;
};

const test = base.extend<TestFixtures>({
  rejectedEventId: async ({}, applyFixture) => {
    const eventId = '0506fe15-d906-4a37-b963-1556729358a4';
    await applyFixture(eventId);
  },

  rejectedEventUrl: async ({ rejectedEventId }, applyFixture) => {
    await applyFixture(`/events/${rejectedEventId}`);
  },

  deletedEventId: async ({}, applyFixture) => {
    const eventId = '047e211a-0ed0-41eb-8993-40aad952e453';
    await applyFixture(eventId);
  },

  deletedEventUrl: async ({ deletedEventId }, applyFixture) => {
    await applyFixture(`/events/${deletedEventId}`);
  },
});

test.describe('Event Preview - Rejected Event Status (Admin)', () => {
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

  test('should display rejected status after admin rejects event', async ({
    page,
    rejectedEventId,
  }) => {
    await page.goto(`/events/${rejectedEventId}`);

    const rejectedStatus = page.getByText('Publicatie afgewezen');
    await expect(rejectedStatus).toBeVisible();

    const explanation = page.getByText(/Dit item werd afgewezen/);
    await expect(explanation).toBeVisible();

    const publicationRulesLink = page.getByRole('link', {
      name: /Bekijk de regels/,
    });
    await expect(publicationRulesLink).toBeVisible();
    await expect(publicationRulesLink).toHaveAttribute(
      'href',
      process.env.NEXT_PUBLIC_UDB_PUBLICATION_RULES_URL,
    );
    await expect(publicationRulesLink).toHaveAttribute('target', '_blank');

    const eventIdText = page.getByText(rejectedEventId);
    await expect(eventIdText).not.toBeVisible();

    const publicUrlLink = page.getByRole('link', {
      name: 'Bekijk op UiTinVlaanderen',
    });
    await expect(publicUrlLink).not.toBeVisible();
  });
});

test.describe('Event Preview - Deleted Event Status', () => {
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

  test('should display deleted status after event is deleted', async ({
    page,
    deletedEventUrl,
    deletedEventId,
  }) => {
    await page.goto(deletedEventUrl);
    const deletedStatus = page.getByText('Verwijderd');
    await expect(deletedStatus).toBeVisible();

    const eventIdText = page.getByText(deletedEventId);
    await expect(eventIdText).not.toBeVisible();

    const publicUrlLink = page.getByRole('link', {
      name: 'Bekijk op UiTinVlaanderen',
    });
    await expect(publicUrlLink).not.toBeVisible();
  });
});
