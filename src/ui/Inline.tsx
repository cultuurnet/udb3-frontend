import styled, { css } from 'styled-components';
import { Box, parseProperty, boxProps, boxPropTypes } from './Box';
import type { BoxProps, UIProp } from './Box';

import { Children, cloneElement, forwardRef } from 'react';
import pick from 'lodash/pick';
import { useMatchBreakpoint } from '@/hooks/useMatchBreakpoint';
import { Breakpoints } from './theme';

const parseStackOnProperty = () => ({ stackOn }: InlineProps) => {
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

type InlineProps = BoxProps & {
  spacing?: UIProp<number>;
  alignItems?: UIProp<string>;
  justifyContent?: UIProp<string>;
  stackOn?: Breakpoints;
};

const Inline = forwardRef<unknown, InlineProps>(
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
        ...child.props,
        ...(!isLastItem ? { [marginProp]: spacing } : {}),
      });
    });

    return (
      <StyledBox
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

const inlinePropTypes = ['spacing', 'alignItems', 'justifyContent', 'stackOn'];
const getInlineProps = (props: unknown) =>
  pick(props, [...boxPropTypes, ...inlinePropTypes]);

Inline.defaultProps = {
  as: 'section',
};

export { Inline, getInlineProps, inlinePropTypes, inlineProps };
export type { InlineProps };
