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
import type { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiHoliday } from '@/hooks/api/holidays';

import { SupportedLanguages } from '../i18n';
import type { Values } from '../types/Values';
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

type HolidayPreset = {
  label: string;
  fetchStartDate: string;
  fetchEndDate: string;
  matchesHoliday: (holiday: {
    type: string;
    region?: string;
    startDate: Date;
  }) => boolean;
};

const locales = { nl, fr, de };

const parseHoliday = (holiday: ApiHoliday, language: string, t: TFunction) => {
  const name =
    holiday.name[language as Values<typeof SupportedLanguages>] ?? '';
  const regionLabel = holiday.region
    ? t(`date_period_picker.region.${holiday.region}`)
    : undefined;
  return {
    type: holiday.type,
    region: holiday.region,
    name: regionLabel ? `${name} (${regionLabel})` : name,
    startDate: parse(holiday.startDate, 'yyyy-MM-dd', new Date()),
    endDate: parse(holiday.endDate, 'yyyy-MM-dd', new Date()),
  };
};

const getAcademicYearStart = (date: Date): number =>
  date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;

const formatAcademicYearLabel = (start: number) =>
  `'${String(start).slice(-2)}-'${String(start + 1).slice(-2)}`;

const publicHolidayPreset = (year: number, t: TFunction): HolidayPreset => ({
  label: `${t('date_period_picker.quick_links.public_holidays')} ${year}`,
  fetchStartDate: `${year}-01-01`,
  fetchEndDate: `${year}-12-31`,
  matchesHoliday: (holiday) =>
    holiday.type !== 'schoolHolidays' &&
    holiday.startDate.getFullYear() === year,
});

const schoolHolidayPreset = (
  academicStart: number,
  region: 'NL' | 'FR',
  label: string,
): HolidayPreset => ({
  label: `${label} ${formatAcademicYearLabel(academicStart)}`,
  fetchStartDate: `${academicStart}-08-01`,
  fetchEndDate: `${academicStart + 1}-07-31`,
  matchesHoliday: (holiday) =>
    holiday.type === 'schoolHolidays' &&
    holiday.region === region &&
    getAcademicYearStart(holiday.startDate) === academicStart,
});

const filterHolidaysForPreset = (
  holidays: ApiHoliday[],
  preset: HolidayPreset,
  language: string,
  t: TFunction,
) =>
  holidays
    .map((holiday) => parseHoliday(holiday, language, t))
    .filter(
      (holiday) =>
        holiday.endDate >= new Date() && preset.matchesHoliday(holiday),
    );

const computeHolidayPresets = (today: Date, t: TFunction): HolidayPreset[] => {
  const year = today.getFullYear();
  const academicYear = getAcademicYearStart(today);
  const schoolRegions = [
    {
      region: 'NL' as const,
      label: t('date_period_picker.quick_links.flemish_school_holidays'),
    },
    {
      region: 'FR' as const,
      label: t('date_period_picker.quick_links.french_school_holidays'),
    },
  ];

  return [
    publicHolidayPreset(year, t),
    publicHolidayPreset(year + 1, t),
    ...schoolRegions.flatMap(({ region, label }) => [
      schoolHolidayPreset(academicYear, region, label),
      schoolHolidayPreset(academicYear + 1, region, label),
    ]),
  ];
};

type QuickLinkPeriod = { startDate: Date; endDate: Date; name: string };

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
  labelVariant = LabelVariants.BOLD,
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
          <Stack spacing={2} paddingY={3} paddingX={4}>
            {holidayPresets.map((preset) => (
              <Button
                key={preset.label}
                variant={ButtonVariants.SECONDARY}
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
        <Stack spacing={2}>
          {formattedHolidaysForViewedMonth.map((label) => (
            <Text key={label} variant={TextVariants.MUTED} fontSize="0.85rem">
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

export { DatePeriodPicker };
export type { QuickLinkPeriod };
