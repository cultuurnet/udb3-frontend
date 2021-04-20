import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

const getFontWeight = (props: Props) => {
  if (props.size === 1) return 300;
  return 700;
};

const getFontSize = (props: Props) => {
  if (props.size === 1) return 1.6;
  return 1.2;
};

type Props = BoxProps & {
  children: React.ReactNode;
};

const Title = ({ size, children, className, ...props }: Props) => (
  <Box
    forwardedAs={`h${size}`}
    size={size}
    className={className}
    css={`
      font-weight: ${getFontWeight};
      font-size: ${getFontSize}rem;
    `}
    {...getBoxProps(props)}
  >
    {children}
  </Box>
);

Title.defaultProps = {
  size: 2,
};

export { Title };
