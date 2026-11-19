import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';

type Props = BoxProps & {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
};

const ImageLegacy = ({
  src,
  alt,
  className,
  width,
  height,
  loading,
  ...props
}: Props) => (
  <Box
    as="img"
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    loading={loading}
    {...getBoxProps(props)}
  />
);

export { ImageLegacy };
