import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, getBoxProps } from './Box';

const Small = ({ children, className, ...props }) => (
  <Box
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'forwardedAs'.
    forwardedAs="small"
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'className'. Did you mean 'classN... Remove this comment to see the full error message
    className={className}
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'className'. Did you mean 'classN... Remove this comment to see the full error message
    css={`
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'css'.
      font-size: 0.65rem;
    `}
    {...getBoxProps(props)}
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'props'.
  >
    // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
    {children}
  // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  </Box>
);

Small.propTypes = {
  ...boxPropTypes,
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Small };
