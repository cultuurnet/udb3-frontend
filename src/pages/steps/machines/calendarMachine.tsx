import { useInterpret, useSelector } from '@xstate/react';
import {
  getDate,
  getMonth,
  getYear,
  setDate,
  setMonth,
  setYear,
} from 'date-fns';
import uniqueId from 'lodash/uniqueId';
import { createContext, ReactNode, useContext } from 'react';
import {
  Actions,
  assign,
  createMachine,
  Interpreter,
  MachineConfig,
  MachineOptions,
  State,
} from 'xstate';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { CalendarType } from '@/constants/CalendarType';
import { OfferStatus } from '@/constants/OfferStatus';
import { OpeningHours, StatusReason } from '@/types/Offer';
import { Values } from '@/types/Values';

const getTodayWithoutTime = () => {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

const getStartDate = () => {
  return getTodayWithoutTime().toString();
};

const getEndDate = () => {
  const today = getTodayWithoutTime();

  today.setHours(23);
  today.setMinutes(59);

  return today.toString();
};

export type OpeningHoursWithId = OpeningHours & { id: string };

export const createDayId = () => uniqueId('day-');
export const createOpeninghoursId = () => uniqueId('openinghours-');

type Status = {
  type: Values<typeof OfferStatus>;
  reason?: StatusReason;
};

type BookingAvailability = {
  type: Values<typeof BookingAvailabilityType>;
};

const createInitialContext = () => ({
  days: [
    {
      id: createDayId(),
      startDate: getStartDate(),
      endDate: getEndDate(),
      status: {
        type: OfferStatus.AVAILABLE,
      } as Status,
      bookingAvailability: {
        type: BookingAvailabilityType.AVAILABLE,
      } as BookingAvailability,
    },
  ],
  startDate: getStartDate(),
  endDate: getEndDate(),
  openingHours: [] as OpeningHoursWithId[],
});

export const initialCalendarContext = createInitialContext();

export type CalendarContext = typeof initialCalendarContext;

type CalendarEvents =
  | { type: 'CHOOSE_ONE_OR_MORE_DAYS' }
  | { type: 'CHOOSE_FIXED_DAYS' }
  | { type: 'CHOOSE_WITH_START_AND_END_DATE' }
  | { type: 'CHOOSE_PERMANENT' }
  | { type: 'ADD_DAY' }
  | {
      type: 'LOAD_INITIAL_CONTEXT';
      newContext?: CalendarContext;
      calendarType?: Values<typeof CalendarType>;
    }
  | {
      type: 'REMOVE_DAY';
      id: string;
    }
  | {
      type: 'CHANGE_START_DATE';
      newDate: Date;
    }
  | {
      type: 'CHANGE_END_DATE';
      newDate: Date;
    }
  | {
      type: 'CHANGE_START_DATE_OF_DAY';
      newDate: Date;
      id: string;
    }
  | {
      type: 'CHANGE_END_DATE_OF_DAY';
      newDate: Date;
      id: string;
    }
  | {
      type: 'CHANGE_START_HOUR';
      newHours: number;
      newMinutes: number;
      id: string;
    }
  | {
      type: 'CHANGE_END_HOUR';
      newHours: number;
      newMinutes: number;
      id: string;
    }
  | {
      type: 'CHANGE_OPENING_HOURS';
      newOpeningHours: OpeningHoursWithId[];
    };

const calendarSchema = {
  context: {} as CalendarContext,
  events: {} as CalendarEvents,
} as const;

type CalendarSchema = typeof calendarSchema;

export type CalendarState = State<
  CalendarContext,
  CalendarEvents,
  CalendarSchema
>;

type CalendarActions = Actions<CalendarContext, CalendarEvents>;

const calendarMachineOptions: MachineOptions<CalendarContext, CalendarEvents> =
  {
    guards: {
      has1Day: (context) => context.days.length === 1,
      has2Days: (context) => context.days.length === 2,
      hasMoreThan2Days: (context) => context.days.length > 2,
      isSingle: (_context, event) => {
        if (event.type !== 'LOAD_INITIAL_CONTEXT') return false;
        return event.calendarType === CalendarType.SINGLE;
      },
      isMultiple: (_context, event) => {
        if (event.type !== 'LOAD_INITIAL_CONTEXT') return false;
        return event.calendarType === CalendarType.MULTIPLE;
      },
      isPeriodic: (_context, event) => {
        if (event.type !== 'LOAD_INITIAL_CONTEXT') return false;
        return event.calendarType === CalendarType.PERIODIC;
      },
      isPermanent: (_context, event) => {
        if (event.type !== 'LOAD_INITIAL_CONTEXT') return false;
        return event.calendarType === CalendarType.PERMANENT;
      },
      hasStartAndEndDate: (context, event) => {
        if (event.type !== 'CHOOSE_FIXED_DAYS') return false;
        return !!(context.startDate && context.endDate);
      },
      hasHours: (context) => false,
      hasNoHours: (context) => false,
    },
    actions: {
      loadInitialContext: assign((context, event) => {
        if (event.type !== 'LOAD_INITIAL_CONTEXT') return;
        if (!event.newContext) {
          return createInitialContext();
        }

        return {
          ...event.newContext,
        };
      }),
      addNewDay: assign({
        days: (context) => {
          const lastDay = context.days.slice(-1)[0];
          if (!lastDay) return context.days;

          return [
            ...context.days,
            {
              ...lastDay,
              id: createDayId(),
              status: { type: OfferStatus.AVAILABLE },
              bookingAvailability: { type: BookingAvailabilityType.AVAILABLE },
            },
          ];
        },
      }),
      removeDay: assign({
        days: (context, event) => {
          if (event.type !== 'REMOVE_DAY') return context.days;

          return context.days.filter((day) => day.id !== event.id);
        },
      }),
      changeStartDate: assign({
        startDate: (context, event) => {
          if (event.type !== 'CHANGE_START_DATE') return context.startDate;

          return event.newDate.toString();
        },
      }),
      changeEndDate: assign({
        endDate: (context, event) => {
          if (event.type !== 'CHANGE_END_DATE') return context.endDate;

          return event.newDate.toString();
        },
      }),
      changeOpeningHours: assign({
        openingHours: (context, event) => {
          if (event.type !== 'CHANGE_OPENING_HOURS')
            return context.openingHours;
          return [...event.newOpeningHours];
        },
      }),
      changeStartDateOfDay: assign({
        days: (context, event) => {
          if (event.type !== 'CHANGE_START_DATE_OF_DAY') return context.days;

          return context.days.map((day) => {
            if (day.id !== event.id) return day;

            // Keep time, only set day/month/year
            let startDate: Date = new Date(day.startDate);

            startDate = setYear(startDate, getYear(event.newDate));
            startDate = setMonth(startDate, getMonth(event.newDate));
            startDate = setDate(startDate, getDate(event.newDate));

            return {
              ...day,
              startDate: startDate.toString(),
            };
          });
        },
      }),
      changeEndDateOfDay: assign({
        days: (context, event) => {
          if (event.type !== 'CHANGE_END_DATE_OF_DAY') return context.days;

          return context.days.map((day) => {
            if (day.id !== event.id) return day;

            // Keep time, only set day/month/year
            let endDate: Date = new Date(day.endDate);

            endDate = setYear(endDate, getYear(event.newDate));
            endDate = setMonth(endDate, getMonth(event.newDate));
            endDate = setDate(endDate, getDate(event.newDate));

            return {
              ...day,
              endDate: endDate.toString(),
            };
          });
        },
      }),
      changeStartHour: assign({
        days: (context, event) => {
          if (event.type !== 'CHANGE_START_HOUR') return context.days;

          return context.days.map((day) => {
            if (day.id !== event.id) return day;

            const startDate = new Date(day.startDate);

            startDate.setHours(event.newHours);
            startDate.setMinutes(event.newMinutes);

            return {
              ...day,
              startDate: startDate.toString(),
            };
          });
        },
      }),
      changeEndHour: assign({
        days: (context, event) => {
          if (event.type !== 'CHANGE_END_HOUR') return context.days;

          return context.days.map((day) => {
            if (day.id !== event.id) return day;

            const endDate = new Date(day.endDate);

            endDate.setHours(event.newHours);
            endDate.setMinutes(event.newMinutes);

            return {
              ...day,
              endDate: endDate.toString(),
            };
          });
        },
      }),
    },
    activities: undefined,
    services: undefined,
    delays: undefined,
  };

const calendarMachineConfig: MachineConfig<
  CalendarContext,
  CalendarSchema,
  CalendarEvents
> = {
  context: initialCalendarContext,
  preserveActionOrder: true,
  predictableActionArguments: true,
  id: 'calendar-step',
  // @ts-expect-error
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD_INITIAL_CONTEXT: [
          {
            target: 'single',
            cond: 'isSingle',
            actions: ['loadInitialContext'],
          },
          {
            target: 'multiple',
            cond: 'isMultiple',
            actions: ['loadInitialContext'],
          },
          {
            target: 'periodic',
            cond: 'isPeriodic',
            actions: ['loadInitialContext'],
          },
          {
            target: 'permanent',
            cond: 'isPermanent',
            actions: ['loadInitialContext'],
          },
          {
            target: 'single',
          },
        ],
      },
    },
    single: {
      on: {
        CHOOSE_FIXED_DAYS: [
          {
            target: 'periodic',
            cond: 'hasStartAndEndDate',
          },
          {
            target: 'permanent',
          },
        ],
        ADD_DAY: {
          target: 'multiple',
          actions: ['addNewDay'] as CalendarActions,
        },
        CHANGE_START_DATE: {
          actions: ['changeStartDate'] as CalendarActions,
        },
        CHANGE_END_DATE: {
          actions: ['changeEndDate'] as CalendarActions,
        },
        CHANGE_START_DATE_OF_DAY: {
          actions: ['changeStartDateOfDay'] as CalendarActions,
        },
        CHANGE_END_DATE_OF_DAY: {
          actions: ['changeEndDateOfDay'] as CalendarActions,
        },
        CHANGE_START_HOUR: {
          actions: ['changeStartHour'] as CalendarActions,
        },
        CHANGE_END_HOUR: {
          actions: ['changeEndHour'] as CalendarActions,
        },
      },
    },
    multiple: {
      on: {
        CHOOSE_FIXED_DAYS: [
          {
            target: 'periodic',
            cond: 'hasStartAndEndDate',
          },
          {
            target: 'permanent',
          },
        ],
        ADD_DAY: {
          actions: ['addNewDay'] as CalendarActions,
        },
        REMOVE_DAY: [
          {
            target: 'single',
            cond: 'has2Days',
            actions: ['removeDay'] as CalendarActions,
          },
          {
            cond: 'hasMoreThan2Days',
            actions: ['removeDay'] as CalendarActions,
          },
        ],
        CHANGE_START_DATE_OF_DAY: {
          actions: ['changeStartDateOfDay'] as CalendarActions,
        },
        CHANGE_END_DATE_OF_DAY: {
          actions: ['changeEndDateOfDay'] as CalendarActions,
        },
        CHANGE_START_HOUR: {
          actions: ['changeStartHour'] as CalendarActions,
        },
        CHANGE_END_HOUR: {
          actions: ['changeEndHour'] as CalendarActions,
        },
      },
    },
    periodic: {
      initial: 'noHours',
      states: {
        noHours: {
          on: {
            ADD_HOURS: {
              target: 'withHours',
            },
          },
        },
        withHours: {
          on: {
            CHANGE_HOURS: [
              {
                cond: 'hasHours',
              },
              {
                target: 'noHours',
                cond: 'hasNoHours',
              },
            ],
          },
        },
      },
      on: {
        CHANGE_START_DATE: {
          actions: ['changeStartDate'] as CalendarActions,
        },
        CHANGE_END_DATE: {
          actions: ['changeEndDate'] as CalendarActions,
        },
        CHANGE_OPENING_HOURS: {
          actions: ['changeOpeningHours'] as CalendarActions,
        },
        CHOOSE_ONE_OR_MORE_DAYS: [
          {
            target: 'single',
            cond: 'has1Day',
          },
          {
            target: 'multiple',
          },
        ],
        CHOOSE_PERMANENT: {
          target: 'permanent',
        },
      },
    },
    permanent: {
      initial: 'noHours',
      states: {
        noHours: {
          on: {
            ADD_HOURS: {
              target: 'withHours',
            },
          },
        },
        withHours: {
          on: {
            CHANGE_HOURS: [
              {
                cond: 'hours.length > 0',
              },
              {
                target: 'noHours',
                cond: 'hours.length === 0',
              },
            ],
          },
        },
      },
      on: {
        CHOOSE_ONE_OR_MORE_DAYS: {
          target: 'single',
        },
        CHOOSE_WITH_START_AND_END_DATE: {
          target: 'periodic',
        },
        CHANGE_OPENING_HOURS: {
          actions: ['changeOpeningHours'] as CalendarActions,
        },
      },
    },
  },
};

const calendarMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMCGAbMA7CqBOAtLAC5gAOAdLAJZZSYDEAwgBIDybAygKID6AYgEkAGtwAivMQEEAmpwDaABgC6iUGQD2NYtQ1Y1IAB6IAnACYANCACeiAIwBWRQHYKDswDYAHAGYzDj2dFDwAWAF8wqzRMHHwiUkoaOkYpMQlpGSVVJBBNbV19HOMETxCKEy8HEJ87Z2c7RR8PEx8rWwQvDzsKHyDnEMqQkMc7EwiojGxcQhJyKlp6MGYWKQA5AHE+TgAVKQAlbckpbe4sgzzqHT0DYo9PChCWkOczF0VHRS820zsyrxNHE4QmYvP5vOMQNEpnFZokFoxWGtNrxuKt0sdTipzlpLgUbogPD4fA8PB4XM4as8HJ1vh1HBQPA5RnYWcDFNSIVDYjMEvNkktERstrsDrx2ABVPZnHIXK6FUC3MzEnxeZwtCmE4Z1Wn1DwPOxK0leUZOLqcybc+JzJKLZZIvioiQSqVYmU4uX4hCExQ9MmE5wOXUvZy0rquWpmZy+HwmYHOO7mmLTK2UAC2AFd0DoyAj2Fw+EJROi5NL1O68UVEMCvBRPD5FJH3HZjf9aWY7M0Hv4mnX1QFE9CeXMM1nqDmlqli6XcuXrpWEGyGc8KkrTZVGW3gg4GcHCWTfJUB5bYRQR9nGHtuABZNgANT4GWnsorCsQpXKgxqdQaTRaOruFB2DUzb9IS9YtEeyYnmeY4Xted4PrI8h2NkZb5HOr4IPWNYtg4ATGiCAYmA4tKjKSDxEga1RmO2nSQTCvIweOdpCrwOz7Ic0gnE+s7ykYiC9GUNGqkq8Z3OyIY2PYnThk8lSNA4FTOPRQ5ppm54CisrGOkc3GumhuIYfxWHGrW7w+AEsYGiYaokVJCC1IE5QODGSrEUyQw+CpKanupsGafabEioczo8ehfHFL03QGn4QzmIoQyOKRRoUPU1R3Kq1QNt50F+cxgrIjpoX6TO4Wer0NaKMR5iRl4WVeKqpGWQ8-QvBZDU-jlvJkGAeC6BA1DIBQWAaCwGjpngsAMJOYpsJKCglc+RnFLZqVucCfiOFGdntDR9Ide2AQSR2XVzD1fUaANQ0AO6XAAFmNE1TQVfDOgtqGlYZEX2AarjEQl9TtQGLlth23TxcEFJeA2ninZQ539YNFC3cQD3jZNLHIm9yEfUt30IKtbWxkqh3baDhLlJR8Z4TUVXKZEkIWlB3W9YjyDLBwPC8Gwqx8Gwey8Del5HCWi28Z6dxtiCJj6mYwyKZ4-gOHDFAI5dg0c-mvAAArcHsV5rKi2xhV9noNJY9lAZ0FDsmY5jPHczSqir52pqgWDYMQw2jejU0zdjYtlfOoxmIB1G1JUdufL4tL1t07bNtRTj-EyLu9W7HtYF7KNo09mOvXNezvdiQeYUdtbAs2oTkiY5hts8tbJ50PiPDRRJp3gGee8j92PRjL2zfNOMl6bwfmGHm3bVHDWtPZcsy72fiBJUtSfB3XdZ5rXM83zAtC4hou4+L87mDW9SdDZJhkkM3ikXVNsKc2dXydD9MTEmDFnen7ue1vfAAOqCG2CwIKHFeBrAkDpLimIj6l2MubUiLgZYNCZFVRwMZwQQhGhAOABguTM2tPCMAI8PTB3ZAybwK4hgNWhl0RBoxALARZE4EwVVYwqyYpgEhL54EVFSnUIkqoAREmCOTGWAI5YNn+CEakFkO5s29n3eAbo4G3ADG4V+csQjeFJDZKWnwbauUysCAYb9GYf1UqrVm6sbq919tw5a9hXjhgDEEGMjgGrUils2CgnRjTBGor4Mw8ibEOPxncVw1IXBaJ0c0SSu1onOUZAMFytRRjrx-lnRR9iVGj0wi8NsLRfQVCGLZWMmD36Dh8q7TJ2c7FPTCRLaktZ3KKVCP4Kqs92j1jKKMDqTQ1T-FGOEBm+DP7w2-pnYgjT5xyyajWQiAynAuA7F5UZTNxkzMwgQOZ9lOx+BVAMRkNFOkRAiEAA */
  createMachine(calendarMachineConfig, calendarMachineOptions);

