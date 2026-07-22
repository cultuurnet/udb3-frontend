import { startOfDay } from 'date-fns';
import uniqueId from 'lodash/uniqueId';
import { useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { DayOfWeek } from '@/types/Offer';
import { Accordion } from '@/ui/Accordion';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { MultiSelectDropdown } from '@/ui/MultiSelectDropdown';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';

import {
  getOpeningHoursErrorIds,
  getOverlappingDays,
  hasPeriodOverlap,
  isOpeningHoursConfirmDisabled,
  type RegularHoursFormData,
  type RegularHoursRow,
} from '../../../utils/validateOpeningHours';
import {
  CalendarState,
  createOpeninghoursId,
  useCalendarSelector,
  useIsPeriodic,
} from '../machines/calendarMachine';
import { useCalendarHandlers } from '../machines/useCalendarHandlers';
import { ChildcareTimeFields, getChildcareErrors } from './ChildcareTimeFields';
import { ClosingPeriod, type ClosingPeriodData } from './ClosingPeriod';
import { DeviatingPeriod, type DeviatingPeriodData } from './DeviatingPeriod';
import { sortPeriods } from './sortPeriods';

type CalendarOpeninghoursModalProps = {
  visible: boolean;
  onClose: () => void;
  onChangeCalendarState: (newSate: CalendarState) => void;
  showChildcare?: boolean;
  onChangeAdjustedDays: (adjustedDays: DeviatingPeriodData[]) => void;
  initialDeviatingPeriods?: DeviatingPeriodData[];
  onChangeClosingPeriods: (closingPeriods: ClosingPeriodData[]) => void;
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

  const initialOpeningHours: RegularHoursRow[] =
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

  const { control, getValues } = useForm<RegularHoursFormData>({
    defaultValues: { openingHours: initialOpeningHours },
  });

  const { append, remove, update } = useFieldArray({
    control,
    name: 'openingHours',
  });
  const openingHours = useWatch({ control, name: 'openingHours' });

  const findOpeningHourIndex = (id: string) =>
    openingHours.findIndex((openingHour) => openingHour.id === id);

  const [deviatingPeriods, setDeviatingPeriods] = useState<
    DeviatingPeriodData[]
  >(sortPeriods(initialDeviatingPeriods ?? []));
  const [pendingDelete, setPendingDelete] = useState<{
    kind: 'deviating' | 'closing';
    id: string;
  } | null>(null);

  const [closingPeriods, setClosingPeriods] = useState<ClosingPeriodData[]>(
    sortPeriods(initialClosingPeriods ?? []),
  );
  const [shownErrorIds, setShownErrorIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const modalContentRef = useRef<HTMLElement>(null);

  const handleAddOpeningHours = () =>
    append({
      id: createOpeninghoursId(),
      opens: '00:00',
      closes: '23:59',
      dayOfWeek: [],
      childcareStartTime: '',
      childcareEndTime: '',
    });

  const handleRemoveOpeningHours = (idToRemove: string) => {
    const index = findOpeningHourIndex(idToRemove);
    if (index !== -1) remove(index);
  };

  const handleChangeField = (
    idToChange: string,
    field: 'opens' | 'closes' | 'childcareStartTime' | 'childcareEndTime',
    newTime: string,
  ) => {
    const index = findOpeningHourIndex(idToChange);
    if (index !== -1)
      update(index, { ...getValues('openingHours')[index], [field]: newTime });
  };

  const handleToggleDaysOfWeek = (newDays: string[], idToChange: string) => {
    const index = findOpeningHourIndex(idToChange);
    if (index !== -1)
      update(index, {
        ...getValues('openingHours')[index],
        dayOfWeek: [...newDays].sort(
          (a, b) =>
            DaysOfWeek.indexOf(a as DayOfWeek) -
            DaysOfWeek.indexOf(b as DayOfWeek),
        ) as DayOfWeek[],
      });
  };

  const handleAddDeviatingPeriod = () => {
    const today = startOfDay(new Date());
    setDeviatingPeriods((prev) => [
      ...prev,
      {
        id: uniqueId('deviating-period-'),
        startDate: eventStart ?? today,
        endDate: eventStart ?? today,
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
        startDate: eventStart ?? today,
        endDate: eventStart ?? today,
        description: {},
      },
    ]);
  };

  const handleConfirmDelete = () => {
    if (pendingDelete?.kind === 'deviating') {
      setDeviatingPeriods((prev) =>
        prev.filter((period) => period.id !== pendingDelete.id),
      );
    } else if (pendingDelete?.kind === 'closing') {
      setClosingPeriods((prev) =>
        prev.filter((period) => period.id !== pendingDelete.id),
      );
    }
    setPendingDelete(null);
  };

  const eventStart =
    isPeriodic && eventStartDate ? new Date(eventStartDate) : undefined;
  const eventEnd =
    isPeriodic && eventEndDate ? new Date(eventEndDate) : undefined;

  const isDeleteConfirm = pendingDelete !== null;
  const daysWithTimeConflict = getOverlappingDays(openingHours);

  const isConfirmDisabled = isOpeningHoursConfirmDisabled({
    isDeleteConfirm,
    regularHours: openingHours,
    deviatingPeriods,
    shownErrorIds,
    eventStart,
    eventEnd,
    closingPeriods,
  });

  const handleSave = () => {
    onChangeAdjustedDays(deviatingPeriods);
    onChangeClosingPeriods(closingPeriods);
    handleChangeOpeningHours(
      openingHours.map((hour) => ({
        ...hour,
        childcareStartTime: hour.childcareStartTime || undefined,
        childcareEndTime: hour.childcareEndTime || undefined,
      })),
    );
    setShownErrorIds(new Set());
    onClose();
  };

  const handleSaveAttempt = () => {
    const errorIds = getOpeningHoursErrorIds({
      regularHours: openingHours,
      deviatingPeriods,
      eventStart,
      eventEnd,
      closingPeriods,
    });
    if (errorIds.size) {
      setShownErrorIds(errorIds);
      modalContentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      handleSave();
    }
  };

  const modalTitle = isDeleteConfirm
    ? pendingDelete?.kind === 'deviating'
      ? t('create.calendar.opening_hours_modal.deviating.delete_modal.title')
      : t('create.calendar.opening_hours_modal.closing.delete_modal.title')
    : t('create.calendar.opening_hours_modal.title_add_hours');

  const modalConfirmTitle = isDeleteConfirm
    ? pendingDelete?.kind === 'deviating'
      ? t('create.calendar.opening_hours_modal.deviating.delete_modal.confirm')
      : t('create.calendar.opening_hours_modal.closing.delete_modal.confirm')
    : t('create.calendar.opening_hours_modal.button_confirm');

  const modalConfirmVariant = isDeleteConfirm
    ? ButtonVariants.DANGER
    : ButtonVariants.PRIMARY;

  const handleModalClose = () => {
    if (isDeleteConfirm) {
      setPendingDelete(null);
    } else {
      setShownErrorIds(new Set());
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
      confirmButtonDisabled={isConfirmDisabled}
      onConfirm={isDeleteConfirm ? handleConfirmDelete : handleSaveAttempt}
      onClose={handleModalClose}
      css={`
        .modal-dialog {
          max-width: 58rem;
        }
      `}
    >
      <Stack padding={4} display={isDeleteConfirm ? undefined : 'none'}>
        <Text>
          {pendingDelete?.kind === 'deviating'
            ? t(
                'create.calendar.opening_hours_modal.deviating.delete_modal.body',
              )
            : t(
                'create.calendar.opening_hours_modal.closing.delete_modal.body',
              )}
        </Text>
      </Stack>

      <Stack
        ref={modalContentRef}
        spacing={4}
        padding={4}
        alignItems="flex-start"
        display={isDeleteConfirm ? 'none' : undefined}
      >
        {isConfirmDisabled && (
          <Alert variant={AlertVariants.DANGER}>
            {t(
              'create.calendar.opening_hours_modal.validation_messages.errors',
            )}
          </Alert>
        )}
        {openingHours.map((openingHour) => {
          const { startError, endError } = getChildcareErrors(t, {
            childcareStartTime: openingHour.childcareStartTime,
            childcareEndTime: openingHour.childcareEndTime,
            activityStart: openingHour.opens,
            activityEnd: openingHour.closes,
          });

          return (
            <Stack key={openingHour.id} flex={1} spacing={4}>
              <Inline
                alignItems="flex-end"
                spacing={5}
                marginBottom={showChildcare ? 4 : undefined}
              >
                <Stack spacing={3}>
                  <Text fontWeight="bold">
                    {t('create.calendar.opening_hours_modal.days')}
                  </Text>
                  <MultiSelectDropdown
                    id={`day-of-week-${openingHour.id}`}
                    options={Object.values(DaysOfWeek).map((day) => ({
                      value: day,
                      label: t(`create.calendar.days.short.${day}`),
                    }))}
                    selectedValues={openingHour.dayOfWeek as DayOfWeek[]}
                    placeholder={t(
                      'create.calendar.opening_hours_modal.select_days',
                    )}
                    onChange={(newDays) =>
                      handleToggleDaysOfWeek(newDays, openingHour.id)
                    }
                    width="15rem"
                    hasError={
                      shownErrorIds.has(openingHour.id) &&
                      openingHour.dayOfWeek.length === 0
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
                  <ChildcareTimeFields
                    idPrefix={`openinghours-${openingHour.id}`}
                    startTime={openingHour.childcareStartTime}
                    endTime={openingHour.childcareEndTime}
                    onChangeStartTime={(newTime) =>
                      handleChangeField(
                        openingHour.id,
                        'childcareStartTime',
                        newTime,
                      )
                    }
                    onChangeEndTime={(newTime) =>
                      handleChangeField(
                        openingHour.id,
                        'childcareEndTime',
                        newTime,
                      )
                    }
                  />
                )}
                {openingHours.length > 1 && (
                  <Button
                    iconName={Icons.TRASH}
                    variant={ButtonVariants.DANGER}
                    onClick={() => handleRemoveOpeningHours(openingHour.id)}
                  />
                )}
              </Inline>
              {shownErrorIds.has(openingHour.id) &&
                openingHour.dayOfWeek.length === 0 && (
                  <Text color="red">
                    {t(
                      'create.calendar.opening_hours_modal.validation_messages.day_of_week.min',
                    )}
                  </Text>
                )}
              {openingHour.closes < openingHour.opens && (
                <Text color="red">
                  {t('create.calendar.days.validation_messages.invalid_hours')}
                </Text>
              )}
              {startError && <Text color="red">{startError}</Text>}
              {endError && <Text color="red">{endError}</Text>}
            </Stack>
          );
        })}
        {daysWithTimeConflict.length > 0 && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.validation_messages.overlapping_days',
              {
                days: daysWithTimeConflict
                  .map((day) => t(`create.calendar.days.full.${day}`))
                  .join(', '),
              },
            )}
          </Text>
        )}
        <Button
          iconName={Icons.PLUS}
          variant={ButtonVariants.OUTLINED}
          onClick={handleAddOpeningHours}
        >
          {t('create.calendar.opening_hours_modal.button_add_hours')}
        </Button>

        <Accordion>
          <Accordion.Item
            eventKey="deviating"
            title={t('create.calendar.opening_hours_modal.deviating.title')}
            spacing={4}
          >
            {deviatingPeriods.map((period, index) => (
              <DeviatingPeriod
                key={period.id}
                index={index}
                period={period}
                onChange={(updated: DeviatingPeriodData) => {
                  setDeviatingPeriods((prev) =>
                    prev.map((existing) =>
                      existing.id === updated.id ? updated : existing,
                    ),
                  );
                }}
                onRemove={() =>
                  setPendingDelete({ kind: 'deviating', id: period.id })
                }
                onQuickLinkExpand={(expanded) =>
                  setDeviatingPeriods((prev) =>
                    prev.flatMap((existing) =>
                      existing.id === period.id ? expanded : [existing],
                    ),
                  )
                }
                showChildcare={showChildcare}
                hasOverlap={
                  period.openingHours.some((openingHour) =>
                    shownErrorIds.has(openingHour.id),
                  ) &&
                  hasPeriodOverlap(period, deviatingPeriods.slice(0, index))
                }
                hasInvalidDateOrder={
                  period.openingHours.some((openingHour) =>
                    shownErrorIds.has(openingHour.id),
                  ) && period.startDate > period.endDate
                }
                daysWithTimeConflict={getOverlappingDays(period.openingHours)}
                eventStartDate={eventStart}
                eventEndDate={eventEnd}
                shownErrorIds={shownErrorIds}
              />
            ))}
            <Button
              iconName={Icons.PLUS}
              variant={ButtonVariants.NEUTRAL}
              onClick={handleAddDeviatingPeriod}
              className="tw:self-start"
            >
              {t('create.calendar.opening_hours_modal.deviating.add_period')}
            </Button>
          </Accordion.Item>

          <Accordion.Item
            eventKey="closing"
            title={t('create.calendar.opening_hours_modal.closing.title')}
            spacing={4}
          >
            {closingPeriods.map((period, index) => (
              <ClosingPeriod
                key={period.id}
                index={index}
                period={period}
                onChange={(updated: ClosingPeriodData) => {
                  setClosingPeriods((prev) =>
                    prev.map((existing) =>
                      existing.id === updated.id ? updated : existing,
                    ),
                  );
                }}
                onRemove={() =>
                  setPendingDelete({ kind: 'closing', id: period.id })
                }
                onQuickLinkExpand={(expanded) =>
                  setClosingPeriods((prev) =>
                    prev.flatMap((existing) =>
                      existing.id === period.id ? expanded : [existing],
                    ),
                  )
                }
                hasOverlap={
                  shownErrorIds.has(period.id) &&
                  hasPeriodOverlap(period, closingPeriods.slice(0, index))
                }
                hasInvalidDateOrder={
                  shownErrorIds.has(period.id) &&
                  period.startDate > period.endDate
                }
                eventStartDate={eventStart}
                eventEndDate={eventEnd}
              />
            ))}
            <Button
              iconName={Icons.PLUS}
              variant={ButtonVariants.NEUTRAL}
              onClick={handleAddClosingPeriod}
              className="tw:self-start"
            >
              {t('create.calendar.opening_hours_modal.closing.add_period')}
            </Button>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Modal>
  );
};

export { CalendarOpeninghoursModal };
