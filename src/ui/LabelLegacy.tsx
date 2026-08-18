import type { Values } from '@/types/Values';

import type { BoxProps } from './Box';
import { getInlineProps, Inline } from './Inline';
import { LabelVariants } from './Label';
import { Text } from './Text';

const getFontWeight = (props) => {
  if (props.variant === LabelVariants.BOLD) return 700;
  return 'normal';
};

type Props = BoxProps & {
  htmlFor: string;
  variant?: Values<typeof LabelVariants>;
  required?: boolean;
};

const LabelLegacy = ({
  htmlFor,
  children,
  className,
  variant = LabelVariants.NORMAL,
  required = false,
  ...props
}: Props) => (
  <Inline
    forwardedAs="label"
    htmlFor={htmlFor}
    className={className}
    variant={variant}
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
