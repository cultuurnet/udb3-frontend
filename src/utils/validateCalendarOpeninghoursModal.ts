import { DaysOfWeek } from '@/constants/DaysOfWeek';
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

const hasNoDaySelected = (openingHours: { dayOfWeek: unknown[] }[]): boolean =>
  openingHours.some((hour) => hour.dayOfWeek.length === 0);

const hasInvalidOpeningHours = (openingHours: OpeningHoursRow[]): boolean =>
  openingHours.some(
    (hour) => !!hour.opens && !!hour.closes && hour.closes < hour.opens,
  );

const hasChildcareErrors = (openingHours: OpeningHoursRow[]): boolean =>
  openingHours.some((hour) => {
    if (!hour.childcareEnabled) return false;
    const timesMissing = !hour.childcareStartTime || !hour.childcareEndTime;
    const startTooLate =
      !!hour.childcareStartTime && hour.childcareStartTime >= hour.opens;
    const endTooEarly =
      !!hour.childcareEndTime && hour.childcareEndTime <= hour.closes;
    return timesMissing || startTooLate || endTooEarly;
  });

type PeriodWithDateRange = { id: string; startDate: Date; endDate: Date };

const hasDateRangeError = (
  periods: PeriodWithDateRange[],
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
): boolean =>
  periods.some(
    (period) =>
      (eventStart && period.startDate < eventStart) ||
      (eventEnd && period.endDate > eventEnd),
  );

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

export const getOverlappingDays = (
  openingHours: Pick<OpeningHoursRow, 'opens' | 'closes' | 'dayOfWeek'>[],
): DayOfWeek[] => {
  const getOpeningHoursForDay = (day: DayOfWeek) =>
    openingHours.filter((row) => row.dayOfWeek.includes(day));

  const hasTimeConflict = (rows: Pick<OpeningHoursRow, 'opens' | 'closes'>[]) =>
    rows.some((row, index) =>
      rows
        .slice(index + 1)
        .some((other) => row.opens < other.closes && other.opens < row.closes),
    );

  return DaysOfWeek.filter((day) =>
    hasTimeConflict(getOpeningHoursForDay(day)),
  );
};

const hasAnyOverlappingDays = (
  openingHours: Pick<OpeningHoursRow, 'opens' | 'closes' | 'dayOfWeek'>[],
  deviatingPeriods: DeviatingPeriodData[],
): boolean =>
  getOverlappingDays(openingHours).length > 0 ||
  deviatingPeriods.some(
    (period) => getOverlappingDays(period.openingHours).length > 0,
  );

export const hasAnyModalErrors = (
  openingHours: OpeningHoursRow[],
  deviatingPeriods: DeviatingPeriodData[],
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
): boolean =>
  hasNoDaySelected(openingHours) ||
  deviatingPeriods.some((period) => hasNoDaySelected(period.openingHours)) ||
  hasChildcareErrors(openingHours) ||
  hasInvalidOpeningHours(openingHours) ||
  hasAnyOverlappingDays(openingHours, deviatingPeriods) ||
  hasDateRangeError(deviatingPeriods, eventStart, eventEnd) ||
  deviatingPeriods.some((period) =>
    overlapsWithAnotherPeriod(period, deviatingPeriods),
  );

const hasDeviatingPeriodErrors = (
  deviatingPeriods: DeviatingPeriodData[],
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
): boolean => hasAnyModalErrors([], deviatingPeriods, eventStart, eventEnd);

const hasClosingPeriodErrors = (
  closingPeriods: PeriodWithDateRange[],
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
): boolean =>
  hasDateRangeError(closingPeriods, eventStart, eventEnd) ||
  closingPeriods.some((closingPeriod) =>
    overlapsWithAnotherPeriod(closingPeriod, closingPeriods),
  );

const hasMainOpeningHoursErrors = (
  openingHours: OpeningHoursRow[],
  shownErrorIds: ReadonlySet<string>,
): boolean => {
  if (getOverlappingDays(openingHours).length > 0) return true;
  if (hasChildcareErrors(openingHours)) return true;
  if (shownErrorIds.size === 0) return false;
  const flaggedRows = openingHours.filter((hour) => shownErrorIds.has(hour.id));
  return (
    hasNoDaySelected(flaggedRows) ||
    hasInvalidOpeningHours(flaggedRows) ||
    hasChildcareErrors(flaggedRows)
  );
};

export const getErrorSections = (
  openingHours: OpeningHoursRow[],
  deviatingPeriods: DeviatingPeriodData[],
  closingPeriods: PeriodWithDateRange[],
  shownErrorIds: ReadonlySet<string>,
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
) => ({
  hours: hasMainOpeningHoursErrors(openingHours, shownErrorIds),
  deviating: hasDeviatingPeriodErrors(deviatingPeriods, eventStart, eventEnd),
  closing: hasClosingPeriodErrors(closingPeriods, eventStart, eventEnd),
});

export const isModalConfirmDisabled = (
  isDeleteConfirm: boolean,
  openingHours: OpeningHoursRow[],
  deviatingPeriods: DeviatingPeriodData[],
  shownErrorIds: ReadonlySet<string>,
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
  closingPeriods: PeriodWithDateRange[] = [],
): boolean => {
  if (isDeleteConfirm) return false;
  if (hasChildcareErrors(openingHours)) return true;
  if (hasAnyOverlappingDays(openingHours, deviatingPeriods)) return true;
  if (hasClosingPeriodErrors(closingPeriods, eventStart, eventEnd)) return true;
  if (shownErrorIds.size === 0) return false;

  const flaggedRows = openingHours.filter((hour) => shownErrorIds.has(hour.id));
  const hasFlaggedRowErrors =
    hasNoDaySelected(flaggedRows) ||
    hasInvalidOpeningHours(flaggedRows) ||
    hasChildcareErrors(flaggedRows) ||
    deviatingPeriods.some((period) =>
      hasNoDaySelected(
        period.openingHours.filter((hour) => shownErrorIds.has(hour.id)),
      ),
    );

  const validatedPeriods = deviatingPeriods.filter((period) =>
    period.openingHours.every((hour) => shownErrorIds.has(hour.id)),
  );

  return (
    hasFlaggedRowErrors ||
    hasDateRangeError(validatedPeriods, eventStart, eventEnd) ||
    validatedPeriods.some((period) =>
      overlapsWithAnotherPeriod(period, validatedPeriods),
    )
  );
};
