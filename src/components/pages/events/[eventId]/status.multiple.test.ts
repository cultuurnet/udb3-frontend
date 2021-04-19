// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/data/event' or its corr... Remove this comment to see the full error message
import { eventWithSubEvents } from '@/test/data/event';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/parseOfferId' or its c... Remove this comment to see the full error message
import { parseOfferId } from '@/utils/parseOfferId';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/setupPage' or its... Remove this comment to see the full error message
import { setupPage } from '@/test/utils/setupPage';

import { waitFor, screen } from '@testing-library/react/pure';

import Status from './status';
// @ts-expect-error ts-migrate(2732) FIXME: Cannot find module '@/i18n/nl.json'. Consider usin... Remove this comment to see the full error message
import nl from '@/i18n/nl.json';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/renderPageWithWra... Remove this comment to see the full error message
import { renderPageWithWrapper } from '@/test/utils/renderPageWithWrapper';
import userEvent from '@testing-library/user-event';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/waitForFetch' or ... Remove this comment to see the full error message
import { waitForFetch } from '@/test/utils/waitForFetch';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/OfferStatus' or it... Remove this comment to see the full error message
import { OfferStatus } from '@/constants/OfferStatus';

const setup = async () => {
  const page = setupPage({
    router: {
      query: {
        eventId: parseOfferId(eventWithSubEvents['@id']),
      },
    },
    responses: {
      '/event/:id': { body: eventWithSubEvents },
      'events/:id/subEvents': {},
    },
  });

  renderPageWithWrapper(<Status />);

  await waitFor(() =>
    // @ts-expect-error ts-migrate(2749) FIXME: 'Status' refers to a value, but is being used as a... Remove this comment to see the full error message
    screen.getByText(`Status voor ${eventWithSubEvents.name.nl}`),
  );

  return page;
};

test('I can save a status', async () => {
  const page = await setup();

  userEvent.click(screen.getByTestId('checkbox-0'));
  userEvent.click(screen.getByTestId('checkbox-2'));

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.changeStatus,
    }),
  );

  expect(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  ).toBeDisabled();

  userEvent.click(screen.getByLabelText(nl.offerStatus.status.event.available));

  expect(screen.getByLabelText(nl.offerStatus.reason)).toBeDisabled();

  expect(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  ).toBeEnabled();

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  );

  await waitForFetch(`/events/${page.router.query.eventId}/subEvents`);

  // 3rd API call, [url, payload] tuple
  expect(fetch.mock.calls[2][1].body).toEqual(
    JSON.stringify([
      {
        id: 0,
        status: { type: OfferStatus.AVAILABLE, reason: {} },
      },
      {
        id: 2,
        status: { type: OfferStatus.AVAILABLE, reason: {} },
      },
    ]),
  );
});

test('I can save a status with a reason', async () => {
  const page = await setup();

  userEvent.click(screen.getByTestId('checkbox-1'));
  userEvent.click(screen.getByTestId('checkbox-2'));

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.changeStatus,
    }),
  );

  userEvent.click(
    screen.getByLabelText(nl.offerStatus.status.event.unavailable),
  );

  expect(screen.getByLabelText(nl.offerStatus.reason)).toBeEnabled();

  userEvent.type(screen.getByLabelText(nl.offerStatus.reason), 'Lorem Ipsum');

  expect(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  ).toBeEnabled();

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  );

  await waitForFetch(`/events/${page.router.query.eventId}/subEvents`);

  // 3rd API call, [url, payload] tuple
  expect(fetch.mock.calls[2][1].body).toEqual(
    JSON.stringify([
      {
        id: 1,
        status: {
          type: OfferStatus.UNAVAILABLE,
          reason: { nl: 'Lorem Ipsum' },
        },
      },
      {
        id: 2,
        status: {
          type: OfferStatus.UNAVAILABLE,
          reason: { nl: 'Lorem Ipsum' },
        },
      },
    ]),
  );
});
