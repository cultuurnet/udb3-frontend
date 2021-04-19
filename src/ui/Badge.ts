import { Badge as BootstrapBadge } from 'react-bootstrap';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { getBoxProps, boxPropTypes } from './Box';
import { Text } from './Text';

const BadgeVariants = {
  DANGER: 'danger',
  SECONDARY: 'secondary',
};

// @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
const BaseBadge = (props) => <Text {...props} />;

const Badge = ({ children, className, variant, ...props }) => {
  return (
    <BootstrapBadge
      as={BaseBadge}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
      className={className}
      variant={variant}
      {...getBoxProps(props)}
    >
      // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
      {children}
    </BootstrapBadge>
  );
};

Badge.propTypes = {
  ...boxPropTypes,
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.string,
};

Badge.defaultProps = {
  variant: BadgeVariants.DANGER,
};

export { Badge, BadgeVariants };
