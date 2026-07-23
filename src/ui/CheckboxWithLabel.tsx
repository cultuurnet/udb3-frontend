import { ChangeEvent, ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Checkbox } from './Checkbox';
import { CheckboxWithLabelLegacy } from './CheckboxWithLabelLegacy';
import { Label } from './Label';
import { cn } from './shadcn/utils';

type CheckboxWithLabelProps = {
  className?: string;
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: ReactNode;
};

const CheckboxWithLabel = ({
  id,
  name,
  checked = false,
  disabled = false,
  onCheckedChange = () => {},
  children,
  className = '',
}: CheckboxWithLabelProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <div className={cn('tw:flex tw:items-center tw:gap-2', className)}>
        <Checkbox
          id={id}
          onCheckedChange={onCheckedChange}
          name={name}
          checked={checked}
          disabled={disabled}
        />
        <Label cursor={disabled ? 'not-allowed' : 'pointer'} htmlFor={id}>
          {children}
        </Label>
      </div>
    );
  }

  return (
    <CheckboxWithLabelLegacy
      id={id}
      name={name}
      checked={checked}
      disabled={disabled}
      onToggle={(event: ChangeEvent<HTMLInputElement>) =>
        onCheckedChange(event.target.checked)
      }
      className={className}
    >
      {children}
    </CheckboxWithLabelLegacy>
  );
};

export { CheckboxWithLabel };
export type { CheckboxWithLabelProps };
