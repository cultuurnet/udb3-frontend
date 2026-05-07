import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { DayOfWeek } from '@/types/Offer';
import { Alert } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { MultiSelectDropdown } from '@/ui/MultiSelectDropdown';
import { Label, LabelVariants } from '@/ui/Label';
import { RadioButton, RadioButtonTypes } from '@/ui/RadioButton';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';
import { colors } from '@/ui/theme';

import {
  CalendarState,
  createOpeninghoursId,
  useCalendarSelector,
} from '../machines/calendarMachine';
import { useCalendarHandlers } from '../machines/useCalendarHandlers';

const schema = yup
  .object({
    openingHours: yup.array().of(
      yup
        .object({
          id: yup.string().required(),
          closes: yup.string().required(),
          opens: yup.string().required(),
          dayOfWeek: yup
            .array()
            .of(yup.mixed<DayOfWeek>().oneOf(Object.values(DaysOfWeek)))
            .min(1),
          childcareStartTime: yup.string(),
          childcareEndTime: yup.string(),
        })
        .required(),
    ),
  } as const)
  .required();

type FormData = yup.InferType<typeof schema>;

type CalendarOpeninghoursModalProps = {
  visible: boolean;
  onClose: () => void;
  onChangeCalendarState: (newSate: CalendarState) => void;
  showChildcare?: boolean;
};

