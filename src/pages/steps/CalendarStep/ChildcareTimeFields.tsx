import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/ui/Checkbox';
import { Label, LabelVariants } from '@/ui/Label';
import { cn } from '@/ui/shadcn/utils';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import { TimeField, TimeFieldLabelPositions } from '@/ui/TimeField';
import { getChildcareTimeErrors } from '@/utils/validateOpeningHours';

type ChildcareTimeFieldsProps = {
  idPrefix: string;
  startTime: string;
  endTime: string;
  onChangeStartTime: (newTime: string) => void;
  onChangeEndTime: (newTime: string) => void;
  disabled?: boolean;
  showInfo?: boolean;
};

const ChildcareTimeFields = ({
  idPrefix,
  startTime,
  endTime,
  onChangeStartTime,
  onChangeEndTime,
  disabled = false,
  showInfo = false,
}: ChildcareTimeFieldsProps) => {
  const { t } = useTranslation();
  const [startEnabled, setStartEnabled] = useState(() => !!startTime);
  const [endEnabled, setEndEnabled] = useState(() => !!endTime);
  const startToggleId = `${idPrefix}-childcare-before-toggle`;
  const endToggleId = `${idPrefix}-childcare-after-toggle`;
  const fieldId = (suffix: 'start' | 'end') =>
    `${idPrefix}-childcare-time-span-picker-${suffix}`;

  const handleToggleStart = (checked: boolean) => {
    setStartEnabled(checked);
    if (!checked && startTime) onChangeStartTime('');
  };

  const handleToggleEnd = (checked: boolean) => {
    setEndEnabled(checked);
    if (!checked && endTime) onChangeEndTime('');
  };

  return (
    <div className="tw:relative tw:flex tw:items-end tw:gap-3">
      <div className="tw:flex tw:flex-col tw:gap-1">
        <div className="tw:flex tw:items-center tw:gap-1">
          <Checkbox
            id={startToggleId}
            checked={startEnabled}
            disabled={disabled}
            onCheckedChange={handleToggleStart}
          />
          <Label
            variant={LabelVariants.BOLD}
            htmlFor={startToggleId}
            disabled={disabled}
            className={cn(!startEnabled && 'tw:text-muted-foreground')}
          >
            {t('create.calendar.days.childcare.before')}
          </Label>
        </div>
        <TimeField
          id={fieldId('start')}
          name="startTime"
          label={t('create.calendar.days.childcare.from')}
          labelPosition={TimeFieldLabelPositions.INLINE}
          value={startTime}
          onChange={onChangeStartTime}
          disabled={disabled || !startEnabled}
        />
      </div>
      <div className="tw:flex tw:flex-col tw:gap-1">
        <div className="tw:flex tw:items-center tw:gap-1">
          <Checkbox
            id={endToggleId}
            checked={endEnabled}
            disabled={disabled}
            onCheckedChange={handleToggleEnd}
          />
          <Label
            variant={LabelVariants.BOLD}
            htmlFor={endToggleId}
            disabled={disabled}
            className={cn(!endEnabled && 'tw:text-muted-foreground')}
          >
            {t('create.calendar.days.childcare.after')}
          </Label>
        </div>
        <TimeField
          id={fieldId('end')}
          name="endTime"
          label={t('create.calendar.days.childcare.to')}
          labelPosition={TimeFieldLabelPositions.INLINE}
          value={endTime}
          onChange={onChangeEndTime}
          disabled={disabled || !endEnabled}
        />
      </div>
      {showInfo && (
        <Text
          color={colors.textMuted}
          position="absolute"
          top="100%"
          left={0}
          right={0}
        >
          {t('create.calendar.days.childcare.info')}
        </Text>
      )}
    </div>
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
