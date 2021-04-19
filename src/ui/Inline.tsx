// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'styl... Remove this comment to see the full error message
import styled, { css } from 'styled-components';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, boxProps, parseProperty } from './Box';
import PropTypes from 'prop-types';
import { Children, cloneElement, forwardRef } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import pick from 'lodash/pick';
import { Breakpoints } from './theme';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/useMatchBreakpoint' or... Remove this comment to see the full error message
import { useMatchBreakpoint } from '@/hooks/useMatchBreakpoint';

const parseStackOnProperty = () => ({ stackOn }) => {
  if (!stackOn) {
    return;
  }
  return css`
    @media (max-width: ${(props) => props.theme.breakpoints[stackOn]}px) {
      flex-direction: column;
    }
  `;
};

const inlineProps = css`
  display: flex;
  flex-direction: row;

  ${parseProperty('alignItems')};
  ${parseProperty('justifyContent')};
  ${parseStackOnProperty()};
`;

const StyledBox = styled(Box)`
  ${inlineProps};
  ${boxProps};
`;

const Inline = forwardRef(
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'spacing' does not exist on type '{ child... Remove this comment to see the full error message
  ({ spacing, className, children, as, stackOn, ...props }, ref) => {
    const shouldCollapse = useMatchBreakpoint(stackOn);

    const marginProp =
      shouldCollapse && stackOn ? 'marginBottom' : 'marginRight';

    const notNullChildren = Children.toArray(children).filter(
      (child) => child !== null,
    );

    const clonedChildren = Children.map(notNullChildren, (child, i) => {
      const isLastItem = i === notNullChildren.length - 1;

      return cloneElement(child, {
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        ...child.props,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'props' does not exist on type 'string | ... Remove this comment to see the full error message
        ...(!isLastItem ? { [marginProp]: spacing } : {}),
      });
    });

    return (
      <StyledBox
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        className={className}
        forwardedAs={as}
        stackOn={stackOn}
        {...props}
        ref={ref}
      >
        {clonedChildren}
      </StyledBox>
    );
  },
);

const inlinePropTypes = {
  ...boxPropTypes,
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  alignItems: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  justifyContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  stackOn: PropTypes.oneOf(Object.values(Breakpoints)),
};

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'props' implicitly has an 'any' type.
const getInlineProps = (props) => pick(props, Object.keys(inlinePropTypes));

Inline.propTypes = {
  ...inlinePropTypes,
  as: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

Inline.defaultProps = {
  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ as: string; }' is not assignable to type '... Remove this comment to see the full error message
  as: 'section',
};

export { Inline, getInlineProps, inlinePropTypes, inlineProps };
