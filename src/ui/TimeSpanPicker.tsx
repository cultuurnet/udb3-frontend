import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { getInlineProps, Inline, InlineProps } from './Inline';
import { Label, LabelVariants } from './Label';
import { Stack } from './Stack';
import { Text, TextVariants } from './Text';
import { getGlobalBorderRadius, getValueFromTheme } from './theme';
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

const timeToNumeric = (time: string) => parseInt(time.replace(':', ''));

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

const inlineDropDownCss = css`
  flex: 1 1 auto;
  width: 100%;
  display: block;

  .rbt,
  .rbt-input,
  .rbt-input-main,
  .rbt-input-wrapper {
    width: 100% !important;
    display: block !important;
  }

  .form-control {
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 0 0 0 2.5rem;
    height: auto;
    text-align: center;
    width: 100%;
  }

  .form-control:focus {
    box-shadow: none;
  }

  input::-webkit-calendar-picker-indicator {
    display: none;
  }

  .rbt-menu.dropdown-menu.show {
    min-width: 7.5rem !important;
    width: 7.5rem !important;
    margin-top: 0.5rem;
    margin-left: -0.75rem;
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

const TimeSpanPicker = ({
  id,
  startTime,
  endTime,
  startTimeLabel,
  endTimeLabel,
  onChangeStartTime,
  onChangeEndTime,
  disabled,
  minWidth,
  labelPosition = TimeSpanPickerLabelPositions.TOP,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const idPrefix = `${id}-time-span-picker`;

  const timeSlots = (time: string) => time === '23:59' || isQuarterHour(time);

  if (labelPosition === TimeSpanPickerLabelPositions.INLINE) {
    const fields = [
      {
        key: 'start',
        label: startTimeLabel ?? t('time_span_picker.start'),
        value: startTime,
        onChange: onChangeStartTime,
      },
      {
        key: 'end',
        label: endTimeLabel ?? t('time_span_picker.end'),
        value: endTime,
        onChange: onChangeEndTime,
      },
    ];

    return (
      <Inline
        as="div"
        css={`
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 0.5rem;
        `}
        {...getInlineProps(props)}
      >
        {fields.map(({ key, label, value, onChange }) => (
          <Inline
            key={key}
            alignItems="center"
            css={`
              position: relative;
              flex: 0 0 auto;
              width: 7.5rem;
              border: var(--bs-border-width) solid var(--bs-border-color);
              border-radius: ${getGlobalBorderRadius};
              padding: 0.375rem 0.75rem;
              background: white;
              transition:
                border-color 0.15s ease-in-out,
                box-shadow 0.15s ease-in-out;
              ${disabled ? 'opacity: 0.5;' : ''}

              &:focus-within {
                border-color: #86b7fe;
                box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                outline: 0;
              }
            `}
          >
            <Text
              variant={TextVariants.MUTED}
              fontSize="0.85rem"
              css={`
                position: absolute;
                left: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
              `}
            >
              {label}
            </Text>
            <Typeahead<string>
              inputType="time"
              inputRequired={true}
              name={key === 'start' ? 'startTime' : 'endTime'}
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
              css={inlineDropDownCss}
            />
          </Inline>
        ))}
      </Inline>
    );
  }

  return (
    <Inline as="div" spacing={3} {...getInlineProps(props)}>
      <Stack spacing={2} as="div">
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-start`}>
          {startTimeLabel ?? t('time_span_picker.start')}
        </Label>
        <Typeahead<string>
          inputType="time"
          inputRequired={true}
          name="startTime"
          id={`${idPrefix}-start`}
          filterBy={timeSlots}
          defaultInputValue={startTime}
          options={hourOptions}
          onBlur={(event) => onChangeStartTime(event.target.value)}
          onChange={([newValue]: string[]) => {
            if (!newValue) return;
            onChangeStartTime(newValue);
          }}
          positionFixed
          disabled={disabled}
          css={dropDownCss}
        />
      </Stack>
      <Stack spacing={2} as="div">
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-end`}>
          {endTimeLabel ?? t('time_span_picker.end')}
        </Label>
        <Typeahead<string>
          inputType="time"
          inputRequired={true}
          name="endTime"
          id={`${idPrefix}-end`}
          filterBy={timeSlots}
          defaultInputValue={endTime}
          options={hourOptions}
          onBlur={(event) => onChangeEndTime(event.target.value)}
          onChange={([newValue]: string[]) => {
            if (!newValue) return;
            onChangeEndTime(newValue);
          }}
          css={dropDownCss}
          positionFixed
          disabled={disabled}
        />
      </Stack>
    </Inline>
  );
};

export { TimeSpanPicker, TimeSpanPickerLabelPositions };
