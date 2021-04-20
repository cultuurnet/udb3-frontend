import { Children } from 'react';

import { getStackProps, Stack } from './Stack';
import type { StackProps } from './Stack';

import { Inline, getInlineProps } from './Inline';
import type { InlineProps } from './Inline';

type Values<T> = T[keyof T];

const ListVariants = {
  ORDERED: 'ordered',
  UNORDERED: 'unordered',
} as const;

type ListProps = StackProps & {
  variant?: Values<typeof ListVariants>;
  children: React.ReactNode;
};

const List = ({ children, className, variant, ...props }: ListProps) => (
  <Stack
    forwardedAs={variant === ListVariants.ORDERED ? 'ol' : 'ul'}
    className={className}
    variant={variant}
    {...getStackProps(props)}
  >
    {children}
  </Stack>
);

List.defaultProps = {
  variant: ListVariants.UNORDERED,
};

type ListItemProps = InlineProps & {
  children: React.ReactNode;
};

const ListItem = ({
  children,
  className,
  onClick,
  ...props
}: ListItemProps) => {
  const parsedChildren =
    Children.count(children) === 1 ? <>{children}</> : children;

  return (
    <Inline
      as="li"
      className={className}
      onClick={onClick}
      {...getInlineProps(props)}
    >
      {parsedChildren}
    </Inline>
  );
};

List.Item = ListItem;

export { List };
