import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

type TextProps = BoxProps & {
  children: React.ReactNode;
};

const Text = ({ as, children, className, ...props }: TextProps) => {
  return (
    <Box as={as} className={className} {...getBoxProps(props)}>
      {children}
    </Box>
  );
};

Text.defaultProps = {
  as: 'span',
};

export { Text };
export type { TextProps };
