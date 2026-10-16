import {
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
} from 'date-fns';
import de from 'date-fns/locale/de';
import fr from 'date-fns/locale/fr';
import nl from 'date-fns/locale/nl';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiHoliday } from '@/hooks/api/holidays';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import type { Values } from '../types/Values';
import {
  computeHolidayPresets,
  filterHolidaysForPreset,
  type HolidayType,
  parseHoliday,
} from '../utils/holidayPresets';
import { Button, ButtonVariants } from './Button';
import { DatePeriodPickerLegacy } from './DatePeriodPickerLegacy';
import { DatePicker } from './DatePicker';
import { Label, LabelVariants } from './Label';
import { cn } from './shadcn/utils';
import { SwitchVariants } from './Switch';
import { SwitchWithLabel } from './SwitchWithLabel';
import { Text, TextVariants } from './Text';

const locales = { nl, fr, de };

type QuickLinkPeriod = {
  startDate: Date;
  endDate: Date;
  name: string;
  holidayType: HolidayType;
};

type Props = {
  id: string;
  className?: string;
  dateStart: Date;
  dateEnd: Date;
  minDate?: Date;
  maxDate?: Date;
  onDateStartChange: (date: Date) => void;
  onDateEndChange: (date: Date) => void;
  disabled?: boolean;
  showHolidaysToggle?: boolean;
  showQuickLinks?: boolean;
  apiHolidays?: ApiHoliday[];
  fetchHolidays?: (startDate: string, endDate: string) => Promise<ApiHoliday[]>;
  onQuickLinkClick?: (periods: QuickLinkPeriod[]) => void;
  onShowHolidaysChange?: (shown: boolean, year: number) => void;
  labelVariant?: Values<typeof LabelVariants>;
};

