import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { Box } from './Box';
import type { InlineProps } from './Inline';
import { Label, LabelVariants } from './Label';
import { cn } from './shadcn/utils';
import { getValueFromTheme } from './theme';
import { Typeahead } from './Typeahead';

const TimeSpanPickerLabelPositions = {
  TOP: 'top',
  INLINE: 'inline',
} as const;

type TimeSpanPickerLabelPosition =
  (typeof TimeSpanPickerLabelPositions)[keyof typeof TimeSpanPickerLabelPositions];

const getValueForTimePicker = getValueFromTheme('timePicker');

const getHourOptions = () => {
  const hours = Array(24).fill(0);
  const minutes = Array(60).fill(0);
  const times = [];
  hours.forEach((_hour, i) => {
    minutes.forEach((_minute, minuteIndex) =>
      times.push(
        `${i > 9 ? i : `0${i}`}:${
          minuteIndex > 9 ? minuteIndex : `0${minuteIndex}`
        }`,
      ),
    );
  });

  return times;
};

const hourOptions = getHourOptions();

const quarterHours = ['00', '15', '30', '45'];

type Props = {
  id: string;
  className?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  startTime?: string;
  endTime?: string;
  onChangeStartTime: (newStartTime: string) => void;
  onChangeEndTime: (newEndTime: string) => void;
  disabled?: boolean;
  labelPosition?: TimeSpanPickerLabelPosition;
} & InlineProps;

const isQuarterHour = (time: string) =>
  quarterHours.some((quarterHour) => time.endsWith(quarterHour));

const dropDownCss = css`
  width: 6rem;
  flex: 0 0 auto;

  input {
    text-align: center;
  }

  .rbt-menu.dropdown-menu.show {
    min-width: 0;
    max-height: 300px !important;

    z-index: ${getValueForTimePicker('zIndexPopup')};

    .dropdown-item {
      padding: 0.25rem 0;
      text-align: center;
    }
  }

  .rbt-input-hint {
    display: none;
  }
`;

const inlineLabelDropDownCss = css`
  ${dropDownCss}

  width: 7rem;

  input {
    padding-left: 2rem;
    text-align: right;
  }
`;

const TimeSpanPicker = ({
  id,
  startTime,
  endTime,
  startTimeLabel,
  endTimeLabel,
  onChangeStartTime,
  onChangeEndTime,
  disabled,
  labelPosition = TimeSpanPickerLabelPositions.TOP,
  className,
}: Props) => {
  const { t } = useTranslation();
  const idPrefix = `${id}-time-span-picker`;
  const isInline = labelPosition === TimeSpanPickerLabelPositions.INLINE;

  const timeSlots = (time: string) => time === '23:59' || isQuarterHour(time);

  const fields = [
    {
      key: 'start',
      label: startTimeLabel ?? t('time_span_picker.start'),
      value: startTime,
      onChange: onChangeStartTime,
      name: 'startTime',
    },
    {
      key: 'end',
      label: endTimeLabel ?? t('time_span_picker.end'),
      value: endTime,
      onChange: onChangeEndTime,
      name: 'endTime',
    },
  ];

  return (
    <div className={cn('tw:flex tw:gap-2', className)}>
      {fields.map(({ key, label, value, onChange, name }) => {
        const typeahead = (
          <Typeahead<string>
            inputType="time"
            inputRequired={true}
            name={name}
            id={`${idPrefix}-${key}`}
            filterBy={timeSlots}
            defaultInputValue={value}
            options={hourOptions}
            minLength={0}
            onBlur={(event) => onChange(event.target.value)}
            onChange={([newValue]: string[]) => {
              if (!newValue) return;
              onChange(newValue);
            }}
            positionFixed
            disabled={disabled}
            css={isInline ? inlineLabelDropDownCss : dropDownCss}
          />
        );

        if (isInline) {
          return (
            <Box key={key} position="relative" display="inline-block">
              <Label
                htmlFor={`${idPrefix}-${key}`}
                className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none tw:z-1 tw:text-[0.85rem] tw:text-muted-foreground tw:font-normal tw:m-0"
              >
                {label}
              </Label>
              {typeahead}
            </Box>
          );
        }

        return (
          <div key={key} className="tw:flex tw:flex-col tw:gap-y-1">
            <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-${key}`}>
              {label}
            </Label>
            {typeahead}
          </div>
        );
      })}
    </div>
  );
};

export { TimeSpanPicker, TimeSpanPickerLabelPositions };
