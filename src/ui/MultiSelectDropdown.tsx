import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Icon, Icons } from '@/ui/Icon';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu';
import { cn } from '@/ui/shadcn/utils';

import { MultiSelectDropdownLegacy } from './MultiSelectDropdownLegacy';

type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectDropdownProps = {
  id: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  placeholder: string;
  onChange: (selectedValues: string[]) => void;
  hasError?: boolean;
  className?: string;
};

const getMultiSelectLabel = (
  options: MultiSelectOption[],
  selectedValues: string[],
  placeholder: string,
) =>
  selectedValues.length === 0
    ? placeholder
    : options
        .filter((opt) => selectedValues.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ');

const MultiSelectDropdownShadcn = ({
  id,
  options,
  selectedValues,
  placeholder,
  onChange,
  hasError = false,
  className,
}: MultiSelectDropdownProps) => {
  const label = getMultiSelectLabel(options, selectedValues, placeholder);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        className={cn(
          'tw:flex tw:h-10 tw:w-45 tw:select-none tw:items-center tw:gap-2 tw:rounded-md tw:border tw:border-input tw:bg-transparent tw:px-3 tw:text-base tw:transition-colors tw:focus-visible:outline-none tw:focus-visible:ring-1 tw:focus-visible:ring-ring',
          hasError && 'tw:border-destructive',
          className,
        )}
      >
        <span className="tw:min-w-0 tw:flex-1 tw:truncate tw:text-left">
          {label}
        </span>
        <Icon name={Icons.CHEVRON_DOWN} className="tw:shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="tw:w-(--radix-dropdown-menu-trigger-width)"
        align="start"
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            className="tw:cursor-pointer tw:text-base"
            checked={selectedValues.includes(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...selectedValues, option.value]
                  : selectedValues.filter((value) => value !== option.value),
              )
            }
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MultiSelectDropdown = (props: MultiSelectDropdownProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <MultiSelectDropdownShadcn {...props} />
  ) : (
    <MultiSelectDropdownLegacy {...props} />
  );
};

export { getMultiSelectLabel, MultiSelectDropdown };
export type { MultiSelectDropdownProps, MultiSelectOption };
