// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/data/event' or its corr... Remove this comment to see the full error message
import { event } from '@/test/data/event';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/parseOfferId' or its c... Remove this comment to see the full error message
import { parseOfferId } from '@/utils/parseOfferId';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/setupPage' or its... Remove this comment to see the full error message
import { setupPage } from '@/test/utils/setupPage';

import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Status from './status';
// @ts-expect-error ts-migrate(2732) FIXME: Cannot find module '@/i18n/nl.json'. Consider usin... Remove this comment to see the full error message
import nl from '@/i18n/nl.json';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/renderPageWithWra... Remove this comment to see the full error message
import { renderPageWithWrapper } from '@/test/utils/renderPageWithWrapper';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/waitForFetch' or ... Remove this comment to see the full error message
import { waitForFetch } from '@/test/utils/waitForFetch';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/OfferStatus' or it... Remove this comment to see the full error message
import { OfferStatus } from '@/constants/OfferStatus';

const setup = async () => {
  const page = setupPage({
    router: {
      query: {
        eventId: parseOfferId(event['@id']),
      },
    },
    responses: {
      '/event/:id': { body: event },
      '/events/:id/status': {},
    },
  });

  renderPageWithWrapper(<Status />);
  // @ts-expect-error ts-migrate(2749) FIXME: 'Status' refers to a value, but is being used as a... Remove this comment to see the full error message
  await waitFor(() => screen.getByText(`Status voor ${event.name.nl}`));

  return page;
};

test('I can save a status', async () => {
  const page = await setup();

  expect(
    screen.getByLabelText(nl.offerStatus.status.event.available),
  ).toBeChecked();

  expect(screen.getByLabelText(nl.offerStatus.reason)).toBeDisabled();

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  );

  await waitForFetch(`/events/${page.router.query.eventId}/status`);

  // 3rd API call, [url, payload] tuple
  expect(fetch.mock.calls[2][1].body).toEqual(
    JSON.stringify({
      type: OfferStatus.AVAILABLE,
    }),
  );

  expect(page.router.push).toBeCalledWith(
    `/event/${page.router.query.eventId}/preview`,
  );
});

test('I can save a status with a reason', async () => {
  const page = await setup();

  userEvent.click(
    screen.getByLabelText(nl.offerStatus.status.event.temporarilyUnavailable),
  );

  expect(
    screen.getByLabelText(nl.offerStatus.status.event.available),
  ).not.toBeChecked();

  expect(
    screen.getByLabelText(nl.offerStatus.status.event.temporarilyUnavailable),
  ).toBeChecked();

  expect(screen.getByLabelText(nl.offerStatus.reason)).toBeEnabled();

  const reason = 'Lorem ipsum';

  userEvent.type(screen.getByLabelText(nl.offerStatus.reason), reason);

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  );

  await waitForFetch(`/events/${page.router.query.eventId}/status`);

  // 3rd API call, [url, payload] tuple
  expect(fetch.mock.calls[2][1].body).toEqual(
    JSON.stringify({
      type: OfferStatus.TEMPORARILY_UNAVAILABLE,
      reason: { nl: reason },
    }),
  );

  expect(page.router.push).toBeCalledWith(
    `/event/${page.router.query.eventId}/preview`,
  );
});

test('The reason and error are cleared when switching back to "available"', async () => {
  await setup();

  userEvent.click(
    screen.getByLabelText(nl.offerStatus.status.event.temporarilyUnavailable),
  );

  userEvent.type(
    screen.getByLabelText(nl.offerStatus.reason),
    'Nam quis nulla. Integer malesuada. In in enim a arcu imperdiet malesuada. Sed vel lectus. Donec odio urna, tempus molestie, porttitor ut, iaculis quis, sem. Phasellus rhoncus. Aenean id metus id velit ullamcorper pulvina',
  );

  expect(screen.getByRole('alert')).toBeInTheDocument();

  expect(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.save,
    }),
  ).toBeDisabled();

  userEvent.click(screen.getByLabelText(nl.offerStatus.status.event.available));

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();

  expect(screen.getByLabelText(nl.offerStatus.reason).value).toBe('');
});

test('I can cancel', async () => {
  const page = await setup();

  userEvent.click(
    screen.getByRole('button', {
      name: nl.offerStatus.actions.cancel,
    }),
  );

  expect(page.router.push).toBeCalledWith(
    `/event/${page.router.query.eventId}/edit`,
  );
});
