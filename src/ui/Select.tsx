import type { ChangeEvent, FocusEvent, ReactNode } from 'react';
import { forwardRef } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { cn } from '@/ui/shadcn/utils';

import { Icon, Icons } from './Icon';
import { SelectLegacy } from './SelectLegacy';

type SelectProps = {
  id?: string;
  name?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: FocusEvent<HTMLSelectElement>) => void;
};

const sizeClassNames = {
  sm: 'tw:h-8 tw:pl-2 tw:pr-7 tw:py-0.5 tw:text-sm',
  md: 'tw:h-10 tw:pl-3 tw:pr-8 tw:py-1 tw:text-base',
  lg: 'tw:h-12 tw:pl-4 tw:pr-9 tw:py-2 tw:text-lg',
} as const;

const iconOffsetClassNames = {
  sm: 'tw:right-2',
  md: 'tw:right-3',
  lg: 'tw:right-4',
} as const;

const SelectShadcn = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      name,
      value,
      disabled,
      size,
      ariaLabel,
      className,
      onChange,
      onBlur,
      children,
    },
    ref,
  ) => (
    <div className={cn('tw:relative', className)}>
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={onChange}
        onBlur={onBlur}
        className={cn(
          'tw:flex tw:w-full tw:appearance-none tw:rounded-md tw:border tw:border-input tw:bg-transparent tw:transition-colors tw:focus-visible:outline-none tw:focus-visible:ring-1 tw:focus-visible:ring-ring tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
          sizeClassNames[size ?? 'md'],
        )}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className={cn(
          'tw:pointer-events-none tw:absolute tw:top-1/2 tw:flex tw:-translate-y-1/2 tw:text-muted-foreground',
          iconOffsetClassNames[size ?? 'md'],
          disabled && 'tw:opacity-50',
        )}
      >
        <Icon name={Icons.CHEVRON_DOWN} width={18} height={18} />
      </span>
    </div>
  ),
);

SelectShadcn.displayName = 'SelectShadcn';

const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <SelectShadcn {...props} ref={ref} />;
  }

  return <SelectLegacy {...props} ref={ref} />;
});

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
