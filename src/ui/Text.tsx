import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('text');

const TextVariants = {
  REGULAR: 'regular',
  MUTED: 'muted',
};

type Props = BoxProps;

const getColor = (variant) => {
  if (variant === TextVariants.MUTED) return getValue('muted.color');
};

const Text = ({
  as = 'span',
  children,
  className,
  variant = TextVariants.REGULAR,
  ...props
}: Props) => {
  return (
    <Box
      as={as}
      className={className}
      color={getColor(variant)}
      {...getBoxProps(props)}
    >
      {children}
    </Box>
  );
};

export { Text, TextVariants };
export type { Props as TextProps };
