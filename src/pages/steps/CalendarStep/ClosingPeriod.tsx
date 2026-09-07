import { endOfDay, startOfDay } from 'date-fns';
import uniqueId from 'lodash/uniqueId';
import { useTranslation } from 'react-i18next';

import { useFetchHolidays, useHolidaysWithToggle } from '@/hooks/api/holidays';
import { useQuickLinkRangeFilter } from '@/hooks/useQuickLinkRangeFilter';
import { BoxProps } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, theme } from '@/ui/theme';
import type { HolidayType } from '@/utils/holidayPresets';

import type { SupportedLanguage } from '../../../i18n';

type ClosingPeriodData = {
  id: string;
  startDate: Date;
  endDate: Date;
  description: Partial<Record<SupportedLanguage, string>>;
  holidayType?: HolidayType;
};

type Props = BoxProps & {
  period: ClosingPeriodData;
  onChange: (period: ClosingPeriodData) => void;
  onRemove: () => void;
  onQuickLinkExpand?: (periods: ClosingPeriodData[]) => void;
  eventStartDate?: Date;
  eventEndDate?: Date;
  hasOverlap?: boolean;
  hasInvalidDateOrder?: boolean;
};

const ClosingPeriod = ({
  period,
  onChange,
  onRemove,
  onQuickLinkExpand,
  eventStartDate,
  eventEndDate,
  hasOverlap = false,
  hasInvalidDateOrder = false,
  ...boxProps
}: Props) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;
  const fetchHolidays = useFetchHolidays();
  const { quickLinkRangeError, clearQuickLinkRangeError, filterByEventRange } =
    useQuickLinkRangeFilter(eventStartDate, eventEndDate);
  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();

  return (
    <Stack
      spacing={0}
      padding={4}
      css={`
        border: 1px solid ${colors.grey3};
        border-radius: 0.5rem;
        background-color: ${colors.greylight};
      `}
      {...boxProps}
    >
      <Inline justifyContent="space-between" alignItems="center">
        <Text
          color={colors.udbMainDarkBlue}
          fontWeight="bold"
          fontSize={theme.components.openingHoursModal.fontSize.sectionTitle}
        >
          {t('create.calendar.opening_hours_modal.closing.select_period')}
        </Text>
        <Button
          variant={ButtonVariants.DANGER}
          iconName={Icons.TRASH}
          onClick={onRemove}
          aria-label={t(
            'create.calendar.opening_hours_modal.closing.remove_period',
          )}
        />
      </Inline>

      <Stack spacing={2}>
        <Inline spacing={0} alignItems="flex-end" className="tw:gap-8">
          <DatePeriodPicker
            className="tw:w-full"
            id={`closing-period-${period.id}`}
            dateStart={period.startDate}
            dateEnd={period.endDate}
            onDateStartChange={(date) => {
              clearQuickLinkRangeError();
              onChange({ ...period, startDate: date, endDate: endOfDay(date) });
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
                filtered.map((p) => ({
                  id: uniqueId('closing-period-'),
                  startDate: p.startDate,
                  endDate: p.endDate,
                  description: { [lang]: p.name },
                  holidayType: p.holidayType,
                })),
              );
            }}
          />
          <Input
            value={period.description[lang] ?? ''}
            onChange={(e) =>
              onChange({
                ...period,
                description: { ...period.description, [lang]: e.target.value },
              })
            }
            placeholder={t(
              'create.calendar.opening_hours_modal.closing.description_placeholder',
            )}
          />
        </Inline>
        {hasOverlap && (
          <Text color="red">
            {t('create.calendar.opening_hours_modal.closing.errors.overlap')}
          </Text>
        )}
        {hasInvalidDateOrder && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.closing.errors.start_after_end',
            )}
          </Text>
        )}
        {eventStartDate &&
          startOfDay(period.startDate) < startOfDay(eventStartDate) && (
            <Text color="red">
              {t(
                'create.calendar.opening_hours_modal.closing.errors.start_before_event',
              )}
            </Text>
          )}
        {eventEndDate &&
          startOfDay(period.endDate) > startOfDay(eventEndDate) && (
            <Text color="red">
              {t(
                'create.calendar.opening_hours_modal.closing.errors.end_after_event',
              )}
            </Text>
          )}
        {quickLinkRangeError && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.closing.errors.quick_link_out_of_range',
            )}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export type { ClosingPeriodData };
export { ClosingPeriod };
