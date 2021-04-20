import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

type Props = BoxProps;

const Small = ({ children, className, ...props }: Props) => (
  <Box
    forwardedAs="small"
    className={className}
    css={`
      font-size: 0.65rem;
    `}
    {...getBoxProps(props)}
  >
    {children}
  </Box>
);

export { Small };
