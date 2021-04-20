import styled, { css } from 'styled-components';
import { Box, parseProperty, boxProps, UIProp, boxPropTypes } from './Box';
import type { BoxProps } from './Box';

import { Children, cloneElement, forwardRef } from 'react';
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

type StackProps = BoxProps & {
  spacing?: UIProp<number>;
  alignItems?: UIProp<string>;
  justifyContent?: UIProp<string>;
};

const Stack = forwardRef<unknown, StackProps>(
  ({ spacing, className, children, as, ...props }, ref) => {
    const notNullChildren = Children.toArray(children).filter(
      (child) => child !== null,
    );

    const clonedChildren = Children.map(notNullChildren, (child, i) => {
      const isLastItem = i === notNullChildren.length - 1;

      return cloneElement(child, {
        ...child.props,
        ...(!isLastItem ? { marginBottom: spacing } : {}),
      });
    });

    return (
      <StyledBox className={className} forwardedAs={as} ref={ref} {...props}>
        {clonedChildren}
      </StyledBox>
    );
  },
);

const stackPropTypes = ['spacing', 'alignItems', 'justifyContent', 'stackOn'];
const getStackProps = (props: unknown) =>
  pick(props, [...stackPropTypes, ...boxPropTypes]);

Stack.defaultProps = {
  as: 'section',
};

export { Stack, getStackProps, stackProps };
export type { StackProps };
