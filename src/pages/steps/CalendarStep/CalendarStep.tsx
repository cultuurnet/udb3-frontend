import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import uniqueId from 'lodash/uniqueId';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { CalendarType } from '@/constants/CalendarType';
import { EventTypes, eventTypesWithNoThemes } from '@/constants/EventTypes';
import { OfferStatus } from '@/constants/OfferStatus';
import { OfferTypes } from '@/constants/OfferType';
import {
  useChangeOfferCalendarMutation,
  useGetOfferByIdQuery,
} from '@/hooks/api/offers';
import { useToast } from '@/hooks/useToast';
import {
  Offer,
  OpeningHoursAdjustedDay,
  OpeningHoursClosedDay,
  SubEvent,
} from '@/types/Offer';
import { Values } from '@/types/Values';
import { Panel } from '@/ui/Panel';
import { getStackProps, Stack } from '@/ui/Stack';
import { formatDateToISO } from '@/utils/formatDateToISO';

import { UseEditArguments } from '../hooks/useEditField';
import {
  CalendarContext,
  CalendarState,
  createDayId,
  createOpeninghoursId,
  initialCalendarContext,
  useCalendarContext,
  useCalendarSelector,
  useIsFixedDays,
  useIsIdle,
  useIsOneOrMoreDays,
} from '../machines/calendarMachine';
import { useCalendarHandlers } from '../machines/useCalendarHandlers';
import { FormDataUnion, StepProps, StepsConfiguration } from '../Steps';
import { convertTimeTableToSubEvents } from '../TimeTableStep';
import { CalendarOptionToggle } from './CalendarOptionToggle';
import type { ClosingPeriodData } from './ClosingPeriod';
import type { DeviatingPeriodData } from './DeviatingPeriod';
import { FixedDays } from './FixedDays';
import { OneOrMoreDays } from './OneOrMoreDays';

const preserveBookingAvailability = <
  T extends Pick<SubEvent, 'startDate' | 'bookingAvailability'>,
>(
  subEvents: T[],
  existingSubEvents: SubEvent[],
) => {
  // Match each subEvent to one existing entry by date, so shared dates don't
  // collapse and survivors keep their capacity.
  const unmatched = [...existingSubEvents];

  return subEvents.map((subEvent) => {
    const startDate = new Date(subEvent.startDate).getTime();
    const index = unmatched.findIndex(
      (existing) => new Date(existing.startDate).getTime() === startDate,
    );
    if (index === -1) return subEvent;

    const [{ bookingAvailability }] = unmatched.splice(index, 1);
    return bookingAvailability
      ? { ...subEvent, bookingAvailability }
      : subEvent;
  });
};

const useEditCalendar = ({ offerId, onSuccess }: UseEditArguments) => {
  const queryClient = useQueryClient();
  const changeCalendarMutation = useChangeOfferCalendarMutation({
    onMutate: async ({ id, scope, subEvent, calendarType }) => {
      const queryKey = [scope, { id }];
      await queryClient.cancelQueries({ queryKey });
      const previousOffer = queryClient.getQueryData<Offer>(queryKey);
      // Mirror the new calendar in the cache: calendar types without subEvents
      // (periodic/permanent) clear them, so the reservation UI updates too.
      queryClient.setQueryData<Offer>(queryKey, (offer) =>
        offer
          ? {
              ...offer,
              subEvent: subEvent ?? [],
              ...(calendarType && { calendarType }),
            }
          : offer,
      );
      return { previousOffer };
    },
    onError: (
      _error,
      { id, scope },
      context: { previousOffer?: Offer } | undefined,
    ) => {
      if (context?.previousOffer) {
        queryClient.setQueryData([scope, { id }], context.previousOffer);
      }
    },
    onSuccess: () =>
      onSuccess('calendar', {
        shouldInvalidateEvent: false,
      }),
  });

  return async ({ scope, calendar, timeTable }: FormDataUnion) => {
    const common = {
      id: offerId,
      scope,
    };

    if (timeTable) {
      const subEvent = convertTimeTableToSubEvents(timeTable);

      await changeCalendarMutation.mutateAsync({
        ...common,
        subEvent,
        calendarType:
          subEvent.length > 1 ? CalendarType.MULTIPLE : CalendarType.SINGLE,
      });

      return;
    }

    const existingSubEvents =
      queryClient.getQueryData<Offer>([scope, { id: offerId }])?.subEvent ?? [];

    // Keep each surviving subEvent's capacity across removals (matched on start
    // date), so deleting a date never wipes the others.
    const subEvent = Array.isArray(calendar?.subEvent)
      ? preserveBookingAvailability(calendar.subEvent, existingSubEvents)
      : calendar?.subEvent;

    await changeCalendarMutation.mutateAsync({
      ...common,
      ...calendar,
      ...(subEvent && { subEvent }),
    });
  };
};

