import type { ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group';

import { Label } from './Label';
import { RadioButtonGroupLegacy } from './RadioButtonGroupLegacy';
import { cn } from './shadcn/utils';
import { Text, TextVariants } from './Text';

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
  onValueChange: (value: string) => void;
};

const RadioButtonGroupShadcn = ({
  name = '',
  items = [],
  selected,
  disabled,
  className,
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
              className={item.info ? 'tw:mt-1' : undefined}
            />
            <div className="tw:flex tw:flex-col">
              <Label
                cursor={isItemDisabled ? 'not-allowed' : 'pointer'}
                opacity={isItemDisabled ? 0.5 : undefined}
                htmlFor={itemId}
              >
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
      onChange={(event) => props.onValueChange(event.target.value)}
    />
  );
};

export { RadioButtonGroup };
export type { Item as RadioButtonGroupItem };
