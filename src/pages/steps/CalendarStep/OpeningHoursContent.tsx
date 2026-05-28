import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type {
  OpeningHours,
  OpeningHoursAdjustedDay,
  OpeningHoursClosedDay,
} from '@/types/Offer';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';

import type { SupportedLanguage } from '../../../i18n';
import { useCalendarSelector } from '../machines/calendarMachine';
import type { ClosingPeriodData } from './ClosingPeriod';
import type { DeviatingPeriodData } from './DeviatingPeriod';

const OpeningHourRow = ({
  dayOfWeek,
  opens,
  closes,
  childcare,
  index,
}: OpeningHours & { index: number }) => {
  const { t } = useTranslation();
  return (
    <Stack
      paddingTop={index > 0 ? 2 : 0}
      paddingBottom={2}
      css={`
        ${index > 0 ? `border-top: 1px solid ${colors.grey3};` : ''}
      `}
    >
      <Inline alignItems="flex-start">
        <Text minWidth="12rem">
          {dayOfWeek
            .map((day) => t(`create.calendar.days.short.${day}`))
            .join(', ')}
        </Text>
        <Text minWidth="8rem">
          {opens} - {closes}
        </Text>
        <Stack spacing={1} minWidth="10rem">
          {childcare && (
            <>
              <Text fontStyle="italic">
                {t('create.calendar.fixed_days.overview.childcare_before', {
                  start: childcare.start,
                })}
              </Text>
              <Text fontStyle="italic">
                {t('create.calendar.fixed_days.overview.childcare_after', {
                  end: childcare.end,
                })}
              </Text>
            </>
          )}
        </Stack>
      </Inline>
    </Stack>
  );
};

type OpeningHoursSummaryProps = {
  openingHours: OpeningHours[];
  adjustedDays?: OpeningHoursAdjustedDay[];
  closedDays?: OpeningHoursClosedDay[];
  lang: SupportedLanguage;
};

