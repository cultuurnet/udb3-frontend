import type { DeviatingPeriodData } from '@/pages/steps/CalendarStep/DeviatingPeriod';

import {
  getOverlappingDays,
  hasAnyModalErrors,
  isModalConfirmDisabled,
  type OpeningHoursRow,
} from './validateCalendarOpeninghoursModal';

const makeRow = (partial: Partial<OpeningHoursRow> = {}): OpeningHoursRow => ({
  id: 'row-1',
  opens: '09:00',
  closes: '17:00',
  dayOfWeek: ['monday'],
  childcareEnabled: false,
  childcareStartTime: '',
  childcareEndTime: '',
  ...partial,
});

const makePeriod = (
  partial: Partial<DeviatingPeriodData> = {},
): DeviatingPeriodData => ({
  id: 'period-1',
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-07'),
  description: {},
  openingHours: [
    { id: 'oh-1', opens: '09:00', closes: '17:00', dayOfWeek: ['monday'] },
  ],
  ...partial,
});

describe('getOverlappingDays', () => {
  it('returns empty when a day only appears in one row', () => {
    expect(getOverlappingDays([makeRow()])).toEqual([]);
  });

  it('returns empty when the same day appears in two rows with non-overlapping times', () => {
    const rows = [
      makeRow({
        id: 'a',
        opens: '09:00',
        closes: '12:00',
        dayOfWeek: ['monday'],
      }),
      makeRow({
        id: 'b',
        opens: '13:00',
        closes: '17:00',
        dayOfWeek: ['monday'],
      }),
    ];
    expect(getOverlappingDays(rows)).toEqual([]);
  });

  it('returns empty when times touch but do not overlap', () => {
    const rows = [
      makeRow({
        id: 'a',
        opens: '09:00',
        closes: '12:00',
        dayOfWeek: ['monday'],
      }),
      makeRow({
        id: 'b',
        opens: '12:00',
        closes: '17:00',
        dayOfWeek: ['monday'],
      }),
    ];
    expect(getOverlappingDays(rows)).toEqual([]);
  });

  it('returns the day when two rows on the same day have overlapping times', () => {
    const rows = [
      makeRow({
        id: 'a',
        opens: '09:00',
        closes: '13:00',
        dayOfWeek: ['monday'],
      }),
      makeRow({
        id: 'b',
        opens: '12:00',
        closes: '17:00',
        dayOfWeek: ['monday'],
      }),
    ];
    expect(getOverlappingDays(rows)).toEqual(['monday']);
  });

  it('only flags the day where times conflict, not the non-conflicting one', () => {
    const rows = [
      makeRow({
        id: 'a',
        opens: '09:00',
        closes: '12:00',
        dayOfWeek: ['monday', 'tuesday'],
      }),
      makeRow({
        id: 'b',
        opens: '13:00',
        closes: '17:00',
        dayOfWeek: ['monday'],
      }),
      makeRow({
        id: 'c',
        opens: '10:00',
        closes: '15:00',
        dayOfWeek: ['tuesday'],
      }),
    ];
    expect(getOverlappingDays(rows)).toEqual(['tuesday']);
  });
});

describe('hasAnyModalErrors', () => {
  it('returns true when a row has no day selected', () => {
    expect(
      hasAnyModalErrors([makeRow({ dayOfWeek: [] })], [], undefined, undefined),
    ).toBe(true);
  });

  it('returns false for a valid row with no deviating periods', () => {
    expect(hasAnyModalErrors([makeRow()], [], undefined, undefined)).toBe(
      false,
    );
  });

  it('returns true when a deviating period starts before the event start', () => {
    const period = makePeriod({ startDate: new Date('2025-05-01') });
    expect(
      hasAnyModalErrors(
        [makeRow()],
        [period],
        new Date('2025-06-01'),
        undefined,
      ),
    ).toBe(true);
  });

  it('returns true when a deviating period ends after the event end', () => {
    const period = makePeriod({ endDate: new Date('2025-07-01') });
    expect(
      hasAnyModalErrors(
        [makeRow()],
        [period],
        undefined,
        new Date('2025-06-30'),
      ),
    ).toBe(true);
  });

  it('returns true when a deviating period has overlapping opening hours', () => {
    const period = makePeriod({
      openingHours: [
        { id: 'a', opens: '09:00', closes: '13:00', dayOfWeek: ['monday'] },
        { id: 'b', opens: '12:00', closes: '17:00', dayOfWeek: ['monday'] },
      ],
    });
    expect(hasAnyModalErrors([makeRow()], [period], undefined, undefined)).toBe(
      true,
    );
  });
});

describe('isModalConfirmDisabled — first-click reveals, second-click saves', () => {
  it('keeps the button enabled on first open even when a row has no day selected', () => {
    expect(
      isModalConfirmDisabled(
        false,
        [makeRow({ dayOfWeek: [] })],
        [],
        new Set(),
        undefined,
        undefined,
      ),
    ).toBe(false);
  });

  it('disables the button after the first save attempt exposes the missing-day error', () => {
    const row = makeRow({ id: 'row-1', dayOfWeek: [] });
    expect(
      isModalConfirmDisabled(
        false,
        [row],
        [],
        new Set(['row-1']),
        undefined,
        undefined,
      ),
    ).toBe(true);
  });

  it('re-enables the button once the error is fixed while shownErrorIds are still populated', () => {
    const row = makeRow({ id: 'row-1' });
    expect(
      isModalConfirmDisabled(
        false,
        [row],
        [],
        new Set(['row-1']),
        undefined,
        undefined,
      ),
    ).toBe(false);
  });

  it('always disables immediately for overlapping days, even before a save attempt', () => {
    const rows = [
      makeRow({
        id: 'a',
        opens: '09:00',
        closes: '13:00',
        dayOfWeek: ['monday'],
      }),
      makeRow({
        id: 'b',
        opens: '12:00',
        closes: '17:00',
        dayOfWeek: ['monday'],
      }),
    ];
    expect(
      isModalConfirmDisabled(false, rows, [], new Set(), undefined, undefined),
    ).toBe(true);
  });

  it('never disables for a delete confirm regardless of errors', () => {
    const row = makeRow({ id: 'row-1', dayOfWeek: [] });
    expect(
      isModalConfirmDisabled(
        true,
        [row],
        [],
        new Set(['row-1']),
        undefined,
        undefined,
      ),
    ).toBe(false);
  });
});
