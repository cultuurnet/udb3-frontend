import type { ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';

import { Label } from './Label';
import { cn } from './shadcn/utils';
import { Switch, SwitchVariants } from './Switch';
import { SwitchWithLabelLegacy } from './SwitchWithLabelLegacy';

type SwitchWithLabelProps = {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: Values<typeof SwitchVariants>;
  label?: ReactNode;
  className?: string;
};

const SwitchWithLabelShadcn = ({
  id,
  checked,
  disabled,
  onCheckedChange = () => {},
  variant = SwitchVariants.DEFAULT,
  label,
  className,
}: SwitchWithLabelProps) => (
  <div className={cn('tw:flex tw:items-center tw:gap-2', className)}>
    <Switch
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      variant={variant}
    />
    <Label
      className={cn(
        disabled ? 'tw:cursor-not-allowed tw:opacity-50' : 'tw:cursor-pointer',
      )}
      htmlFor={id}
    >
      {label}
    </Label>
  </div>
);

const SwitchWithLabel = (props: SwitchWithLabelProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <SwitchWithLabelShadcn {...props} />;
  }

  return <SwitchWithLabelLegacy {...props} />;
};

export { SwitchWithLabel };
export type { SwitchWithLabelProps };
