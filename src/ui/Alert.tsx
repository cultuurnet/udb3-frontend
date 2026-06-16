import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import {
  Alert as ShadcnAlert,
  AlertDescription,
  AlertTitle,
} from '@/ui/shadcn/alert';
import { cn } from '@/ui/shadcn/utils';

import { AlertLegacy } from './AlertLegacy';
import { Icon, Icons } from './Icon';
import type { InlineProps } from './Inline';

const AlertVariants = {
  PRIMARY: 'primary',
  INFO: 'info',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
} as const;

const AlertVariantIcon: Partial<
  Record<
    Values<typeof AlertVariants>,
    { name: Values<typeof Icons>; className: string }
  >
> = {
  [AlertVariants.PRIMARY]: { name: Icons.INFO, className: 'tw:text-info' },
  [AlertVariants.SUCCESS]: {
    name: Icons.CHECK_CIRCLE,
    className: 'tw:text-success',
  },
  [AlertVariants.WARNING]: {
    name: Icons.EXCLAMATION_TRIANGLE,
    className: 'tw:text-udb-warning',
  },
  [AlertVariants.DANGER]: {
    name: Icons.EXCLAMATION_CIRCLE,
    className: 'tw:text-destructive',
  },
};

type AlertProps = InlineProps & {
  variant?: Values<typeof AlertVariants>;
  visible?: boolean;
  fullWidth?: boolean;
  closable?: boolean;
  onClose?: () => void;
  title?: string;
  action?: ReactNode;
};

const AlertShadcn = ({
  variant = AlertVariants.PRIMARY,
  visible = true,
  children,
  fullWidth,
  closable,
  onClose,
  title,
  action,
  className,
}: AlertProps) => {
  const { t } = useTranslation();
  const icon = AlertVariantIcon[variant];

  return (
    <ShadcnAlert
      data-testid={`alert-${variant}`}
      variant={variant}
      className={cn(
        !visible && 'tw:hidden',
        !fullWidth && 'tw:w-auto tw:self-start',
        closable && 'tw:pr-10',
        className,
      )}
    >
      <div className="tw:flex tw:items-start tw:gap-3">
        {icon && (
          <Icon
            name={icon.name}
            width={14}
            height={14}
            className={cn(!title && 'tw:mt-0.5', 'tw:shrink-0', icon.className)}
          />
        )}
        <div className="tw:flex-1 tw:min-w-0">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>
            {typeof children !== 'string' ? (
              children
            ) : (
              // TODO: remove !important overrides when GlobalStyle.js CSS reset (list-style: none, font: inherit) is cleaned up.
              <span
                className="tw:[&_ul]:list-disc! tw:[&_ul]:pl-8! tw:[&_li]:list-item! tw:[&_strong]:font-bold! tw:[&_b]:font-bold! tw:[&_code]:font-mono!"
                dangerouslySetInnerHTML={{ __html: children as string }}
              />
            )}
          </AlertDescription>
          {action && <div className="tw:mt-3">{action}</div>}
        </div>
      </div>
      {closable && (
        <button
          aria-label={t('common.close')}
          onClick={onClose}
          className={cn(
            'tw:absolute tw:right-2 tw:cursor-pointer tw:border-0 tw:bg-transparent tw:p-1 tw:rounded tw:opacity-60 tw:transition-opacity tw:hover:opacity-100 tw:hover:bg-black/10',
            title ? 'tw:top-2' : 'tw:top-2.5',
            icon?.className,
          )}
        >
          <Icon name={Icons.TIMES} width={14} height={14} />
        </button>
      )}
    </ShadcnAlert>
  );
};

const Alert = ({
  variant = AlertVariants.PRIMARY,
  visible = true,
  children,
  fullWidth,
  closable,
  onClose,
  title,
  action,
  className,
  ...props
}: AlertProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (!isShadcnMigrationEnabled) {
    return (
      <AlertLegacy
        variant={variant}
        visible={visible}
        fullWidth={fullWidth}
        closable={closable}
        onClose={onClose}
        className={className}
        {...props}
      >
        {children}
      </AlertLegacy>
    );
  }

  return (
    <AlertShadcn
      variant={variant}
      visible={visible}
      fullWidth={fullWidth}
      closable={closable}
      onClose={onClose}
      title={title}
      action={action}
      className={className}
    >
      {children}
    </AlertShadcn>
  );
};

export { Alert, AlertVariants };
