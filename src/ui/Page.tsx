import { getStackProps, Stack, StackProps } from './Stack';
import { getValueFromTheme } from './theme';

import { Title } from './Title';
import { getInlineProps, Inline, InlineProps } from './Inline';
import { Children } from 'react';
import { BoxProps, getBoxProps } from './Box';

const getValueForPage = getValueFromTheme('page');

type PageProps = StackProps;

const Page = ({ children: rawChildren, className, ...props }: PageProps) => {
  const children = Children.toArray(rawChildren) as Array<
    (React.ReactChild | React.ReactFragment | React.ReactPortal) & {
      type: React.FC;
    }
  >;

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

type PageTitleProps = BoxProps;

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

type PageActionsProps = InlineProps;

const PageActions = ({ children, className, ...props }: PageActionsProps) => (
  <Inline className={className} spacing={3} {...getInlineProps(props)}>
    {children}
  </Inline>
);

type PageContentProps = StackProps;

const PageContent = ({ children, className, ...props }: PageContentProps) => (
  <Stack className={className} spacing={3} {...getStackProps(props)}>
    {children}
  </Stack>
);

Page.Title = PageTitle;
Page.Actions = PageActions;
Page.Content = PageContent;

export { Page };
