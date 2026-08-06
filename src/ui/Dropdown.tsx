import NextLink from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Button, buttonVariantMap, ButtonVariants } from '@/ui/Button';
import { buttonVariants } from '@/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu';
import { cn } from '@/ui/shadcn/utils';

import { DividerLegacy, DropdownLegacy, ItemLegacy } from './DropdownLegacy';
import { Icon, Icons } from './Icon';
import { Link } from './Link';

const DropDownVariants = {
  ...ButtonVariants,
  SECONDARY: 'outline-secondary',
} as const;

const ShadcnMigrationContext = createContext(false);

type DropdownItemProps = {
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
};

type DropdownProps = {
  variant: Values<typeof DropDownVariants>;
  isSplit?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  children?: ReactNode;
};

const ItemShadcn = ({ href, onClick, children }: DropdownItemProps) => {
  if (onClick) {
    return (
      <DropdownMenuItem onSelect={onClick} className="tw:text-base">
        {children}
      </DropdownMenuItem>
    );
  }

  if (href) {
    return (
      <DropdownMenuItem asChild className="tw:text-base">
        <NextLink
          href={href}
          className="tw:w-full tw:text-inherit tw:no-underline"
        >
          {children}
        </NextLink>
      </DropdownMenuItem>
    );
  }

  return null;
};

const Item = (props: DropdownItemProps) => {
  const isShadcnMigrationEnabled = useContext(ShadcnMigrationContext);

  if (isShadcnMigrationEnabled) {
    return <ItemShadcn {...props} />;
  }

  return <ItemLegacy {...props} />;
};

const Divider = () => {
  const isShadcnMigrationEnabled = useContext(ShadcnMigrationContext);

  if (isShadcnMigrationEnabled) {
    return <DropdownMenuSeparator />;
  }

  return <DividerLegacy />;
};

const DropdownShadcn = ({
  variant,
  isSplit = false,
  id,
  className,
  'aria-label': ariaLabel,
  children,
}: DropdownProps) => {
  const { t } = useTranslation();

  const isMenuChild = (child) => child.type === Item || child.type === Divider;
  const menuChildren = Children.toArray(children).filter(isMenuChild);

  const isPrimaryActionChild = (child) =>
    child.type === Button || child.type === Link;
  const primaryActionChild = Children.toArray(children).find(
    isPrimaryActionChild,
  ) as ReactElement<any>;

  const buttonVariant =
    variant === DropDownVariants.SECONDARY ? ButtonVariants.NEUTRAL : variant;
  const shadcnVariant = buttonVariantMap[buttonVariant];

  const menuContent = menuChildren.length > 0 && (
    <DropdownMenuContent align="end">{menuChildren}</DropdownMenuContent>
  );

  if (isSplit) {
    const primaryAction = cloneElement(primaryActionChild, {
      ...primaryActionChild.props,
      variant: buttonVariant,
      className: cn(
        primaryActionChild.props.className,
        menuChildren.length > 0 &&
          'tw:rounded-r-none tw:[&>span]:rounded-r-none tw:[&>span]:shadow-none',
      ),
    });

    return (
      <DropdownMenu>
        <div
          id={id}
          className={cn(
            'tw:inline-flex tw:rounded-md tw:shadow-heavy',
            className,
          )}
        >
          {primaryAction}
          {menuChildren.length > 0 && (
            <DropdownMenuTrigger
              aria-label={t('dropdown.toggle_label')}
              className={cn(
                buttonVariants({ variant: shadcnVariant, size: 'icon' }),
                'tw:h-auto tw:self-stretch tw:rounded-l-none tw:border-l tw:shadow-none',
                buttonVariant === ButtonVariants.NEUTRAL
                  ? 'tw:border-border'
                  : 'tw:border-white',
              )}
            >
              <Icon name={Icons.CHEVRON_DOWN} />
            </DropdownMenuTrigger>
          )}
        </div>
        {menuContent}
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          buttonVariants({ variant: shadcnVariant }),
          'tw:flex tw:items-center tw:justify-start',
          className,
        )}
      >
        {primaryActionChild.props.children}
      </DropdownMenuTrigger>
      {menuContent}
    </DropdownMenu>
  );
};

const Dropdown = (props: DropdownProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return (
    <ShadcnMigrationContext.Provider value={isShadcnMigrationEnabled}>
      {isShadcnMigrationEnabled ? (
        <DropdownShadcn {...props} />
      ) : (
        <DropdownLegacy {...props} />
      )}
    </ShadcnMigrationContext.Provider>
  );
};

Dropdown.Item = Item;
Dropdown.Divider = Divider;

export { Divider, Dropdown, DropDownVariants, Item };
export type { DropdownProps };
