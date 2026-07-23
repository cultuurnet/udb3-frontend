import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BoxProps } from '@/ui/Box';
import { Checkbox } from '@/ui/Checkbox';
import { Label, LabelVariants } from '@/ui/Label';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import {
  TimeSpanPicker,
  TimeSpanPickerLabelPositions,
} from '@/ui/TimeSpanPicker';
import { getChildcareTimeErrors } from '@/utils/validateOpeningHours';

type ChildcareTimeFieldsProps = BoxProps & {
  idPrefix: string;
  startTime: string;
  endTime: string;
  onChangeStartTime: (newTime: string) => void;
  onChangeEndTime: (newTime: string) => void;
  disabled?: boolean;
};

const ChildcareTimeFields = ({
  idPrefix,
  startTime,
  endTime,
  onChangeStartTime,
  onChangeEndTime,
  disabled = false,
  ...boxProps
}: ChildcareTimeFieldsProps) => {
  const { t } = useTranslation();
  const [startEnabled, setStartEnabled] = useState(() => !!startTime);
  const [endEnabled, setEndEnabled] = useState(() => !!endTime);
  const startToggleId = `${idPrefix}-childcare-before-toggle`;
  const endToggleId = `${idPrefix}-childcare-after-toggle`;

  const handleToggleStart = (checked: boolean) => {
    setStartEnabled(checked);
    if (!checked && startTime) onChangeStartTime('');
  };

  const handleToggleEnd = (checked: boolean) => {
    setEndEnabled(checked);
    if (!checked && endTime) onChangeEndTime('');
  };

  return (
    <Stack position="relative" {...boxProps}>
      <div className="tw:flex tw:gap-2">
        <div className="tw:flex tw:items-center tw:gap-1 tw:mb-2">
          <Checkbox
            id={startToggleId}
            checked={startEnabled}
            disabled={disabled}
            onCheckedChange={handleToggleStart}
          />
          <Label
            variant={LabelVariants.BOLD}
            htmlFor={startToggleId}
            color={!startEnabled ? colors.grey5 : undefined}
            cursor={disabled ? 'not-allowed' : 'pointer'}
          >
            {t('create.calendar.days.childcare.before')}
          </Label>
        </div>
        <div className="tw:flex tw:items-center tw:gap-1 tw:mb-2">
          <Checkbox
            id={endToggleId}
            checked={endEnabled}
            disabled={disabled}
            onCheckedChange={handleToggleEnd}
          />
          <Label
            variant={LabelVariants.BOLD}
            htmlFor={endToggleId}
            color={!endEnabled ? colors.grey5 : undefined}
            cursor={disabled ? 'not-allowed' : 'pointer'}
          >
            {t('create.calendar.days.childcare.after')}
          </Label>
        </div>
      </div>
      <TimeSpanPicker
        id={`${idPrefix}-childcare`}
        labelPosition={TimeSpanPickerLabelPositions.INLINE}
        startTimeLabel={t('create.calendar.days.childcare.from')}
        endTimeLabel={t('create.calendar.days.childcare.to')}
        startTime={startTime}
        endTime={endTime}
        onChangeStartTime={onChangeStartTime}
        onChangeEndTime={onChangeEndTime}
        startDisabled={disabled || !startEnabled}
        endDisabled={disabled || !endEnabled}
      />
      <Text
        color={colors.grey5}
        position="absolute"
        top="100%"
        left={0}
        right={0}
      >
        {t('create.calendar.days.childcare.info')}
      </Text>
    </Stack>
  );
};

type GetChildcareErrorsParams = {
  childcareStartTime?: string;
  childcareEndTime?: string;
  activityStart: string;
  activityEnd: string;
};

const getChildcareErrors = (
  t: TFunction,
  {
    childcareStartTime,
    childcareEndTime,
    activityStart,
    activityEnd,
  }: GetChildcareErrorsParams,
): { startError?: string; endError?: string } => {
  const { startTooLate, endTooEarly } = getChildcareTimeErrors({
    childcareStart: childcareStartTime,
    childcareEnd: childcareEndTime,
    activityStart,
    activityEnd,
  });

  return {
    startError: startTooLate
      ? t('create.calendar.days.childcare.validation_messages.start_too_late')
      : undefined,
    endError: endTooEarly
      ? t('create.calendar.days.childcare.validation_messages.end_too_early')
      : undefined,
  };
};

export { ChildcareTimeFields, getChildcareErrors };
