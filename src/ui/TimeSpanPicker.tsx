import type { FocusEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Label, LabelVariants } from './Label';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from './shadcn/command';
import { Popover, PopoverAnchor, PopoverContent } from './shadcn/popover';
import { cn } from './shadcn/utils';
import { TimeSpanPickerLegacy } from './TimeSpanPickerLegacy';

const TimeSpanPickerLabelPositions = {
  TOP: 'top',
  INLINE: 'inline',
} as const;

type TimeSpanPickerLabelPosition =
  (typeof TimeSpanPickerLabelPositions)[keyof typeof TimeSpanPickerLabelPositions];

type TimeSpanPickerProps = {
  id: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  startTime?: string;
  endTime?: string;
  onChangeStartTime: (newStartTime: string) => void;
  onChangeEndTime: (newEndTime: string) => void;
  disabled?: boolean;
  startDisabled?: boolean;
  endDisabled?: boolean;
  labelPosition?: TimeSpanPickerLabelPosition;
  className?: string;
};

const getQuickPickTimes = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of ['00', '15', '30', '45']) {
      times.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    }
  }
  times.push('23:59');
  return times;
};

const quickPickTimes = getQuickPickTimes();

type TimeFieldProps = {
  id: string;
  name: string;
  label: string;
  value?: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  isInline?: boolean;
};

const TimeFieldShadcn = ({
  id,
  name,
  label,
  value,
  onChange,
  disabled,
  isInline,
}: TimeFieldProps) => {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  const handleSelect = (time: string) => {
    setInputValue(time);
    onChange(time);
    setIsOpen(false);
  };

  const input = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Command
        shouldFilter={false}
        className="tw:h-auto tw:w-auto tw:overflow-visible tw:rounded-none tw:bg-transparent"
      >
        <PopoverAnchor asChild>
          <div ref={anchorRef}>
            <input
              id={id}
              name={name}
              data-testid={name}
              type="time"
              required
              disabled={disabled}
              value={inputValue}
              onFocus={() => setIsOpen(true)}
              onChange={(event) => setInputValue(event.target.value)}
              onBlur={(event: FocusEvent<HTMLInputElement>) =>
                onChange(event.target.value)
              }
              className={cn(
                'tw:h-10 tw:w-auto tw:min-w-24 tw:rounded-md tw:border tw:border-border tw:bg-background tw:px-3 tw:text-center tw:text-base tw:outline-none tw:focus:ring-2 tw:focus:ring-ring tw:disabled:cursor-not-allowed tw:disabled:opacity-50 tw:[&::-webkit-calendar-picker-indicator]:hidden',
                isInline && 'tw:w-auto tw:min-w-28 tw:pl-9 tw:text-right',
              )}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="center"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (
              event.target instanceof Node &&
              anchorRef.current?.contains(event.target)
            ) {
              event.preventDefault();
            }
          }}
          className="tw:w-(--radix-popper-anchor-width) tw:min-w-0 tw:p-0"
        >
          <CommandList className="tw:max-h-60">
            <CommandGroup className="tw:p-0">
              {quickPickTimes.map((time) => (
                <CommandItem
                  key={time}
                  value={time}
                  onSelect={() => handleSelect(time)}
                  className="tw:cursor-pointer tw:justify-center tw:px-0 tw:py-1 tw:text-center tw:text-base"
                >
                  {time}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );

  if (isInline) {
    return (
      <div className="tw:relative tw:inline-block">
        <label
          htmlFor={id}
          className="tw:pointer-events-none tw:absolute tw:left-3 tw:top-1/2 tw:z-10 tw:-translate-y-1/2 tw:text-sm tw:font-normal tw:text-muted-foreground"
        >
          {label}
        </label>
        {input}
      </div>
    );
  }

  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <Label variant={LabelVariants.BOLD} htmlFor={id}>
        {label}
      </Label>
      {input}
    </div>
  );
};

const TimeSpanPickerShadcn = ({
  id,
  startTime,
  endTime,
  startTimeLabel,
  endTimeLabel,
  onChangeStartTime,
  onChangeEndTime,
  disabled,
  startDisabled,
  endDisabled,
  labelPosition = TimeSpanPickerLabelPositions.TOP,
  className,
}: TimeSpanPickerProps) => {
  const { t } = useTranslation();
  const idPrefix = `${id}-time-span-picker`;
  const isInline = labelPosition === TimeSpanPickerLabelPositions.INLINE;

  const fields = [
    {
      key: 'start',
      name: 'startTime',
      label: startTimeLabel ?? t('time_span_picker.start'),
      value: startTime,
      onChange: onChangeStartTime,
      disabled: startDisabled ?? disabled,
    },
    {
      key: 'end',
      name: 'endTime',
      label: endTimeLabel ?? t('time_span_picker.end'),
      value: endTime,
      onChange: onChangeEndTime,
      disabled: endDisabled ?? disabled,
    },
  ];

  return (
    <div
      className={cn('tw:flex tw:flex-wrap tw:items-end tw:gap-3', className)}
    >
      {fields.map(
        ({ key, name, label, value, onChange, disabled: fieldDisabled }) => (
          <TimeFieldShadcn
            key={key}
            id={`${idPrefix}-${key}`}
            name={name}
            label={label}
            value={value}
            onChange={onChange}
            disabled={fieldDisabled}
            isInline={isInline}
          />
        ),
      )}
    </div>
  );
};

const TimeSpanPicker = (props: TimeSpanPickerProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <TimeSpanPickerShadcn {...props} />;
  }

  return <TimeSpanPickerLegacy {...props} />;
};

export type { TimeSpanPickerProps };
export { TimeSpanPicker, TimeSpanPickerLabelPositions };
