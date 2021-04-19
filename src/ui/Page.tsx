
import { getStackProps, Stack, stackPropTypes } from './Stack';
import { getValueFromTheme } from './theme';

import { Title } from './Title';
import { getInlineProps, Inline, inlinePropTypes } from './Inline';
import { Children } from 'react';
import { getBoxProps } from './Box';

const getValueForPage = getValueFromTheme('page');

/*
(ts-migrate) TODO: Migrate the remaining prop types
...stackPropTypes
*/
type PageProps = {
    children?: React.ReactNode;
    className?: string;
};

const Page = ({ children: rawChildren, className, ...props }: PageProps) => {
  const children = Children.toArray(rawChildren);

  const title = children.find((child) => child.type === PageTitle);
  const actions = children.find((child) => child.type === PageActions);
  const content = children.find((child) => child.type === PageContent);

  return (
    <Stack
      forwardedAs="main"
      className={className}
      flex={1}
      backgroundColor={getValueForPage('backgroundColor')}
      minHeight="100vh"
      css={`
        overflow-x: hidden;
        overflow-y: auto;
      `}
      paddingLeft={4}
      paddingRight={4}
      spacing={5}
      {...getStackProps(props)}
    >
      <Inline
        forwardedAs="div"
        alignItems="baseline"
        css={`
          border-bottom: 1px solid ${getValueForTitle('borderColor')};
        `}
        spacing={3}
      >
        {title}
        {actions}
      </Inline>
      {content}
    </Stack>
  );
};

const getValueForTitle = getValueFromTheme('pageTitle');

/*
(ts-migrate) TODO: Migrate the remaining prop types
...inlinePropTypes
*/
type PageTitleProps = {
    className?: string;
    children?: React.ReactNode;
};

const PageTitle = ({ children, className, ...props }: PageTitleProps) => (
  <Title
    size={1}
    className={className}
    color={getValueForTitle('color')}
    lineHeight="220%"
    {...getBoxProps(props)}
  >
    {children}
  </Title>
);

/*
(ts-migrate) TODO: Migrate the remaining prop types
...inlinePropTypes
*/
type PageActionsProps = {
    className?: string;
    children?: React.ReactNode;
};

const PageActions = ({ children, className, ...props }: PageActionsProps) => (
  <Inline className={className} spacing={3} {...getInlineProps(props)}>
    {children}
  </Inline>
);

/*
(ts-migrate) TODO: Migrate the remaining prop types
...inlinePropTypes
*/
type PageContentProps = {
    className?: string;
    children?: React.ReactNode;
};

const PageContent = ({ children, className, ...props }: PageContentProps) => (
  <Stack className={className} spacing={3} {...getStackProps(props)}>
    {children}
  </Stack>
);

Page.Title = PageTitle;
Page.Actions = PageActions;
Page.Content = PageContent;

export { Page };
