import type { Values } from '@/types/Values';

import type { BoxProps } from './Box';
import { getInlineProps, Inline } from './Inline';
import type { LabelVariants } from './Label';
import { Text } from './Text';

const getFontWeight = (props) => {
  if (props.variant === 'bold') return 700;
  return 'normal';
};

type Props = BoxProps & {
  htmlFor: string;
  variant?: Values<typeof LabelVariants>;
  required?: boolean;
  disabled?: boolean;
};

const LabelLegacy = ({
  htmlFor,
  children,
  className,
  variant = 'normal',
  required = false,
  disabled,
  cursor,
  opacity,
  ...props
}: Props) => (
  <Inline
    forwardedAs="label"
    htmlFor={htmlFor}
    className={className}
    variant={variant}
    cursor={
      disabled === undefined ? cursor : disabled ? 'not-allowed' : 'pointer'
    }
    opacity={disabled ? 0.5 : opacity}
    css={`
      font-weight: ${getFontWeight};
    `}
    {...getInlineProps(props)}
  >
    <Text>{children}</Text>
  </Inline>
);

export { LabelLegacy };
export type { Props as LabelProps };
