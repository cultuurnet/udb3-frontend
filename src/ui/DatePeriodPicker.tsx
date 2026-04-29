import {
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  isSameMonth,
  parse,
  startOfDay,
} from 'date-fns';
import de from 'date-fns/locale/de';
import fr from 'date-fns/locale/fr';
import nl from 'date-fns/locale/nl';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiHoliday } from '@/hooks/api/holidays';
import type { Values } from '@/types/Values';

import { Box } from './Box';
import { DatePicker } from './DatePicker';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Label, LabelVariants } from './Label';
import { Stack } from './Stack';
import { SwitchButton } from './SwitchButton';
import { Text, TextVariants } from './Text';

const DatePeriodPickerVariants = {
  DEFAULT: 'default',
  HOLIDAYS: 'holidays',
} as const;

type DatePeriodPickerVariant = Values<typeof DatePeriodPickerVariants>;

type HolidayPeriod = {
  startDate: Date;
  endDate: Date;
  name: string;
};

const locales = { nl, fr, de };

type Props = InlineProps & {
  id: string;
  dateStart: Date;
  dateEnd: Date;
  minDate?: Date;
  maxDate?: Date;
  onDateStartChange: (date: Date) => void;
  onDateEndChange: (date: Date) => void;
  disabled?: boolean;
  variant?: DatePeriodPickerVariant;
  apiHolidays?: ApiHoliday[];
  onShowHolidaysChange?: (shown: boolean, year: number) => void;
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
  variant = DatePeriodPickerVariants.DEFAULT,
  apiHolidays,
  onShowHolidaysChange,
  ...props
}: Props) => {
  const { t, i18n } = useTranslation();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(dateStart);

  const isHolidays = variant === DatePeriodPickerVariants.HOLIDAYS;

  const handleToggleHolidays = (shown: boolean) => {
    setIsHighlighted(shown);
    onShowHolidaysChange?.(shown, viewedMonth.getFullYear());
  };

  const handleCalendarViewChange = (month: Date) => {
    setViewedMonth(month);
    if (isHighlighted) {
      onShowHolidaysChange?.(true, month.getFullYear());
    }
  };

  const idPrefix = `${id}date-period-picker`;
  const locale = locales[i18n.language] ?? nl;
  const year = viewedMonth.getFullYear();

  const holidayPeriods: HolidayPeriod[] = (apiHolidays ?? []).map((holiday) => {
    const name =
      holiday.name.find((name) => name.language === i18n.language.toUpperCase())
        ?.text ?? '';
    const regionLabel = holiday.region
      ? t(`date_period_picker.region.${holiday.region}`)
      : undefined;
    return {
      startDate: parse(holiday.startDate, 'yyyy-MM-dd', new Date()),
      endDate: parse(holiday.endDate, 'yyyy-MM-dd', new Date()),
      name: regionLabel ? `${name} (${regionLabel})` : name,
    };
  });

  const highlightDates = holidayPeriods.flatMap(({ startDate, endDate }) =>
    eachDayOfInterval({ start: startDate, end: endDate }),
  );

  const firstDayOfViewedMonth = new Date(year, viewedMonth.getMonth(), 1);
  const lastDayOfViewedMonth = new Date(year, viewedMonth.getMonth() + 1, 0);

  const formattedHolidaysForViewedMonth = holidayPeriods
    .filter(
      ({ startDate, endDate }) =>
        startDate <= lastDayOfViewedMonth && endDate >= firstDayOfViewedMonth,
    )
    .map(({ startDate, endDate, name }) => {
      if (isSameDay(startDate, endDate))
        return `${format(startDate, 'd MMMM', { locale })}: ${name}`;
      if (isSameMonth(startDate, endDate))
        return `${startDate.getDate()}-${endDate.getDate()} ${format(startDate, 'MMMM', { locale })}: ${name}`;
      return `${format(startDate, 'd MMMM', { locale })} - ${format(endDate, 'd MMMM', { locale })}: ${name}`;
    });

  const calendarContent = isHolidays ? (
    <Stack spacing={3}>
      <Box>
        <SwitchButton
          label={t('date_period_picker.show_holidays')}
          checked={isHighlighted}
          onChange={handleToggleHolidays}
          disabled={disabled}
        />
      </Box>
      {isHighlighted && formattedHolidaysForViewedMonth.length > 0 && (
        <Stack spacing={1}>
          {formattedHolidaysForViewedMonth.map((label) => (
            <Text key={label} variant={TextVariants.MUTED}>
              {label}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  ) : undefined;

  return (
    <Inline as="div" spacing={5} {...getInlineProps(props)}>
      <Stack spacing={2} as="div">
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-start`}>
          {t('date_period_picker.start')}
        </Label>
        <DatePicker
          withHolidays={isHolidays}
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
          onMonthChange={isHolidays ? handleCalendarViewChange : undefined}
          onYearChange={isHolidays ? handleCalendarViewChange : undefined}
          calendarWidth={isHolidays ? '20rem' : undefined}
          calendarHeader={
            isHolidays ? (
              <Text>{t('date_period_picker.select_start_date')}</Text>
            ) : undefined
          }
          disabled={disabled}
          highlightDates={
            isHolidays && isHighlighted ? highlightDates : undefined
          }
          calendarContent={calendarContent}
        />
      </Stack>
      <Stack spacing={2} as="div">
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-end`}>
          {t('date_period_picker.end')}
        </Label>
        <DatePicker
          withHolidays={isHolidays}
          id={`${idPrefix}-end`}
          selected={dateEnd}
          onChange={(newDateEnd) => {
            if (dateStart && dateStart.getTime() > newDateEnd.getTime()) {
              onDateStartChange(newDateEnd);
            }
            onDateEndChange(endOfDay(newDateEnd));
          }}
          onMonthChange={isHolidays ? handleCalendarViewChange : undefined}
          onYearChange={isHolidays ? handleCalendarViewChange : undefined}
          calendarWidth={isHolidays ? '20rem' : undefined}
          calendarHeader={
            isHolidays ? (
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
            isHolidays && isHighlighted ? highlightDates : undefined
          }
          calendarContent={calendarContent}
        />
      </Stack>
    </Inline>
  );
};

export { DatePeriodPicker, DatePeriodPickerVariants };
export type { DatePeriodPickerVariant };
