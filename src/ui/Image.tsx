import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';

type Props = BoxProps & {
  src: string;
  alt: string;
};

const Image = ({
  src,
  alt,
  className,
  width = 600,
  height = 'auto',
  ...props
}: Props) => (
  <Box
    as="img"
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    {...getBoxProps(props)}
  />
);

export { Image };
