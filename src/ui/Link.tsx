import NextLink from 'next/link';
import type { ElementType, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';

import type { Values } from '@/types/Values';
import { Button } from '@/ui/Button';

import type { Icons } from './Icon';
import { Icon } from './Icon';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Text } from './Text';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('link');

export const LinkButtonVariants = {
  BUTTON_PRIMARY: 'primary',
  BUTTON_SECONDARY: 'secondary',
  BUTTON_DANGER: 'danger',
  BUTTON_SUCCESS: 'success',
} as const;

const LinkVariants = {
  ...LinkButtonVariants,
  UNSTYLED: 'unstyled',
} as const;

type BaseLinkProps = InlineProps & {
  variant?: Values<typeof LinkVariants>;
  as?: ElementType;
};

const BaseLink = forwardRef<HTMLElement, BaseLinkProps>(
  ({ href, variant, title, children, className, as = 'a', ...props }, ref) => {
    if (variant === LinkVariants.UNSTYLED) {
      return (
        <Inline
          className={className}
          href={href}
          ref={ref}
          as={as}
          title={title}
          display="inline-flex"
          color={{ default: 'inherit', hover: 'inherit' }}
          alignItems="center"
          width="100%"
          textDecoration="none"
          {...getInlineProps(props)}
        >
          {children}
        </Inline>
      );
    }

    if (Object.values(LinkButtonVariants).includes(variant)) {
      return (
        <Inline
          className={className}
          href={href}
          ref={ref}
          as={as}
          display="inline-flex"
          alignItems="center"
          {...getInlineProps(props)}
          textDecoration="none"
        >
          <Button forwardedAs="span" width="100%" variant={variant}>
            {children}
          </Button>
        </Inline>
      );
    }

    return (
      <Inline
        className={className}
        href={href}
        ref={ref}
        forwardedAs={as}
        color={{ default: getValue('color'), hover: getValue('hoverColor') }}
        display="inline-flex"
        fontWeight={400}
        css={`
          text-decoration: underline;
          &:hover {
            text-decoration: underline;
          }
        `}
        {...getInlineProps(props)}
      >
        {children}
      </Inline>
    );
  },
);

BaseLink.displayName = 'BaseLink';

type LinkProps = {
  children?: React.ReactNode;
  className?: string;
  href: string;
  iconName?: Values<typeof Icons>;
  suffix?: ReactNode;
  customChildren?: boolean;
  shouldHideText?: boolean;
  target?: string;
  rel?: string;
} & BaseLinkProps;

const Link = ({
  href,
  iconName,
  suffix,
  children,
  customChildren = false,
  shouldHideText = false,
  className,
  variant,
  title,
  as,
  target,
  rel,
  ...props
}: LinkProps) => {
  const isInternalLink = href.startsWith('/') || href.startsWith('#');

  const clonedSuffix =
    suffix && isValidElement(suffix)
      ? cloneElement(suffix as ReactElement, {
          ...(suffix.props && typeof suffix.props === 'object'
            ? suffix.props
            : {}),
          key: 'suffix',
        })
      : suffix;

  const content = (
    <Inline justifyContent="space-between" width="100%">
      <Inline spacing={3}>
        {iconName && <Icon name={iconName} />}
        {customChildren
          ? children
          : !shouldHideText && <Text flex={1}>{children}</Text>}
      </Inline>
      {clonedSuffix}
    </Inline>
  );

  if (!href) {
    return (
      <BaseLink
        as={as}
        className={className}
        variant={variant}
        title={title}
        {...getInlineProps(props)}
      >
        {content}
      </BaseLink>
    );
  }

  if (isInternalLink) {
    return (
      <NextLink
        href={href}
        css={`
          text-decoration: none;
          margin: 0 !important;
          padding: 0 !important;
          ${getInlineProps(props)}
        `}
      >
        <BaseLink
          as="span"
          className={className}
          variant={variant}
          title={title}
          {...getInlineProps(props)}
          target={target}
          rel={rel}
        >
          {content}
        </BaseLink>
      </NextLink>
    );
  }

  return (
    <BaseLink
      as={as}
      href={href}
      className={className}
      variant={variant}
      rel="noopener"
      target="_blank"
      title={title}
      {...getInlineProps(props)}
    >
      {content}
    </BaseLink>
  );
};

export { Link, LinkVariants };
