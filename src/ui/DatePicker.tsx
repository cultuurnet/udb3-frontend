import {
  addYears,
  endOfDay,
  format,
  isValid,
  parse,
  startOfDay,
  subYears,
} from 'date-fns';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  de as dayPickerDe,
  fr as dayPickerFr,
  nl as dayPickerNl,
} from 'react-day-picker/locale';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Button, ButtonVariants } from './Button';
import { DatePickerLegacy } from './DatePickerLegacy';
import { Icons } from './Icon';
import { Input } from './Input';
import { badgeVariants } from './shadcn/badge';
import { Calendar } from './shadcn/calendar';
import { Popover, PopoverAnchor, PopoverContent } from './shadcn/popover';
import { cn } from './shadcn/utils';

const dayPickerLocales = { nl: dayPickerNl, fr: dayPickerFr, de: dayPickerDe };

type Props = {
  id: string;
  selected?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (value: Date) => void;
  onCalendarClose?: () => void;
  onMonthChange?: (date: Date) => void;
  onYearChange?: (date: Date) => void;
  highlightDates?: Date[];
  calendarHeader?: ReactNode;
  calendarContent?: ReactNode;
  calendarQuickLinks?: (onClose: () => void) => ReactNode;
  calendarWidth?: string;
  // todo: only affects DatePickerLegacy's react-datepicker styling — DatePickerShadcn
  // doesn't read it. Delete this prop (and its callers) once Legacy is dropped.
  withHolidays?: boolean;
  className?: string;
  maxWidth?: string;
  disabled?: boolean;
};

