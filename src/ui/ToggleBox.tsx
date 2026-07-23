import { ReactElement, ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Icon, Icons } from './Icon';
import { cn } from './shadcn/utils';
import { ToggleBoxLegacy } from './ToggleBoxLegacy';

type Props = {
  active?: boolean;
  icon?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const ToggleBoxShadcn = ({
  active = false,
  icon,
  title,
  description,
  disabled,
  onClick,
  className,
}: Props) => {
  // Matches the legacy component: hovering only turns the border/icon
  // green when the box is active or not disabled — a disabled, inactive
  // box stays grey on hover.
  const hoverEnabled = !disabled || active;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'tw:group tw:relative tw:flex tw:min-w-68 tw:flex-col tw:items-center tw:justify-center tw:gap-3 tw:rounded-udb tw:border tw:p-6 tw:disabled:opacity-50',
        active
          ? 'tw:border-success tw:bg-success-muted'
          : 'tw:border-secondary tw:bg-white',
        disabled ? 'tw:cursor-not-allowed' : 'tw:cursor-pointer',
        hoverEnabled && 'tw:hover:border-success',
        className,
      )}
    >
      <span
        className={cn(
          'tw:absolute tw:left-3 tw:top-3 tw:flex tw:h-7.5 tw:w-7.5 tw:items-center tw:justify-center tw:rounded-[5px] tw:border-[1.8px]',
          active ? 'tw:border-success tw:bg-success' : 'tw:border-secondary',
          hoverEnabled && 'tw:group-hover:border-success',
        )}
      >
        <Icon
          name={Icons.CHECK}
          width={22}
          height={22}
          className="tw:text-white"
        />
      </span>

      {icon && (
        <span
          className={cn(
            'tw:flex tw:min-h-20 tw:items-center tw:justify-center',
            active
              ? 'tw:text-success tw:[&_.icon-hover-color-stroke]:stroke-success tw:[&_.icon-hover-color-fill]:fill-success'
              : 'tw:text-secondary tw:[&_.icon-hover-color-stroke]:stroke-secondary tw:[&_.icon-hover-color-fill]:fill-secondary',
            hoverEnabled &&
              'tw:group-hover:text-success tw:group-hover:[&_.icon-hover-color-stroke]:stroke-success tw:group-hover:[&_.icon-hover-color-fill]:fill-success',
          )}
        >
          {icon}
        </span>
      )}

      {title && (
        <span
          className={cn(
            'tw:text-[16px] tw:font-bold',
            active ? 'tw:text-success' : 'tw:text-secondary',
            hoverEnabled && 'tw:group-hover:text-success',
          )}
        >
          {title}
        </span>
      )}

      {description && (
        <span className="tw:-mt-2 tw:text-[14px] tw:text-muted-foreground">
          {description}
        </span>
      )}
    </button>
  );
};

const ToggleBox = ({
  active,
  icon,
  title,
  description,
  disabled,
  onClick,
  className,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <ToggleBoxShadcn
        active={active}
        icon={icon}
        title={title}
        description={description}
        disabled={disabled}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <ToggleBoxLegacy
      active={active}
      icon={icon}
      title={title}
      description={description}
      disabled={disabled}
      onClick={onClick}
      className={className}
    />
  );
};

export { ToggleBox };
export type { Props as ToggleBoxProps };
