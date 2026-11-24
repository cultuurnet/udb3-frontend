import getConfig from 'next/config';

const getTicketmaticReservationLinkHosts = (): string[] => {
  const { publicRuntimeConfig } = getConfig() ?? {};
  const hosts: string =
    publicRuntimeConfig?.ticketmaticReservationLinkHosts ?? '';

  return hosts
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
};

const isTicketmaticUrl = (url: string | undefined): boolean => {
  if (!url) return false;

  try {
    const host = new URL(url).hostname.toLowerCase();
    return getTicketmaticReservationLinkHosts().includes(host);
  } catch {
    return false;
  }
};

export { isTicketmaticUrl };