const convertOfferToCalendarContext = (offer: Offer) => {
  const initialContext = initialCalendarContext;

  const days = (offer.subEvent ?? []).map((subEvent) => ({
    id: createDayId(),
    startDate: subEvent.startDate,
    endDate: subEvent.endDate,
    status: subEvent.status,
    bookingAvailability: subEvent.bookingAvailability,
    bookingInfo: subEvent.bookingInfo,
    childcareStartTime: subEvent.childcare?.start ?? '',
    childcareEndTime: subEvent.childcare?.end ?? '',
    hasOvernightStay: !!subEvent.overnight,
  }));

  const openingHours = (offer.openingHours ?? []).map((openingHour) => ({
    id: createOpeninghoursId(),
    opens: openingHour.opens,
    closes: openingHour.closes,
    dayOfWeek: openingHour.dayOfWeek,
    childcareStartTime: openingHour.childcare?.start,
    childcareEndTime: openingHour.childcare?.end,
  }));

  const newContext = {
    ...initialContext,
    ...(days.length > 0 && { days }),
    ...(openingHours.length > 0 && { openingHours }),
    ...(offer?.startDate && {
      startDate: offer.startDate,
    }),
    ...(offer?.endDate && {
      endDate: offer.endDate,
    }),
  };

  return { newContext, calendarType: offer.calendarType };
};

const convertStateToFormData = (
  context: CalendarContext,
  calendarType: Values<typeof CalendarType>,
) => {
  if (!context) return undefined;

  const { days, openingHours, startDate, endDate } = context;

  const isOneOrMoreDays = (
    [CalendarType.SINGLE, CalendarType.MULTIPLE] as string[]
  ).includes(calendarType);

  const isFixedDays = (
    [CalendarType.PERIODIC, CalendarType.PERMANENT] as string[]
  ).includes(calendarType);

  const subEvent = days.map((day) => ({
    startDate: formatDateToISO(
      day.startDate ? new Date(day.startDate) : new Date(),
    ),
    endDate: formatDateToISO(day.endDate ? new Date(day.endDate) : new Date()),
    bookingAvailability: day.bookingAvailability,
    status: day.status,
    ...(day.bookingInfo && { bookingInfo: day.bookingInfo }),
    ...((day.childcareStartTime || day.childcareEndTime) && {
      childcare: {
        ...(day.childcareStartTime && { start: day.childcareStartTime }),
        ...(day.childcareEndTime && { end: day.childcareEndTime }),
      },
    }),
    ...(day.hasOvernightStay && { overnight: true }),
  }));

  const newOpeningHours = openingHours.map((openingHour) => ({
    opens: openingHour.opens,
    closes: openingHour.closes,
    dayOfWeek: openingHour.dayOfWeek,
    ...((openingHour.childcareStartTime || openingHour.childcareEndTime) && {
      childcare: {
        ...(openingHour.childcareStartTime && {
          start: openingHour.childcareStartTime,
        }),
        ...(openingHour.childcareEndTime && {
          end: openingHour.childcareEndTime,
        }),
      },
    }),
  }));

  return {
    calendarType,
    ...(isOneOrMoreDays && { subEvent }),
    ...(isFixedDays && { openingHours: newOpeningHours }),
    ...(calendarType === CalendarType.PERIODIC && {
      startDate: formatDateToISO(new Date(startDate)),
      endDate: formatDateToISO(new Date(endDate)),
    }),
  };
};

const convertAdjustedDays = (
  adjustedDays: OpeningHoursAdjustedDay[],
): DeviatingPeriodData[] =>
  adjustedDays.map((day) => ({
    id: uniqueId('deviating-period-'),
    startDate: new Date(day.startDate),
    endDate: new Date(day.endDate),
    description: day.description ?? {},
    openingHours: day.openingHours.map((openingHour) => ({
      id: createOpeninghoursId(),
      ...openingHour,
    })),
  }));

const formatAdjustedDays = (adjustedDays: DeviatingPeriodData[]) =>
  adjustedDays.map(({ openingHours, ...period }) => ({
    startDate: format(period.startDate, 'yyyy-MM-dd'),
    endDate: format(period.endDate, 'yyyy-MM-dd'),
    ...(Object.keys(period.description).length > 0 && {
      description: period.description,
    }),
    openingHours: openingHours.map(
      ({ id: _id, ...openingHour }) => openingHour,
    ),
  }));

