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

const makeClosingPeriod = (
  partial: Partial<{ id: string; startDate: Date; endDate: Date }> = {},
) => ({
  id: 'closing-1',
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-07'),
  ...partial,
});

describe('getOverlappingDays', () => {
  it('returns empty when a day only appears in one row', () => {
    expect(getOverlappingDays([makeRow()])).toEqual([]);
  });

  it('returns empty when times on the same day do not overlap', () => {
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

  it('returns the day when two rows on the same day overlap', () => {
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

  it('only flags the conflicting day, not others', () => {
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
  const check = (
    rows: OpeningHoursRow[],
    periods: DeviatingPeriodData[] = [],
    closingPeriods: ReturnType<typeof makeClosingPeriod>[] = [],
    eventStart?: Date,
    eventEnd?: Date,
  ) => hasAnyModalErrors(rows, periods, eventStart, eventEnd, closingPeriods);

  it('returns false when everything is valid', () => {
    expect(check([makeRow()])).toBe(false);
  });

  it('returns true when a row has no day selected', () => {
    expect(check([makeRow({ dayOfWeek: [] })])).toBe(true);
  });

  it('returns true when a period is before the event start', () => {
    expect(
      check(
        [makeRow()],
        [makePeriod({ startDate: new Date('2025-05-01') })],
        [],
        new Date('2025-06-01'),
      ),
    ).toBe(true);
  });

  it('returns true when a period is after the event end', () => {
    expect(
      check(
        [makeRow()],
        [makePeriod({ endDate: new Date('2025-07-01') })],
        [],
        undefined,
        new Date('2025-06-30'),
      ),
    ).toBe(true);
  });

  it('returns true when a period has start after end', () => {
    expect(
      check(
        [makeRow()],
        [
          makePeriod({
            startDate: new Date('2025-06-10'),
            endDate: new Date('2025-06-01'),
          }),
        ],
      ),
    ).toBe(true);
  });

  it('returns true when two deviating periods overlap', () => {
    const periods = [
      makePeriod({
        id: 'p1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-10'),
      }),
      makePeriod({
        id: 'p2',
        startDate: new Date('2025-06-05'),
        endDate: new Date('2025-06-15'),
      }),
    ];
    expect(check([makeRow()], periods)).toBe(true);
  });

  it('returns true when a deviating period has overlapping opening hours', () => {
    const period = makePeriod({
      openingHours: [
        { id: 'a', opens: '09:00', closes: '13:00', dayOfWeek: ['monday'] },
        { id: 'b', opens: '12:00', closes: '17:00', dayOfWeek: ['monday'] },
      ],
    });
    expect(check([makeRow()], [period])).toBe(true);
  });

  it('returns true when two closing periods overlap', () => {
    const closingPeriods = [
      makeClosingPeriod({
        id: 'c1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-10'),
      }),
      makeClosingPeriod({
        id: 'c2',
        startDate: new Date('2025-06-05'),
        endDate: new Date('2025-06-15'),
      }),
    ];
    expect(check([makeRow()], [], closingPeriods)).toBe(true);
  });

  it('returns true when a closing period has start after end', () => {
    expect(
      check(
        [makeRow()],
        [],
        [
          makeClosingPeriod({
            startDate: new Date('2025-06-10'),
            endDate: new Date('2025-06-01'),
          }),
        ],
      ),
    ).toBe(true);
  });
});

describe('isModalConfirmDisabled', () => {
  const check = (
    rows: OpeningHoursRow[],
    shownErrorIds: ReadonlySet<string>,
    { isDelete = false } = {},
  ) =>
    isModalConfirmDisabled(
      isDelete,
      rows,
      [],
      shownErrorIds,
      undefined,
      undefined,
    );

  it.each([
    ['missing day', makeRow({ id: 'row-1', dayOfWeek: [] })],
    [
      'overlapping times',
      makeRow({ id: 'row-1', opens: '09:00', closes: '08:00' }),
    ],
    [
      'childcare missing times',
      makeRow({
        id: 'row-1',
        childcareEnabled: true,
        childcareStartTime: '',
        childcareEndTime: '',
      }),
    ],
  ])('is false before first save attempt even with %s', (_, row) => {
    expect(check([row], new Set())).toBe(false);
  });

  it.each([
    [
      'childcare start too late',
      makeRow({
        id: 'row-1',
        childcareEnabled: true,
        childcareStartTime: '09:00',
        childcareEndTime: '',
      }),
    ],
    [
      'childcare end too early',
      makeRow({
        id: 'row-1',
        childcareEnabled: true,
        childcareStartTime: '',
        childcareEndTime: '17:00',
      }),
    ],
    [
      'childcare both times invalid',
      makeRow({
        id: 'row-1',
        childcareEnabled: true,
        childcareStartTime: '10:00',
        childcareEndTime: '16:00',
      }),
    ],
  ])('is true immediately (before save attempt) with %s', (_, row) => {
    expect(check([row], new Set())).toBe(true);
  });

  it('is true after first save reveals a missing day', () => {
    expect(
      check([makeRow({ id: 'row-1', dayOfWeek: [] })], new Set(['row-1'])),
    ).toBe(true);
  });

  it('is true after first save reveals overlapping days', () => {
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
    expect(check(rows, new Set(['a', 'b']))).toBe(true);
  });

  it('is false once the error is fixed', () => {
    expect(check([makeRow({ id: 'row-1' })], new Set(['row-1']))).toBe(false);
  });

  it('is false when confirming a delete regardless of errors', () => {
    expect(
      check([makeRow({ id: 'row-1', dayOfWeek: [] })], new Set(['row-1']), {
        isDelete: true,
      }),
    ).toBe(false);
  });
});
