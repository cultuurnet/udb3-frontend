import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { cn } from './shadcn/utils';
import type { TimeFieldLabelPosition } from './TimeField';
import { TimeFieldLabelPositions, TimeFieldShadcn } from './TimeField';
import { TimeSpanPickerLegacy } from './TimeSpanPickerLegacy';

const TimeSpanPickerLabelPositions = TimeFieldLabelPositions;

type TimeSpanPickerProps = {
  id: string;
  className?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  startTime?: string;
  endTime?: string;
  onChangeStartTime: (newStartTime: string) => void;
  onChangeEndTime: (newEndTime: string) => void;
  disabled?: boolean;
  startDisabled?: boolean;
  endDisabled?: boolean;
  labelPosition?: TimeFieldLabelPosition;
};

const TimeSpanPickerShadcn = ({
  id,
  startTime,
  endTime,
  startTimeLabel,
  endTimeLabel,
  onChangeStartTime,
  onChangeEndTime,
  disabled,
  startDisabled,
  endDisabled,
  labelPosition = TimeSpanPickerLabelPositions.TOP,
  className,
}: TimeSpanPickerProps) => {
  const { t } = useTranslation();
  const idPrefix = `${id}-time-span-picker`;

  const fields = [
    {
      key: 'start',
      name: 'startTime',
      label: startTimeLabel ?? t('time_span_picker.start'),
      value: startTime,
      onChange: onChangeStartTime,
      disabled: startDisabled ?? disabled,
    },
    {
      key: 'end',
      name: 'endTime',
      label: endTimeLabel ?? t('time_span_picker.end'),
      value: endTime,
      onChange: onChangeEndTime,
      disabled: endDisabled ?? disabled,
    },
  ];

  return (
    <div
      className={cn('tw:flex tw:flex-nowrap tw:items-end tw:gap-3', className)}
    >
      {fields.map(
        ({ key, name, label, value, onChange, disabled: fieldDisabled }) => (
          <TimeFieldShadcn
            key={key}
            id={`${idPrefix}-${key}`}
            name={name}
            label={label}
            value={value}
            onChange={onChange}
            disabled={fieldDisabled}
            labelPosition={labelPosition}
          />
        ),
      )}
    </div>
  );
};

const TimeSpanPicker = (props: TimeSpanPickerProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <TimeSpanPickerShadcn {...props} />;
  }

  return <TimeSpanPickerLegacy {...props} />;
};

export type { TimeSpanPickerProps };
export { TimeSpanPicker, TimeSpanPickerLabelPositions };
