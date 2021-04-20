import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

type Props = BoxProps;

const Image = ({ src, alt, className, ...props }: Props) => (
  <Box
    as="img"
    src={src}
    alt={alt}
    className={className}
    {...getBoxProps(props)}
  />
);

Image.defaultProps = {
  width: 600,
  height: 'auto',
};

export { Image };
