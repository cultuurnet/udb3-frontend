import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box } from './Box';

const Container = ({ children, className }) => (
  <Box
    className={className}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'maxWidth'.
    maxWidth={{
      default: 1170,
      // @ts-expect-error ts-migrate(2695) FIXME: Left side of comma operator is unused and has no s... Remove this comment to see the full error message
      m: 970,
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'm'.
      s: 750,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 's'.
    }}
    width={{
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'width'.
      default: 1170,
      // @ts-expect-error ts-migrate(2695) FIXME: Left side of comma operator is unused and has no s... Remove this comment to see the full error message
      m: 970,
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'm'.
      s: 750,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 's'.
    }}
  >
    // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
    {children}
  </Box>
);

Container.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Container };
