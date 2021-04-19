import { getValueFromTheme } from './theme';
import { Stack, stackPropTypes, getStackProps } from './Stack';
import { Children } from 'react';

const getValue = getValueFromTheme('panel');

/*
(ts-migrate) TODO: Migrate the remaining prop types
...stackPropTypes
*/
type PanelProps = {
  className?: string;
  children?: React.ReactNode;
};

const Panel = ({ children, className, ...props }: PanelProps) => {
  const parsedChildren =
    Children.count(children) === 1 ? <>{children}</> : children;
  return (
    <Stack
      css={`
        border: 1px solid ${getValue('borderColor')};
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
      `}
      className={className}
      {...getStackProps(props)}
    >
      {parsedChildren}
    </Stack>
  );
};

const getValueForPanelFooter = getValueFromTheme('panelFooter');

/*
(ts-migrate) TODO: Migrate the remaining prop types
...stackPropTypes
*/
type PanelFooterProps = {
  className?: string;
  children?: React.ReactNode;
};

const PanelFooter = ({ children, className, ...props }: PanelFooterProps) => {
  const parsedChildren =
    Children.count(children) === 1 ? <>{children}</> : children;
  return (
    <Stack
      forwardedAs="footer"
      className={className}
      backgroundColor={getValueForPanelFooter('backgroundColor')}
      css={`
        border-top: 1px solid ${getValueForPanelFooter('borderColor')};
        background-color: ${getValueForPanelFooter('backgroundColor')};
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

export { Panel };
