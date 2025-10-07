import { difference, kebabCase, pickBy } from 'lodash';
import type {
  ChangeEvent,
  ClipboardEvent,
  ComponentType,
  DragEvent,
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import { UseAsyncProps } from 'react-bootstrap-typeahead';
import { ReactDatePickerProps } from 'react-datepicker';
import type { ExecutionContext, RuleSet } from 'styled-components';
import styled, { css } from 'styled-components';

import type { BreakpointValues, Theme } from './theme';

type ValidUIPropTypes = string | number;

type UIPropValue<T> = T | ((props: { theme: Theme }) => T);

type Parser = (
  value: UIPropValue<ValidUIPropTypes>,
) => (props?: { theme: Theme }) => string;

type UIPropObject<T> = {
  default?: UIPropValue<T>;
  hover?: UIPropValue<T>;
} & {
  [value in BreakpointValues]?: UIPropValue<T>;
};

type UIProp<T> = UIPropValue<T> | UIPropObject<T>;

type GeneralProps = {
  theme: Theme;
  children: ReactNode;
  className: string;
  id: string;
  name: string;
  as: string | ComponentType<any>;
  forwardedAs: string | ComponentType<any>;
  selected: unknown;
  dangerouslySetInnerHTML: {
    __html: string;
  };
  [ariaKey: `aria-${string}`]: string;
};

type InlineProps = {
  stackOn: BreakpointValues;
};

type TitleProps = {
  size: 1 | 2 | 3;
};

type ListProps = {
  variant: string;
};

type LinkProps = {
  title: string;
  href: string;
  rel: string;
  target: string;
};

type LabelProps = {
  htmlFor: string;
};

type ImageProps = {
  src: string;
  alt: string;
};

type SvgProps = {
  version: string;
  xmlns: string;
  viewBox: string;
};

type ProgressBarProps = {
  now: number;
};

type InputProps = {
  type: string;
  checked: boolean;
};

type SpecificComponentProps = InlineProps &
  Omit<ReactDatePickerProps, 'onChange' | 'onSelect' | 'value' | 'selected'> &
  TitleProps &
  ListProps &
  LinkProps &
  LabelProps &
  ImageProps &
  InputProps &
  SvgProps &
  ProgressBarProps &
  Omit<UseAsyncProps, 'id' | 'size' | 'onChange' | 'selected'>;

type EventHandlerProps = {
  onBlur: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange:
    | ((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)
    | ((value: Date) => void)
    | ((value: unknown) => void);
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onInput: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onInputChange: (value: string) => void;
  onMouseOver: (event: MouseEvent<HTMLFormElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLFormElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

type Display =
  | 'block'
  | 'inline'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'flow-root'
  | 'none'
  | 'contents'
  | 'table'
  | 'table-row'
  | 'list-item'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset';

type AlignItems =
  | 'normal'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'start'
  | 'end'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'stretch'
  | 'safe'
  | 'unsafe';

type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

type UIProps = {
  alignItems: UIProp<AlignItems>;
  alignSelf: UIProp<AlignItems>;
  animation: UIProp<RuleSet>;
  backgroundColor: UIProp<string>;
  backgroundPosition: UIProp<string>;
  backgroundRepeat: UIProp<string>;
  borderRadius: UIProp<string>;
  bottom: UIProp<string | number>;
  color: UIProp<string>;
  cursor: UIProp<string>;
  display: UIProp<Display>;
  flex: UIProp<string | number>;
  flexShrink: UIProp<string | number>;
  flexWrap: UIProp<FlexWrap>;
  flexDirection: UIProp<string>;
  fontSize: UIProp<string | number>;
  fontWeight: UIProp<string | number>;
  fontStyle: UIProp<string | number>;
  height: UIProp<string | number>;
  justifyContent: UIProp<JustifyContent>;
  left: UIProp<string | number>;
  lineHeight: UIProp<string | number>;
  margin: UIProp<number>;
  marginBottom: UIProp<number>;
  marginLeft: UIProp<number>;
  marginRight: UIProp<number>;
  marginTop: UIProp<number>;
  marginX: UIProp<number>;
  marginY: UIProp<number>;
  maxHeight: UIProp<string | number>;
  maxWidth: UIProp<string | number>;
  minHeight: UIProp<string | number>;
  minWidth: UIProp<string | number>;
  objectFit: UIProp<string>;
  overflow: UIProp<string>;
  opacity: UIProp<number>;
  padding: UIProp<number>;
  paddingBottom: UIProp<number>;
  paddingLeft: UIProp<number>;
  paddingRight: UIProp<number>;
  paddingTop: UIProp<number>;
  paddingX: UIProp<number>;
  paddingY: UIProp<number>;
  position: UIProp<string>;
  right: UIProp<string | number>;
  stroke: UIProp<string>;
  textAlign: UIProp<string>;
  textDecoration: UIProp<string>;
  top: UIProp<string | number>;
  width: UIProp<string | number>;
  zIndex: UIProp<number>;
  role: UIProp<string>;
};

type BoxProps<T = any> = Partial<
  UIProps & GeneralProps & SpecificComponentProps & EventHandlerProps
>;

const remInPixels = 15;

const FALSY_VALUES = [null, undefined, false, '', NaN, 0] as const;

const wrapStatementWithBreakpoint =
  (
    breakpoint: string,
    statementToWrap: string | (() => RuleSet<{ theme: Theme }>),
  ) =>
  () =>
    css`
      @media (max-width: ${breakpoint}px) {
        ${statementToWrap}
      }
    `;

const createCSSStatement =
  (key: string, value: UIPropValue<ValidUIPropTypes>, parser?: Parser) =>
  () => {
    return css`
      ${kebabCase(key)}: ${parser ? parser(value) : value};
    `;
  };

const isString = (value: unknown): value is string => {
  return typeof value === 'string' || value instanceof String;
};

const isNumber = (value: unknown): value is number => {
  if (isString(value)) return false;
  return !Number.isNaN(value);
};

const isUIProp = (value: unknown): value is UIProp<ValidUIPropTypes> => {
  return [isString, isNumber, isUIPropObject].some((validator) =>
    validator(value),
  );
};

const isUIPropObject = (
  value: unknown,
): value is UIPropObject<ValidUIPropTypes> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const createUIPropObject = (
  value: UIPropValue<ValidUIPropTypes>,
): UIPropObject<ValidUIPropTypes> => {
  return {
    default: value,
  };
};

const isDefined = <T,>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

const parseProperty =
  (key: string, parser?: Parser, customValue?: unknown) =>
  (props: ExecutionContext & { theme?: Theme }) => {
    const value = customValue ?? props[key];

    if (!isUIProp(value)) return css``;

    const parsedValue = isUIPropObject(value)
      ? value
      : createUIPropObject(value);

    const { default: defaultValue, hover, ...rest } = parsedValue;

    const style = css`
      ${isDefined<UIPropValue<ValidUIPropTypes>>(defaultValue) &&
      createCSSStatement(key, defaultValue, parser)}
      ${isDefined<UIPropValue<ValidUIPropTypes>>(hover) &&
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

    return parsedBreakpoints.reduce((acc, [breakpoint, val]) => {
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

const parseSpacing =
  (value: UIPropValue<number>) => (props?: { theme: Theme }) => {
    const parsedValue = typeof value === 'function' ? value(props) : value;

    if (value === 0) return '0rem';

    return `
  ${(1 / remInPixels) * 2 ** parsedValue}rem
`;
  };

const parseDimension =
  (value: UIPropValue<string | number>) => (props: { theme: Theme }) => {
    const parsedValue = typeof value === 'function' ? value(props) : value;

    if (!isString(parsedValue)) {
      return `${Number(parsedValue)}px`;
    }
    return parsedValue;
  };

const parseShorthandProperty =
  (shorthand: string, propsToChange: string[], parser: Parser) =>
  (props: ExecutionContext & { theme?: Theme }) =>
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
  ${parseProperty('fontStyle')};
  ${parseProperty('borderRadius')};
  ${parseProperty('textAlign')};
  ${parseProperty('textDecoration')};
  ${parseProperty('justifyContent')};
  ${parseProperty('alignItems')};
  ${parseProperty('alignSelf')};
  ${parseProperty('lineHeight')};
  ${parseProperty('color')};
  ${parseProperty('stroke')};
  ${parseProperty('zIndex')};

  ${parseProperty('display')};
  ${parseProperty('overflow')};
  ${parseProperty('opacity')};
  ${parseProperty('flex')};
  ${parseProperty('flexShrink')};
  ${parseProperty('flexWrap')};
  ${parseProperty('flexDirection')};
  ${parseProperty('cursor')};

  ${parseProperty('animation')}
`;

const reactPropTypes = [
  'as',
  'id',
  'onClick',
  'onBlur',
  'onInput',
  'onSubmit',
  'onChange',
  'dangerouslySetInnerHTML',
];

const boxPropTypes = [
  ...reactPropTypes,
  'alignItems',
  'alignSelf',
  'animation',
  'backgroundColor',
  'backgroundPosition',
  'backgroundRepeat',
  'borderRadius',
  'bottom',
  'color',
  'cursor',
  'display',
  'flex',
  'flexShrink',
  'flexDirection',
  'flexWrap',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'height',
  'justifyContent',
  'left',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginX',
  'marginY',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'opacity',
  'overflow',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingX',
  'paddingY',
  'position',
  'right',
  'stroke',
  'textAlign',
  'textDecoration',
  'top',
  'stackOn',
  'width',
  'size',
  'zIndex',
] as const;

const notAllowedPropsSet = new Set(difference(boxPropTypes, reactPropTypes));

export const withoutDisallowedPropsConfig = {
  shouldForwardProp: (prop) => !notAllowedPropsSet.has(prop as any),
};

const StyledBox = styled.div.withConfig(withoutDisallowedPropsConfig)`
  ${boxProps}
`;

const getBoxProps = (props: Record<string, any>) =>
  pickBy(props, (_value, key) => {
    // pass aria attributes to the DOM element
    if (key.startsWith('aria-')) {
      return true;
    }

    return (boxPropTypes as readonly string[]).includes(key);
  });

const Box = forwardRef<HTMLElement, BoxProps<any>>(
  ({ children, as = 'div', ...props }, ref) => (
    <StyledBox ref={ref} as={as} {...props}>
      {children}
    </StyledBox>
  ),
);

Box.displayName = 'Box';

export {
  Box,
  boxProps,
  boxPropTypes,
  FALSY_VALUES,
  getBoxProps,
  parseDimension,
  parseProperty,
  parseSpacing,
};

export type { BoxProps, UIProp };
