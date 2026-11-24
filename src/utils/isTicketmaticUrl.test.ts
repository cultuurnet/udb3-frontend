import getConfig from 'next/config';

import { isTicketmaticUrl } from './isTicketmaticUrl';

jest.mock('next/config', () => jest.fn());

const mockHosts = (hosts: string | undefined) =>
  (getConfig as jest.Mock).mockReturnValue({
    publicRuntimeConfig: { ticketmaticReservationLinkHosts: hosts },
  });

describe('isTicketmaticUrl', () => {
  beforeEach(() => {
    mockHosts('tickets.ticketmatic.com');
  });

  it('matches a url on a configured host', () => {
    expect(isTicketmaticUrl('https://tickets.ticketmatic.com/event/1')).toBe(
      true,
    );
  });

  it('ignores the case of the host', () => {
    expect(isTicketmaticUrl('https://Tickets.Ticketmatic.COM/event/1')).toBe(
      true,
    );
  });

  it('matches any host of a comma-separated list', () => {
    mockHosts('first.ticketmatic.com, second.ticketmatic.com');

    expect(isTicketmaticUrl('https://second.ticketmatic.com/event/1')).toBe(
      true,
    );
  });

  it('rejects other hosts', () => {
    expect(isTicketmaticUrl('https://other.ticketmatic.com/event/1')).toBe(
      false,
    );
    expect(isTicketmaticUrl('https://evil-tickets.ticketmatic.com')).toBe(
      false,
    );
    expect(isTicketmaticUrl('https://tickets.ticketmatic.com.evil.be')).toBe(
      false,
    );
  });

  it('rejects an empty or invalid url', () => {
    expect(isTicketmaticUrl(undefined)).toBe(false);
    expect(isTicketmaticUrl('')).toBe(false);
    expect(isTicketmaticUrl('not a url')).toBe(false);
  });

  it('matches nothing when no hosts are configured', () => {
    mockHosts(undefined);

    expect(isTicketmaticUrl('https://tickets.ticketmatic.com/event/1')).toBe(
      false,
    );
  });
});
