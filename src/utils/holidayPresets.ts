import { parse } from 'date-fns';
import type { TFunction } from 'i18next';

import type { ApiHoliday } from '@/hooks/api/holidays';

import { SupportedLanguages } from '../i18n';
import type { Values } from '../types/Values';

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

export type { HolidayPreset };
export {
  computeHolidayPresets,
  filterHolidaysForPreset,
  getAcademicYearStart,
  parseHoliday,
  publicHolidayPreset,
  schoolHolidayPreset,
};