const OpeningHoursSummary = ({
  openingHours,
  adjustedDays,
  closedDays,
  lang,
}: OpeningHoursSummaryProps) => {
  const { t } = useTranslation();

  if (openingHours.length === 0) return null;

  return (
    <Stack spacing={5}>
      {openingHours.length > 0 && (
        <Stack>
          <Text color={colors.udbMainDarkBlue} fontWeight="bold">
            {t('create.calendar.fixed_days.overview.weekly_on')}
          </Text>
          <Stack>
            {openingHours.map((openingHour, index) => (
              <OpeningHourRow
                key={`${openingHour.opens}-${openingHour.closes}-${openingHour.dayOfWeek.join(',')}`}
                index={index}
                {...openingHour}
              />
            ))}
          </Stack>
        </Stack>
      )}

      {adjustedDays && adjustedDays.length > 0 && (
        <Stack>
          <Text color={colors.udbMainDarkBlue} fontWeight="bold">
            {t('create.calendar.fixed_days.overview.deviating_except')}
          </Text>
          <Stack spacing={4}>
            {adjustedDays.map((adjustedDay) => (
              <Stack
                key={`${adjustedDay.startDate}-${adjustedDay.endDate}`}
                spacing={1}
              >
                <Text>
                  {`${format(parseISO(adjustedDay.startDate), 'dd/MM/yyyy')} - ${format(parseISO(adjustedDay.endDate), 'dd/MM/yyyy')}`}
                  {adjustedDay.description?.[lang]
                    ? ` (${adjustedDay.description[lang]})`
                    : ''}
                </Text>
                <Text color={colors.udbMainDarkBlue}>
                  {t(
                    'create.calendar.fixed_days.overview.deviating_then_weekly',
                  )}
                </Text>
                {adjustedDay.openingHours.map((openingHour, index) => (
                  <OpeningHourRow
                    key={`${openingHour.opens}-${openingHour.closes}-${openingHour.dayOfWeek.join(',')}`}
                    index={index}
                    {...openingHour}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}

      {closedDays && closedDays.length > 0 && (
        <Stack spacing={1}>
          <Text color={colors.udbMainDarkBlue} fontWeight="bold">
            {t('create.calendar.fixed_days.overview.closed')}
          </Text>
          {closedDays.map((closedDay) => (
            <Text key={`${closedDay.startDate}-${closedDay.endDate}`}>
              {`${format(parseISO(closedDay.startDate), 'dd/MM/yyyy')} - ${format(parseISO(closedDay.endDate), 'dd/MM/yyyy')}`}
              {closedDay.description?.[lang]
                ? ` (${closedDay.description[lang]})`
                : ''}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

type OpeningHoursContentProps = {
  initialAdjustedDays?: DeviatingPeriodData[];
  initialClosingPeriods?: ClosingPeriodData[];
  onOpenModal: () => void;
  onRequestDelete: () => void;
};

const OpeningHoursContent = ({
  initialAdjustedDays,
  initialClosingPeriods,
  onOpenModal,
  onRequestDelete,
}: OpeningHoursContentProps) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);
  const openingHours = useCalendarSelector(
    (state) => state.context.openingHours,
  );

  const hasOpeningHours = openingHours.length > 0;
  const hasBoaContent =
    hasOpeningHours ||
    (initialAdjustedDays?.length ?? 0) > 0 ||
    (initialClosingPeriods?.length ?? 0) > 0;

  if (isBoaEnabled && hasBoaContent) {
    return (
      <Stack spacing={3}>
        <Inline justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">{t('create.calendar.fixed_days.hours')}</Text>
          <Inline spacing={3}>
            <Button variant={ButtonVariants.LINK} onClick={onOpenModal}>
              {t('create.calendar.fixed_days.overview.edit')}
            </Button>
            <Button
              variant={ButtonVariants.LINK_DANGER}
              onClick={onRequestDelete}
            >
              {t('create.calendar.fixed_days.overview.delete')}
            </Button>
          </Inline>
        </Inline>
        <OpeningHoursSummary
          openingHours={openingHours.map((openingHour) => ({
            ...openingHour,
            childcare:
              openingHour.childcareStartTime && openingHour.childcareEndTime
                ? {
                    start: openingHour.childcareStartTime,
                    end: openingHour.childcareEndTime,
                  }
                : undefined,
          }))}
          adjustedDays={initialAdjustedDays?.map(
            ({ openingHours, startDate, endDate, description }) => ({
              startDate: format(startDate, 'yyyy-MM-dd'),
              endDate: format(endDate, 'yyyy-MM-dd'),
              description,
              openingHours: openingHours.map(
                ({ id: _id, ...openingHour }) => openingHour,
              ),
            }),
          )}
          closedDays={initialClosingPeriods?.map(
            ({ startDate, endDate, description }) => ({
              startDate: format(startDate, 'yyyy-MM-dd'),
              endDate: format(endDate, 'yyyy-MM-dd'),
              description,
            }),
          )}
          lang={lang}
        />
      </Stack>
    );
  }

  if (hasOpeningHours) {
    return (
      <List>
        <List.Item
          alignItems="center"
          paddingTop={3}
          paddingBottom={3}
          justifyContent="space-between"
          spacing={5}
        >
          <Text fontWeight="bold">
            {t('create.calendar.fixed_days.opening_hours')}
          </Text>
          <Button variant={ButtonVariants.SECONDARY} onClick={onOpenModal}>
            {t('create.calendar.fixed_days.button_change_opening_hours')}
          </Button>
        </List.Item>
        {openingHours.map((openingHour) => (
          <List.Item
            paddingTop={2}
            paddingBottom={2}
            css={`
              border-top: 1px solid ${colors.grey3};
            `}
            justifyContent="space-between"
            spacing={2}
            key={openingHour.id}
          >
            <Text maxWidth="20rem">
              {openingHour.dayOfWeek
                .map((dayOfWeek) =>
                  t(`create.calendar.days.short.${dayOfWeek}`),
                )
                .join(', ')}
            </Text>
            <Text>
              {openingHour.opens} - {openingHour.closes}
            </Text>
          </List.Item>
        ))}
      </List>
    );
  }

  return (
    <Button
      variant={ButtonVariants.SECONDARY}
      onClick={onOpenModal}
      alignSelf="flex-start"
    >
      {t(
        isBoaEnabled
          ? 'create.calendar.fixed_days.button_add_hours'
          : 'create.calendar.fixed_days.button_add_opening_hours',
      )}
    </Button>
  );
};

export { OpeningHoursContent, OpeningHoursSummary };
