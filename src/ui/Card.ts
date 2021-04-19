import { Card as BootstrapCard } from 'react-bootstrap';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { Stack, getStackProps, stackPropTypes } from './Stack';

const Card = ({ children, className, ...props }) => {
  return (
    <BootstrapCard
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'forwardedAs'.
      forwardedAs={Stack}
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ Stack: any; }' is not assignable to type '... Remove this comment to see the full error message
      className={className}
      {...getStackProps(props)}
      css={`
        // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'css'. Did you mean 'CSS'?
        &.card {
          border: none;
        }
      `}
    >
      // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
      {children}
    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    </BootstrapCard>
  );
};

Card.propTypes = {
  ...stackPropTypes,
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Card };
