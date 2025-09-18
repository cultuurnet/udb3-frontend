import { pickBy } from 'lodash';
import { Children, cloneElement, forwardRef, isValidElement, Fragment } from 'react';
import styled, { css } from 'styled-components';

import {
  BoxProps,
  getBoxProps,
  UIProp,
  withoutDisallowedPropsConfig,
} from './Box';
import {
  Box,
  boxProps,
  boxPropTypes,
  FALSY_VALUES,
  parseProperty,
} from './Box';
import type { BreakpointValues } from './theme';

type StackProps = {
  spacing?: UIProp<number>;
  stackOn?: BreakpointValues;
};

type Props = BoxProps & StackProps;

const stackProps = css`
  display: flex;
  flex-direction: column;

  ${parseProperty('alignItems')};
  ${parseProperty('justifyContent')};
`;

const StyledBox = styled(Box).withConfig(withoutDisallowedPropsConfig)`
  ${stackProps};
  ${boxProps};
`;

const Stack = forwardRef<HTMLElement, Props>(
  ({ spacing, className, children, as = 'section', ...props }, ref) => {
    const validChildren = Children.toArray(children).filter(
      (child) => !FALSY_VALUES.includes(child),
    );

    const clonedChildren = Children.map(validChildren, (child, i) => {
      const isLastItem = i === validChildren.length - 1;

      const isBoxComponent =
        isValidElement(child) && typeof child.type !== 'string' && child.type !== Fragment;

      // @ts-expect-error
      return cloneElement(child, {
        // @ts-expect-error
        ...child.props,
        ...(!isLastItem && spacing && isBoxComponent ? { marginBottom: spacing } : {}),
      });
    });

    return (
      <StyledBox
        className={className}
        as={as}
        ref={ref}
        {...getBoxProps(props)}
      >
        {clonedChildren}
      </StyledBox>
    );
  },
);

Stack.displayName = 'Stack';

const stackPropTypes = ['spacing', 'alignItems', 'justifyContent'];

const getStackProps = (props: Record<string, any>) =>
  pickBy(props, (_value, key) => {
    // pass aria attributes to the DOM element
    if (key.startsWith('aria-')) {
      return true;
    }

    const propTypes: string[] = [...boxPropTypes, ...stackPropTypes];

    return propTypes.includes(key);
  });

export { getStackProps, Stack };
export type { Props as StackProps };
