import uniqueId from 'lodash/uniqueId';
import { useTranslation } from 'react-i18next';

import { useFetchHolidays } from '@/hooks/api/holidays';
import { BoxProps } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';

import type { SupportedLanguage } from '../../../i18n';

type ClosingPeriodData = {
  id: string;
  startDate: Date;
  endDate: Date;
  description: Partial<Record<SupportedLanguage, string>>;
};

type Props = BoxProps & {
  index: number;
  period: ClosingPeriodData;
  onChange: (period: ClosingPeriodData) => void;
  onRemove: () => void;
  onQuickLinkExpand?: (periods: ClosingPeriodData[]) => void;
  eventStartDate?: Date;
  eventEndDate?: Date;
  hasOverlap?: boolean;
};

const ClosingPeriod = ({
  index,
  period,
  onChange,
  onRemove,
  onQuickLinkExpand,
  eventStartDate,
  eventEndDate,
  hasOverlap = false,
  ...boxProps
}: Props) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;
  const fetchHolidays = useFetchHolidays();

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
          {t('create.calendar.opening_hours_modal.closing.period_title', {
            index: index + 1,
          })}
        </Text>
        <Button
          variant={ButtonVariants.DANGER}
          iconName={Icons.TRASH}
          spacing={2}
          onClick={onRemove}
        >
          {t('create.calendar.opening_hours_modal.closing.remove_period')}
        </Button>
      </Inline>

      <Stack spacing={2}>
        <Text color={colors.udbMainDarkBlue} fontWeight="bold">
          {t('create.calendar.opening_hours_modal.closing.select_period')}
        </Text>
        <Inline spacing={0} alignItems="flex-end" className="tw:gap-8">
          <DatePeriodPicker
            className="tw:w-full"
            id={`closing-period-${period.id}`}
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
                  id: uniqueId('closing-period-'),
                  startDate: p.startDate,
                  endDate: p.endDate,
                  description: { [lang]: p.name },
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
        {eventStartDate && period.startDate < eventStartDate && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.closing.errors.start_before_event',
            )}
          </Text>
        )}
        {eventEndDate && period.endDate > eventEndDate && (
          <Text color="red">
            {t(
              'create.calendar.opening_hours_modal.closing.errors.end_after_event',
            )}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export type { ClosingPeriodData };
export { ClosingPeriod };
