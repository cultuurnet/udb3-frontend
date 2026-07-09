import { format, isSameDay, startOfDay } from 'date-fns';
import uniqueId from 'lodash/uniqueId';
import { useTranslation } from 'react-i18next';

import { DaysOfWeek } from '@/constants/DaysOfWeek';
import { useFetchHolidays, useHolidaysWithToggle } from '@/hooks/api/holidays';
import { useQuickLinkRangeFilter } from '@/hooks/useQuickLinkRangeFilter';
import { DayOfWeek } from '@/types/Offer';
import { BoxProps } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { MultiSelectDropdown } from '@/ui/MultiSelectDropdown';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';

import type { SupportedLanguage } from '../../../i18n';
import { createOpeninghoursId } from '../machines/calendarMachine';
import { ChildcareTimeFields, getChildcareErrors } from './ChildcareTimeFields';

type OpeningHour = {
  id: string;
  opens: string;
  closes: string;
  dayOfWeek: DayOfWeek[];
  childcare?: { start?: string; end?: string };
};

type DeviatingPeriodData = {
  id: string;
  startDate: Date;
  endDate: Date;
  description: Partial<Record<SupportedLanguage, string>>;
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
  hasInvalidDateOrder?: boolean;
  daysWithTimeConflict?: DayOfWeek[];
  shownErrorIds?: ReadonlySet<string>;
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
  hasInvalidDateOrder = false,
  daysWithTimeConflict = [],
  shownErrorIds = new Set(),
  ...boxProps
}: Props) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;
  const fetchHolidays = useFetchHolidays();
  const { quickLinkRangeError, clearQuickLinkRangeError, filterByEventRange } =
    useQuickLinkRangeFilter(eventStartDate, eventEndDate);
  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();
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
        <Text color={colors.udbMainDarkBlue} fontWeight="bold">
          {t('create.calendar.opening_hours_modal.deviating.select_period')}
        </Text>
        <Inline spacing={5} alignItems="flex-end">
          <DatePeriodPicker
            width="100%"
            id={`deviating-period-${period.id}`}
            dateStart={period.startDate}
            dateEnd={period.endDate}
            onDateStartChange={(date) => {
              clearQuickLinkRangeError();
              onChange({ ...period, startDate: date });
            }}
            onDateEndChange={(date) => {
              clearQuickLinkRangeError();
              onChange({ ...period, endDate: date });
            }}
            showQuickLinks
            fetchHolidays={fetchHolidays}
            apiHolidays={apiHolidays}
            onShowHolidaysChange={onShowHolidaysChange}
            onQuickLinkClick={(periods) => {
              if (!onQuickLinkExpand || periods.length === 0) return;
              const filtered = filterByEventRange(periods);
              if (filtered.length === 0) return;
              onQuickLinkExpand(
                filtered.map((p) => {
                  const isSingleDay = isSameDay(p.startDate, p.endDate);
                  const dayOfWeek = isSingleDay
                    ? (format(p.startDate, 'iiii').toLowerCase() as DayOfWeek)
                    : null;
                  return {
                    id: uniqueId('deviating-period-'),
                    startDate: p.startDate,
                    endDate: p.endDate,
                    description: { [lang]: p.name },
                    openingHours: period.openingHours.map((openingHour) => ({
                      ...openingHour,
                      id: createOpeninghoursId(),
                      dayOfWeek: dayOfWeek ? [dayOfWeek] : [],
                    })),
                  };
                }),
              );
            }}
          />
          <Input
            value={period.description[lang] ?? ''}
            width="80%"
            onChange={(e) =>
              onChange({
                ...period,
                description: { ...period.description, [lang]: e.target.value },
              })
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
        {hasInvalidDateOrder && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.deviating.errors.start_after_end',
            )}
          </Text>
        )}
        {eventStartDate &&
          startOfDay(period.startDate) < startOfDay(eventStartDate) && (
            <Text color="red">
              {t(
                'create.calendar.opening_hours_modal.deviating.errors.start_before_event',
              )}
            </Text>
          )}
        {eventEndDate &&
          startOfDay(period.endDate) > startOfDay(eventEndDate) && (
            <Text color="red">
              {t(
                'create.calendar.opening_hours_modal.deviating.errors.end_after_event',
              )}
            </Text>
          )}
        {quickLinkRangeError && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.deviating.errors.quick_link_out_of_range',
            )}
          </Text>
        )}
      </Stack>

      <Stack spacing={2} marginTop={3}>
        <Text color={colors.udbMainDarkBlue} fontWeight="bold">
          {t('create.calendar.opening_hours_modal.deviating.fill_hours')}
        </Text>
        <Stack spacing={4}>
          {period.openingHours.map((openingHour) => {
            const { startError, endError } = getChildcareErrors(t, {
              childcareStartTime: openingHour.childcare?.start,
              childcareEndTime: openingHour.childcare?.end,
              activityStart: openingHour.opens,
              activityEnd: openingHour.closes,
            });

            return (
              <Stack key={openingHour.id} spacing={4}>
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
                      id={`deviating-day-of-week-${openingHour.id}`}
                      options={Object.values(DaysOfWeek).map((day) => ({
                        value: day,
                        label: t(`create.calendar.days.short.${day}`),
                      }))}
                      selectedValues={openingHour.dayOfWeek}
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
                    <ChildcareTimeFields
                      idPrefix={`deviating-${openingHour.id}`}
                      startTime={openingHour.childcare?.start ?? ''}
                      endTime={openingHour.childcare?.end ?? ''}
                      onChangeStartTime={(newTime) =>
                        updateOpeningHour(openingHour.id, {
                          childcare: {
                            ...openingHour.childcare,
                            start: newTime || undefined,
                          },
                        })
                      }
                      onChangeEndTime={(newTime) =>
                        updateOpeningHour(openingHour.id, {
                          childcare: {
                            ...openingHour.childcare,
                            end: newTime || undefined,
                          },
                        })
                      }
                    />
                  )}
                  {period.openingHours.length > 1 && (
                    <Button
                      iconName={Icons.TRASH}
                      variant={ButtonVariants.DANGER}
                      onClick={() => handleRemoveOpeningHour(openingHour.id)}
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
