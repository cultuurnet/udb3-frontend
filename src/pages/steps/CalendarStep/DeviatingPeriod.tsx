import uniqueId from 'lodash/uniqueId';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { useFetchHolidays } from '@/hooks/api/holidays';
import { DayOfWeek } from '@/types/Offer';
import { Alert } from '@/ui/Alert';
import { BoxProps } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Label, LabelVariants } from '@/ui/Label';
import { MultiSelectDropdown } from '@/ui/MultiSelectDropdown';
import { RadioButton, RadioButtonTypes } from '@/ui/RadioButton';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';

import { createOpeninghoursId } from '../machines/calendarMachine';

type OpeningHour = {
  id: string;
  opens: string;
  closes: string;
  dayOfWeek: DayOfWeek[];
  childcare?: { start: string; end: string };
};

type DeviatingPeriodData = {
  id: string;
  startDate: Date;
  endDate: Date;
  description: string;
  openingHours: OpeningHour[];
};

type Props = BoxProps & {
  index: number;
  period: DeviatingPeriodData;
  onChange: (period: DeviatingPeriodData) => void;
  onRemove: () => void;
  onQuickLinkExpand?: (periods: DeviatingPeriodData[]) => void;
  showChildcare?: boolean;
  eventStartDate?: Date;
  eventEndDate?: Date;
  hasOverlap?: boolean;
};

