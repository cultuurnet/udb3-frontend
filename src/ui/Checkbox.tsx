import { ChangeEvent } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Checkbox as ShadcnCheckbox } from '@/ui/shadcn/checkbox';

import { CheckboxLegacy } from './CheckboxLegacy';

const CheckboxVariants = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
} as const;

type CheckboxVariants = Values<typeof CheckboxVariants>;

type CheckboxProps = {
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  variant?: CheckboxVariants;
  'aria-label'?: string;
  'data-testid'?: string;
};

const Checkbox = ({
  id,
  name,
  checked,
  disabled,
  onCheckedChange = () => {},
  className,
  variant = CheckboxVariants.PRIMARY,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CheckboxProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <ShadcnCheckbox
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={className}
        variant={variant === CheckboxVariants.SUCCESS ? 'success' : 'default'}
        aria-label={ariaLabel}
        data-testid={dataTestId}
      />
    );
  }

  return (
    <CheckboxLegacy
      id={id}
      name={name}
      checked={checked}
      disabled={disabled}
      onToggle={(event: ChangeEvent<HTMLInputElement>) =>
        onCheckedChange(event.target.checked)
      }
      className={className}
      variant={variant}
      aria-label={ariaLabel}
      data-testid={dataTestId}
    />
  );
};

export { Checkbox, CheckboxVariants };
export type { CheckboxProps };
