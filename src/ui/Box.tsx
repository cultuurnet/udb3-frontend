import styled, {
  css,
  FlattenInterpolation,
  FlattenSimpleInterpolation,
  ThemeProps,
} from 'styled-components';

import kebabCase from 'lodash/kebabCase';
import pick from 'lodash/pick';
import { forwardRef, Ref } from 'react';
import type { Theme } from './theme';

const remInPixels = 15;

const wrapStatementWithBreakpoint = (
  breakpoint: any,
  statementToWrap: any,
) => (): FlattenInterpolation<ThemeProps<any>> => css`
  @media (max-width: ${breakpoint}px) {
    ${statementToWrap}
  }
`;

const createCSSStatement = (
  key: string,
  value: string,
  parser: (value: string) => () => FlattenSimpleInterpolation,
) => (): FlattenInterpolation<ThemeProps<any>> => css`
  ${kebabCase(key)}: ${parser ? parser(value) : value};
`;

const parseProperty = (
  key: string,
  parser?: (value: string | number) => () => FlattenSimpleInterpolation,
  customValue?: string,
) => (props: ThemeProps<Theme>): FlattenInterpolation<ThemeProps<any>> => {
  if (key === undefined || key === null) return css``;
  const value = customValue ?? props[key];

  if (value === undefined) return css``;

  const parsedValue =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value
      : { default: value };

  const { default: defaultValue, hover, ...rest } = parsedValue;

  const style = css`
    ${defaultValue && createCSSStatement(key, defaultValue, parser)}
    ${hover &&
    css`
      :hover {
        ${createCSSStatement(key, hover, parser)}
      }
    `}
  `;

  if (Object.keys(rest).length === 0) {
    return style;
  }

  const parsedBreakpoints = Object.entries(rest)
    .map(([breakpoint]) => [
      props?.theme?.breakpoints?.[breakpoint],
      parsedValue?.[breakpoint],
    ])
    .sort(([valueA], [valueB]) => valueA - valueB);

  return parsedBreakpoints.reduce((acc, [breakpoint, val], index) => {
    if (!breakpoint || val === undefined) return acc;
    return css`
      ${wrapStatementWithBreakpoint(
        breakpoint,
        createCSSStatement(key, val, parser),
      )};
      ${acc};
    `;
  }, style);
};

const parseSpacing = (value: number) => () =>
  `
    ${(1 / remInPixels) * 2 ** value}rem
  `;

const parseDimension = (value) => () =>
  typeof value === 'string' || value instanceof String ? value : `${value}px`;

const parseShorthandProperty = (
  shorthand: string,
  propsToChange: string[] = [],
  parser: (value: string | number) => () => FlattenSimpleInterpolation,
) => (props: unknown): FlattenInterpolation<ThemeProps<any>> =>
  propsToChange.reduce(
    (acc, val) => css`
      ${parseProperty(val, parser, props[shorthand])};
      ${acc};
    `,
    css``,
  );

const boxProps = css`
  ${parseProperty('position')};

  ${parseShorthandProperty(
    'margin',
    ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    parseSpacing,
  )};

  ${parseShorthandProperty(
    'marginY',
    ['marginTop', 'marginBottom'],
    parseSpacing,
  )};

  ${parseShorthandProperty(
    'marginX',
    ['marginLeft', 'marginRight'],
    parseSpacing,
  )};

  ${parseProperty('marginTop', parseSpacing)};
  ${parseProperty('marginBottom', parseSpacing)};
  ${parseProperty('marginLeft', parseSpacing)};
  ${parseProperty('marginRight', parseSpacing)};

  ${parseShorthandProperty(
    'padding',
    ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    parseSpacing,
  )};

  ${parseShorthandProperty(
    'paddingY',
    ['paddingTop', 'paddingBottom'],
    parseSpacing,
  )};
  ${parseShorthandProperty(
    'paddingX',
    ['paddingLeft', 'paddingRight'],
    parseSpacing,
  )};

  ${parseProperty('paddingTop', parseSpacing)};
  ${parseProperty('paddingBottom', parseSpacing)};
  ${parseProperty('paddingLeft', parseSpacing)};
  ${parseProperty('paddingRight', parseSpacing)};

  ${parseProperty('width', parseDimension)};
  ${parseProperty('maxWidth', parseDimension)};
  ${parseProperty('minWidth', parseDimension)};

  ${parseProperty('height', parseDimension)};
  ${parseProperty('maxHeight', parseDimension)};
  ${parseProperty('minHeight', parseDimension)};

  ${parseProperty('top', parseDimension)};
  ${parseProperty('bottom', parseDimension)};
  ${parseProperty('left', parseDimension)};
  ${parseProperty('right', parseDimension)};

  ${parseProperty('backgroundColor')};
  ${parseProperty('backgroundPosition')};
  ${parseProperty('backgroundRepeat')};

  ${parseProperty('objectFit')};

  ${parseProperty('fontSize')};
  ${parseProperty('fontWeight')};
  ${parseProperty('textAlign')};
  ${parseProperty('justifyContent')};
  ${parseProperty('alignItems')};
  ${parseProperty('lineHeight')};
  ${parseProperty('color')};
  ${parseProperty('stroke')};
  ${parseProperty('zIndex')};

  ${parseProperty('display')};
  ${parseProperty('opacity')};
  ${parseProperty('flex')};
  ${parseProperty('cursor')};

  ${parseProperty('animation')}
`;

