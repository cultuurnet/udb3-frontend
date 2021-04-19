import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { getValueFromTheme } from './theme';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Inline' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { getInlineProps, Inline, inlinePropTypes } from './Inline';
import { cloneElement, forwardRef } from 'react';
import { Icon } from './Icon';
import { Text } from './Text';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Button' or its correspond... Remove this comment to see the full error message
import { Button, ButtonVariants } from '@/ui/Button';

const getValue = getValueFromTheme('link');

const LinkButtonVariants = {
  BUTTON_PRIMARY: ButtonVariants.PRIMARY,
  BUTTON_SECONDARY: ButtonVariants.SECONDARY,
  BUTTON_DANGER: ButtonVariants.DANGER,
  BUTTON_SUCCESS: ButtonVariants.SUCCESS,
};

const LinkVariants = {
  UNSTYLED: 'unstyled',
  ...LinkButtonVariants,
};

const BaseLink = forwardRef(({ variant, children, ...props }, ref) => {
  if (variant === LinkVariants.UNSTYLED) {
    return (
      <Inline
        ref={ref}
        forwardedAs="a"
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        display="inline-flex"
        color={{ default: 'inherit', hover: 'inherit' }}
        alignItems="center"
        {...props}
      >
        {children}
      </Inline>
    );
  }

  if (Object.values(LinkButtonVariants).includes(variant)) {
    return (
      <Inline
        ref={ref}
        forwardedAs="a"
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        display="inline-flex"
        alignItems="center"
        {...props}
      >
        <Button forwardedAs="span" variant={variant}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          {children}
        </Button>
      </Inline>
    );
  }

  return (
    <Inline
      ref={ref}
      forwardedAs="a"
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      color={{ default: getValue('color'), hover: getValue('color') }}
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
});

BaseLink.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node,
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
}) => {
  const isInternalLink = href.startsWith('/');

  const clonedSuffix = suffix
    ? cloneElement(suffix, {
        ...suffix.props,
        key: 'suffix',
        css: `align-self: flex-end`,
      })
    : undefined;

  const inner = [
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'variant' does not exist on type 'LinkPro... Remove this comment to see the full error message
    iconName && <Icon name={iconName} key="icon" />,
    customChildren
      ? children
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      : !shouldHideText && (
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <Text flex={1} textAlign="left" key="text">
            {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'props' does not exist on type 'string | ... Remove this comment to see the full error message */}
            {children}
          </Text>
        ),
    clonedSuffix,
  ];

  if (isInternalLink) {
    return (
      <NextLink
        href={href}
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        passHref
        {...(process.env.STORYBOOK ? { prefetch: false } : {})}
      >
        <BaseLink
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          className={className}
          variant={variant}
          title={title}
          {...getInlineProps(props)}
        >
          {inner}
        </BaseLink>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      </NextLink>
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
    );
  }

  return (
    <BaseLink
      href={href}
      className={className}
      variant={variant}
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      rel="noopener"
      target="_blank"
      title={title}
      {...getInlineProps(props)}
    >
      {inner}
    </BaseLink>
  );
};

Link.propTypes = {
  ...inlinePropTypes,
  href: PropTypes.string,
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  title: PropTypes.string,
  iconName: PropTypes.string,
  suffix: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
  customChildren: PropTypes.bool,
  shouldHideText: PropTypes.bool,
  as: PropTypes.node,
};

Link.defaultProps = {
  customChildren: false,
  shouldHideText: false,
};

export { Link, LinkVariants };
