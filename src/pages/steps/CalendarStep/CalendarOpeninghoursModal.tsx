import { yupResolver } from '@hookform/resolvers/yup';
import { startOfDay } from 'date-fns';
import uniqueId from 'lodash/uniqueId';
import { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { DayOfWeek } from '@/types/Offer';
import { Alert } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Label, LabelVariants } from '@/ui/Label';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { MultiSelectDropdown } from '@/ui/MultiSelectDropdown';
import { RadioButton, RadioButtonTypes } from '@/ui/RadioButton';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';

import {
  CalendarState,
  createOpeninghoursId,
  useCalendarSelector,
  useIsPeriodic,
} from '../machines/calendarMachine';
import { useCalendarHandlers } from '../machines/useCalendarHandlers';
import { ClosingPeriod, type ClosingPeriodData } from './ClosingPeriod';
import { DeviatingPeriod, type DeviatingPeriodData } from './DeviatingPeriod';

const schema = yup
  .object({
    openingHours: yup.array().of(
      yup
        .object({
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

type OpeningHoursRow = {
  id: string;
  opens: string;
  closes: string;
  dayOfWeek: DayOfWeek[];
  childcareStartTime: string;
  childcareEndTime: string;
};

type FormValues = {
  openingHours: OpeningHoursRow[];
};

type CalendarOpeninghoursModalProps = {
  visible: boolean;
  onClose: () => void;
  onChangeCalendarState: (newSate: CalendarState) => void;
  showChildcare?: boolean;
  onChangeAdjustedDays?: (adjustedDays: DeviatingPeriodData[]) => void;
  initialDeviatingPeriods?: DeviatingPeriodData[];
  onChangeClosingPeriods?: (closingPeriods: ClosingPeriodData[]) => void;
  initialClosingPeriods?: ClosingPeriodData[];
};

const CalendarOpeninghoursModal = ({
  visible,
  onClose,
  onChangeCalendarState,
  showChildcare = true,
  onChangeAdjustedDays,
  initialDeviatingPeriods,
  onChangeClosingPeriods,
  initialClosingPeriods,
}: CalendarOpeninghoursModalProps) => {
  const { t } = useTranslation();

  const { handleChangeOpeningHours } = useCalendarHandlers(
    onChangeCalendarState,
  );

  const savedOpeningHours = useCalendarSelector(
    (state) => state.context.openingHours,
  );
  const isPeriodic = useIsPeriodic();
  const eventStartDate = useCalendarSelector(
    (state) => state.context.startDate,
  );
  const eventEndDate = useCalendarSelector((state) => state.context.endDate);

  const initialOpeningHours =
    savedOpeningHours.length === 0
      ? [
          {
            id: createOpeninghoursId(),
            opens: '00:00',
            closes: '23:59',
            dayOfWeek: [],
            childcareStartTime: '',
            childcareEndTime: '',
          },
        ]
      : savedOpeningHours.map((hours) => ({
          ...hours,
          childcareStartTime: hours.childcareStartTime ?? '',
          childcareEndTime: hours.childcareEndTime ?? '',
        }));

  const {
    formState: { errors },
    handleSubmit,
    control,
    clearErrors,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { openingHours: initialOpeningHours },
  });

  const { replace } = useFieldArray({ control, name: 'openingHours' });
  const openingHours = useWatch({ control, name: 'openingHours' });

  const [childcareEnabledMap, setChildcareEnabledMap] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      savedOpeningHours.map((openingHour) => [
        openingHour.id,
        !!openingHour.childcareStartTime,
      ]),
    ),
  );
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [deviatingPeriods, setDeviatingPeriods] = useState<
    DeviatingPeriodData[]
  >(initialDeviatingPeriods ?? []);
  const [lastEditedPeriodId, setLastEditedPeriodId] = useState<string | null>(
    null,
  );
  const [pendingDeleteDeviatingId, setPendingDeleteDeviatingId] = useState<
    string | null
  >(null);

  const [closingPeriods, setClosingPeriods] = useState<ClosingPeriodData[]>(
    initialClosingPeriods ?? [],
  );
  const [lastEditedClosingPeriodId, setLastEditedClosingPeriodId] = useState<
    string | null
  >(null);
  const [pendingDeleteClosingId, setPendingDeleteClosingId] = useState<
    string | null
  >(null);

  const markTouched = (key: string) =>
    setTouchedFields((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const handleAddOpeningHours = () =>
    replace([
      ...openingHours,
      {
        id: createOpeninghoursId(),
        opens: '00:00',
        closes: '23:59',
        dayOfWeek: [],
        childcareStartTime: '',
        childcareEndTime: '',
      },
    ]);

  const handleRemoveOpeningHours = (idToRemove: string) =>
    replace(
      openingHours.filter((openingHour) => openingHour.id !== idToRemove),
    );

  const handleChangeField = (
    idToChange: string,
    field: 'opens' | 'closes' | 'childcareStartTime' | 'childcareEndTime',
    newTime: string,
  ) =>
    replace(
      openingHours.map((openingHour) =>
        openingHour.id === idToChange
          ? { ...openingHour, [field]: newTime }
          : openingHour,
      ),
    );

  const handleToggleDaysOfWeek = (newDays: string[], idToChange: string) =>
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

  const handleToggleChildcare = (idToChange: string, enabled: boolean) =>
    setChildcareEnabledMap((prev) => ({ ...prev, [idToChange]: enabled }));

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

  const handleAddDeviatingPeriod = () => {
    const today = startOfDay(new Date());
    setDeviatingPeriods((prev) => [
      ...prev,
      {
        id: uniqueId('deviating-period-'),
        startDate: today,
        endDate: today,
        description: {},
        openingHours: [
          {
            id: createOpeninghoursId(),
            opens: '00:00',
            closes: '23:59',
            dayOfWeek: [],
          },
        ],
      },
    ]);
  };

  const handleAddClosingPeriod = () => {
    const today = startOfDay(new Date());
    setClosingPeriods((prev) => [
      ...prev,
      {
        id: uniqueId('closing-period-'),
        startDate: today,
        endDate: today,
        description: {},
      },
    ]);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteDeviatingId) {
      setDeviatingPeriods((prev) =>
        prev.filter((period) => period.id !== pendingDeleteDeviatingId),
      );
      setPendingDeleteDeviatingId(null);
    } else if (pendingDeleteClosingId) {
      setClosingPeriods((prev) =>
        prev.filter((period) => period.id !== pendingDeleteClosingId),
      );
      setPendingDeleteClosingId(null);
    }
  };

  const handleSave = handleSubmit((data) => {
    onChangeAdjustedDays?.(deviatingPeriods);
    onChangeClosingPeriods?.(closingPeriods);
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
  });

  const eventStart =
    isPeriodic && eventStartDate ? new Date(eventStartDate) : undefined;
  const eventEnd =
    isPeriodic && eventEndDate ? new Date(eventEndDate) : undefined;

  const overlapsWithAnotherPeriod = (period: DeviatingPeriodData) =>
    deviatingPeriods.some(
      (other) =>
        other.id !== period.id &&
        period.startDate <= other.endDate &&
        period.endDate >= other.startDate,
    );

  const overlapsWithAnotherClosingPeriod = (period: ClosingPeriodData) =>
    closingPeriods.some(
      (other) =>
        other.id !== period.id &&
        period.startDate <= other.endDate &&
        period.endDate >= other.startDate,
    );

  const hasChildcareErrors = openingHours.some((hours) => {
    if (!childcareEnabledMap[hours.id]) return false;

    const timesMissing = !hours.childcareStartTime || !hours.childcareEndTime;

    const startTooLate =
      !!hours.childcareStartTime && hours.childcareStartTime >= hours.opens;
    const endTooEarly =
      !!hours.childcareEndTime && hours.childcareEndTime <= hours.closes;

    return timesMissing || startTooLate || endTooEarly;
  });

  const hasMissingDaysError = deviatingPeriods.some((period) =>
    period.openingHours.some(
      (openingHour) => openingHour.dayOfWeek.length === 0,
    ),
  );

  const hasDateRangeError = deviatingPeriods.some(
    (period) =>
      (eventStart && period.startDate < eventStart) ||
      (eventEnd && period.endDate > eventEnd),
  );

  const hasOverlapError = deviatingPeriods.some(overlapsWithAnotherPeriod);

  const hasClosingDateRangeError = closingPeriods.some(
    (period) =>
      (eventStart && period.startDate < eventStart) ||
      (eventEnd && period.endDate > eventEnd),
  );

  const hasClosingOverlapError = closingPeriods.some(
    overlapsWithAnotherClosingPeriod,
  );

  // Modal state
  const isDeleteConfirm =
    pendingDeleteDeviatingId !== null || pendingDeleteClosingId !== null;

  const modalTitle = isDeleteConfirm
    ? pendingDeleteDeviatingId
      ? t('create.calendar.opening_hours_modal.deviating.delete_modal.title')
      : t('create.calendar.opening_hours_modal.closing.delete_modal.title')
    : t('create.calendar.opening_hours_modal.title');

  const modalConfirmTitle = isDeleteConfirm
    ? pendingDeleteDeviatingId
      ? t('create.calendar.opening_hours_modal.deviating.delete_modal.confirm')
      : t('create.calendar.opening_hours_modal.closing.delete_modal.confirm')
    : t('create.calendar.opening_hours_modal.button_confirm');

  const modalConfirmVariant = isDeleteConfirm
    ? ButtonVariants.DANGER
    : ButtonVariants.PRIMARY;

  const modalConfirmDisabled =
    !isDeleteConfirm &&
    (hasChildcareErrors ||
      hasMissingDaysError ||
      hasDateRangeError ||
      hasOverlapError ||
      hasClosingDateRangeError ||
      hasClosingOverlapError);

  const handleModalClose = () => {
    if (isDeleteConfirm) {
      setPendingDeleteDeviatingId(null);
      setPendingDeleteClosingId(null);
    } else {
      clearErrors();
      onClose();
    }
  };

  return (
    <Modal
      title={modalTitle}
      visible={visible}
      variant={ModalVariants.QUESTION}
      size={ModalSizes.LG}
      confirmTitle={modalConfirmTitle}
      cancelTitle={t('create.calendar.opening_hours_modal.button_cancel')}
      confirmButtonVariant={modalConfirmVariant}
      confirmButtonDisabled={modalConfirmDisabled}
      onConfirm={isDeleteConfirm ? handleConfirmDelete : handleSave}
      onClose={handleModalClose}
      css={`
        .modal-dialog {
          max-width: min(960px, 95vw);
        }
      `}
    >
      <Stack padding={4} display={isDeleteConfirm ? undefined : 'none'}>
        <Text>
          {pendingDeleteDeviatingId
            ? t(
                'create.calendar.opening_hours_modal.deviating.delete_modal.body',
              )
            : t(
                'create.calendar.opening_hours_modal.closing.delete_modal.body',
              )}
        </Text>
      </Stack>

      <Stack
        spacing={4}
        padding={4}
        alignItems="flex-start"
        display={isDeleteConfirm ? 'none' : undefined}
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
                <Alert css="width: 100%;">
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

        <Accordion
          css={`
            width: 100%;
            .accordion-item {
              border: none;
              border-bottom: 1px solid ${colors.grey3};
            }
            .accordion-button,
            .accordion-body {
              padding-left: 0;
              padding-right: 0;
            }
            .accordion-button:not(.collapsed) {
              background-color: transparent;
              color: inherit;
              box-shadow: none;
            }
          `}
        >
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <Text fontWeight="bold">
                {t('create.calendar.opening_hours_modal.deviating.title')}
              </Text>
            </Accordion.Header>
            <Accordion.Body>
              <Stack spacing={4}>
                {deviatingPeriods.map((period, index) => (
                  <DeviatingPeriod
                    key={period.id}
                    index={index}
                    period={period}
                    onChange={(updated: DeviatingPeriodData) => {
                      setLastEditedPeriodId(updated.id);
                      setDeviatingPeriods((prev) =>
                        prev.map((existing) =>
                          existing.id === updated.id ? updated : existing,
                        ),
                      );
                    }}
                    onRemove={() => setPendingDeleteDeviatingId(period.id)}
                    onQuickLinkExpand={(expanded) =>
                      setDeviatingPeriods((prev) =>
                        prev.flatMap((existing) =>
                          existing.id === period.id ? expanded : [existing],
                        ),
                      )
                    }
                    showChildcare={showChildcare}
                    hasOverlap={
                      period.id === lastEditedPeriodId &&
                      overlapsWithAnotherPeriod(period)
                    }
                    eventStartDate={eventStart}
                    eventEndDate={eventEnd}
                  />
                ))}
                <Button
                  iconName={Icons.PLUS}
                  variant={ButtonVariants.SECONDARY}
                  onClick={handleAddDeviatingPeriod}
                  alignSelf="flex-start"
                >
                  {t(
                    'create.calendar.opening_hours_modal.deviating.add_period',
                  )}
                </Button>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Accordion
          css={`
            width: 100%;
            .accordion-item {
              border: none;
              border-bottom: 1px solid ${colors.grey3};
            }
            .accordion-button,
            .accordion-body {
              padding-left: 0;
              padding-right: 0;
            }
            .accordion-button:not(.collapsed) {
              background-color: transparent;
              color: inherit;
              box-shadow: none;
            }
          `}
        >
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <Text fontWeight="bold">
                {t('create.calendar.opening_hours_modal.closing.title')}
              </Text>
            </Accordion.Header>
            <Accordion.Body>
              <Stack spacing={4}>
                {closingPeriods.map((period, index) => (
                  <ClosingPeriod
                    key={period.id}
                    index={index}
                    period={period}
                    onChange={(updated: ClosingPeriodData) => {
                      setLastEditedClosingPeriodId(updated.id);
                      setClosingPeriods((prev) =>
                        prev.map((existing) =>
                          existing.id === updated.id ? updated : existing,
                        ),
                      );
                    }}
                    onRemove={() => setPendingDeleteClosingId(period.id)}
                    onQuickLinkExpand={(expanded) =>
                      setClosingPeriods((prev) =>
                        prev.flatMap((existing) =>
                          existing.id === period.id ? expanded : [existing],
                        ),
                      )
                    }
                    hasOverlap={
                      period.id === lastEditedClosingPeriodId &&
                      overlapsWithAnotherClosingPeriod(period)
                    }
                    eventStartDate={eventStart}
                    eventEndDate={eventEnd}
                  />
                ))}
                <Button
                  iconName={Icons.PLUS}
                  variant={ButtonVariants.OUTLINED}
                  onClick={handleAddClosingPeriod}
                  alignSelf="flex-start"
                >
                  {t('create.calendar.opening_hours_modal.closing.add_period')}
                </Button>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Modal>
  );
};

export { CalendarOpeninghoursModal };
