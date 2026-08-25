import { parse } from 'date-fns';
import type { TFunction } from 'i18next';

import type { ApiHoliday } from '@/hooks/api/holidays';

import { SupportedLanguages } from '../i18n';
import type { Values } from '../types/Values';
import {
  hasPeriodOverlap,
  type PeriodWithDateRange,
} from './validateOpeningHours';

const HolidayTypes = { PUBLIC: 'public', SCHOOL: 'school' } as const;
type HolidayType = Values<typeof HolidayTypes>;

const SCHOOL_HOLIDAY_API_TYPE = 'schoolHolidays';

type HolidayPreset = {
  label: string;
  fetchStartDate: string;
  fetchEndDate: string;
  matchesHoliday: (holiday: {
    holidayType: HolidayType;
    region?: string;
    startDate: Date;
  }) => boolean;
};

const parseHoliday = (holiday: ApiHoliday, language: string, t: TFunction) => {
  const name =
    holiday.name[language as Values<typeof SupportedLanguages>] ?? '';
  const regionLabel = holiday.region
    ? t(`date_period_picker.region.${holiday.region}`)
    : undefined;
  return {
    holidayType:
      holiday.type === SCHOOL_HOLIDAY_API_TYPE
        ? HolidayTypes.SCHOOL
        : HolidayTypes.PUBLIC,
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
    holiday.holidayType === HolidayTypes.PUBLIC &&
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
    holiday.holidayType === HolidayTypes.SCHOOL &&
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

type HolidayPeriod = PeriodWithDateRange & { holidayType?: HolidayType };

const removeOverlappingPublicHolidays = <T extends HolidayPeriod>(
  periods: T[],
): T[] => {
  const schoolHolidays = periods.filter(
    (period) => period.holidayType === HolidayTypes.SCHOOL,
  );

  const remaining = periods.filter(
    (period) =>
      period.holidayType !== HolidayTypes.PUBLIC ||
      !hasPeriodOverlap(period, schoolHolidays),
  );

  return remaining.length === periods.length ? periods : remaining;
};

export type { HolidayPreset, HolidayType };
export {
  computeHolidayPresets,
  filterHolidaysForPreset,
  getAcademicYearStart,
  HolidayTypes,
  parseHoliday,
  publicHolidayPreset,
  removeOverlappingPublicHolidays,
  schoolHolidayPreset,
};
