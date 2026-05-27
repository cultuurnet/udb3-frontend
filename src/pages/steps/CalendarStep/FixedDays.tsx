import { format } from 'date-fns';
import { ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHolidaysWithToggle } from '@/hooks/api/holidays';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { OpeningHours } from '@/types/Offer';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { Inline } from '@/ui/Inline';
import { List } from '@/ui/List';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { RadioButtonWithLabel } from '@/ui/RadioButtonWithLabel';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';

import type { SupportedLanguage } from '../../../i18n';
import {
  CalendarState,
  useCalendarSelector,
  useIsPeriodic,
  useIsPermanent,
} from '../machines/calendarMachine';
import { useCalendarHandlers } from '../machines/useCalendarHandlers';
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
  const { t, i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);

  const [
    isCalendarOpeninghoursModalVisible,
    setIsCalendarOpeninghoursModalVisible,
  ] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const { handleChangeOpeningHours } = useCalendarHandlers(
    onChangeCalendarState,
  );

  const isPeriodic = useIsPeriodic();
  const isPermanent = useIsPermanent();

  const startDate = useCalendarSelector((state) => state.context.startDate);
  const endDate = useCalendarSelector((state) => state.context.endDate);

  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();

  const openingHours = useCalendarSelector(
    (state) => state.context.openingHours,
  );

  const hasOpeningHours = openingHours.length > 0;
  const hasBoaContent =
    hasOpeningHours ||
    (initialAdjustedDays?.length ?? 0) > 0 ||
    (initialClosingPeriods?.length ?? 0) > 0;

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
    onChangeAdjustedDays?.([]);
    onChangeClosingPeriods?.([]);
    handleChangeOpeningHours([]);
    setIsDeleteConfirmVisible(false);
  };

  const openingHoursContent =
    isBoaEnabled && hasBoaContent ? (
      <Stack spacing={3}>
        <Inline justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">
            {t('create.calendar.fixed_days.opening_hours')}
          </Text>
          <Inline spacing={3}>
            <Button
              variant={ButtonVariants.LINK}
              onClick={() => setIsCalendarOpeninghoursModalVisible(true)}
            >
              {t('create.calendar.fixed_days.overview.edit')}
            </Button>
            <Button
              variant={ButtonVariants.LINK_DANGER}
              onClick={() => setIsDeleteConfirmVisible(true)}
            >
              {t('create.calendar.fixed_days.overview.delete')}
            </Button>
          </Inline>
        </Inline>

        <Stack spacing={5}>
          <Stack>
            <Text color={colors.udbMainDarkBlue} fontWeight="bold">
              {t('create.calendar.fixed_days.overview.weekly_on')}
            </Text>
            <Stack>
              {openingHours.map((openingHour, index) => (
                <Stack
                  key={index}
                  paddingY={2}
                  css={`
                    ${index > 0 ? `border-top: 1px solid ${colors.grey3};` : ''}
                  `}
                >
                  <Inline alignItems="flex-start">
                    <Text minWidth="12rem">
                      {openingHour.dayOfWeek
                        .map((day) => t(`create.calendar.days.short.${day}`))
                        .join(', ')}
                    </Text>
                    <Text minWidth="8rem">
                      {openingHour.opens} - {openingHour.closes}
                    </Text>
                    <Stack spacing={1} minWidth="10rem">
                      {openingHour.childcareStartTime &&
                        openingHour.childcareEndTime && (
                          <>
                            <Text fontStyle="italic">
                              {t(
                                'create.calendar.fixed_days.overview.childcare_before',
                                { start: openingHour.childcareStartTime },
                              )}
                            </Text>
                            <Text fontStyle="italic">
                              {t(
                                'create.calendar.fixed_days.overview.childcare_after',
                                { end: openingHour.childcareEndTime },
                              )}
                            </Text>
                          </>
                        )}
                    </Stack>
                  </Inline>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {initialAdjustedDays && initialAdjustedDays.length > 0 && (
            <Stack>
              <Text color={colors.udbMainDarkBlue} fontWeight="bold">
                {t('create.calendar.fixed_days.overview.deviating_except')}
              </Text>
              <Stack spacing={4}>
                {initialAdjustedDays.map((period) => (
                  <Stack key={period.id} spacing={1}>
                    <Text>
                      {`${format(period.startDate, 'dd/MM/yyyy')} - ${format(period.endDate, 'dd/MM/yyyy')}`}
                      {period.description[lang]
                        ? ` (${period.description[lang]})`
                        : ''}
                    </Text>
                    <Text color={colors.udbMainDarkBlue}>
                      {t(
                        'create.calendar.fixed_days.overview.deviating_then_weekly',
                      )}
                    </Text>
                    {period.openingHours.map((openingHour, index) => (
                      <Stack
                        key={index}
                        paddingTop={index > 0 ? 2 : 0}
                        paddingBottom={2}
                        css={`
                          ${index > 0 ? `border-top: 1px solid ${colors.grey3};` : ''}
                        `}
                      >
                        <Inline alignItems="flex-start">
                          <Text minWidth="12rem">
                            {openingHour.dayOfWeek
                              .map((day) =>
                                t(`create.calendar.days.short.${day}`),
                              )
                              .join(', ')}
                          </Text>
                          <Text minWidth="8rem">
                            {openingHour.opens} - {openingHour.closes}
                          </Text>
                          <Stack spacing={1} minWidth="10rem">
                            {openingHour.childcare?.start &&
                              openingHour.childcare?.end && (
                                <>
                                  <Text fontStyle="italic">
                                    {t(
                                      'create.calendar.fixed_days.overview.childcare_before',
                                      { start: openingHour.childcare.start },
                                    )}
                                  </Text>
                                  <Text fontStyle="italic">
                                    {t(
                                      'create.calendar.fixed_days.overview.childcare_after',
                                      { end: openingHour.childcare.end },
                                    )}
                                  </Text>
                                </>
                              )}
                          </Stack>
                        </Inline>
                      </Stack>
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          {initialClosingPeriods && initialClosingPeriods.length > 0 && (
            <Stack spacing={1}>
              <Text color={colors.udbMainDarkBlue} fontWeight="bold">
                {t('create.calendar.fixed_days.overview.closed')}
              </Text>
              {initialClosingPeriods.map((period) => (
                <Text key={period.id}>
                  {`${format(period.startDate, 'dd/MM/yyyy')} - ${format(period.endDate, 'dd/MM/yyyy')}`}
                  {period.description[lang]
                    ? ` (${period.description[lang]})`
                    : ''}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    ) : hasOpeningHours ? (
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
              border-top: 1px solid ${colors.grey3};
            `}
            justifyContent="space-between"
            spacing={2}
            key={index}
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
    ) : (
      <Button
        variant={ButtonVariants.SECONDARY}
        onClick={() => setIsCalendarOpeninghoursModalVisible(true)}
        alignSelf="flex-start"
      >
        {t(
          isBoaEnabled
            ? 'create.calendar.fixed_days.button_add_hours'
            : 'create.calendar.fixed_days.button_add_opening_hours',
        )}
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
          visible={isDeleteConfirmVisible}
          variant={ModalVariants.QUESTION}
          size={ModalSizes.MD}
          title={t('create.calendar.fixed_days.overview.delete_modal.title')}
          confirmTitle={t(
            'create.calendar.fixed_days.overview.delete_modal.confirm',
          )}
          confirmButtonVariant={ButtonVariants.DANGER}
          cancelTitle={t('create.calendar.opening_hours_modal.button_cancel')}
          onClose={() => setIsDeleteConfirmVisible(false)}
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
