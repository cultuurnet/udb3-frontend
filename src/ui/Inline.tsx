import { pickBy } from 'lodash';
import { Children, cloneElement, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { useMatchBreakpoint } from '@/hooks/useMatchBreakpoint';

import {
  Box,
  BoxProps,
  boxProps,
  boxPropTypes,
  FALSY_VALUES,
  parseProperty,
  UIProp,
  UnknownProps,
  withoutDisallowedPropsConfig,
} from './Box';
import type { BreakpointValues } from './theme';

type InlineProps = {
  spacing?: UIProp<number>;
  stackOn?: BreakpointValues;
};

type Props = BoxProps & InlineProps;

const parseStackOnProperty =
  () =>
  ({ stackOn }: Props) => {
    if (!stackOn) return;
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
  ${parseProperty('alignSelf')};
  ${parseProperty('justifyContent')};
  ${parseStackOnProperty()};
`;

const StyledBox = styled(Box).withConfig(withoutDisallowedPropsConfig)`
  ${inlineProps};
  ${boxProps};
`;

const Inline = forwardRef<HTMLElement, Props>(
  ({ spacing, className, children, as = 'span', stackOn, ...props }, ref) => {
    const shouldCollapse = useMatchBreakpoint(stackOn);
    const marginProp =
      shouldCollapse && stackOn ? 'marginBottom' : 'marginRight';

    const validChildren = Children.toArray(children).filter(
      (child) => !FALSY_VALUES.includes(child),
    );

    const clonedChildren = Children.map(validChildren, (child, i) => {
      const isLastItem = i === validChildren.length - 1;
      // @ts-expect-error
      return cloneElement(child, {
        // @ts-expect-error
        ...child.props,
        ...(!isLastItem && spacing ? { [marginProp]: spacing } : {}),
      });
    });

    return (
      <StyledBox
        as={as}
        className={className}
        stackOn={stackOn}
        {...props}
        ref={ref}
      >
        {clonedChildren}
      </StyledBox>
    );
  },
);

Inline.displayName = 'Inline';

const inlinePropTypes = [
  'spacing',
  'alignItems',
  'alignSelf',
  'justifyContent',
  'stackOn',
];
const linkPropTypes = ['rel', 'target'];

const getInlineProps = (props: UnknownProps) =>
  pickBy(props, (_value, key) => {
    if (key.startsWith('aria-')) return true;
    const propTypes: string[] = [
      ...boxPropTypes,
      ...inlinePropTypes,
      ...linkPropTypes,
    ];
    return propTypes.includes(key);
  });

export { getInlineProps, Inline };
export type { Props as InlineProps };
