import { expect, type Page } from '@playwright/test';

const INSPECTED_PROTOCOLS = ['http:', 'https:'];

const readAllowedHosts = () => {
  const allowedHosts = process.env.VRT_ALLOWED_HOSTS;
  if (!allowedHosts) {
    throw new Error(
      '\nVRT_ALLOWED_HOSTS is unset, so every request would count as unexpected. It is derived in scripts/vrt/env.mjs and passed into the container by scripts/vrt/pages.mjs — start a run with `yarn vrt:pages`.\n',
    );
  }
  return new Set(allowedHosts.split(','));
};

// Browser requests only — SSR and prefetchAuthenticatedQuery bypass this.
export const trackUnexpectedHosts = (page: Page) => {
  const unexpectedHosts = new Set<string>();
  if (process.env.VRT_RECORD_MODE === 'true') return unexpectedHosts;

  const allowedHosts = readAllowedHosts();
  page.on('request', (request) => {
    const { protocol, hostname } = new URL(request.url());
    if (INSPECTED_PROTOCOLS.includes(protocol) && !allowedHosts.has(hostname)) {
      unexpectedHosts.add(hostname);
    }
  });

  return unexpectedHosts;
};

export const expectNoUnexpectedHosts = (unexpectedHosts: Set<string>) =>
  expect(
    [...unexpectedHosts],
    'Unexpected hosts were reached, so any baseline this run wrote is not trustworthy. Give each a MOCK_UPSTREAMS entry, or add it to buildAllowedHosts() in scripts/vrt/env.mjs',
  ).toEqual([]);
