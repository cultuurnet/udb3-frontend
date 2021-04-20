import { getBoxProps, Box } from './Box';
import type { BoxProps } from './Box';
import type { Values } from '@/types/Values';

export const LabelVariants = {
  BOLD: 'bold',
  NORMAL: 'normal',
} as const;

const getFontWeight = (props: Props) => {
  if (props.variant === LabelVariants.BOLD) return 700;
  return 'normal';
};

type Props = BoxProps & {
  variant?: Values<typeof LabelVariants>;
  children: React.ReactNode;
};

const Label = ({ htmlFor, children, className, variant, ...props }: Props) => (
  <Box
    forwardedAs="label"
    htmlFor={htmlFor}
    className={className}
    variant={variant}
    css={`
      font-weight: ${getFontWeight};
    `}
    {...getBoxProps(props)}
  >
    {children}
  </Box>
);

Label.defaultProps = {
  variant: LabelVariants.NORMAL,
};

export { Label };
