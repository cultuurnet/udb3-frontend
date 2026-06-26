import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
} from 'react';
import styled, { css } from 'styled-components';

import { getBoxProps, withoutDisallowedPropsConfig } from './Box';
import { Box, boxProps, FALSY_VALUES, parseProperty } from './Box';
import type { StackProps } from './Stack';

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

const StackLegacy = forwardRef<HTMLElement, StackProps>(
  ({ spacing, className, children, as = 'section', ...props }, ref) => {
    const validChildren = Children.toArray(children).filter(
      (child) => !FALSY_VALUES.includes(child),
    );

    const clonedChildren = Children.map(validChildren, (child, i) => {
      const isLastItem = i === validChildren.length - 1;

      const isBoxComponent =
        isValidElement(child) &&
        typeof child.type !== 'string' &&
        child.type !== Fragment;

      // @ts-expect-error
      return cloneElement(child, {
        // @ts-expect-error
        ...child.props,
        ...(!isLastItem && spacing && isBoxComponent
          ? { marginBottom: spacing }
          : {}),
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

StackLegacy.displayName = 'StackLegacy';

export { StackLegacy };