const DeviatingPeriod = ({
  index,
  period,
  onChange,
  onRemove,
  onQuickLinkExpand,
  showChildcare = true,
  eventStartDate,
  eventEndDate,
  hasOverlap = false,
  ...boxProps
}: Props) => {
  const { t } = useTranslation();
  const fetchHolidays = useFetchHolidays();
  const [childcareEnabledMap, setChildcareEnabledMap] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      period.openingHours.map((openingHour) => [
        openingHour.id,
        !!openingHour.childcare?.start,
      ]),
    ),
  );
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );

  const markTouched = (key: string) =>
    setTouchedFields((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const updateOpeningHour = (idToChange: string, patch: Partial<OpeningHour>) =>
    onChange({
      ...period,
      openingHours: period.openingHours.map((openingHour) =>
        openingHour.id === idToChange
          ? { ...openingHour, ...patch }
          : openingHour,
      ),
    });

  const handleAddOpeningHour = () =>
    onChange({
      ...period,
      openingHours: [
        ...period.openingHours,
        {
          id: createOpeninghoursId(),
          opens: '00:00',
          closes: '23:59',
          dayOfWeek: [],
        },
      ],
    });

  const handleRemoveOpeningHour = (idToRemove: string) =>
    onChange({
      ...period,
      openingHours: period.openingHours.filter(
        (openingHour) => openingHour.id !== idToRemove,
      ),
    });

  const handleToggleDaysOfWeek = (newDays: string[], idToChange: string) =>
    updateOpeningHour(idToChange, {
      dayOfWeek: [...newDays].sort(
        (a, b) =>
          DaysOfWeek.indexOf(a as DayOfWeek) -
          DaysOfWeek.indexOf(b as DayOfWeek),
      ) as DayOfWeek[],
    });

  const handleToggleChildcare = (idToChange: string, enabled: boolean) => {
    setChildcareEnabledMap((prev) => ({ ...prev, [idToChange]: enabled }));
    if (!enabled) updateOpeningHour(idToChange, { childcare: undefined });
  };

  const getChildcareRowState = (
    openingHour: OpeningHour,
    childcareEnabled: boolean,
  ) => {
    const startTouched =
      touchedFields[`${openingHour.id}-start`] &&
      !!openingHour.childcare?.start;
    const endTouched =
      touchedFields[`${openingHour.id}-end`] && !!openingHour.childcare?.end;
    return {
      timesMissing:
        childcareEnabled &&
        (!openingHour.childcare?.start || !openingHour.childcare?.end),
      startError:
        childcareEnabled &&
        startTouched &&
        openingHour.childcare?.start >= openingHour.opens
          ? t(
              'create.calendar.days.childcare.validation_messages.start_too_late',
            )
          : undefined,
      endError:
        childcareEnabled &&
        endTouched &&
        openingHour.childcare?.end <= openingHour.closes
          ? t(
              'create.calendar.days.childcare.validation_messages.end_too_early',
            )
          : undefined,
    };
  };

  return (
    <Stack
      spacing={4}
      padding={4}
      css={`
        border: 1px solid ${colors.grey3};
        border-radius: 0.5rem;
      `}
      {...boxProps}
    >
      <Inline justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold">
          {t('create.calendar.opening_hours_modal.deviating.period_title', {
            index: index + 1,
          })}
        </Text>
        <Button
          variant={ButtonVariants.DANGER}
          iconName={Icons.TRASH}
          spacing={2}
          onClick={onRemove}
        >
          {t('create.calendar.opening_hours_modal.deviating.remove_period')}
        </Button>
      </Inline>

      <Stack spacing={2}>
        <Text color={colors.udbMainBlue} fontWeight="bold">
          {t('create.calendar.opening_hours_modal.deviating.select_period')}
        </Text>
        <Inline spacing={5} alignItems="flex-end">
          <DatePeriodPicker
            width="100%"
            id={`deviating-period-${period.id}`}
            dateStart={period.startDate}
            dateEnd={period.endDate}
            onDateStartChange={(date) =>
              onChange({ ...period, startDate: date })
            }
            onDateEndChange={(date) => onChange({ ...period, endDate: date })}
            showQuickLinks
            fetchHolidays={fetchHolidays}
            onQuickLinkClick={(periods) => {
              if (!onQuickLinkExpand || periods.length === 0) return;
              onQuickLinkExpand(
                periods.map((p) => ({
                  id: uniqueId('deviating-period-'),
                  startDate: p.startDate,
                  endDate: p.endDate,
                  description: p.name,
                  openingHours: period.openingHours.map((h) => ({
                    ...h,
                    id: createOpeninghoursId(),
                  })),
                })),
              );
            }}
          />
          <Input
            value={period.description}
            name={t(
              'create.calendar.opening_hours_modal.deviating.description_placeholder',
            )}
            onChange={(e) =>
              onChange({ ...period, description: e.target.value })
            }
            placeholder={t(
              'create.calendar.opening_hours_modal.deviating.description_placeholder',
            )}
          />
        </Inline>
        {hasOverlap && (
          <Text color="red">
            {t('create.calendar.opening_hours_modal.deviating.errors.overlap')}
          </Text>
        )}
        {eventStartDate && period.startDate < eventStartDate && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.deviating.errors.start_before_event',
            )}
          </Text>
        )}
        {eventEndDate && period.endDate > eventEndDate && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.deviating.errors.end_after_event',
            )}
          </Text>
        )}
      </Stack>

      <Stack spacing={2} marginTop={3}>
        <Text color={colors.udbMainBlue} fontWeight="bold">
          {t('create.calendar.opening_hours_modal.deviating.fill_hours')}
        </Text>
        <Stack spacing={4}>
          {period.openingHours.map((openingHour) => {
            const childcareEnabled =
              childcareEnabledMap[openingHour.id] ?? false;
            const { timesMissing, startError, endError } = getChildcareRowState(
              openingHour,
              childcareEnabled,
            );

            return (
              <Stack key={openingHour.id} spacing={4}>
                <Inline alignItems="flex-end" spacing={4.5}>
                  <Stack spacing={3}>
                    <Text fontWeight="bold">
                      {t('create.calendar.opening_hours_modal.days')}
                    </Text>
                    <MultiSelectDropdown
                      id={`deviating-day-of-week-${openingHour.id}`}
                      options={Object.values(DaysOfWeek).map((day) => ({
                        value: day,
                        label: t(`create.calendar.days.full.${day}`),
                      }))}
                      selectedValues={openingHour.dayOfWeek}
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
                      id={`deviating-timespan-${openingHour.id}`}
                      startTime={openingHour.opens}
                      endTime={openingHour.closes}
                      startTimeLabel={t(
                        'create.calendar.opening_hours_modal.start_time',
                      )}
                      endTimeLabel={t(
                        'create.calendar.opening_hours_modal.end_time',
                      )}
                      onChangeStartTime={(newTime) =>
                        updateOpeningHour(openingHour.id, { opens: newTime })
                      }
                      onChangeEndTime={(newTime) =>
                        updateOpeningHour(openingHour.id, { closes: newTime })
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
                          id={`deviating-childcare-toggle-${openingHour.id}`}
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
                          htmlFor={`deviating-childcare-toggle-${openingHour.id}`}
                        >
                          {t('create.calendar.days.childcare.label')}
                        </Label>
                      </Inline>
                      <TimeSpanPicker
                        id={`deviating-childcare-timespan-${openingHour.id}`}
                        startTime={openingHour.childcare?.start ?? ''}
                        endTime={openingHour.childcare?.end ?? ''}
                        startTimeLabel={t(
                          'create.calendar.days.childcare.from',
                        )}
                        endTimeLabel={t('create.calendar.days.childcare.to')}
                        onChangeStartTime={(newTime) => {
                          markTouched(`${openingHour.id}-start`);
                          updateOpeningHour(openingHour.id, {
                            childcare: {
                              start: newTime,
                              end: openingHour.childcare?.end ?? '',
                            },
                          });
                        }}
                        onChangeEndTime={(newTime) => {
                          markTouched(`${openingHour.id}-end`);
                          updateOpeningHour(openingHour.id, {
                            childcare: {
                              start: openingHour.childcare?.start ?? '',
                              end: newTime,
                            },
                          });
                        }}
                        labelPosition={TimeSpanPickerLabelPositions.INLINE}
                        disabled={!childcareEnabled}
                      />
                    </Stack>
                  )}
                  {period.openingHours.length > 1 && (
                    <Button
                      iconName={Icons.TRASH}
                      variant={ButtonVariants.DANGER}
                      onClick={() => handleRemoveOpeningHour(openingHour.id)}
                    />
                  )}
                </Inline>
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
            onClick={handleAddOpeningHour}
            alignSelf="flex-start"
          >
            {t('create.calendar.opening_hours_modal.button_add_hours')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export type { DeviatingPeriodData };
export { DeviatingPeriod };