const DatePickerShadcn = ({
  id,
  selected,
  onChange,
  onCalendarClose,
  onMonthChange,
  onYearChange,
  className,
  minDate,
  maxDate,
  disabled,
  highlightDates,
  calendarHeader,
  calendarContent,
  calendarQuickLinks,
  calendarWidth,
  maxWidth,
}: Props) => {
  const { t, i18n } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const anchorRef = useRef<HTMLDivElement>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const lastSelectedTime = useRef(selected?.getTime());
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFocusCalendar, setShouldFocusCalendar] = useState(false);
  const [month, setMonth] = useState(selected ?? today);
  const [textValue, setTextValue] = useState(
    selected ? format(selected, 'dd/MM/yyyy') : '',
  );

  useEffect(() => {
    if (selected?.getTime() === lastSelectedTime.current) return;
    lastSelectedTime.current = selected?.getTime();
    setTextValue(selected ? format(selected, 'dd/MM/yyyy') : '');
    setMonth(selected ?? new Date());
  }, [selected]);

  const handleOpenChange = (open: boolean) => {
    if (disabled) return;
    setIsOpen(open);
    if (!open) onCalendarClose?.();
  };

  const focusCalendarDay = () => {
    calendarContainerRef.current
      ?.querySelector<HTMLButtonElement>('[data-day][tabindex="0"]')
      ?.focus();
  };

  useEffect(() => {
    if (!isOpen || !shouldFocusCalendar) return;
    focusCalendarDay();
    setShouldFocusCalendar(false);
  }, [isOpen, shouldFocusCalendar]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (isOpen) {
      focusCalendarDay();
      return;
    }
    setIsOpen(true);
    setShouldFocusCalendar(true);
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange?.(date);
    setIsOpen(false);
    onCalendarClose?.();
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return;
    const parsed = parse(value, 'd/M/yyyy', startOfDay(today));
    if (!isValid(parsed)) return;
    if (minDate && parsed < startOfDay(minDate)) return;
    if (maxDate && parsed > endOfDay(maxDate)) return;
    onChange?.(parsed);
  };

  const handleTextBlur = () => {
    setTextValue(selected ? format(selected, 'dd/MM/yyyy') : '');
  };

  const handleMonthChange = (newMonth: Date) => {
    const yearChanged = newMonth.getFullYear() !== month.getFullYear();
    setMonth(newMonth);
    onMonthChange?.(newMonth);
    if (yearChanged) onYearChange?.(newMonth);
  };

  const handleTodayClick = () => {
    handleMonthChange(new Date());
  };

  const handleGoToSelectedClick = () => {
    if (selected) handleMonthChange(selected);
  };

  const disabledMatchers = [
    minDate ? { before: minDate } : undefined,
    maxDate ? { after: maxDate } : undefined,
  ].filter((matcher): matcher is { before: Date } | { after: Date } =>
    Boolean(matcher),
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            'tw:flex tw:rounded-md tw:outline-none tw:focus-within:ring-1 tw:focus-within:ring-ring',
            className,
          )}
          style={maxWidth ? { maxWidth } : undefined}
        >
          <Input
            id={id}
            value={textValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleTextChange(event.target.value)
            }
            onFocus={() => !disabled && setIsOpen(true)}
            onBlur={handleTextBlur}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            className="tw:min-w-0 tw:max-w-37.5! tw:flex-1 tw:rounded-r-none! tw:outline-none! tw:focus:shadow-none! tw:focus-visible:ring-0!"
          />
          <Button
            variant={ButtonVariants.NEUTRAL}
            iconName={Icons.CALENDAR_ALT}
            onClick={() => !disabled && handleOpenChange(!isOpen)}
            disabled={disabled}
            aria-label={t('date_picker.open_calendar')}
            className="tw:rounded-l-none tw:border tw:border-l-0 tw:border-input tw:shadow-none tw:focus-visible:ring-0"
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
        className="tw:min-w-(--radix-popper-anchor-width) tw:max-w-[95vw] tw:w-auto tw:overflow-hidden tw:p-0"
      >
        <div className="tw:flex">
          <div
            ref={calendarContainerRef}
            style={calendarWidth ? { minWidth: calendarWidth } : undefined}
          >
            {calendarHeader && (
              <div className="tw:border-b tw:border-border tw:bg-muted tw:px-4 tw:py-3 tw:text-center tw:font-bold tw:leading-6">
                {calendarHeader}
              </div>
            )}
            <div className="tw:flex tw:justify-center tw:gap-2 tw:px-3 tw:pt-2">
              {selected && (
                <Button
                  variant={ButtonVariants.UNSTYLED}
                  onClick={handleGoToSelectedClick}
                  disabled={disabled}
                  className={cn(badgeVariants({ variant: 'default' }))}
                >
                  {t('date_picker.go_to_selected')}
                </Button>
              )}
              <Button
                variant={ButtonVariants.UNSTYLED}
                onClick={handleTodayClick}
                disabled={disabled}
                className={cn(badgeVariants({ variant: 'secondary' }))}
              >
                {t('date_picker.today')}
              </Button>
            </div>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              month={month}
              onMonthChange={handleMonthChange}
              captionLayout="dropdown"
              startMonth={minDate ?? subYears(today, 100)}
              endMonth={maxDate ?? addYears(today, 10)}
              disabled={disabledMatchers}
              modifiers={
                highlightDates?.length ? { highlighted: highlightDates } : {}
              }
              modifiersClassNames={{
                highlighted:
                  'tw:bg-accent tw:text-accent-foreground tw:rounded-md',
              }}
              locale={dayPickerLocales[i18n.language] ?? dayPickerLocales.nl}
              className="tw:mx-auto"
            />
            {calendarContent && (
              <div className="tw:px-3 tw:pb-3">{calendarContent}</div>
            )}
          </div>
          {calendarQuickLinks && (
            <div className="tw:border-l tw:border-border">
              {calendarQuickLinks(() => handleOpenChange(false))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const DatePicker = ({
  id,
  selected,
  onChange,
  onCalendarClose,
  onMonthChange,
  onYearChange,
  className,
  minDate,
  maxDate,
  disabled,
  highlightDates,
  calendarHeader,
  calendarContent,
  calendarQuickLinks,
  calendarWidth,
  withHolidays,
  maxWidth,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <DatePickerShadcn
        id={id}
        selected={selected}
        onChange={onChange}
        onCalendarClose={onCalendarClose}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        className={className}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        highlightDates={highlightDates}
        calendarHeader={calendarHeader}
        calendarContent={calendarContent}
        calendarQuickLinks={calendarQuickLinks}
        calendarWidth={calendarWidth}
        maxWidth={maxWidth}
      />
    );
  }

  return (
    <DatePickerLegacy
      id={id}
      selected={selected}
      onChange={onChange}
      onCalendarClose={onCalendarClose}
      onMonthChange={onMonthChange}
      onYearChange={onYearChange}
      className={className}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      highlightDates={highlightDates}
      calendarHeader={calendarHeader}
      calendarContent={calendarContent}
      calendarQuickLinks={calendarQuickLinks}
      calendarWidth={calendarWidth}
      withHolidays={withHolidays}
      maxWidth={maxWidth}
    />
  );
};

export { DatePicker };
export type { Props as DatePickerProps };
