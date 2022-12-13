import { useCallback, useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CalendarType } from '@/constants/CalendarType';
import { OfferStatus } from '@/constants/OfferStatus';
import { OfferType } from '@/constants/OfferType';
import {
  useChangeCalendarMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { useChangeOfferCalendarMutation } from '@/hooks/api/offers';
import { useGetPlaceByIdQuery } from '@/hooks/api/places';
import { useToast } from '@/pages/manage/movies/useToast';
import { Event } from '@/types/Event';
import { Panel } from '@/ui/Panel';
import { getStackProps, Stack } from '@/ui/Stack';
import { Toast } from '@/ui/Toast';

import {
  CalendarState,
  createDayId,
  createOpeninghoursId,
  initialCalendarContext,
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

const useEditCalendar = ({ offerId, onSuccess }) => {
  const changeCalendarMutation = useChangeOfferCalendarMutation({
    onSuccess: () => onSuccess('calendar', { shouldInvalidateEvent: false }),
  });

  return async ({ scope, calendar, timeTable }: FormDataUnion) => {
    const subEvent = convertTimeTableToSubEvents(timeTable);

    await changeCalendarMutation.mutateAsync({
      id: offerId,
      ...calendar,
      ...(timeTable && {
        subEvent,
        calendarType:
          subEvent.length > 1 ? CalendarType.MULTIPLE : CalendarType.SINGLE,
      }),
      scope,
    });
  };
};

const convertStateToFormData = (state: CalendarState) => {
  if (!state) return undefined;

  const { context } = state;
  const { days, openingHours, startDate, endDate } = context;

  const isSingle = state.matches('single');
  const isMultiple = state.matches('multiple');
  const isPeriodic = state.matches('periodic');
  const isPermanent = state.matches('permanent');

  const isOneOrMoreDays = isSingle || isMultiple;
  const isFixedDays = isPeriodic || isPermanent;

  const subEvent = days.map((day) => ({
    startDate: new Date(day.startDate).toISOString(),
    endDate: new Date(day.endDate).toISOString(),
    bookingAvailability: day.bookingAvailability,
    status: day.status,
  }));

  const newOpeningHours = openingHours.map((openingHour) => ({
    opens: openingHour.opens,
    closes: openingHour.closes,
    dayOfWeek: openingHour.dayOfWeek,
  }));

  return {
    ...(isSingle && { calendarType: CalendarType.SINGLE }),
    ...(isMultiple && { calendarType: CalendarType.MULTIPLE }),
    ...(isPeriodic && { calendarType: CalendarType.PERIODIC }),
    ...(isPermanent && { calendarType: CalendarType.PERMANENT }),
    ...(isOneOrMoreDays && { subEvent }),
    ...(isFixedDays && { openingHours: newOpeningHours }),
    ...(isPeriodic && {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    }),
  };
};

type CalendarStepProps = StepProps & { offerId?: string };

const CalendarStep = ({ offerId, control, ...props }: CalendarStepProps) => {
  const { t } = useTranslation();

  const scope = useWatch({ control, name: 'scope' });

  const isOneOrMoreDays = useIsOneOrMoreDays();
  const isFixedDays = useIsFixedDays();
  const isIdle = useIsIdle();

  const calendarStateType = useCalendarSelector((state) => state.value);
  const days = useCalendarSelector((state) => state.context.days);
  const state = useCalendarSelector((state) => state);

  const previousState = useCalendarSelector((state) => state.history?.value);

  const hasUnavailableSubEvent = useMemo(
    () => days.some((day) => day.status.type !== OfferStatus.AVAILABLE),
    [days],
  );

  const {
    handleLoadInitialContext: loadInitialContext,
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
  } = useCalendarHandlers();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLoadInitialContext = useCallback(loadInitialContext, []);

  useEffect(() => {
    if (offerId) return;
    handleLoadInitialContext();
  }, [offerId, handleLoadInitialContext]);

  const useGetOfferByIdQuery =
    scope === OfferType.EVENTS ? useGetEventByIdQuery : useGetPlaceByIdQuery;

  const getEventByIdQuery = useGetOfferByIdQuery({ id: offerId });

  // @ts-expect-error
  const event: Event | undefined = getEventByIdQuery.data;

  useEffect(() => {
    const initialContext = initialCalendarContext;

    if (!event) return;

    const days = (event.subEvent ?? []).map((subEvent) => ({
      id: createDayId(),
      startDate: subEvent.startDate,
      endDate: subEvent.endDate,
      status: subEvent.status,
      bookingAvailability: subEvent.bookingAvailability,
    }));

    const openingHours = (event.openingHours ?? []).map((openingHour) => ({
      id: createOpeninghoursId(),
      opens: openingHour.opens,
      closes: openingHour.closes,
      dayOfWeek: openingHour.dayOfWeek,
    }));

    const newContext = {
      ...initialContext,
      ...(days.length > 0 && { days }),
      ...(openingHours.length > 0 && { openingHours }),
      ...(event && { startDate: event.startDate ?? '' }),
      ...(event && { endDate: event.endDate ?? '' }),
    };

    handleLoadInitialContext(newContext, event.calendarType);
  }, [event, handleLoadInitialContext]);

  const toast = useToast({
    messages: { calendar: t('create.toast.success.calendar') },
    title: '',
  });

  const changeCalendarMutation = useChangeCalendarMutation({
    onSuccess: () => {
      // only trigger toast in edit mode
      if (!offerId) return;
      toast.trigger('calendar');
    },
  });

  const convertedStateToFormData = useMemo(() => {
    if (!state) return;

    return convertStateToFormData(state);
  }, [state]);

  const handleSubmitCalendarMutation = async (isIdle: boolean) => {
    if (isIdle) return;

    const formData = convertedStateToFormData;

    const calendarType =
      typeof calendarStateType === 'string'
        ? calendarStateType
        : Object.keys(calendarStateType)[0];

    await changeCalendarMutation.mutateAsync({
      id: offerId,
      calendarType,
      ...formData,
    });
  };

  const handleSubmitCalendarMutationCallback = useCallback(
    handleSubmitCalendarMutation,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calendarStateType, convertedStateToFormData, offerId],
  );

  useEffect(() => {
    if (!offerId) return;
    if (isIdle) return;
    if (previousState === 'idle') return;

    handleSubmitCalendarMutationCallback(isIdle);
  }, [offerId, handleSubmitCalendarMutationCallback, isIdle, previousState]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChooseFixedDaysCallback = useCallback(handleChooseFixedDays, []);

  useEffect(() => {
    if (isIdle) return;
    if (scope !== OfferType.PLACES) return;

    handleChooseFixedDaysCallback();
  }, [scope, isIdle, handleChooseFixedDaysCallback]);

  return (
    <Stack
      spacing={4}
      maxWidth={{ l: '100%', default: '50%' }}
      {...getStackProps(props)}
    >
      {scope === OfferType.EVENTS && (
        <CalendarOptionToggle
          onChooseOneOrMoreDays={handleChooseOneOrMoreDays}
          onChooseFixedDays={handleChooseFixedDays}
          width="100%"
          disableChooseFixedDays={hasUnavailableSubEvent}
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
          />
        )}
      </Panel>
      <Toast
        variant="success"
        header={toast.header}
        body={toast.message}
        visible={!!toast.message}
        onClose={() => toast.clear()}
      />
    </Stack>
  );
};

const calendarStepConfiguration: StepsConfiguration = {
  // eslint-disable-next-line react/display-name
  Component: (props) => <CalendarStep {...props} />,
  name: 'calendar',
  title: ({ t }) => t('create.calendar.title'),
  shouldShowStep: ({ watch }) => {
    return !!watch('typeAndTheme.type.id');
  },
};

export {
  CalendarStep,
  calendarStepConfiguration,
  convertStateToFormData,
  useEditCalendar,
};
