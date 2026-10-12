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

// Scaling keeps every edge in frame, so the view stays the whole image.
const scaledBy = (intrinsic, scale) => ({
  output: {
    width: Math.round(intrinsic.width * scale),
    height: Math.round(intrinsic.height * scale),
  },
  view: { x: 0, y: 0, ...intrinsic },
});

// What a crop keeps: enlarge until the box is covered, then cut the axis that
// overflows. The frame then runs off two edges instead of being redrawn square.
const croppedTo = (intrinsic, output) => {
  const scale = Math.max(
    output.width / intrinsic.width,
    output.height / intrinsic.height,
  );
  const width = output.width / scale;
  const height = output.height / scale;

  return {
    output,
    view: {
      x: (intrinsic.width - width) / 2,
      y: (intrinsic.height - height) / 2,
      width,
      height,
    },
  };
};

const resolveRendering = (intrinsic, params) => {
  const width = Number(params.get('width') ?? params.get('w')) || 0;
  const height = Number(params.get('height') ?? params.get('h')) || 0;

  if (!width && !height) return scaledBy(intrinsic, 1);
  if (!height) return scaledBy(intrinsic, width / intrinsic.width);
  if (!width) return scaledBy(intrinsic, height / intrinsic.height);
  if (params.get('fit') === 'crop')
    return croppedTo(intrinsic, { width, height });

  return scaledBy(
    intrinsic,
    Math.min(width / intrinsic.width, height / intrinsic.height),
  );
};

export const imagesFixtures = Object.values(vrtMockImages).map(
  ({ filename, intrinsic, svgAt }) => ({
    method: 'GET',
    path: `/${filename}`,
    contentType: 'image/svg+xml',
    response: (params) => svgAt(resolveRendering(intrinsic, params)),
  }),
);