const CalendarOpeninghoursModal = ({
  visible,
  onClose,
  onChangeCalendarState,
  showChildcare = true,
}: CalendarOpeninghoursModalProps) => {
  const { t } = useTranslation();

  const { handleChangeOpeningHours } = useCalendarHandlers(
    onChangeCalendarState,
  );

  const openinghoursFromStateMachine = useCalendarSelector(
    (state) => state.context.openingHours,
  );

  const {
    formState: { errors },
    handleSubmit,
    control,
    clearErrors,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      openingHours: [],
    },
  });

  const { replace, append } = useFieldArray({
    control,
    name: 'openingHours',
  });
  const openingHours = useWatch({ control, name: 'openingHours' });
  const [childcareEnabledMap, setChildcareEnabledMap] = useState<
    Record<string, boolean>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );

  const markTouched = (key: string) =>
    setTouchedFields((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  useEffect(() => {
    if (openinghoursFromStateMachine.length === 0) {
      const id = createOpeninghoursId();
      append({
        id,
        opens: '00:00',
        closes: '23:59',
        dayOfWeek: [],
        childcareStartTime: '',
        childcareEndTime: '',
      });
      return;
    }

    replace(
      openinghoursFromStateMachine.map((hours) => ({
        ...hours,
        childcareStartTime: hours.childcareStartTime ?? '',
        childcareEndTime: hours.childcareEndTime ?? '',
      })),
    );
    setChildcareEnabledMap(
      Object.fromEntries(
        openinghoursFromStateMachine.map((hours) => [
          hours.id,
          !!hours.childcareStartTime,
        ]),
      ),
    );
  }, [openinghoursFromStateMachine, append, replace]);

  const handleAddOpeningHours = () => {
    const id = createOpeninghoursId();
    append({
      id,
      opens: '00:00',
      closes: '23:59',
      dayOfWeek: [],
      childcareStartTime: '',
      childcareEndTime: '',
    });
  };

  const handleToggleChildcare = (idToChange: string, enabled: boolean) => {
    setChildcareEnabledMap((prev) => ({ ...prev, [idToChange]: enabled }));
  };

  const handleChangeField = (
    idToChange: string,
    field: 'opens' | 'closes' | 'childcareStartTime' | 'childcareEndTime',
    newTime: string,
  ) =>
    replace(
      openingHours.map((h) =>
        h.id === idToChange ? { ...h, [field]: newTime } : h,
      ),
    );

  const handleRemoveOpeningHours = (idToRemove: string) => {
    replace(
      openingHours.filter((openingHour) => openingHour.id !== idToRemove),
    );
  };

  const handleToggleDaysOfWeek = (
    newDays: string[],
    idToChange: string,
  ) => {
    replace(
      openingHours.map((openingHour) =>
        openingHour.id === idToChange
          ? {
              ...openingHour,
              dayOfWeek: [...newDays].sort(
                (a, b) =>
                  DaysOfWeek.indexOf(a as DayOfWeek) -
                  DaysOfWeek.indexOf(b as DayOfWeek),
              ) as DayOfWeek[],
            }
          : openingHour,
      ),
    );
  };

  const getChildcareRowState = (
    openingHour: (typeof openingHours)[number],
    childcareEnabled: boolean,
  ) => {
    const startTouched =
      touchedFields[`${openingHour.id}-start`] &&
      !!openingHour.childcareStartTime;
    const endTouched =
      touchedFields[`${openingHour.id}-end`] && !!openingHour.childcareEndTime;
    return {
      timesMissing:
        childcareEnabled &&
        (!openingHour.childcareStartTime || !openingHour.childcareEndTime),
      startError:
        childcareEnabled &&
        startTouched &&
        openingHour.childcareStartTime >= openingHour.opens
          ? t(
              'create.calendar.days.childcare.validation_messages.start_too_late',
            )
          : undefined,
      endError:
        childcareEnabled &&
        endTouched &&
        openingHour.childcareEndTime <= openingHour.closes
          ? t(
              'create.calendar.days.childcare.validation_messages.end_too_early',
            )
          : undefined,
    };
  };

  const hasChildcareErrors = openingHours.some((hours) => {
    if (!childcareEnabledMap[hours.id]) return false;

    const timesMissing =
      !hours.childcareStartTime || !hours.childcareEndTime;

    const startTooLate =
      !!hours.childcareStartTime &&
      hours.childcareStartTime >= hours.opens;
    const endTooEarly =
      !!hours.childcareEndTime &&
      hours.childcareEndTime <= hours.closes;

    return timesMissing || startTooLate || endTooEarly;
  });

  return (
    <Modal
      title={t('create.calendar.opening_hours_modal.title')}
      visible={visible}
      variant={ModalVariants.QUESTION}
      onClose={() => {
        clearErrors();
        onClose();
      }}
      confirmTitle={t('create.calendar.opening_hours_modal.button_confirm')}
      cancelTitle={t('create.calendar.opening_hours_modal.button_cancel')}
      size={ModalSizes.LG}
      confirmButtonDisabled={hasChildcareErrors}
      onConfirm={handleSubmit((data) => {
        handleChangeOpeningHours(
          data.openingHours.map((hour) => ({
            ...hour,
            childcareStartTime: childcareEnabledMap[hour.id]
              ? hour.childcareStartTime
              : undefined,
            childcareEndTime: childcareEnabledMap[hour.id]
              ? hour.childcareEndTime
              : undefined,
          })),
        );
        onClose();
      })}
    >
      <Stack
        spacing={4}
        padding={4}
        alignItems="flex-start"
        justifyContent="center"
      >
        {openingHours.map((openingHour, index) => {
          const childcareEnabled = childcareEnabledMap[openingHour.id] ?? false;
          const { timesMissing, startError, endError } = getChildcareRowState(
            openingHour,
            childcareEnabled,
          );

          return (
            <Stack key={openingHour.id} flex={1} spacing={4}>
              <Inline alignItems="flex-end" spacing={5}>
                <Stack spacing={3}>
                  <Text fontWeight="bold">
                    {t('create.calendar.opening_hours_modal.days')}
                  </Text>
                  <MultiSelectDropdown
                    id={`day-of-week-${openingHour.id}`}
                    options={Object.values(DaysOfWeek).map((day) => ({
                      value: day,
                      label: t(`create.calendar.days.full.${day}`),
                    }))}
                    selectedValues={openingHour.dayOfWeek as DayOfWeek[]}
                    placeholder={t(
                      'create.calendar.opening_hours_modal.select_days',
                    )}
                    onChange={(newDays) =>
                      handleToggleDaysOfWeek(newDays, openingHour.id)
                    }
                  />
                </Stack>
                <Stack spacing={3}>
                  <Text fontWeight="bold">
                    {t('create.calendar.opening_hours_modal.hours')}
                  </Text>
                  <TimeSpanPicker
                    id={`openinghours-row-timespan-${openingHour.id}`}
                    startTime={openingHour.opens}
                    endTime={openingHour.closes}
                    startTimeLabel={t(
                      'create.calendar.opening_hours_modal.start_time',
                    )}
                    endTimeLabel={t(
                      'create.calendar.opening_hours_modal.end_time',
                    )}
                    onChangeStartTime={(newTime) =>
                      handleChangeField(openingHour.id, 'opens', newTime)
                    }
                    onChangeEndTime={(newTime) =>
                      handleChangeField(openingHour.id, 'closes', newTime)
                    }
                    labelPosition={TimeSpanPickerLabelPositions.INLINE}
                  />
                </Stack>
                {showChildcare && (
                  <Stack spacing={3}>
                    <Inline
                      alignItems="center"
                      css={`
                        gap: 0.5rem;
                        .form-switch {
                          font-size: 0.85rem;
                        }
                      `}
                    >
                      <RadioButton
                        id={`openinghours-childcare-toggle-${openingHour.id}`}
                        type={RadioButtonTypes.SWITCH}
                        color={colors.udbMainPositiveGreen}
                        checked={childcareEnabled}
                        onChange={(e) =>
                          handleToggleChildcare(
                            openingHour.id,
                            e.target.checked,
                          )
                        }
                      />
                      <Label
                        variant={LabelVariants.BOLD}
                        htmlFor={`openinghours-childcare-toggle-${openingHour.id}`}
                      >
                        {t('create.calendar.days.childcare.label')}
                      </Label>
                    </Inline>
                    <TimeSpanPicker
                      id={`openinghours-childcare-timespan-${openingHour.id}`}
                      startTime={openingHour.childcareStartTime}
                      endTime={openingHour.childcareEndTime}
                      startTimeLabel={t('create.calendar.days.childcare.from')}
                      endTimeLabel={t('create.calendar.days.childcare.to')}
                      onChangeStartTime={(newTime) => {
                        markTouched(`${openingHour.id}-start`);
                        handleChangeField(
                          openingHour.id,
                          'childcareStartTime',
                          newTime,
                        );
                      }}
                      onChangeEndTime={(newTime) => {
                        markTouched(`${openingHour.id}-end`);
                        handleChangeField(
                          openingHour.id,
                          'childcareEndTime',
                          newTime,
                        );
                      }}
                      labelPosition={TimeSpanPickerLabelPositions.INLINE}
                      disabled={!childcareEnabled}
                    />
                  </Stack>
                )}
                {openingHours.length > 1 && (
                  <Button
                    iconName={Icons.TRASH}
                    variant={ButtonVariants.DANGER}
                    onClick={() => handleRemoveOpeningHours(openingHour.id)}
                  />
                )}
              </Inline>
              {errors.openingHours?.[index]?.dayOfWeek?.type && (
                <Text color="red">
                  {t(
                    'create.calendar.opening_hours_modal.validation_messages.day_of_week.min',
                  )}
                </Text>
              )}
              {timesMissing && (
                <Alert
                  css={`
                    width: 100%;
                  `}
                >
                  {t(
                    'create.calendar.days.childcare.validation_messages.set_times_required',
                  )}
                </Alert>
              )}
              {startError && <Text color="red">{startError}</Text>}
              {endError && <Text color="red">{endError}</Text>}
            </Stack>
          );
        })}
        <Button
          iconName={Icons.PLUS}
          variant={ButtonVariants.OUTLINED}
          onClick={handleAddOpeningHours}
        >
          {t('create.calendar.opening_hours_modal.button_add_hours')}
        </Button>
      </Stack>
    </Modal>
  );
};

export { CalendarOpeninghoursModal };
