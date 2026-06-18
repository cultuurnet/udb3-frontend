import { ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHolidaysWithToggle } from '@/hooks/api/holidays';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { OpeningHours } from '@/types/Offer';
import { Box } from '@/ui/Box';
import { ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
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
import { OpeningHoursContent } from './OpeningHoursContent';

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
  onChangeAdjustedDays: (adjustedDays: DeviatingPeriodData[]) => void;
  initialAdjustedDays?: DeviatingPeriodData[];
  onChangeClosingPeriods: (closingPeriods: ClosingPeriodData[]) => void;
  initialClosingPeriods?: ClosingPeriodData[];
};

export const FixedDays = ({
  onChooseWithStartAndEndDate,
  onChoosePermanent,
  onChangeStartDate,
  onChangeEndDate,
  onChangeCalendarState,
  onChangeOpeningHours,
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
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] =
    useState(false);

  const isPeriodic = useIsPeriodic();
  const isPermanent = useIsPermanent();

  const startDate = useCalendarSelector((state) => state.context.startDate);
  const endDate = useCalendarSelector((state) => state.context.endDate);

  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();

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

  const handleDeleteAll = () => {
    onChangeAdjustedDays([]);
    onChangeClosingPeriods([]);
    onChangeOpeningHours([]);
    setIsDeleteConfirmModalVisible(false);
  };

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
            spacing={0}
            className="tw:gap-4"
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
            <OpeningHoursContent
              initialAdjustedDays={initialAdjustedDays}
              initialClosingPeriods={initialClosingPeriods}
              onOpenModal={() => setIsCalendarOpeninghoursModalVisible(true)}
              onRequestDelete={() => setIsDeleteConfirmModalVisible(true)}
            />
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
        {isPermanent && (
          <Stack paddingX={4.5}>
            <OpeningHoursContent
              initialAdjustedDays={initialAdjustedDays}
              initialClosingPeriods={initialClosingPeriods}
              onOpenModal={() => setIsCalendarOpeninghoursModalVisible(true)}
              onRequestDelete={() => setIsDeleteConfirmModalVisible(true)}
            />
          </Stack>
        )}
      </Stack>
      {!isBoaEnabled && (
        <CalendarOpeninghoursModalLegacy
          visible={isCalendarOpeninghoursModalVisible}
          onClose={() => setIsCalendarOpeninghoursModalVisible(false)}
          onChangeCalendarState={onChangeCalendarState}
        />
      )}
      {isBoaEnabled && isCalendarOpeninghoursModalVisible && (
        <CalendarOpeninghoursModal
          visible={isCalendarOpeninghoursModalVisible}
          onClose={() => setIsCalendarOpeninghoursModalVisible(false)}
          onChangeCalendarState={onChangeCalendarState}
          onChangeAdjustedDays={onChangeAdjustedDays}
          initialDeviatingPeriods={initialAdjustedDays}
          onChangeClosingPeriods={onChangeClosingPeriods}
          initialClosingPeriods={initialClosingPeriods}
        />
      )}
      {isBoaEnabled && (
        <Modal
          visible={isDeleteConfirmModalVisible}
          variant={ModalVariants.QUESTION}
          size={ModalSizes.MD}
          title={t('create.calendar.fixed_days.overview.delete_modal.title')}
          confirmTitle={t(
            'create.calendar.fixed_days.overview.delete_modal.confirm',
          )}
          confirmButtonVariant={ButtonVariants.DANGER}
          cancelTitle={t('create.calendar.opening_hours_modal.button_cancel')}
          onClose={() => setIsDeleteConfirmModalVisible(false)}
          onConfirm={handleDeleteAll}
        >
          <Box padding={4}>
            <Text>
              {t('create.calendar.fixed_days.overview.delete_modal.body')}
            </Text>
          </Box>
        </Modal>
      )}
    </Stack>
  );
};
