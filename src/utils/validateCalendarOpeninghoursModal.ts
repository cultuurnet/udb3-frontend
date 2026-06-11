import { DayOfWeek } from '@/types/Offer';

import { type DeviatingPeriodData } from '../pages/steps/CalendarStep/DeviatingPeriod';

export type OpeningHoursRow = {
  id: string;
  opens: string;
  closes: string;
  dayOfWeek: DayOfWeek[];
  childcareEnabled: boolean;
  childcareStartTime: string;
  childcareEndTime: string;
};

export type OpeningHoursFormData = {
  openingHours: OpeningHoursRow[];
};

export const hasChildcareErrors = (openingHours: OpeningHoursRow[]): boolean =>
  openingHours.some((hour) => {
    if (!hour.childcareEnabled) return false;
    const timesMissing = !hour.childcareStartTime && !hour.childcareEndTime;
    const startTooLate =
      !!hour.childcareStartTime && hour.childcareStartTime >= hour.opens;
    const endTooEarly =
      !!hour.childcareEndTime && hour.childcareEndTime <= hour.closes;
    return timesMissing || startTooLate || endTooEarly;
  });

export const hasInvalidOpeningHoursError = (
  openingHours: OpeningHoursRow[],
): boolean =>
  openingHours.some(
    (hour) => !!hour.opens && !!hour.closes && hour.closes < hour.opens,
  );

export const hasMissingOpeningHoursDaysError = (
  openingHours: OpeningHoursRow[],
): boolean => openingHours.some((hour) => hour.dayOfWeek.length === 0);

type PeriodWithDateRange = { id: string; startDate: Date; endDate: Date };

export const overlapsWithAnotherPeriod = (
  period: PeriodWithDateRange,
  periods: PeriodWithDateRange[],
): boolean =>
  periods.some(
    (other) =>
      other.id !== period.id &&
      period.startDate <= other.endDate &&
      period.endDate >= other.startDate,
  );

export const hasMissingDaysError = (periods: DeviatingPeriodData[]): boolean =>
  periods.some((period) =>
    period.openingHours.some(
      (openingHour) => openingHour.dayOfWeek.length === 0,
    ),
  );

export const hasDateRangeError = (
  periods: DeviatingPeriodData[],
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
): boolean =>
  periods.some(
    (period) =>
      (eventStart && period.startDate < eventStart) ||
      (eventEnd && period.endDate > eventEnd),
  );
