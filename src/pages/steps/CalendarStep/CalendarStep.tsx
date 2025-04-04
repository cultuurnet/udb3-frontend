import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { CalendarType } from '@/constants/CalendarType';
import { eventTypesWithNoThemes } from '@/constants/EventTypes';
import { OfferStatus } from '@/constants/OfferStatus';
import { OfferTypes } from '@/constants/OfferType';
import {
  useChangeOfferCalendarMutation,
  useGetOfferByIdQuery,
} from '@/hooks/api/offers';
import { useToast } from '@/pages/manage/movies/useToast';
import { Offer, SubEvent } from '@/types/Offer';
import { Values } from '@/types/Values';
import { Panel } from '@/ui/Panel';
import { getStackProps, Stack } from '@/ui/Stack';
import { Toast } from '@/ui/Toast';
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
import { FixedDays } from './FixedDays';
import { OneOrMoreDays } from './OneOrMoreDays';

const useEditCalendar = ({ offerId, onSuccess }: UseEditArguments) => {
  const changeCalendarMutation = useChangeOfferCalendarMutation({
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

    await changeCalendarMutation.mutateAsync({
      ...common,
      ...calendar,
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
  }));

  const openingHours = (offer.openingHours ?? []).map((openingHour) => ({
    id: createOpeninghoursId(),
    opens: openingHour.opens,
    closes: openingHour.closes,
    dayOfWeek: openingHour.dayOfWeek,
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
  }));

  const newOpeningHours = openingHours.map((openingHour) => ({
    opens: openingHour.opens,
    closes: openingHour.closes,
    dayOfWeek: openingHour.dayOfWeek,
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

  const handleChangeCalendarState = (newState: CalendarState) => {
    const calendarType = Object.values(CalendarType).find((type) =>
      newState.matches(type),
    );

    const formData = convertStateToFormData(newState.context, calendarType);

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
      minWidth={{ l: 'auto', default: '60rem' }}
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
          />
        )}
        {isOneOrMoreDays && (
          <OneOrMoreDays
            onDeleteDay={handleDeleteDay}
            onChangeStartDate={handleChangeStartDateOfDay}
            onChangeEndDate={handleChangeEndDateOfDay}
            onChangeStartTime={handleChangeStartTime}
            onChangeEndTime={handleChangeEndTime}
            onAddDay={handleAddDay}
            errors={errors}
          />
        )}
      </Panel>
      <Toast
        variant="success"
        body={toast.message}
        visible={!!toast.message}
        onClose={() => toast.clear()}
      />
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
