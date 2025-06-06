import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeEvent, useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { DayOfWeek } from '@/types/Offer';
import { Button, ButtonVariants } from '@/ui/Button';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { TimeSpanPicker } from '@/ui/TimeSpanPicker';

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
};

const CalendarOpeninghoursModal = ({
  visible,
  onClose,
  onChangeCalendarState,
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

  useEffect(() => {
    if (openinghoursFromStateMachine.length === 0) {
      append({
        id: createOpeninghoursId(),
        opens: '00:00',
        closes: '23:59',
        dayOfWeek: [],
      });
      return;
    }

    replace(openinghoursFromStateMachine);
  }, [openinghoursFromStateMachine, append, replace]);

  const handleAddOpeningHours = () => {
    append({
      id: createOpeninghoursId(),
      opens: '00:00',
      closes: '23:59',
      dayOfWeek: [],
    });
  };

  const handleRemoveOpeningHours = (idToRemove: string) => {
    replace(
      openingHours.filter((openingHour) => openingHour.id !== idToRemove),
    );
  };

  const handleChangeOpens = (idToChange: string, newTime: string) => {
    replace(
      openingHours.map((openingHour) => {
        if (openingHour.id === idToChange) {
          return {
            ...openingHour,
            opens: newTime,
          };
        }
        return openingHour;
      }),
    );
  };

  const handleChangeCloses = (idToChange: string, newTime: string) => {
    replace(
      openingHours.map((openingHour) => {
        if (openingHour.id === idToChange) {
          return {
            ...openingHour,
            closes: newTime,
          };
        }
        return openingHour;
      }),
    );
  };

  const handleToggleDaysOfWeek = (
    event: ChangeEvent<HTMLInputElement>,
    dayOfWeek: DayOfWeek,
    idToChange: string,
  ) => {
    const checked = event.target.checked;

    replace(
      openingHours.map((openingHour) => {
        if (openingHour.id === idToChange && checked) {
          openingHour.dayOfWeek.push(dayOfWeek);
          openingHour.dayOfWeek.sort((a, b) => {
            return DaysOfWeek.indexOf(a) - DaysOfWeek.indexOf(b);
          });
        }
        if (
          openingHour.id === idToChange &&
          !checked &&
          openingHour.dayOfWeek.includes(dayOfWeek)
        ) {
          openingHour.dayOfWeek = openingHour.dayOfWeek.filter(
            (day) => day !== dayOfWeek,
          );
        }
        return openingHour;
      }),
    );
  };

  return (
    <Modal
      title={t('create.calendar.opening_hours_modal.title')}
      visible={visible}
      variant={ModalVariants.QUESTION}
      onClose={onClose}
      confirmTitle={t('create.calendar.opening_hours_modal.button_confirm')}
      cancelTitle={t('create.calendar.opening_hours_modal.button_cancel')}
      size={ModalSizes.LG}
      onConfirm={handleSubmit((data) => {
        handleChangeOpeningHours(data.openingHours);
        onClose();
      })}
    >
      <Stack
        spacing={4}
        padding={4}
        alignItems="flex-start"
        justifyContent="center"
      >
        {openingHours.map((openingHour, index) => (
          <Stack key={openingHour.id} flex={1}>
            <Inline alignItems="flex-end" spacing={5}>
              <Stack spacing={3}>
                <Text fontWeight="bold">
                  {t('create.calendar.opening_hours_modal.days')}
                </Text>
                <Inline spacing={4}>
                  {Object.values(DaysOfWeek).map((dayOfWeek) => (
                    <CheckboxWithLabel
                      key={`${openingHour.id}-${dayOfWeek}`}
                      className="day-of-week-radio"
                      id={`day-of-week-radio-${openingHour.id}-${dayOfWeek}`}
                      name={dayOfWeek}
                      checked={openingHour.dayOfWeek.includes(dayOfWeek)}
                      disabled={false}
                      onToggle={(e) =>
                        handleToggleDaysOfWeek(e, dayOfWeek, openingHour.id)
                      }
                    >
                      {t(`create.calendar.days.short.${dayOfWeek}`)}
                    </CheckboxWithLabel>
                  ))}
                </Inline>
              </Stack>
              <TimeSpanPicker
                spacing={3}
                id={`openinghours-row-timespan-${openingHour.id}`}
                startTime={openingHour.opens}
                endTime={openingHour.closes}
                startTimeLabel={t(
                  'create.calendar.opening_hours_modal.start_time',
                )}
                endTimeLabel={t('create.calendar.opening_hours_modal.end_time')}
                onChangeStartTime={(newStartTime) => {
                  handleChangeOpens(openingHour.id, newStartTime);
                }}
                onChangeEndTime={(newEndTime) => {
                  handleChangeCloses(openingHour.id, newEndTime);
                }}
                minWidth="120px"
              />
              <Button
                iconName={Icons.TRASH}
                variant={ButtonVariants.DANGER}
                onClick={() => handleRemoveOpeningHours(openingHour.id)}
              />
            </Inline>
            {errors.openingHours?.[index]?.dayOfWeek?.type && (
              <Text color="red">
                {t(
                  'create.calendar.opening_hours_modal.validation_messages.day_of_week.min',
                )}
              </Text>
            )}
          </Stack>
        ))}
        <Button
          iconName={Icons.PLUS}
          variant={ButtonVariants.LINK}
          onClick={handleAddOpeningHours}
        >
          {t('create.calendar.opening_hours_modal.button_add')}
        </Button>
      </Stack>
    </Modal>
  );
};

export { CalendarOpeninghoursModal };
