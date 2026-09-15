import type { ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group';

import { Label } from './Label';
import { RadioButtonGroupLegacy } from './RadioButtonGroupLegacy';
import { cn } from './shadcn/utils';
import { Text, TextVariants } from './Text';
import { colors } from './theme';

const RadioButtonVariants = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
} as const;

type RadioButtonVariants = Values<typeof RadioButtonVariants>;

// TODO: after legacy drop, delete this map — the shadcn variants are the only color source needed.
const LEGACY_COLOR_BY_VARIANT: Record<RadioButtonVariants, string> = {
  [RadioButtonVariants.PRIMARY]: colors.primary,
  [RadioButtonVariants.SUCCESS]: colors.udbMainPositiveGreen,
};

type Item = {
  value: string;
  label?: ReactNode;
  info?: string;
  content?: ReactNode;
  id?: string;
  disabled?: boolean;
};

type Props = {
  name: string;
  items?: Array<Item>;
  selected: string;
  disabled?: boolean;
  className?: string;
  variant?: RadioButtonVariants;
  onValueChange: (value: string) => void;
};

const RadioButtonGroupShadcn = ({
  name = '',
  items = [],
  selected,
  disabled,
  className,
  variant = RadioButtonVariants.PRIMARY,
  onValueChange,
}: Props) => (
  <RadioGroup
    value={selected}
    onValueChange={onValueChange}
    disabled={disabled}
    name={name}
    className={cn('tw:flex tw:flex-col tw:gap-3', className)}
  >
    {items.map((item) => {
      const itemId = item.id ?? `${name}-${item.value}`;
      const isItemDisabled = item.disabled ?? disabled;

      return (
        <div key={item.value} className="tw:flex tw:flex-col tw:gap-3">
          <div
            className={cn(
              'tw:flex tw:gap-3',
              item.info ? 'tw:items-start' : 'tw:items-center',
            )}
          >
            <RadioGroupItem
              value={item.value}
              id={itemId}
              disabled={isItemDisabled}
              variant={
                variant === RadioButtonVariants.SUCCESS ? 'success' : 'default'
              }
              className={item.info ? 'tw:mt-1' : undefined}
            />
            <div className="tw:flex tw:flex-col">
              <Label disabled={isItemDisabled} htmlFor={itemId}>
                {item.label}
              </Label>
              {!!item.info && (
                <Text variant={TextVariants.MUTED}>{item.info}</Text>
              )}
            </div>
          </div>
          {item.value === selected && item.content}
        </div>
      );
    })}
  </RadioGroup>
);

const RadioButtonGroup = (props: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <RadioButtonGroupShadcn {...props} />;
  }

  return (
    <RadioButtonGroupLegacy
      name={props.name}
      items={props.items}
      selected={props.selected}
      disabled={props.disabled}
      className={props.className}
      color={
        LEGACY_COLOR_BY_VARIANT[props.variant ?? RadioButtonVariants.PRIMARY]
      }
      onChange={(event) => props.onValueChange(event.target.value)}
    />
  );
};

export { RadioButtonGroup, RadioButtonVariants };
export type { Item as RadioButtonGroupItem };
