import NextLink from 'next/link';
import { getValueFromTheme } from './theme';
import { getInlineProps, Inline, InlineProps } from './Inline';
import { cloneElement, forwardRef } from 'react';
import { Icon } from './Icon';
import { Text } from './Text';
import { Button, ButtonVariants } from '@/ui/Button';

const getValue = getValueFromTheme('link');

type Values<T> = T[keyof T];

const LinkButtonVariants = {
  BUTTON_PRIMARY: ButtonVariants.PRIMARY,
  BUTTON_SECONDARY: ButtonVariants.SECONDARY,
  BUTTON_DANGER: ButtonVariants.DANGER,
  BUTTON_SUCCESS: ButtonVariants.SUCCESS,
} as const;

const LinkVariants = {
  UNSTYLED: 'unstyled',
  ...LinkButtonVariants,
} as const;

type BaseLinkProps = InlineProps & {
  title: string;
  variant?: Values<typeof LinkVariants>;
};

const BaseLink = forwardRef<unknown, BaseLinkProps>(
  ({ variant, children, ...props }, ref) => {
    if (variant === LinkVariants.UNSTYLED) {
      return (
        <Inline
          ref={ref}
          forwardedAs="a"
          display="inline-flex"
          color={{ default: 'inherit', hover: 'inherit' }}
          alignItems="center"
          {...props}
        >
          {children}
        </Inline>
      );
    }

    if (variant && Object.values(LinkButtonVariants).includes(variant)) {
      return (
        <Inline
          ref={ref}
          forwardedAs="a"
          display="inline-flex"
          alignItems="center"
          {...props}
        >
          <Button forwardedAs="span" variant={variant}>
            {children}
          </Button>
        </Inline>
      );
    }

    return (
      <Inline
        ref={ref}
        forwardedAs="a"
        color={{
          default: getValue<string>('color'),
          hover: getValue<string>('color'),
        }}
        display="inline-flex"
        css={`
          font-weight: 400;
          &:hover {
            text-decoration: underline;
          }
        `}
        {...props}
      >
        {children}
      </Inline>
    );
  },
);

type Props = InlineProps & {
  href: string;
  title: string;
  iconName: string;
  suffix: React.ReactNode;
  className: string;
  children: React.ReactNode;
  customChildren: boolean;
  shouldHideText: boolean;
  as: React.ReactNode;
  variant?: Values<typeof LinkVariants>;
};

const Link = ({
  href,
  iconName,
  suffix,
  children,
  customChildren,
  shouldHideText,
  className,
  variant,
  title,
  ...props
}: Props) => {
  const isInternalLink = href.startsWith('/') || href.startsWith('#');

  // @ts-expect-error
  if (!React.isValidElement(suffix)) return null;

  const clonedSuffix = suffix
    ? cloneElement(suffix, {
        ...suffix.props,
        key: 'suffix',
        css: `align-self: flex-end`,
      })
    : undefined;

  const inner = [
    iconName && <Icon name={iconName} key="icon" />,
    customChildren
      ? children
      : !shouldHideText && (
          <Text flex={1} textAlign="left" key="text">
            {children}
          </Text>
        ),
    clonedSuffix,
  ];

  if (isInternalLink) {
    return (
      <NextLink
        href={href}
        passHref
        {...(process.env.STORYBOOK ? { prefetch: false } : {})}
      >
        <BaseLink
          className={className}
          variant={variant}
          title={title}
          {...getInlineProps(props)}
        >
          {inner}
        </BaseLink>
      </NextLink>
    );
  }

  return (
    <BaseLink
      href={href}
      className={className}
      variant={variant}
      rel="noopener"
      target="_blank"
      title={title}
      {...getInlineProps(props)}
    >
      {inner}
    </BaseLink>
  );
};

Link.defaultProps = {
  customChildren: false,
  shouldHideText: false,
};

export { Link, LinkVariants };
