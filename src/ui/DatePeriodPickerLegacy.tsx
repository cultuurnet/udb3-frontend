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

import type { Values } from '../types/Values';
import {
  computeHolidayPresets,
  filterHolidaysForPreset,
  type HolidayType,
  parseHoliday,
} from '../utils/holidayPresets';
import { Button, ButtonVariants } from './Button';
import { DatePicker } from './DatePicker';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Label, LabelVariants } from './Label';
import { Stack } from './Stack';
import { SwitchVariants } from './Switch';
import { SwitchWithLabel } from './SwitchWithLabel';
import { Text, TextVariants } from './Text';
import { colors } from './theme';

const locales = { nl, fr, de };

type QuickLinkPeriod = {
  startDate: Date;
  endDate: Date;
  name: string;
  holidayType: HolidayType;
};

type Props = InlineProps & {
  id: string;
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

const DatePeriodPickerLegacy = ({
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
  labelVariant = LabelVariants.BOLD,
  className,
  ...props
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
        <Stack
          css={`
            border-left: 1px solid ${colors.grey3};
            height: 100%;
            font-size: 1rem;
          `}
        >
          <Stack
            className="custom-calendar-header"
            css={`
              padding: 1.35rem !important;
            `}
          >
            <Text>{t('date_period_picker.quick_links.title')}</Text>
          </Stack>
          <Stack
            spacing={2}
            paddingY={3}
            paddingX={4}
            css={`
              gap: 0.2667rem;
            `}
          >
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
          </Stack>
        </Stack>
      )
    : undefined;

  const calendarContent = showHolidayFeatures ? (
    <Stack spacing={3}>
      <SwitchWithLabel
        id={`${idPrefix}-show-holidays`}
        label={
          <Text className={isHighlighted ? 'tw:font-bold' : 'tw:font-normal'}>
            {t('date_period_picker.show_holidays')}
          </Text>
        }
        checked={isHighlighted}
        onCheckedChange={handleToggleHolidays}
        disabled={disabled}
        variant={SwitchVariants.SUCCESS}
      />
      {isHighlighted && formattedHolidaysForViewedMonth.length > 0 && (
        <Stack spacing={2}>
          {formattedHolidaysForViewedMonth.map((label) => (
            <Text
              key={label}
              variant={TextVariants.MUTED}
              className="tw:text-sm"
            >
              {label}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  ) : undefined;

  return (
    <Inline
      as="div"
      spacing={5}
      className={className}
      {...getInlineProps(props)}
    >
      <Stack spacing={2} as="div">
        <Label variant={labelVariant} htmlFor={`${idPrefix}-start`}>
          {t('date_period_picker.start')}
        </Label>
        <DatePicker
          withHolidays={showHolidayFeatures}
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
      </Stack>
      <Stack spacing={2} as="div">
        <Label variant={labelVariant} htmlFor={`${idPrefix}-end`}>
          {t('date_period_picker.end')}
        </Label>
        <DatePicker
          withHolidays={showHolidayFeatures}
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
      </Stack>
    </Inline>
  );
};

export { DatePeriodPickerLegacy };
export type { Props as DatePeriodPickerLegacyProps, QuickLinkPeriod };
