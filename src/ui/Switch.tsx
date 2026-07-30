import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Switch as ShadcnSwitch } from '@/ui/shadcn/switch';

import { cn } from './shadcn/utils';
import { SwitchLegacy } from './SwitchLegacy';
import { colors } from './theme';

const SwitchVariants = {
  DEFAULT: 'default',
  SUCCESS: 'success',
} as const;

// TODO: after legacy drop, delete this map — BG_CLASS_BY_VARIANT below will be the only color source needed.
const LEGACY_COLOR_BY_VARIANT: Record<Values<typeof SwitchVariants>, string> = {
  [SwitchVariants.DEFAULT]: colors.udbMainBlue,
  [SwitchVariants.SUCCESS]: colors.udbMainPositiveGreen,
};

const BG_CLASS_BY_VARIANT: Record<Values<typeof SwitchVariants>, string> = {
  [SwitchVariants.DEFAULT]: 'tw:data-[state=checked]:bg-primary',
  [SwitchVariants.SUCCESS]: 'tw:data-[state=checked]:bg-success',
};

type SwitchProps = {
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: Values<typeof SwitchVariants>;
  className?: string;
  'aria-label'?: string;
};

const Switch = ({
  id,
  checked,
  disabled,
  onCheckedChange = () => {},
  variant = SwitchVariants.DEFAULT,
  className,
  'aria-label': ariaLabel,
}: SwitchProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <ShadcnSwitch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={cn(BG_CLASS_BY_VARIANT[variant], className)}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <SwitchLegacy
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      color={LEGACY_COLOR_BY_VARIANT[variant]}
      className={className}
      aria-label={ariaLabel}
    />
  );
};

export { LEGACY_COLOR_BY_VARIANT, Switch, SwitchVariants };
export type { SwitchProps };
