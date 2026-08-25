import type { ClosingPeriodData } from '../pages/steps/CalendarStep/ClosingPeriod';
import type { DeviatingPeriodData } from '../pages/steps/CalendarStep/DeviatingPeriod';
import {
  type HolidayType,
  HolidayTypes,
  removeOverlappingPublicHolidays,
} from './holidayPresets';

const createPeriod = (
  id: string,
  startDate: string,
  endDate: string,
  holidayType?: HolidayType,
): ClosingPeriodData => ({
  id,
  startDate: new Date(startDate),
  endDate: new Date(endDate),
  description: { nl: id },
  holidayType,
});

const christmasHolidays = createPeriod(
  'kerstvakantie',
  '2026-12-19',
  '2027-01-03',
  HolidayTypes.SCHOOL,
);

const christmasDay = createPeriod(
  'kerstmis',
  '2026-12-25',
  '2026-12-25',
  HolidayTypes.PUBLIC,
);

describe('removeOverlappingPublicHolidays', () => {
  it('removes a public holiday that falls inside a school holiday', () => {
    const result = removeOverlappingPublicHolidays([
      christmasHolidays,
      christmasDay,
    ]);

    expect(result.map((period) => period.id)).toEqual(['kerstvakantie']);
  });

  it('removes a public holiday that partially overlaps a school holiday', () => {
    const result = removeOverlappingPublicHolidays([
      christmasHolidays,
      createPeriod(
        'nieuwjaar',
        '2027-01-01',
        '2027-01-01',
        HolidayTypes.PUBLIC,
      ),
    ]);

    expect(result.map((period) => period.id)).toEqual(['kerstvakantie']);
  });

  it('keeps public holidays outside every school holiday', () => {
    const result = removeOverlappingPublicHolidays([
      christmasHolidays,
      christmasDay,
      createPeriod(
        'wapenstilstand',
        '2026-11-11',
        '2026-11-11',
        HolidayTypes.PUBLIC,
      ),
    ]);

    expect(result.map((period) => period.id)).toEqual([
      'kerstvakantie',
      'wapenstilstand',
    ]);
  });

  it('never removes school holidays that overlap each other', () => {
    const result = removeOverlappingPublicHolidays([
      christmasHolidays,
      createPeriod(
        'vacances-noel',
        '2026-12-21',
        '2027-01-01',
        HolidayTypes.SCHOOL,
      ),
    ]);

    expect(result.map((period) => period.id)).toEqual([
      'kerstvakantie',
      'vacances-noel',
    ]);
  });

  it('keeps manually added periods that overlap a school holiday', () => {
    const manualPeriod = createPeriod('manueel', '2026-12-24', '2026-12-26');

    expect(
      removeOverlappingPublicHolidays([christmasHolidays, manualPeriod]),
    ).toEqual([christmasHolidays, manualPeriod]);
  });

  it('returns the same list when nothing has to be removed', () => {
    const periods = [christmasDay];

    expect(removeOverlappingPublicHolidays(periods)).toBe(periods);
  });

  it('removes overlapping public holidays from deviating periods', () => {
    const deviatingPeriods: DeviatingPeriodData[] = [
      { ...christmasHolidays, openingHours: [] },
      { ...christmasDay, openingHours: [] },
    ];

    const result = removeOverlappingPublicHolidays(deviatingPeriods);

    expect(result.map((period) => period.id)).toEqual(['kerstvakantie']);
  });
});
