import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import {
  ToggleGroup as ShadcnToggleGroupRoot,
  ToggleGroupItem,
} from './shadcn/toggle-group';
import { cn } from './shadcn/utils';
import { ToggleGroupLegacy } from './ToggleGroupLegacy';

type ToggleGroupOption = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  value: string;
  options: ToggleGroupOption[];
  onChange: (value: string) => void;
  className?: string;
};

const ToggleGroupShadcn = ({ value, options, onChange, className }: Props) => (
  <ShadcnToggleGroupRoot
    type="single"
    value={value}
    onValueChange={(newValue) => {
      if (newValue) onChange(newValue);
    }}
    className={cn(
      'tw:items-stretch tw:gap-0 tw:rounded tw:bg-grey-background',
      className,
    )}
  >
    {options.map((option) => (
      <ToggleGroupItem
        key={option.value}
        value={option.value}
        className="tw:h-auto tw:min-w-0 tw:flex-1 tw:rounded-none tw:px-4 tw:py-2 tw:text-base tw:text-foreground tw:transition-all tw:hover:bg-background/60 tw:data-[state=on]:z-1 tw:data-[state=on]:rounded tw:data-[state=on]:bg-background tw:data-[state=on]:shadow-heavy"
      >
        {option.label}
      </ToggleGroupItem>
    ))}
  </ShadcnToggleGroupRoot>
);

const ToggleGroup = ({ name, value, options, onChange, className }: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <ToggleGroupShadcn
        name={name}
        value={value}
        options={options}
        onChange={onChange}
        className={className}
      />
    );
  }

  return (
    <ToggleGroupLegacy
      name={name}
      value={value}
      options={options}
      onChange={onChange}
      className={className}
    />
  );
};

export { ToggleGroup };
export type { ToggleGroupOption };
