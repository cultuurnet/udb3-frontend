import { camelCase } from 'lodash';
import { FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { OfferStatus } from '@/constants/OfferStatus';
import { useHolidaysWithToggle } from '@/hooks/api/holidays';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonSizes, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Label, LabelVariants } from '@/ui/Label';
import { List } from '@/ui/List';
import { RadioButton, RadioButtonTypes } from '@/ui/RadioButton';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';

import {
  useCalendarSelector,
  useIsOneOrMoreDays,
} from '../machines/calendarMachine';
import { FormDataUnion } from '../Steps';

type ChangeTimeHandler = (id: string, hours: number, minutes: number) => void;

const createChangeTimeHandler =
  (id: string, changeTimeHandler: ChangeTimeHandler) => (newValue: string) => {
    const [hours, minutes] = newValue.split(':');
    changeTimeHandler(id, parseInt(hours), parseInt(minutes));
  };

const getEndTime = (day: any) => {
  const end = new Date(day.endDate);
  const endHour = end.getHours().toString().padStart(2, '0');
  const endMinutes = end.getMinutes().toString().padStart(2, '0');
  const endTime = endHour ? `${endHour}:${endMinutes}` : `00:00`;
  return endTime;
};

const getStartTime = (day: any) => {
  const start = new Date(day.startDate);
  const startHour = start.getHours().toString().padStart(2, '0');
  const startMinutes = start.getMinutes().toString().padStart(2, '0');
  const startTime = startHour ? `${startHour}:${startMinutes}` : `00:00`;
  return startTime;
};

type DaysProps = {
  onDeleteDay?: (id: string) => void;
  onChangeStartDate: (id: string, date: Date | null) => void;
  onChangeEndDate: (id: string, date: Date | null) => void;
  onChangeStartTime?: (id: string, hours: number, minutes: number) => void;
  onChangeEndTime?: (id: string, hours: number, minutes: number) => void;
  onToggleChildcare?: (id: string, enabled: boolean) => void;
  onChangeChildcareStartTime?: (id: string, newTime: string) => void;
  onChangeChildcareEndTime?: (id: string, newTime: string) => void;
  onToggleOvernightStay?: (id: string, enabled: boolean) => void;
  showOvernightStay?: boolean;
  errors: FieldErrors<FormDataUnion>;
} & StackProps;

