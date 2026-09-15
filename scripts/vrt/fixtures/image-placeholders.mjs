const STROKE_WIDTH = 4;
const BORDER_INSET = 10;
const SHAPE_RATIO = 0.4;
const INK = '#ffffff';

const circle = (width, height, size) =>
  `<circle cx="${width / 2}" cy="${height / 2}" r="${size / 2}" fill="${INK}" />`;

const square = (width, height, size) =>
  `<rect x="${(width - size) / 2}" y="${(height - size) / 2}" width="${size}" height="${size}" fill="${INK}" />`;

const triangle = (width, height, size) =>
  `<polygon points="${width / 2},${(height - size) / 2} ${(width + size) / 2},${(height + size) / 2} ${(width - size) / 2},${(height + size) / 2}" fill="${INK}" />`;

// No <text>: it would resolve a font from the container and make the bytes
// depend on what is installed there.
const svgPlaceholder = ({ width, height, background, shape }) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${background}" />`,
    `<path d="M0 0 L${width} ${height} M${width} 0 L0 ${height}" stroke="${INK}" stroke-width="${STROKE_WIDTH}" />`,
    `<rect x="${BORDER_INSET}" y="${BORDER_INSET}" width="${width - BORDER_INSET * 2}" height="${height - BORDER_INSET * 2}" fill="none" stroke="${INK}" stroke-width="${STROKE_WIDTH}" />`,
    shape(width, height, SHAPE_RATIO * Math.min(width, height)),
    '</svg>',
  ].join('');

// The resize query consumers append is ignored by the mock server, so these
// intrinsic sizes are what renders wherever the consumer sets none.
const VRT_MOCK_IMAGES = {
  landscape: { width: 480, height: 270, background: '#1f6feb', shape: circle },
  square: { width: 360, height: 360, background: '#d97706', shape: square },
  portrait: { width: 270, height: 360, background: '#7c3aed', shape: triangle },
};

// .jpg because the app accepts no SVG uploads; browsers honour content-type.
export const vrtMockImages = Object.fromEntries(
  Object.entries(VRT_MOCK_IMAGES).map(([name, image]) => [
    name,
    { filename: `vrt-mock-image-${name}.jpg`, svg: svgPlaceholder(image) },
  ]),
);

export const vrtMockImageDataUri = (name) =>
  `data:image/svg+xml;base64,${Buffer.from(vrtMockImages[name].svg).toString('base64')}`;
