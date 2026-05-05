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

import { DatePicker } from './DatePicker';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Label, LabelVariants } from './Label';
import { RadioButtonTypes } from './RadioButton';
import { RadioButtonWithLabel } from './RadioButtonWithLabel';
import { Stack } from './Stack';
import { Text, TextVariants } from './Text';
import { colors } from './theme';

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
  showHolidaysToggle?: boolean;
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
  showHolidaysToggle,
  apiHolidays,
  onShowHolidaysChange,
  ...props
}: Props) => {
  const { t, i18n } = useTranslation();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(dateStart);

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

  const calendarContent = showHolidaysToggle ? (
    <Stack spacing={3}>
      <RadioButtonWithLabel
        id={`${idPrefix}-show-holidays`}
        type={RadioButtonTypes.SWITCH}
        label={
          <Text fontWeight={isHighlighted ? 'bold' : 'normal'}>
            {t('date_period_picker.show_holidays')}
          </Text>
        }
        checked={isHighlighted}
        onChange={(e) => handleToggleHolidays(e.target.checked)}
        disabled={disabled}
        color={colors.udbMainPositiveGreen}
      />
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
          withHolidays={showHolidaysToggle}
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
            showHolidaysToggle ? handleCalendarViewChange : undefined
          }
          onYearChange={
            showHolidaysToggle ? handleCalendarViewChange : undefined
          }
          calendarWidth={showHolidaysToggle ? '20rem' : undefined}
          calendarHeader={
            showHolidaysToggle ? (
              <Text>{t('date_period_picker.select_start_date')}</Text>
            ) : undefined
          }
          disabled={disabled}
          highlightDates={
            showHolidaysToggle && isHighlighted ? highlightDates : undefined
          }
          calendarContent={calendarContent}
        />
      </Stack>
      <Stack spacing={2} as="div">
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-end`}>
          {t('date_period_picker.end')}
        </Label>
        <DatePicker
          withHolidays={showHolidaysToggle}
          id={`${idPrefix}-end`}
          selected={dateEnd}
          onChange={(newDateEnd) => {
            if (dateStart && dateStart.getTime() > newDateEnd.getTime()) {
              onDateStartChange(newDateEnd);
            }
            onDateEndChange(endOfDay(newDateEnd));
          }}
          onMonthChange={
            showHolidaysToggle ? handleCalendarViewChange : undefined
          }
          onYearChange={
            showHolidaysToggle ? handleCalendarViewChange : undefined
          }
          calendarWidth={showHolidaysToggle ? '20rem' : undefined}
          calendarHeader={
            showHolidaysToggle ? (
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
            showHolidaysToggle && isHighlighted ? highlightDates : undefined
          }
          calendarContent={calendarContent}
        />
      </Stack>
    </Inline>
  );
};

export { DatePeriodPicker };