const convertClosingDays = (
  closedDays: OpeningHoursClosedDay[],
): ClosingPeriodData[] =>
  closedDays.map((day) => ({
    id: uniqueId('closing-period-'),
    startDate: new Date(day.startDate),
    endDate: new Date(day.endDate),
    description: day.description ?? {},
  }));

const formatClosingDays = (closingPeriods: ClosingPeriodData[]) =>
  closingPeriods.map((period) => ({
    startDate: format(period.startDate, 'yyyy-MM-dd'),
    endDate: format(period.endDate, 'yyyy-MM-dd'),
    ...(Object.keys(period.description).length > 0 && {
      description: period.description,
    }),
  }));

type CalendarInForm = ReturnType<typeof convertStateToFormData>;

type CalendarStepProps = StepProps & { offerId?: string };

const CalendarStep = ({
  offerId,
  control,
  setValue,
  formState: { errors },
  onChange,
  watch,
  ...props
}: CalendarStepProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const calendarStepContainer = useRef(null);

  const [scope, type, theme] = useWatch({
    control,
    name: ['scope', 'typeAndTheme.type', 'typeAndTheme.theme'],
  });

  const calendarService = useCalendarContext();

  const isCultuurkuurEvent =
    scope === OfferTypes.EVENTS &&
    watch('audience.audienceType') === AudienceTypes.EDUCATION;

  const isOneOrMoreDays = useIsOneOrMoreDays();
  const isFixedDays = useIsFixedDays();
  const isIdle = useIsIdle();
  const days = useCalendarSelector((state) => state.context.days);
  const [isCalendarInitialized, setIsCalendarInitialized] = useState(false);

  const hasUnavailableSubEvent = useMemo(
    () => days.some((day) => day.status.type !== OfferStatus.AVAILABLE),
    [days],
  );

  const adjustedDaysRef = useRef<DeviatingPeriodData[]>([]);
  const [adjustedDays, setAdjustedDays] = useState<DeviatingPeriodData[]>([]);

  const closingPeriodsRef = useRef<ClosingPeriodData[]>([]);
  const [closingPeriods, setClosingPeriods] = useState<ClosingPeriodData[]>([]);

  const offerRef = useRef<Offer | undefined>(undefined);

  const handleChangeCalendarState = (newState: CalendarState) => {
    const calendarType = Object.values(CalendarType).find((type) =>
      newState.matches(type),
    );

    const baseFormData = {
      ...convertStateToFormData(newState.context, calendarType),
      ...(adjustedDaysRef.current.length > 0 && {
        openingHoursAdjustedDays: formatAdjustedDays(adjustedDaysRef.current),
      }),
      ...(closingPeriodsRef.current.length > 0 && {
        openingHoursClosedDays: formatClosingDays(closingPeriodsRef.current),
      }),
    };

    const existingSubEvents = offerRef.current?.subEvent;

    // Preserve by index: covers date edits and added days. Removals are handled
    // at PUT time by preserveBookingAvailability (matched on start date).
    const canPreserveReservationData =
      existingSubEvents &&
      Array.isArray(baseFormData.subEvent) &&
      existingSubEvents.length <= baseFormData.subEvent.length;
    const preservedFormData = canPreserveReservationData
      ? {
          ...baseFormData,
          subEvent: baseFormData.subEvent.map((subEvent, index) => {
            const existing = existingSubEvents[index];
            if (!existing) return subEvent;
            const bookingAvailability =
              existing.bookingAvailability ?? subEvent.bookingAvailability;
            return {
              ...subEvent,
              ...(existing.bookingInfo && {
                bookingInfo: existing.bookingInfo,
              }),
              ...(bookingAvailability && { bookingAvailability }),
            };
          }),
        }
      : baseFormData;

    const shouldClearSubEventBookingInfo =
      existingSubEvents &&
      existingSubEvents.length > 1 &&
      Array.isArray(preservedFormData.subEvent) &&
      preservedFormData.subEvent.length === 1;

    const formData = shouldClearSubEventBookingInfo
      ? {
          ...preservedFormData,
          subEvent: preservedFormData.subEvent.map((subEvent) => ({
            ...subEvent,
            bookingInfo: {},
          })),
        }
      : preservedFormData;

    setValue('calendar', formData, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });

    const wasIdle = newState.history ? newState.history.matches('idle') : true;

    if (wasIdle) {
      return;
    }

    onChange(formData);
  };

  const handleChangeAdjustedDays = (newAdjustedDays: DeviatingPeriodData[]) => {
    adjustedDaysRef.current = newAdjustedDays;
    setAdjustedDays(newAdjustedDays);
  };

  const handleChangeClosingPeriods = (
    newClosingPeriods: ClosingPeriodData[],
  ) => {
    closingPeriodsRef.current = newClosingPeriods;
    setClosingPeriods(newClosingPeriods);
  };

  const {
    handleLoadInitialContext,
    handleAddDay,
    handleDeleteDay,
    handleChangeStartDate,
    handleChangeEndDate,
    handleChangeStartDateOfDay,
    handleChangeEndDateOfDay,
    handleChangeStartTime,
    handleChangeEndTime,
    handleChooseOneOrMoreDays,
    handleChooseFixedDays,
    handleChooseWithStartAndEndDate,
    handleChoosePermanent,
    handleChangeOpeningHours,
    handleChangeChildcareStartTime,
    handleChangeChildcareEndTime,
    handleToggleOvernightStay,
  } = useCalendarHandlers(handleChangeCalendarState);

  useEffect(() => {
    calendarService.start();

    return () => {
      calendarService.stop();
    };
  }, [calendarService]);

  useEffect(() => {
    if (offerId) return;

    handleLoadInitialContext({
      ...(scope === OfferTypes.PLACES && {
        calendarType: CalendarType.PERMANENT,
      }),
    });
  }, [handleLoadInitialContext, scope, offerId]);

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: offerId, scope });

  const offer: Offer | undefined = getOfferByIdQuery.data;
  offerRef.current = offer;

  useEffect(() => {
    if (!offer || isCalendarInitialized) return;

    const isOnDuplicatePage = router.pathname.endsWith('/duplicate');

    const { newContext, calendarType } = convertOfferToCalendarContext(offer);
    if (isOnDuplicatePage) {
      newContext.days = newContext.days.map((day) => ({
        ...day,
        bookingAvailability: { type: BookingAvailabilityType.AVAILABLE },
        status: { type: OfferStatus.AVAILABLE },
      }));
    }
    setIsCalendarInitialized(true);
    handleLoadInitialContext({ newContext, calendarType });
    if (offer.openingHoursAdjustedDays?.length) {
      const converted = convertAdjustedDays(offer.openingHoursAdjustedDays);
      adjustedDaysRef.current = converted;
      setAdjustedDays(converted);
    }

    if (offer.openingHoursClosedDays?.length) {
      const converted = convertClosingDays(offer.openingHoursClosedDays);
      closingPeriodsRef.current = converted;
      setClosingPeriods(converted);
    }
  }, [handleLoadInitialContext, offer, router.pathname, isCalendarInitialized]);

  const toast = useToast({
    messages: { calendar: t('create.toast.success.calendar') },
  });

  const scrollToCalendarContainer = () => {
    if (!calendarStepContainer.current) {
      return;
    }

    calendarStepContainer.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  useEffect(() => {
    if (isIdle) return;
    if (scope !== OfferTypes.PLACES) return;

    handleChooseFixedDays();
  }, [scope, isIdle, handleChooseFixedDays]);

  const hasNoPossibleThemes =
    type?.id && eventTypesWithNoThemes.includes(type.id);

  // scroll to calendar step after theme has been selected
  useEffect(() => {
    if (!scope || !type?.id) return;
    if (!theme?.id && !hasNoPossibleThemes && scope === OfferTypes.EVENTS) {
      return;
    }
    if (offerId) return;

    scrollToCalendarContainer();
  }, [scope, offerId, type, theme, hasNoPossibleThemes]);

  return (
    <Stack
      ref={calendarStepContainer}
      spacing={4}
      minWidth={{ l: 'auto', default: '100%' }}
      width={{ l: '100%', default: 'min-content' }}
      {...getStackProps(props)}
    >
      {scope === OfferTypes.EVENTS && (
        <CalendarOptionToggle
          onChooseOneOrMoreDays={handleChooseOneOrMoreDays}
          onChooseFixedDays={handleChooseFixedDays}
          width="100%"
          disableChooseFixedDays={hasUnavailableSubEvent}
          isCultuurkuurEvent={isCultuurkuurEvent}
        />
      )}
      <Panel backgroundColor="white" padding={5}>
        {isFixedDays && (
          <FixedDays
            onChooseWithStartAndEndDate={handleChooseWithStartAndEndDate}
            onChoosePermanent={handleChoosePermanent}
            onChangeStartDate={handleChangeStartDate}
            onChangeEndDate={handleChangeEndDate}
            onChangeOpeningHours={handleChangeOpeningHours}
            onChangeCalendarState={handleChangeCalendarState}
            onChangeAdjustedDays={handleChangeAdjustedDays}
            initialAdjustedDays={adjustedDays}
            onChangeClosingPeriods={handleChangeClosingPeriods}
            initialClosingPeriods={closingPeriods}
          />
        )}
        {isOneOrMoreDays && (
          <OneOrMoreDays
            onDeleteDay={handleDeleteDay}
            onChangeStartDate={handleChangeStartDateOfDay}
            onChangeEndDate={handleChangeEndDateOfDay}
            onChangeStartTime={handleChangeStartTime}
            onChangeEndTime={handleChangeEndTime}
            onChangeChildcareStartTime={handleChangeChildcareStartTime}
            onChangeChildcareEndTime={handleChangeChildcareEndTime}
            onToggleOvernightStay={handleToggleOvernightStay}
            showOvernightStay={type?.id === EventTypes['Kamp of vakantie']}
            onAddDay={handleAddDay}
            errors={errors}
          />
        )}
      </Panel>
      {toast.component}
    </Stack>
  );
};

