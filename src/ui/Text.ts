import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, getBoxProps } from './Box';

const Text = ({ as, children, className, ...props }) => {
  return (
    <Box as={as} className={className} {...getBoxProps(props)}>
      // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
      {children}
    </Box>
  );
};

Text.propTypes = {
  ...boxPropTypes,
  as: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

Text.defaultProps = {
  as: 'span',
};

export { Text };
