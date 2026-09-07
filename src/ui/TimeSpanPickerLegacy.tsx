import { useTranslation } from 'react-i18next';

import { getInlineProps, Inline } from './Inline';
import { cn } from './shadcn/utils';
import { TimeFieldLegacy } from './TimeField';
import type { TimeSpanPickerProps } from './TimeSpanPicker';

const TimeSpanPickerLegacy = ({
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
  labelPosition,
  className,
  ...props
}: TimeSpanPickerProps) => {
  const { t } = useTranslation();
  const idPrefix = `${id}-time-span-picker`;

  const fields = [
    {
      key: 'start',
      label: startTimeLabel ?? t('time_span_picker.start'),
      value: startTime,
      onChange: onChangeStartTime,
      name: 'startTime',
      disabled: startDisabled ?? disabled,
    },
    {
      key: 'end',
      label: endTimeLabel ?? t('time_span_picker.end'),
      value: endTime,
      onChange: onChangeEndTime,
      name: 'endTime',
      disabled: endDisabled ?? disabled,
    },
  ];

  return (
    <Inline
      as="div"
      alignItems="flex-end"
      className={cn('tw:gap-2', className)}
      {...getInlineProps(props)}
    >
      {fields.map(
        ({ key, label, value, onChange, name, disabled: fieldDisabled }) => (
          <TimeFieldLegacy
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
    </Inline>
  );
};

export { TimeSpanPickerLegacy };