export const Days = ({
  onDeleteDay,
  onChangeStartDate,
  onChangeEndDate,
  onChangeStartTime,
  onChangeEndTime,
  onToggleChildcare,
  onChangeChildcareStartTime,
  onChangeChildcareEndTime,
  onToggleOvernightStay,
  showOvernightStay = false,
  errors,
  ...props
}: DaysProps) => {
  const { t } = useTranslation();
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);

  const days = useCalendarSelector((state) => state.context.days);
  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();

  const isOneOrMoreDays = useIsOneOrMoreDays();

  const subEventErrors = errors.calendar?.subEvent ?? [];
  const timesErrors = subEventErrors.map((error) => {
    if (error.type === 'invalid-hours') {
      return error;
    }

    return undefined;
  });

  return (
    <List spacing={4} {...getStackProps(props)}>
      {days.map((day, index) => {
        const startTime = getStartTime(day);
        const endTime = getEndTime(day);

        const handleChangeStartTime = createChangeTimeHandler(
          day.id,
          onChangeStartTime,
        );
        const handleChangeEndTime = createChangeTimeHandler(
          day.id,
          onChangeEndTime,
        );

        const isDisabled = day.status.type !== OfferStatus.AVAILABLE;

        const isBookingUnavailable =
          day.bookingAvailability.type === BookingAvailabilityType.UNAVAILABLE;

        const childcareTimesMissing =
          day.childcareEnabled &&
          !day.childcareStartTime &&
          !day.childcareEndTime;

        const childcareStartError =
          day.childcareEnabled &&
          !!day.childcareStartTime &&
          day.childcareStartTime >= startTime
            ? t(
                'create.calendar.days.childcare.validation_messages.start_too_late',
              )
            : undefined;
        const childcareEndError =
          day.childcareEnabled &&
          !!day.childcareEndTime &&
          day.childcareEndTime <= endTime
            ? t(
                'create.calendar.days.childcare.validation_messages.end_too_early',
              )
            : undefined;

        return (
          <Stack spacing={4} key={`list-item-${day.id}`}>
            <List.Item alignItems="center" spacing={0} className="tw:gap-8">
              <DatePeriodPicker
                showHolidaysToggle={isBoaEnabled}
                className="tw:gap-2"
                id={`calendar-step-day-${day.id}`}
                dateStart={new Date(day.startDate)}
                dateEnd={new Date(day.endDate)}
                onDateStartChange={(newDate) =>
                  onChangeStartDate(day.id, newDate)
                }
                onDateEndChange={(newDate) => onChangeEndDate(day.id, newDate)}
                disabled={isDisabled}
                apiHolidays={apiHolidays}
                onShowHolidaysChange={onShowHolidaysChange}
              />
              {isOneOrMoreDays && (
                <TimeSpanPicker
                  id={`calendar-step-day-${day.id}`}
                  startTime={startTime}
                  endTime={endTime}
                  onChangeStartTime={handleChangeStartTime}
                  onChangeEndTime={handleChangeEndTime}
                  disabled={isDisabled}
                  className="tw:min-w-30"
                />
              )}
              {isOneOrMoreDays && isBoaEnabled && (
                <Stack spacing={2}>
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
                      id={`calendar-step-day-${day.id}-childcare-toggle`}
                      type={RadioButtonTypes.SWITCH}
                      color={colors.udbMainPositiveGreen}
                      checked={!!day.childcareEnabled}
                      disabled={isDisabled}
                      onChange={(e) =>
                        onToggleChildcare?.(day.id, e.target.checked)
                      }
                    />
                    <Label
                      variant={LabelVariants.BOLD}
                      htmlFor={`calendar-step-day-${day.id}-childcare-toggle`}
                      color={!day.childcareEnabled ? colors.grey5 : undefined}
                    >
                      {t('create.calendar.days.childcare.label')}
                    </Label>
                  </Inline>
                  <TimeSpanPicker
                    key={`childcare-${day.id}-${day.childcareEnabled}`}
                    id={`calendar-step-day-${day.id}-childcare`}
                    labelPosition={TimeSpanPickerLabelPositions.INLINE}
                    startTimeLabel={t('create.calendar.days.childcare.from')}
                    endTimeLabel={t('create.calendar.days.childcare.to')}
                    startTime={day.childcareStartTime ?? ''}
                    endTime={day.childcareEndTime ?? ''}
                    onChangeStartTime={(newTime) =>
                      onChangeChildcareStartTime?.(day.id, newTime)
                    }
                    onChangeEndTime={(newTime) =>
                      onChangeChildcareEndTime?.(day.id, newTime)
                    }
                    disabled={isDisabled || !day.childcareEnabled}
                  />
                </Stack>
              )}
              {isOneOrMoreDays && showOvernightStay && isBoaEnabled && (
                <div className="tw:flex tw:flex-col tw:gap-y-1">
                  <Label
                    variant={LabelVariants.BOLD}
                    htmlFor={`calendar-step-day-${day.id}-overnight-toggle`}
                  >
                    {t('create.calendar.days.overnight_stay.label')}
                  </Label>
                  <Inline
                    alignItems="center"
                    css={`
                      gap: 0.5rem;
                      flex-wrap: nowrap;
                      white-space: nowrap;
                      .form-switch {
                        font-size: 0.85rem;
                      }
                    `}
                  >
                    <RadioButton
                      id={`calendar-step-day-${day.id}-overnight-toggle`}
                      type={RadioButtonTypes.SWITCH}
                      color={colors.udbMainPositiveGreen}
                      checked={!!day.hasOvernightStay}
                      disabled={isDisabled}
                      onChange={(e) =>
                        onToggleOvernightStay?.(day.id, e.target.checked)
                      }
                    />
                    <Label
                      variant={LabelVariants.NORMAL}
                      htmlFor={`calendar-step-day-${day.id}-overnight-toggle`}
                    >
                      {t('create.calendar.days.overnight_stay.with')}
                    </Label>
                  </Inline>
                </div>
              )}
              {days.length > 1 && (
                <Button
                  alignSelf="flex-end"
                  size={ButtonSizes.SMALL}
                  variant={ButtonVariants.DANGER}
                  onClick={() => onDeleteDay(day.id)}
                  iconName={Icons.TRASH}
                  disabled={isDisabled}
                />
              )}
            </List.Item>
            {timesErrors[index] && (
              <Text color="red">
                {t('create.calendar.days.validation_messages.invalid_hours')}
              </Text>
            )}
            {childcareTimesMissing && (
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
            {childcareStartError && (
              <Text color="red">{childcareStartError}</Text>
            )}
            {childcareEndError && <Text color="red">{childcareEndError}</Text>}
            {isDisabled && (
              <Alert
                variant={AlertVariants.PRIMARY}
                fullWidth
                css={`
                  width: 100%;
                `}
              >
                {t(`offerStatus.status.events.${camelCase(day.status.type)}`)}
                {day.status.reason?.nl ? `: ${day.status.reason.nl}` : ''}
              </Alert>
            )}
            {isBookingUnavailable && (
              <Alert
                variant={AlertVariants.PRIMARY}
                fullWidth
                css={`
                  width: 100%;
                `}
              >
                {t(`bookingAvailability.unavailable`)}
              </Alert>
            )}
          </Stack>
        );
      })}
    </List>
  );
};
