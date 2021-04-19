// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'styl... Remove this comment to see the full error message
import styled, { css } from 'styled-components';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, boxProps, parseProperty } from './Box';
import PropTypes from 'prop-types';
import { Children, cloneElement, forwardRef } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import pick from 'lodash/pick';

const stackProps = css`
  display: flex;
  flex-direction: column;

  ${parseProperty('alignItems')};
  ${parseProperty('justifyContent')};
`;

const StyledBox = styled(Box)`
  ${stackProps};
  ${boxProps};
`;

const Stack = forwardRef(
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'spacing' does not exist on type '{ child... Remove this comment to see the full error message
  ({ spacing, className, children, as, ...props }, ref) => {
    const notNullChildren = Children.toArray(children).filter(
      (child) => child !== null,
    );

    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'child' implicitly has an 'any' type.
    const clonedChildren = Children.map(notNullChildren, (child, i) => {
      const isLastItem = i === notNullChildren.length - 1;

      return cloneElement(child, {
        ...child.props,
        ...(!isLastItem ? { marginBottom: spacing } : {}),
      });
    });

    return (
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <StyledBox className={className} forwardedAs={as} ref={ref} {...props}>
        {clonedChildren}
      </StyledBox>
    );
  },
);

const stackPropTypes = {
  ...boxPropTypes,
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  alignItems: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  justifyContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'props' implicitly has an 'any' type.
const getStackProps = (props) => pick(props, Object.keys(stackPropTypes));

Stack.propTypes = {
  ...stackPropTypes,
  as: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

Stack.defaultProps = {
  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ as: string; }' is not assignable to type '... Remove this comment to see the full error message
  as: 'section',
};

export { Stack, getStackProps, stackPropTypes, stackProps };
