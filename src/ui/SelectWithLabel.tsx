import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import { Label, LabelPositions, LabelVariants } from './Label';
import type { SelectProps } from './Select';
import { Select } from './Select';
import { SelectWithLabelLegacy } from './SelectWithLabelLegacy';

type Props = SelectProps & {
  id: string;
  label: string;
  labelPosition?: Values<typeof LabelPositions>;
};

const positionClassNames = {
  [LabelPositions.TOP]: 'tw:flex-col tw:items-start',
  [LabelPositions.LEFT]: 'tw:flex-row tw:items-center',
  [LabelPositions.RIGHT]: 'tw:flex-row-reverse tw:items-center tw:justify-end',
} as const;

const SelectWithLabel = ({
  id,
  name,
  label,
  onChange,
  onBlur,
  className,
  value,
  size,
  disabled,
  children,
  ariaLabel,
  labelPosition = LabelPositions.TOP,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <div
        className={cn(
          'tw:flex tw:gap-2',
          positionClassNames[labelPosition],
          className,
        )}
      >
        <Label
          htmlFor={id}
          variant={LabelVariants.BOLD}
          disabled={disabled}
          className="tw:shrink-0"
        >
          {label}
        </Label>
        <Select
          id={id}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          ariaLabel={ariaLabel}
          size={size}
          disabled={disabled}
        >
          {children}
        </Select>
      </div>
    );
  }

  return (
    <SelectWithLabelLegacy
      id={id}
      name={name}
      label={label}
      onChange={onChange}
      onBlur={onBlur}
      className={className}
      value={value}
      size={size}
      disabled={disabled}
      ariaLabel={ariaLabel}
      labelPosition={labelPosition}
    >
      {children}
    </SelectWithLabelLegacy>
  );
};

export { SelectWithLabel };
