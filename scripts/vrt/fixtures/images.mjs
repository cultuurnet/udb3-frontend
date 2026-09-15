import { MOCK_ORIGIN, toMockPathPrefix } from '../hosts.mjs';
import { vrtMockImages } from './image-placeholders.mjs';

export const IMAGE_ENV_VAR = 'NEXT_PUBLIC_IMGIX_URL';

// Never resolves (RFC 2606), and the trailing slash is load-bearing:
// DashboardRow concatenates this base and a filename directly.
export const IMAGE_PINNED_URL = 'https://vrt-mock-images.invalid/';

export const vrtMockImageUrls = Object.fromEntries(
  Object.entries(vrtMockImages).map(([name, { filename }]) => [
    name,
    `${MOCK_ORIGIN}${toMockPathPrefix(IMAGE_ENV_VAR)}/${filename}`,
  ]),
);

export const imagesFixtures = Object.values(vrtMockImages).map(
  ({ filename, svg }) => ({
    method: 'GET',
    path: `/${filename}`,
    contentType: 'image/svg+xml',
    response: svg,
  }),
);
