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
import { getStackProps, StackProps } from '@/ui/Stack';
import { Switch, SwitchVariants } from '@/ui/Switch';
import { Text } from '@/ui/Text';
import { getGlobalFormInputHeight } from '@/ui/theme';
import { TimeSpanPicker } from '@/ui/TimeSpanPicker';

import {
  useCalendarSelector,
  useIsOneOrMoreDays,
} from '../machines/calendarMachine';
import { FormDataUnion } from '../Steps';
import { ChildcareTimeFields, getChildcareErrors } from './ChildcareTimeFields';

const fieldsGroup =
  'tw:flex tw:items-end tw:gap-x-4 tw:@max-4xl:flex-wrap tw:@max-4xl:gap-y-6';

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
  onChangeChildcareStartTime?: (id: string, newTime: string) => void;
  onChangeChildcareEndTime?: (id: string, newTime: string) => void;
  showChildcare?: boolean;
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
  onChangeChildcareStartTime,
  onChangeChildcareEndTime,
  showChildcare = true,
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
  const isOvernightStayVisible =
    isOneOrMoreDays && showOvernightStay && isBoaEnabled;
  const isChildcareVisible = isOneOrMoreDays && isBoaEnabled && showChildcare;

  const subEventErrors = errors.calendar?.subEvent ?? [];
  const timesErrors = subEventErrors.map((error) => {
    if (error.type === 'invalid-hours') {
      return error;
    }

    return undefined;
  });

  return (
    <List
      spacing={4}
      className="tw:w-fit tw:max-w-full"
      {...getStackProps(props)}
    >
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

        const { startError: childcareStartError, endError: childcareEndError } =
          getChildcareErrors(t, {
            childcareStartTime: day.childcareStartTime,
            childcareEndTime: day.childcareEndTime,
            activityStart: startTime,
            activityEnd: endTime,
          });

        return (
          <div
            className="tw:mb-4 tw:flex tw:flex-col tw:gap-4 tw:rounded-lg tw:border tw:border-border tw:bg-grey-light tw:p-3 tw:pb-5"
            key={`list-item-${day.id}`}
          >
            <List.Item
              className="tw:flex-nowrap tw:gap-x-4"
              marginBottom={isChildcareVisible && index === 0 ? 4 : undefined}
            >
              <div className="tw:flex tw:flex-col tw:items-start tw:gap-y-6 tw:@6xl:flex-row tw:@6xl:items-end tw:@6xl:gap-x-6">
                <div className={fieldsGroup}>
                  <DatePeriodPicker
                    showHolidaysToggle={isBoaEnabled}
                    className="tw:@max-lg:flex-wrap tw:@max-lg:gap-y-6"
                    id={`calendar-step-day-${day.id}`}
                    dateStart={new Date(day.startDate)}
                    dateEnd={new Date(day.endDate)}
                    onDateStartChange={(newDate) =>
                      onChangeStartDate(day.id, newDate)
                    }
                    onDateEndChange={(newDate) =>
                      onChangeEndDate(day.id, newDate)
                    }
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
                </div>
                {(isChildcareVisible || isOvernightStayVisible) && (
                  <div className={fieldsGroup}>
                    {isChildcareVisible && (
                      <ChildcareTimeFields
                        idPrefix={`calendar-step-day-${day.id}`}
                        startTime={day.childcareStartTime ?? ''}
                        endTime={day.childcareEndTime ?? ''}
                        onChangeStartTime={(newTime) =>
                          onChangeChildcareStartTime?.(day.id, newTime)
                        }
                        onChangeEndTime={(newTime) =>
                          onChangeChildcareEndTime?.(day.id, newTime)
                        }
                        disabled={isDisabled}
                        showInfo={index === 0}
                      />
                    )}
                    {isOvernightStayVisible && (
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
                            height: ${getGlobalFormInputHeight};
                            gap: 0.5rem;
                            flex-wrap: nowrap;
                            white-space: nowrap;
                            .form-switch {
                              font-size: 0.85rem;
                            }
                          `}
                        >
                          <Switch
                            id={`calendar-step-day-${day.id}-overnight-toggle`}
                            variant={SwitchVariants.SUCCESS}
                            checked={!!day.hasOvernightStay}
                            disabled={isDisabled}
                            onCheckedChange={(checked) =>
                              onToggleOvernightStay?.(day.id, checked)
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
                  </div>
                )}
              </div>
              {days.length > 1 && (
                <Button
                  className="tw:shrink-0 tw:self-start"
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
            {showChildcare && childcareStartError && (
              <Text color="red">{childcareStartError}</Text>
            )}
            {showChildcare && childcareEndError && (
              <Text color="red">{childcareEndError}</Text>
            )}
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
          </div>
        );
      })}
    </List>
  );
};
