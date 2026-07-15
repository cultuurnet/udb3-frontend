import { ChangeEvent } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Checkbox as ShadcnCheckbox } from '@/ui/shadcn/checkbox';

import { CheckboxLegacy } from './CheckboxLegacy';

type CheckboxProps = {
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
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
      aria-label={ariaLabel}
      data-testid={dataTestId}
    />
  );
};

export { Checkbox };
export type { CheckboxProps };