const StyledBox = styled.div`
  ${boxProps}
`;

type UIPropObject<T> = {
  default?: T | ((props: { theme: Theme }) => T);
  hover?: T | ((props: { theme: Theme }) => T);
} & {
  [value in keyof Theme['breakpoints']]?: T | ((props: { theme: Theme }) => T);
};

type UIProp<T> = T | ((props: { theme: Theme }) => T) | UIPropObject<T>;

type BoxProps = {
  alignItems?: UIProp<string>;
  alt?: string;
  animation?: UIProp<string>;
  as?: React.ReactNode | string;
  backgroundColor?: UIProp<string>;
  backgroundPosition?: UIProp<string>;
  backgroundRepeat?: UIProp<string>;
  bottom?: UIProp<string | number>;
  checked?: boolean;
  children?: React.ReactNode;
  className?: string;
  color?: UIProp<string>;
  cursor?: UIProp<string>;
  delay?: number;
  disabled?: boolean;
  display?: UIProp<string>;
  emptyLabel?: string;
  flex?: UIProp<string | number>;
  fontSize?: UIProp<string | number>;
  fontWeight?: UIProp<string | number>;
  forwardedAs?: React.ReactNode | string;
  height?: UIProp<string | number>;
  highlightOnlyResult?: boolean;
  href?: string;
  htmlFor?: string;
  id?: string;
  isLoading?: boolean;
  justifyContent?: UIProp<string>;
  labelKey?: () => void;
  left?: UIProp<string | number>;
  lineHeight?: UIProp<string | number>;
  margin?: UIProp<number>;
  marginBottom?: UIProp<number>;
  marginLeft?: UIProp<number>;
  marginRight?: UIProp<number>;
  marginTop?: UIProp<number>;
  marginX?: UIProp<number>;
  marginY?: UIProp<number>;
  maxHeight?: UIProp<string | number>;
  maxWidth?: UIProp<string | number>;
  minHeight?: UIProp<string | number>;
  minLength?: number;
  minWidth?: UIProp<string | number>;
  name?: string;
  objectFit?: UIProp<string>;
  onChange?: () => void;
  onClick?: () => void;
  onInputChange?: () => void;
  onSearch?: () => void;
  opacity?: UIProp<number>;
  options?: unknown[];
  padding?: UIProp<number>;
  paddingBottom?: UIProp<number>;
  paddingLeft?: UIProp<number>;
  paddingRight?: UIProp<number>;
  paddingTop?: UIProp<number>;
  paddingX?: UIProp<number>;
  paddingY?: UIProp<number>;
  placeholder?: string;
  position?: UIProp<string>;
  ref?: Ref<any>;
  rel?: string;
  right?: UIProp<string | number>;
  role?: string;
  size?: number;
  src?: string;
  stroke?: UIProp<string>;
  target?: string;
  textAlign?: UIProp<string>;
  top?: UIProp<string | number>;
  type?: string;
  value?: string;
  variant?: string;
  viewBox?: string;
  width?: UIProp<string | number>;
  xmlns?: string;
  zIndex?: UIProp<number>;
};

const boxPropTypes = [
  'alignItems',
  'as',
  'onClick',
  'margin',
  'marginTop',
  'marginBottom',
  'marginRight',
  'marginLeft',
  'marginX',
  'marginY',
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingRight',
  'paddingLeft',
  'paddingX',
  'paddingY',
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'justifyContent',
  'maxHeight',
  'minHeight',
  'top',
  'bottom',
  'left',
  'right',
  'backgroundColor',
  'backgroundPosition',
  'backgroundRepeat',
  'objectFit',
  'fontSize',
  'fontWeight',
  'textAlign',
  'lineHeight',
  'color',
  'stroke',
  'zIndex',
  'position',
  'display',
  'opacity',
  'flex',
  'cursor',
  'animation',
] as const;

const getBoxProps = (props: unknown) => pick(props, boxPropTypes);

const Box = forwardRef<Ref<HTMLDivElement>, BoxProps>(
  ({ children, ...props }, ref) => (
    <StyledBox ref={ref as any} {...props}>
      {children}
    </StyledBox>
  ),
);

Box.defaultProps = {
  as: 'div',
};

export {
  Box,
  parseProperty,
  parseSpacing,
  parseDimension,
  getBoxProps,
  boxProps,
  boxPropTypes,
};

export type { BoxProps, UIProp };
