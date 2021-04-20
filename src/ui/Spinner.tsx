import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

import { getValueFromTheme } from './theme';

type Values<T> = T[keyof T];

const SpinnerVariants = {
  PRIMARY: 'primary',
  LIGHT: 'light',
} as const;

const SpinnerSizes = {
  SMALL: 'sm',
} as const;

const getValue = getValueFromTheme('spinner');

type Props = BoxProps & {
  variant?: Values<typeof SpinnerVariants>;
  size: Values<typeof SpinnerSizes>;
};

const Spinner = ({ variant, size, className, ...props }: Props) => {
  return (
    <Box
      className={className}
      width="100%"
      alignItems="center"
      textAlign="center"
      css={`
        .text-primary {
          color: ${getValue<string>('primary.color')} !important;
        }
        .text-light {
          color: ${getValue<string>('light.color')} !important;
        }
      `}
      {...getBoxProps(props)}
    >
      <BootstrapSpinner
        as={Box}
        animation="border"
        variant={variant}
        size={size}
      />
    </Box>
  );
};

Spinner.defaultProps = {
  variant: SpinnerVariants.PRIMARY,
};

export { Spinner, SpinnerVariants, SpinnerSizes };