const DatePeriodPickerShadcn = ({
  id,
  dateStart,
  dateEnd,
  minDate,
  maxDate,
  onDateStartChange,
  onDateEndChange,
  disabled,
  showHolidaysToggle,
  showQuickLinks,
  apiHolidays,
  fetchHolidays,
  onQuickLinkClick,
  onShowHolidaysChange,
  className,
  labelVariant = LabelVariants.BOLD,
}: Props) => {
  const { t, i18n } = useTranslation();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(dateStart);

  const showHolidayFeatures = showHolidaysToggle || showQuickLinks;

  const handleToggleHolidays = (shown: boolean) => {
    setIsHighlighted(shown);
    onShowHolidaysChange?.(shown, viewedMonth.getFullYear());
  };

  const handleCalendarViewChange = (month: Date) => {
    setViewedMonth(month);
    if (isHighlighted) onShowHolidaysChange?.(true, month.getFullYear());
  };

  const idPrefix = `${id}date-period-picker`;
  const locale = locales[i18n.language] ?? nl;

  const holidayPeriods = useMemo(
    () =>
      (apiHolidays ?? []).map((holiday) =>
        parseHoliday(holiday, i18n.language, t),
      ),
    [apiHolidays, i18n.language, t],
  );

  const highlightDates = useMemo(
    () =>
      holidayPeriods.flatMap(({ startDate, endDate }) =>
        eachDayOfInterval({ start: startDate, end: endDate }),
      ),
    [holidayPeriods],
  );

  const formattedHolidaysForViewedMonth = useMemo(() => {
    const year = viewedMonth.getFullYear();
    const firstDay = new Date(year, viewedMonth.getMonth(), 1);
    const lastDay = new Date(year, viewedMonth.getMonth() + 1, 0);
    return holidayPeriods
      .filter(
        ({ startDate, endDate }) => startDate <= lastDay && endDate >= firstDay,
      )
      .map(({ startDate, endDate, name }) => {
        if (isSameDay(startDate, endDate)) {
          return `${format(startDate, 'd MMMM', { locale })}: ${name}`;
        }
        if (isSameMonth(startDate, endDate)) {
          return `${startDate.getDate()}-${endDate.getDate()} ${format(startDate, 'MMMM', { locale })}: ${name}`;
        }
        return `${format(startDate, 'd MMMM', { locale })} - ${format(endDate, 'd MMMM', { locale })}: ${name}`;
      });
  }, [holidayPeriods, viewedMonth, locale]);

  const holidayPresets = useMemo(
    () => (showQuickLinks ? computeHolidayPresets(viewedMonth, t) : []),
    [showQuickLinks, viewedMonth, t],
  );

  const calendarQuickLinks = showQuickLinks
    ? (onClose: () => void) => (
        <div className="tw:flex tw:h-full tw:flex-col tw:text-base">
          <div className="tw:border-b tw:border-border tw:bg-muted tw:px-4 tw:py-3 tw:text-center tw:font-bold tw:leading-6">
            <Text>{t('date_period_picker.quick_links.title')}</Text>
          </div>
          <div className="tw:flex tw:flex-col tw:gap-2 tw:px-4 tw:py-3">
            {holidayPresets.map((preset) => (
              <Button
                key={preset.label}
                variant={ButtonVariants.NEUTRAL}
                onClick={async () => {
                  onClose();
                  const holidays =
                    (await fetchHolidays?.(
                      preset.fetchStartDate,
                      preset.fetchEndDate,
                    )) ?? [];
                  const periods = filterHolidaysForPreset(
                    holidays,
                    preset,
                    i18n.language,
                    t,
                  );
                  onQuickLinkClick?.(periods);
                }}
                disabled={disabled}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )
    : undefined;

  const calendarContent = showHolidayFeatures ? (
    <div className="tw:flex tw:flex-col tw:gap-3">
      <SwitchWithLabel
        id={`${idPrefix}-show-holidays`}
        label={
          <Text
            className={cn(isHighlighted ? 'tw:font-bold' : 'tw:font-normal')}
          >
            {t('date_period_picker.show_holidays')}
          </Text>
        }
        checked={isHighlighted}
        onCheckedChange={handleToggleHolidays}
        disabled={disabled}
        variant={SwitchVariants.SUCCESS}
      />
      {isHighlighted && formattedHolidaysForViewedMonth.length > 0 && (
        <div className="tw:flex tw:flex-col tw:gap-1">
          {formattedHolidaysForViewedMonth.map((label) => (
            <Text
              key={label}
              variant={TextVariants.MUTED}
              className="tw:text-sm"
            >
              {label}
            </Text>
          ))}
        </div>
      )}
    </div>
  ) : undefined;

  return (
    <div className={cn('tw:flex tw:gap-8', className)}>
      <div className="tw:flex tw:flex-col tw:gap-1">
        <Label
          variant={labelVariant}
          htmlFor={`${idPrefix}-start`}
          disabled={disabled}
        >
          {t('date_period_picker.start')}
        </Label>
        <DatePicker
          id={`${idPrefix}-start`}
          selected={dateStart}
          minDate={minDate}
          maxDate={maxDate}
          onChange={(newDateStart) => {
            if (dateEnd && dateEnd.getTime() < newDateStart.getTime()) {
              onDateEndChange(endOfDay(newDateStart));
            }
            onDateStartChange(startOfDay(newDateStart));
          }}
          onMonthChange={
            showHolidayFeatures ? handleCalendarViewChange : undefined
          }
          onYearChange={
            showHolidayFeatures ? handleCalendarViewChange : undefined
          }
          onCalendarClose={
            showQuickLinks ? () => setViewedMonth(dateStart) : undefined
          }
          calendarWidth={showHolidayFeatures ? '20rem' : undefined}
          calendarHeader={
            showHolidayFeatures ? (
              <Text>{t('date_period_picker.select_start_date')}</Text>
            ) : undefined
          }
          disabled={disabled}
          highlightDates={
            showHolidayFeatures && isHighlighted ? highlightDates : undefined
          }
          calendarContent={calendarContent}
          calendarQuickLinks={calendarQuickLinks}
        />
      </div>
      <div className="tw:flex tw:flex-col tw:gap-1">
        <Label
          variant={labelVariant}
          htmlFor={`${idPrefix}-end`}
          disabled={disabled}
        >
          {t('date_period_picker.end')}
        </Label>
        <DatePicker
          id={`${idPrefix}-end`}
          selected={dateEnd}
          onChange={(newDateEnd) => {
            if (dateStart && dateStart.getTime() > newDateEnd.getTime()) {
              onDateStartChange(newDateEnd);
            }
            onDateEndChange(endOfDay(newDateEnd));
          }}
          onMonthChange={
            showHolidayFeatures ? handleCalendarViewChange : undefined
          }
          onYearChange={
            showHolidayFeatures ? handleCalendarViewChange : undefined
          }
          onCalendarClose={
            showQuickLinks ? () => setViewedMonth(dateEnd) : undefined
          }
          calendarWidth={showHolidayFeatures ? '20rem' : undefined}
          calendarHeader={
            showHolidayFeatures ? (
              <Text>{t('date_period_picker.select_end_date')}</Text>
            ) : undefined
          }
          minDate={
            dateStart && minDate && minDate.getTime() > dateStart.getTime()
              ? minDate
              : (dateStart ?? minDate)
          }
          maxDate={maxDate}
          disabled={disabled}
          highlightDates={
            showHolidayFeatures && isHighlighted ? highlightDates : undefined
          }
          calendarContent={calendarContent}
        />
      </div>
    </div>
  );
};

const DatePeriodPicker = ({
  id,
  dateStart,
  dateEnd,
  minDate,
  maxDate,
  onDateStartChange,
  onDateEndChange,
  disabled,
  showHolidaysToggle,
  showQuickLinks,
  apiHolidays,
  fetchHolidays,
  onQuickLinkClick,
  onShowHolidaysChange,
  labelVariant,
  className,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <DatePeriodPickerShadcn
        id={id}
        dateStart={dateStart}
        dateEnd={dateEnd}
        minDate={minDate}
        maxDate={maxDate}
        onDateStartChange={onDateStartChange}
        onDateEndChange={onDateEndChange}
        disabled={disabled}
        showHolidaysToggle={showHolidaysToggle}
        showQuickLinks={showQuickLinks}
        apiHolidays={apiHolidays}
        fetchHolidays={fetchHolidays}
        onQuickLinkClick={onQuickLinkClick}
        onShowHolidaysChange={onShowHolidaysChange}
        labelVariant={labelVariant}
        className={className}
      />
    );
  }

  return (
    <DatePeriodPickerLegacy
      id={id}
      dateStart={dateStart}
      dateEnd={dateEnd}
      minDate={minDate}
      maxDate={maxDate}
      onDateStartChange={onDateStartChange}
      onDateEndChange={onDateEndChange}
      disabled={disabled}
      showHolidaysToggle={showHolidaysToggle}
      showQuickLinks={showQuickLinks}
      apiHolidays={apiHolidays}
      fetchHolidays={fetchHolidays}
      onQuickLinkClick={onQuickLinkClick}
      onShowHolidaysChange={onShowHolidaysChange}
      labelVariant={labelVariant}
      className={className}
    />
  );
};

export { DatePeriodPicker };
export type { QuickLinkPeriod };
