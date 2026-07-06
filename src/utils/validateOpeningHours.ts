import { startOfDay } from 'date-fns';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { DayOfWeek } from '@/types/Offer';

import { type DeviatingPeriodData } from '../pages/steps/CalendarStep/DeviatingPeriod';

export type RegularHoursRow = {
  id: string;
  opens: string;
  closes: string;
  dayOfWeek: DayOfWeek[];
  childcareStartTime: string;
  childcareEndTime: string;
};

export type RegularHoursFormData = {
  openingHours: RegularHoursRow[];
};

const hasNoDaySelected = (openingHours: { dayOfWeek: unknown[] }[]): boolean =>
  openingHours.some((hour) => hour.dayOfWeek.length === 0);

const hasInvalidTimeRange = (openingHours: RegularHoursRow[]): boolean =>
  openingHours.some(
    (hour) => !!hour.opens && !!hour.closes && hour.closes < hour.opens,
  );

const hasChildcareErrors = (openingHours: RegularHoursRow[]): boolean =>
  openingHours.some((hour) => {
    const startTooLate =
      !!hour.childcareStartTime && hour.childcareStartTime >= hour.opens;
    const endTooEarly =
      !!hour.childcareEndTime && hour.childcareEndTime <= hour.closes;
    return startTooLate || endTooEarly;
  });

const hasChildcareTimeComparisonErrors = (
  regularHours: RegularHoursRow[],
  deviatingPeriods: DeviatingPeriodData[],
): boolean =>
  regularHours.some(
    (hour) =>
      (!!hour.childcareStartTime && hour.childcareStartTime >= hour.opens) ||
      (!!hour.childcareEndTime && hour.childcareEndTime <= hour.closes),
  ) ||
  deviatingPeriods.some((period) =>
    period.openingHours.some((hour) => {
      if (!hour.childcare) return false;
      return (
        (!!hour.childcare.start && hour.childcare.start >= hour.opens) ||
        (!!hour.childcare.end && hour.childcare.end <= hour.closes)
      );
    }),
  );

const hasRegularHourErrors = (regularHours: RegularHoursRow[]): boolean =>
  hasNoDaySelected(regularHours) ||
  hasInvalidTimeRange(regularHours) ||
  hasChildcareErrors(regularHours);

export type PeriodWithDateRange = {
  id: string;
  startDate: Date;
  endDate: Date;
};

const dayStart = (date: Date): number => startOfDay(new Date(date)).getTime();

export const hasPeriodOverlap = (
  period: PeriodWithDateRange,
  periods: PeriodWithDateRange[],
): boolean =>
  periods.some(
    (other) =>
      other.id !== period.id &&
      dayStart(period.startDate) <= dayStart(other.endDate) &&
      dayStart(period.endDate) >= dayStart(other.startDate),
  );

const hasPeriodDateError = (
  periods: PeriodWithDateRange[],
  eventStart: Date | undefined,
  eventEnd: Date | undefined,
): boolean =>
  periods.some(
    (period) =>
      dayStart(period.startDate) > dayStart(period.endDate) ||
      (eventStart && dayStart(period.startDate) < dayStart(eventStart)) ||
      (eventEnd && dayStart(period.endDate) > dayStart(eventEnd)) ||
      hasPeriodOverlap(period, periods),
  );

export const getOverlappingDays = (
  openingHours: Pick<RegularHoursRow, 'opens' | 'closes' | 'dayOfWeek'>[],
): DayOfWeek[] => {
  const getOpeningHoursForDay = (day: DayOfWeek) =>
    openingHours.filter((row) => row.dayOfWeek.includes(day));

  const hasTimeConflict = (rows: Pick<RegularHoursRow, 'opens' | 'closes'>[]) =>
    rows.some((row, index) =>
      rows
        .slice(index + 1)
        .some((other) => row.opens < other.closes && other.opens < row.closes),
    );

  return DaysOfWeek.filter((day) =>
    hasTimeConflict(getOpeningHoursForDay(day)),
  );
};

const hasOverlappingTimeSlots = (
  regularHours: Pick<RegularHoursRow, 'opens' | 'closes' | 'dayOfWeek'>[],
  deviatingPeriods: DeviatingPeriodData[],
): boolean =>
  getOverlappingDays(regularHours).length > 0 ||
  deviatingPeriods.some(
    (period) => getOverlappingDays(period.openingHours).length > 0,
  );

type OpeningHoursParams = {
  regularHours: RegularHoursRow[];
  deviatingPeriods: DeviatingPeriodData[];
  eventStart: Date | undefined;
  eventEnd: Date | undefined;
  closingPeriods?: PeriodWithDateRange[];
};

export const getOpeningHoursErrorIds = ({
  regularHours,
  deviatingPeriods,
  eventStart,
  eventEnd,
  closingPeriods = [],
}: OpeningHoursParams): ReadonlySet<string> => {
  const hasErrors =
    hasRegularHourErrors(regularHours) ||
    deviatingPeriods.some((period) => hasNoDaySelected(period.openingHours)) ||
    hasOverlappingTimeSlots(regularHours, deviatingPeriods) ||
    [deviatingPeriods, closingPeriods].some((periods) =>
      hasPeriodDateError(periods, eventStart, eventEnd),
    );

  if (!hasErrors) return new Set();

  return new Set([
    ...regularHours.map((hour) => hour.id),
    ...deviatingPeriods.flatMap((period) =>
      period.openingHours.map((hour) => hour.id),
    ),
    ...closingPeriods.map((period) => period.id),
  ]);
};

type OpeningHoursConfirmParams = OpeningHoursParams & {
  isDeleteConfirm: boolean;
  shownErrorIds: ReadonlySet<string>;
};

export const isOpeningHoursConfirmDisabled = ({
  isDeleteConfirm,
  regularHours,
  deviatingPeriods,
  shownErrorIds,
  eventStart,
  eventEnd,
  closingPeriods = [],
}: OpeningHoursConfirmParams): boolean => {
  if (isDeleteConfirm) return false;
  if (hasChildcareTimeComparisonErrors(regularHours, deviatingPeriods))
    return true;
  if (shownErrorIds.size === 0) return false;

  const flaggedRegularHours = regularHours.filter((hour) =>
    shownErrorIds.has(hour.id),
  );
  const flaggedDeviatingPeriods = deviatingPeriods.filter((period) =>
    period.openingHours.every((hour) => shownErrorIds.has(hour.id)),
  );
  const flaggedClosingPeriods = closingPeriods.filter((period) =>
    shownErrorIds.has(period.id),
  );

  const hasOverlap = hasOverlappingTimeSlots(regularHours, deviatingPeriods);
  const hasFlaggedRegularHourErrors = hasRegularHourErrors(flaggedRegularHours);
  const hasFlaggedDeviatingPeriodErrors = deviatingPeriods.some((period) =>
    hasNoDaySelected(
      period.openingHours.filter((hour) => shownErrorIds.has(hour.id)),
    ),
  );
  const hasFlaggedDateErrors = [
    flaggedDeviatingPeriods,
    flaggedClosingPeriods,
  ].some((periods) => hasPeriodDateError(periods, eventStart, eventEnd));

  return (
    hasOverlap ||
    hasFlaggedRegularHourErrors ||
    hasFlaggedDeviatingPeriodErrors ||
    hasFlaggedDateErrors
  );
};