const calendarStepConfiguration: StepsConfiguration<'calendar'> = {
  Component: CalendarStep,
  name: 'calendar',
  title: ({ t, scope }) => t(`create.calendar.title.${scope}`),
  shouldShowStep: ({ watch }) => {
    return !!watch('typeAndTheme.type.id');
  },
  validation: yup.object().shape({
    subEvent: yup
      .array()
      .test(
        'invalid-hours',
        "Hours weren't valid",
        (subEvent: SubEvent[] | undefined, context) => {
          if (!subEvent) {
            return true;
          }

          const errors = subEvent
            .map((sub, index) => {
              const startDate = new Date(sub.startDate);
              const endDate = new Date(sub.endDate);
              const startTime = startDate.getTime();
              const endTime = endDate.getTime();

              if (startTime > endTime) {
                return context.createError({
                  path: `${context.path}.${index}`,
                  message: 'Invalid times',
                });
              }
            })
            .filter(Boolean);

          return errors.length > 0 ? new yup.ValidationError(errors) : true;
        },
      )
      .test(
        'childcare-times-required',
        'Childcare times must be set when childcare is enabled',
        (subEvent: SubEvent[] | undefined, context) => {
          if (!subEvent) return true;
          const errors = subEvent
            .map((sub, index) => {
              if (!sub.childcare) return undefined;
              if (!sub.childcare.start && !sub.childcare.end) {
                return context.createError({
                  path: `${context.path}.${index}`,
                  message: 'Childcare times required',
                });
              }
            })
            .filter(Boolean);
          return errors.length > 0 ? new yup.ValidationError(errors) : true;
        },
      )
      .test(
        'invalid-childcare-start',
        'Childcare start must be before activity start',
        (subEvent: SubEvent[] | undefined, context) => {
          if (!subEvent) return true;
          const errors = subEvent
            .map((sub, index) => {
              if (!sub.childcare?.start) return undefined;
              const startDate = new Date(sub.startDate);
              const startHHMM = `${startDate
                .getHours()
                .toString()
                .padStart(2, '0')}:${startDate
                .getMinutes()
                .toString()
                .padStart(2, '0')}`;
              if (sub.childcare.start >= startHHMM) {
                return context.createError({
                  path: `${context.path}.${index}`,
                  message: 'Childcare start too late',
                });
              }
            })
            .filter(Boolean);
          return errors.length > 0 ? new yup.ValidationError(errors) : true;
        },
      )
      .test(
        'invalid-childcare-end',
        'Childcare end must be after activity end',
        (subEvent: SubEvent[] | undefined, context) => {
          if (!subEvent) return true;
          const errors = subEvent
            .map((sub, index) => {
              if (!sub.childcare?.end) return undefined;
              const endDate = new Date(sub.endDate);
              const endHHMM = `${endDate
                .getHours()
                .toString()
                .padStart(2, '0')}:${endDate
                .getMinutes()
                .toString()
                .padStart(2, '0')}`;
              if (sub.childcare.end <= endHHMM) {
                return context.createError({
                  path: `${context.path}.${index}`,
                  message: 'Childcare end too early',
                });
              }
            })
            .filter(Boolean);
          return errors.length > 0 ? new yup.ValidationError(errors) : true;
        },
      ),
  }),
};

export type { CalendarInForm };
export {
  CalendarStep,
  calendarStepConfiguration,
  convertStateToFormData,
  useEditCalendar,
};
