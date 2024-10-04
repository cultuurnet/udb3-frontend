import { Children } from 'react';

import type { StackProps } from './Stack';
import { getStackProps, Stack } from './Stack';
import { getGlobalBorderRadius, getValueFromTheme } from './theme';

const getValue = getValueFromTheme('panel');

type PanelProps = StackProps & { borderless?: boolean };

const Panel = ({ children, className, borderless, ...props }: PanelProps) => {
  const parsedChildren =
    Children.count(children) === 1 ? <>{children}</> : children;
  return (
    <Stack
      css={`
        ${!borderless &&
        ` border: 1px solid ${getValue(
          'borderColor',
        )}; border-radius: ${getGlobalBorderRadius}; box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);`}
      `}
      className={className}
      {...getStackProps(props)}
    >
      {parsedChildren}
    </Stack>
  );
};

const getValueForPanelFooter = getValueFromTheme('panelFooter');

type PanelFooterProps = StackProps & {
  borderless?: boolean;
  backgroundColor?: string;
};

const PanelFooter = ({
  children,
  className,
  borderless,
  backgroundColor,
  ...props
}: PanelFooterProps) => {
  const parsedChildren =
    Children.count(children) === 1 ? <>{children}</> : children;
  return (
    <Stack
      forwardedAs="footer"
      className={className}
      backgroundColor={
        backgroundColor
          ? backgroundColor
          : getValueForPanelFooter('backgroundColor')
      }
      css={`
        ${!borderless &&
        `
        border-top: 1px solid ${getValueForPanelFooter('borderColor')};
        border-radius: ${getGlobalBorderRadius};
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        background-color: ${getValueForPanelFooter('backgroundColor')};`}
      `}
      padding={5}
      paddingTop={4}
      {...getStackProps(props)}
    >
      {parsedChildren}
    </Stack>
  );
};

Panel.Footer = PanelFooter;

export type { PanelProps };
export { Panel };
