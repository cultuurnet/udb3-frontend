import { ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHolidaysWithToggle } from '@/hooks/api/holidays';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { OpeningHours } from '@/types/Offer';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { List } from '@/ui/List';
import { RadioButtonWithLabel } from '@/ui/RadioButtonWithLabel';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';

import {
  CalendarState,
  useCalendarSelector,
  useIsPeriodic,
  useIsPermanent,
} from '../machines/calendarMachine';
import { CalendarOpeninghoursModal } from './CalendarOpeninghoursModal';
import { CalendarOpeninghoursModalLegacy } from './CalendarOpeninghoursModalLegacy';
import type { ClosingPeriodData } from './ClosingPeriod';
import type { DeviatingPeriodData } from './DeviatingPeriod';

const FixedDayOptions = {
  PERMANENT: 'permanent',
  PERIODIC: 'periodic',
} as const;

type FixedDaysProps = {
  onChooseWithStartAndEndDate: () => void;
  onChoosePermanent: () => void;
  onChangeStartDate: (date: Date | null) => void;
  onChangeEndDate: (date: Date | null) => void;
  onChangeOpeningHours: (newOpeningHours: OpeningHours[]) => void;
  onChangeCalendarState: (newState: CalendarState) => void;
  onChangeAdjustedDays?: (adjustedDays: DeviatingPeriodData[]) => void;
  initialAdjustedDays?: DeviatingPeriodData[];
  onChangeClosingPeriods?: (closingPeriods: ClosingPeriodData[]) => void;
  initialClosingPeriods?: ClosingPeriodData[];
};

export const FixedDays = ({
  onChooseWithStartAndEndDate,
  onChoosePermanent,
  onChangeStartDate,
  onChangeEndDate,
  onChangeCalendarState,
  onChangeAdjustedDays,
  initialAdjustedDays,
  onChangeClosingPeriods,
  initialClosingPeriods,
}: FixedDaysProps) => {
  const { t } = useTranslation();
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);

  const [
    isCalendarOpeninghoursModalVisible,
    setIsCalendarOpeninghoursModalVisible,
  ] = useState(false);

  const isPeriodic = useIsPeriodic();
  const isPermanent = useIsPermanent();

  const startDate = useCalendarSelector((state) => state.context.startDate);
  const endDate = useCalendarSelector((state) => state.context.endDate);

  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();

  const openingHours = useCalendarSelector(
    (state) => state.context.openingHours,
  );

  const hasOpeningHours = openingHours.length > 0;

  const handleChangeOption = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === FixedDayOptions.PERIODIC) {
      onChooseWithStartAndEndDate();
    }
    if (value === FixedDayOptions.PERMANENT) {
      onChoosePermanent();
    }
  };

  const selectedOption = useMemo(() => {
    if (isPermanent) {
      return FixedDayOptions.PERMANENT;
    }
    return FixedDayOptions.PERIODIC;
  }, [isPermanent]);

  const openingHoursContent = hasOpeningHours ? (
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
        <Button
          variant={ButtonVariants.SECONDARY}
          onClick={() => setIsCalendarOpeninghoursModalVisible(true)}
        >
          {t('create.calendar.fixed_days.button_change_opening_hours')}
        </Button>
      </List.Item>
      {openingHours.map((openingHour, index) => (
        <List.Item
          paddingTop={2}
          paddingBottom={2}
          css={`
            border-top: 1px solid lightgrey;
          `}
          justifyContent="space-between"
          spacing={2}
          key={index}
        >
          <Text maxWidth="25rem">
            {openingHour.dayOfWeek
              .map((dayOfWeek) => t(`create.calendar.days.full.${dayOfWeek}`))
              .join(', ')}
          </Text>
          <Text>
            {openingHour.opens} - {openingHour.closes}
          </Text>
        </List.Item>
      ))}
    </List>
  ) : (
    <Button
      variant={ButtonVariants.SECONDARY}
      onClick={() => setIsCalendarOpeninghoursModalVisible(true)}
      alignSelf="flex-start"
    >
      {t('create.calendar.fixed_days.button_add_opening_hours')}
    </Button>
  );

  return (
    <Stack spacing={5} alignItems="flex-start">
      <Stack spacing={4}>
        <RadioButtonWithLabel
          id={`fixed-days-radio-${FixedDayOptions.PERIODIC}`}
          name="fixed-days-options"
          value={FixedDayOptions.PERIODIC}
          checked={selectedOption === FixedDayOptions.PERIODIC}
          onChange={handleChangeOption}
          label={t('create.calendar.fixed_days.with_start_and_end_date')}
        />
        {isPeriodic && (
          <Stack
            paddingBottom={4.5}
            paddingX={4.5}
            spacing={4}
            css={`
              border-bottom: 1px solid ${colors.grey1};
            `}
          >
            <DatePeriodPicker
              id="calendar-step-fixed"
              dateStart={new Date(startDate)}
              dateEnd={new Date(endDate)}
              onDateStartChange={onChangeStartDate}
              onDateEndChange={onChangeEndDate}
              showHolidaysToggle={isBoaEnabled}
              apiHolidays={apiHolidays}
              onShowHolidaysChange={onShowHolidaysChange}
            />
            {openingHoursContent}
          </Stack>
        )}
        <RadioButtonWithLabel
          id={`fixed-days-radio-${FixedDayOptions.PERMANENT}`}
          name="fixed-days-options"
          value={FixedDayOptions.PERMANENT}
          checked={selectedOption === FixedDayOptions.PERMANENT}
          onChange={handleChangeOption}
          label={t('create.calendar.fixed_days.permanent')}
        />
        {isPermanent && <Stack paddingX={4.5}>{openingHoursContent}</Stack>}
      </Stack>
      {isBoaEnabled && isCalendarOpeninghoursModalVisible ? (
        <CalendarOpeninghoursModal
          visible={isCalendarOpeninghoursModalVisible}
          onClose={() => setIsCalendarOpeninghoursModalVisible(false)}
          onChangeCalendarState={onChangeCalendarState}
          onChangeAdjustedDays={onChangeAdjustedDays}
          initialDeviatingPeriods={initialAdjustedDays}
          onChangeClosingPeriods={onChangeClosingPeriods}
          initialClosingPeriods={initialClosingPeriods}
        />
      ) : (
        <CalendarOpeninghoursModalLegacy
          visible={isCalendarOpeninghoursModalVisible}
          onClose={() => setIsCalendarOpeninghoursModalVisible(false)}
          onChangeCalendarState={onChangeCalendarState}
        />
      )}
    </Stack>
  );
};
