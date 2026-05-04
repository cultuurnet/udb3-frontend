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

import { Button, ButtonVariants } from './Button';
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

const getHolidayLabel = (
  holiday: ApiHoliday,
  language: string,
  t: (key: string) => string,
): string => {
  const name =
    holiday.name.find((n) => n.language === language.toUpperCase())?.text ?? '';
  const regionLabel = holiday.region
    ? t(`date_period_picker.region.${holiday.region}`)
    : undefined;
  return regionLabel ? `${name} (${regionLabel})` : name;
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
  onShowHolidaysChange?: (shown: boolean, year: number) => void;
  onCalendarOpen?: () => void;
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
  onShowHolidaysChange,
  onCalendarOpen,
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
    onShowHolidaysChange?.(isHighlighted, month.getFullYear());
  };

  const idPrefix = `${id}date-period-picker`;
  const locale = locales[i18n.language] ?? nl;
  const year = viewedMonth.getFullYear();

  const holidayPeriods: HolidayPeriod[] = (apiHolidays ?? []).map(
    (holiday) => ({
      startDate: parse(holiday.startDate, 'yyyy-MM-dd', new Date()),
      endDate: parse(holiday.endDate, 'yyyy-MM-dd', new Date()),
      name: getHolidayLabel(holiday, i18n.language, t),
    }),
  );

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

  const schoolHolidays = (apiHolidays ?? [])
    .filter((holiday) => holiday.type === 'schoolHolidays')
    .map((holiday) => ({
      label: getHolidayLabel(holiday, i18n.language, t),
      startDate: parse(holiday.startDate, 'yyyy-MM-dd', new Date()),
      endDate: parse(holiday.endDate, 'yyyy-MM-dd', new Date()),
    }));

  const allSchoolHolidays = schoolHolidays.filter(
    ({ label }, index) =>
      label !== '' &&
      schoolHolidays.findIndex((holiday) => holiday.label === label) === index,
  );

  const upcomingSchoolHolidays = allSchoolHolidays.filter(
    (link) => link.endDate >= firstDayOfViewedMonth,
  );

  const firstUpcoming = upcomingSchoolHolidays[0];
  const targetMonthStart = firstUpcoming
    ? new Date(
        firstUpcoming.startDate.getFullYear(),
        firstUpcoming.startDate.getMonth(),
        1,
      )
    : firstDayOfViewedMonth;
  const targetMonthEnd = new Date(
    targetMonthStart.getFullYear(),
    targetMonthStart.getMonth() + 1,
    0,
  );

  const quickLinks = upcomingSchoolHolidays.filter(
    (link) =>
      link.startDate <= targetMonthEnd && link.endDate >= targetMonthStart,
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
              padding: 1.33rem !important;
            `}
          >
            <Text>{t('date_period_picker.quick_links.title')}</Text>
          </Stack>
          <Stack spacing={2} paddingY={3} paddingX={4}>
            {quickLinks.map(({ label, startDate, endDate }) => (
              <Button
                key={label}
                variant={ButtonVariants.SECONDARY}
                onClick={() => {
                  onDateStartChange(startOfDay(startDate));
                  onDateEndChange(endOfDay(endDate));
                  onClose();
                }}
                disabled={disabled}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Stack>
      )
    : undefined;

  const calendarContent = showHolidayFeatures ? (
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
          onCalendarOpen={showQuickLinks ? onCalendarOpen : undefined}
          onMonthChange={
            showHolidayFeatures ? handleCalendarViewChange : undefined
          }
          onYearChange={
            showHolidayFeatures ? handleCalendarViewChange : undefined
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
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-end`}>
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

export { DatePeriodPicker };
