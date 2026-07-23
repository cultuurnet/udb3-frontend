import NextLink from 'next/link';
import type { ElementType, ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Badge, BadgeVariants } from '@/ui/Badge';
import { buttonVariantMap, buttonVariants } from '@/ui/Button';

import { Box, getBoxProps } from './Box';
import type { Icons } from './Icon';
import { Icon } from './Icon';
import type { InlineProps } from './Inline';
import { LinkLegacy } from './LinkLegacy';
import { cn } from './shadcn/utils';

const LinkButtonVariants = {
  BUTTON_PRIMARY: 'primary',
  BUTTON_NEUTRAL: 'neutral',
  BUTTON_SECONDARY: 'secondary',
  BUTTON_DANGER: 'danger',
  BUTTON_SUCCESS: 'success',
} as const;

const LinkBadgeVariants = {
  BADGE_DANGER: 'badge-danger',
  BADGE_SECONDARY: 'badge-secondary',
  BADGE_INFO: 'badge-info',
} as const;

const LinkVariants = {
  ...LinkButtonVariants,
  ...LinkBadgeVariants,
  UNSTYLED: 'unstyled',
} as const;

const linkButtonVariantSet = new Set(
  Object.values(LinkButtonVariants) as string[],
);
const badgeVariants = new Set(Object.values(LinkBadgeVariants) as string[]);

const badgeVariantByLinkVariant: Record<
  Values<typeof LinkBadgeVariants>,
  Values<typeof BadgeVariants>
> = {
  [LinkBadgeVariants.BADGE_DANGER]: BadgeVariants.DANGER,
  [LinkBadgeVariants.BADGE_SECONDARY]: BadgeVariants.SECONDARY,
  [LinkBadgeVariants.BADGE_INFO]: BadgeVariants.INFO,
};

// TODO: after legacy drop, BaseLinkProps should only accept variant/as/className — callers will use Tailwind classes directly
type BaseLinkProps = InlineProps & {
  variant?: Values<typeof LinkVariants>;
  as?: ElementType;
};

const BaseLinkShadcn = ({
  href,
  variant,
  title,
  target,
  rel,
  children,
  className,
  as: Component = 'a',
  ...props
}: BaseLinkProps) => {
  const isButton = linkButtonVariantSet.has(variant ?? '');
  const isBadge = badgeVariants.has(variant ?? '');

  const variantClass =
    variant === LinkVariants.UNSTYLED
      ? 'tw:items-center tw:w-full tw:no-underline tw:text-inherit tw:hover:text-inherit'
      : isButton || isBadge
        ? 'tw:items-center tw:no-underline'
        : 'tw:font-normal tw:underline tw:text-udb-main-darkest-blue tw:hover:text-udb-main-blue tw:hover:decoration-udb-main-blue';

  // TODO: after legacy drop, replace Box with plain Component and remove getBoxProps — callers will use className instead of Box props
  return (
    <Box
      as={Component}
      href={href}
      title={title}
      target={target}
      rel={rel}
      className={cn('tw:inline-flex', variantClass, className)}
      {...getBoxProps(props)}
    >
      {isButton ? (
        <span
          className={cn(
            buttonVariants({
              variant:
                buttonVariantMap[variant as Values<typeof LinkButtonVariants>],
            }),
            'tw:w-full',
          )}
        >
          {children}
        </span>
      ) : isBadge ? (
        <Badge
          variant={
            badgeVariantByLinkVariant[
              variant as Values<typeof LinkBadgeVariants>
            ]
          }
        >
          {children}
        </Badge>
      ) : (
        children
      )}
    </Box>
  );
};

type LinkProps = {
  children?: ReactNode;
  className?: string;
  href: string;
  iconName?: Values<typeof Icons>;
  suffix?: ReactNode;
  customChildren?: boolean;
  shouldHideText?: boolean;
  target?: string;
  rel?: string;
} & BaseLinkProps;

const LinkShadcn = ({
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

  const isButton = linkButtonVariantSet.has(variant ?? '');
  const isBadge = badgeVariants.has(variant ?? '');

  const clonedSuffix =
    suffix && isValidElement(suffix)
      ? cloneElement(suffix as ReactElement, { key: 'suffix' })
      : suffix;

  const content = isBadge ? (
    children
  ) : isButton || iconName || clonedSuffix ? (
    <span className="tw:flex tw:justify-between tw:w-full">
      <span className="tw:flex tw:gap-[0.5333rem]">
        {iconName && <Icon name={iconName} />}
        {customChildren
          ? children
          : !shouldHideText && <span className="tw:flex-1">{children}</span>}
      </span>
      {clonedSuffix}
    </span>
  ) : shouldHideText ? null : (
    children
  );

  const resolvedAs = href && isInternalLink ? NextLink : as;
  const resolvedRel = href && !isInternalLink ? 'noopener' : rel;
  const resolvedTarget = href && !isInternalLink ? '_blank' : target;

  return (
    <BaseLinkShadcn
      as={resolvedAs}
      href={href || undefined}
      className={className}
      variant={variant}
      title={title}
      target={resolvedTarget}
      rel={resolvedRel}
      {...getBoxProps(props)}
    >
      {content}
    </BaseLinkShadcn>
  );
};

const Link = (props: LinkProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <LinkShadcn {...props} />
  ) : (
    <LinkLegacy {...(props as any)} />
  );
};

export { Link, LinkBadgeVariants, LinkButtonVariants, LinkVariants };
export type { LinkProps };
