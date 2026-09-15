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

const scaled = ({ width, height }, scale) => ({
  width: Math.round(width * scale),
  height: Math.round(height * scale),
});

const resolveSize = (intrinsic, params) => {
  const width = Number(params.get('width') ?? params.get('w')) || 0;
  const height = Number(params.get('height') ?? params.get('h')) || 0;

  if (!width && !height) return intrinsic;
  if (!height) return scaled(intrinsic, width / intrinsic.width);
  if (!width) return scaled(intrinsic, height / intrinsic.height);
  if (params.get('fit') === 'crop') return { width, height };

  return scaled(
    intrinsic,
    Math.min(width / intrinsic.width, height / intrinsic.height),
  );
};

export const imagesFixtures = Object.values(vrtMockImages).map(
  ({ filename, intrinsic, svgAt }) => ({
    method: 'GET',
    path: `/${filename}`,
    contentType: 'image/svg+xml',
    response: (params) => svgAt(resolveSize(intrinsic, params)),
  }),
);
