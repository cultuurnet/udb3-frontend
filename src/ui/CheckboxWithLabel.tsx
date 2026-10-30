import { ChangeEvent, ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Checkbox, CheckboxVariants } from './Checkbox';
import { CheckboxWithLabelLegacy } from './CheckboxWithLabelLegacy';
import { getInlineProps } from './Inline';
import { Label } from './Label';
import { cn } from './shadcn/utils';

type CheckboxWithLabelProps = {
  className?: string;
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: CheckboxVariants;
  children?: ReactNode;
};

const CheckboxWithLabel = ({
  id,
  name,
  checked = false,
  disabled = false,
  onCheckedChange = () => {},
  variant = CheckboxVariants.PRIMARY,
  children,
  className = '',
  ...rest
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
          variant={variant}
        />
        <Label disabled={disabled} htmlFor={id}>
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
      variant={variant}
      {...getInlineProps(rest)}
    >
      {children}
    </CheckboxWithLabelLegacy>
  );
};

export { CheckboxWithLabel };
export type { CheckboxWithLabelProps };