const useCalendarService = () => useInterpret(calendarMachine);

const CalendarMachineContext = createContext(
  {} as Interpreter<CalendarContext, CalendarSchema, CalendarEvents>,
);

export const CalendarMachineProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const calendarService = useCalendarService();

  return (
    <CalendarMachineContext.Provider value={calendarService}>
      {children}
    </CalendarMachineContext.Provider>
  );
};

export const useCalendarContext = () => useContext(CalendarMachineContext);

export const useCalendarSelector = <T,>(
  selector: (state: CalendarState) => T,
) => {
  const calendarService = useCalendarContext();
  return useSelector(calendarService, selector) as T;
};

export const useIsOneOrMoreDays = () =>
  useCalendarSelector(
    (state) => state.matches('single') || state.matches('multiple'),
  );

export const useIsFixedDays = () =>
  useCalendarSelector(
    (state) => state.matches('periodic') || state.matches('permanent'),
  );

export const useIsSingle = () =>
  useCalendarSelector((state) => state.matches('single'));

export const useIsMultiple = () =>
  useCalendarSelector((state) => state.matches('multiple'));

export const useIsPeriodic = () =>
  useCalendarSelector((state) => state.matches('periodic'));

export const useIsPermanent = () =>
  useCalendarSelector((state) => state.matches('permanent'));

export const useIsIdle = () =>
  useCalendarSelector((state) => state.matches('idle'));
