import type { FocusEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { css } from 'styled-components';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';

import { Box } from './Box';
import { Label, LabelVariants } from './Label';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from './shadcn/command';
import { Popover, PopoverAnchor, PopoverContent } from './shadcn/popover';
import { cn } from './shadcn/utils';
import { Stack } from './Stack';
import { colors, getValueFromTheme } from './theme';
import { Typeahead } from './Typeahead';

const getValueForTimePicker = getValueFromTheme('timePicker');

const TimeFieldLabelPositions = {
  TOP: 'top',
  INLINE: 'inline',
} as const;

type TimeFieldLabelPosition = Values<typeof TimeFieldLabelPositions>;

type TimeFieldProps = {
  id: string;
  name?: string;
  label: string;
  value?: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  labelPosition?: TimeFieldLabelPosition;
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

const TimeFieldShadcn = ({
  id,
  name,
  label,
  value,
  onChange,
  disabled,
  labelPosition = TimeFieldLabelPositions.TOP,
}: TimeFieldProps) => {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const isInline = labelPosition === TimeFieldLabelPositions.INLINE;

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
                'tw:h-10 tw:w-auto tw:min-w-24 tw:rounded-md tw:border tw:border-border tw:bg-background tw:px-3 tw:text-center tw:text-base tw:outline-none tw:focus:ring-2 tw:focus:ring-ring tw:disabled:cursor-not-allowed tw:disabled:text-muted-foreground tw:[&::-webkit-calendar-picker-indicator]:hidden',
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
      <Label variant={LabelVariants.BOLD} htmlFor={id} disabled={disabled}>
        {label}
      </Label>
      {input}
    </div>
  );
};

const getHourOptions = () => {
  const hours = Array(24).fill(0);
  const minutes = Array(60).fill(0);
  const times = [];
  hours.forEach((_hour, i) => {
    minutes.forEach((_minute, minuteIndex) =>
      times.push(
        `${i > 9 ? i : `0${i}`}:${
          minuteIndex > 9 ? minuteIndex : `0${minuteIndex}`
        }`,
      ),
    );
  });

  return times;
};

const hourOptions = getHourOptions();

const quarterHours = ['00', '15', '30', '45'];

const isQuarterHour = (time: string) =>
  quarterHours.some((quarterHour) => time.endsWith(quarterHour));

const timeSlots = (time: string) => time === '23:59' || isQuarterHour(time);

const dropDownCss = css`
  flex: 0 0 auto;

  input {
    width: auto;
    min-width: 6rem;
    text-align: center;
  }

  .rbt-menu.dropdown-menu.show {
    min-width: 0;
    max-height: 300px !important;

    z-index: ${getValueForTimePicker('zIndexPopup')};

    .dropdown-item {
      padding: 0.25rem 0;
      text-align: center;
    }
  }

  .rbt-input-hint {
    display: none;
  }
`;

const inlineLabelDropDownCss = css`
  ${dropDownCss}

  input.form-control {
    min-width: 7rem;
    padding-left: 2.5rem;
    text-align: right;
  }
`;

const TimeFieldLegacy = ({
  id,
  name,
  label,
  value,
  onChange,
  disabled,
  labelPosition = TimeFieldLabelPositions.TOP,
}: TimeFieldProps) => {
  const isInline = labelPosition === TimeFieldLabelPositions.INLINE;

  const typeahead = (
    <Typeahead<string>
      key={`${id}-${disabled}`}
      inputType="time"
      inputRequired={true}
      name={name}
      id={id}
      filterBy={timeSlots}
      defaultInputValue={value}
      options={hourOptions}
      minLength={0}
      onBlur={(event: FocusEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
      onChange={([newValue]: string[]) => {
        if (!newValue) return;
        onChange(newValue);
      }}
      positionFixed
      disabled={disabled}
      css={isInline ? inlineLabelDropDownCss : dropDownCss}
    />
  );

  if (isInline) {
    return (
      <Box position="relative" display="inline-block">
        <Label
          htmlFor={id}
          css={`
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            z-index: 1;
            font-size: 0.85rem;
            color: ${colors.grey5};
            font-weight: normal;
            margin: 0;
          `}
        >
          {label}
        </Label>
        {typeahead}
      </Box>
    );
  }

  return (
    <Stack as="div" className="tw:gap-1">
      <Label variant={LabelVariants.BOLD} htmlFor={id}>
        {label}
      </Label>
      {typeahead}
    </Stack>
  );
};

const TimeField = (props: TimeFieldProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <TimeFieldShadcn {...props} />;
  }

  return <TimeFieldLegacy {...props} />;
};

export type { TimeFieldLabelPosition, TimeFieldProps };
export { TimeField, TimeFieldLabelPositions, TimeFieldLegacy, TimeFieldShadcn };
