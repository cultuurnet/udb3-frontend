import 'react-datepicker/dist/react-datepicker.css';

import de from 'date-fns/locale/de';
import fr from 'date-fns/locale/fr';
import nl from 'date-fns/locale/nl';
import { ComponentType, ReactNode, useRef } from 'react';
import ReactDatePicker, {
  registerLocale,
  setDefaultLocale,
} from 'react-datepicker';
import { useTranslation } from 'react-i18next';

import type { BoxProps } from './Box';
import { Box } from './Box';
import { Button, ButtonVariants } from './Button';
import { Icons } from './Icon';
import { getInlineProps, Inline } from './Inline';
import { Input } from './Input';
import { Stack } from './Stack';
import { colors, getValueFromTheme } from './theme';

setDefaultLocale('nl');
registerLocale('nl', nl);
registerLocale('fr', fr);
registerLocale('de', de);

const getValue = getValueFromTheme('datePicker');

type Props = Omit<BoxProps, 'selected' | 'onChange'> & {
  id: string;
  selected?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (value: Date) => void;
  onCalendarClose?: () => void;
  onMonthChange?: (date: Date) => void;
  onYearChange?: (date: Date) => void;
  highlightDates?: Date[];
  calendarHeader?: ReactNode;
  calendarContent?: ReactNode;
  calendarWidth?: string;
  withHolidays?: boolean;
};

const DatePicker = ({
  id,
  selected = new Date(),
  onChange,
  onCalendarClose,
  onMonthChange,
  onYearChange,
  className,
  minDate,
  maxDate,
  disabled,
  highlightDates,
  calendarHeader,
  calendarContent,
  calendarWidth,
  withHolidays = false,
  ...props
}: Props) => {
  const { i18n } = useTranslation();
  const datePickerRef = useRef(null);

  return (
    <Inline
      {...getInlineProps(props)}
      css={`
        .react-datepicker__day--keyboard-selected {
          background-color: ${withHolidays ? 'transparent' : colors.grey1};
          color: ${withHolidays ? 'inherit' : '#000'};
          font-weight: ${withHolidays ? 'normal' : 'bold'};
          ${!withHolidays ? `&:hover { color: ${colors.white}; }` : ''}
        }

        .react-datepicker {
          font-family:
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            'Helvetica Neue',
            Arial,
            'Noto Sans',
            sans-serif,
            'Apple Color Emoji',
            'Segoe UI Emoji',
            'Segoe UI Symbol',
            'Noto Color Emoji' !important;
          font-size: 1rem;
          border: none;
          box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1);
          ${calendarWidth ? `width: ${calendarWidth};` : ''}
        }

        .react-datepicker__header {
          background: ${withHolidays ? colors.white : colors.grey1};
          color: #333;
          border: none;
        }

        .react-datepicker__day-names {
          background-color: ${withHolidays
            ? colors.white
            : 'rgba(0, 0, 0, 0.05)'};
          display: flex;
          font-weight: bold;
          justify-content: center;
        }

        ${withHolidays
          ? `.react-datepicker__day-name {
          text-transform: uppercase;
          color: ${colors.udbMainDarkGrey};
        }`
          : ''}

        .react-datepicker__month-read-view,
        .react-datepicker__year-read-view--selected-year {
          color: #000;
          font-weight: bold;
          ${withHolidays ? `background-color: ${colors.white};` : ''}
        }

        .react-datepicker-popper[data-placement^='bottom']
          .react-datepicker__triangle::before {
          border: none;
        }

        .react-datepicker-popper[data-placement^='bottom']
          .react-datepicker__triangle::after {
          border-bottom-color: ${colors.grey1};
        }

        .react-datepicker__month-read-view--down-arrow,
        .react-datepicker__year-read-view--down-arrow {
          top: 6px;
          ${withHolidays ? `border-color: ${colors.textColor};` : ''}
        }

        ${withHolidays
          ? `.react-datepicker__month-read-view:hover
            .react-datepicker__month-read-view--down-arrow,
          .react-datepicker__year-read-view:hover
            .react-datepicker__year-read-view--down-arrow {
          border-top-color: ${colors.textColor};
        }`
          : ''}

        ${withHolidays
          ? `.react-datepicker__navigation-icon::before {
          border-color: ${colors.textColor};
        }`
          : ''}

        .react-datepicker-wrapper {
          width: auto;
          z-index: ${getValue('zIndexInput')};
        }

        .react-datepicker-wrapper input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .react-datepicker__current-month {
          display: none;
        }

        .react-datepicker-popper {
          z-index: ${getValue('zIndexPopup')};
        }

        .react-datepicker__year-read-view,
        .react-datepicker__month-read-view {
          visibility: visible !important;
          ${withHolidays ? `background-color: ${colors.white};` : ''}
        }

        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          color: #333;
          background: white;
          width: 60%;
          left: 10%;
        }

        .react-datepicker__month-dropdown-container:hover,
        .react-datepicker__year-dropdown-container:hover {
          color: #999;
        }

        .react-datepicker__month-option,
        .react-datepicker__year-option {
          padding: 0.25rem 0.5rem;
        }

        .react-datepicker__month-dropdown-container--scroll {
          margin-left: 0;
        }

        .react-datepicker__day:hover {
          background-color: ${colors.grey1};
          color: inherit;
        }

        .react-datepicker__day--selected {
          background-color: ${colors.udbMainDarkBlue};
          ${withHolidays
            ? `color: ${colors.white}; font-weight: bold;`
            : 'border-radius: 10px;'}
        }

        .react-datepicker__day--selected:hover {
          background-color: ${colors.udbMainDarkBlue};
          ${withHolidays ? `color: ${colors.white};` : ''}
        }

        .react-datepicker__navigation {
          top: 0.5rem;
        }

        .react-datepicker__navigation--years-upcoming,
        .react-datepicker__navigation--years-previous {
          display: none;
        }

        .react-datepicker__year-option:first-child::after {
          content: '▲';
          font-size: 0.8rem;
        }

        .react-datepicker__year-option:last-child::after {
          content: '▼';
          font-size: 0.8rem;
        }

        .react-datepicker__navigation--previous {
          left: -0.5rem;
        }
        .react-datepicker__navigation--next {
          right: -0.5rem;
        }

        ${withHolidays
          ? `
        .react-datepicker__day--highlighted {
          background-color: ${colors.grey1};
          color: #000;

          &.react-datepicker__day--selected {
            background-color: ${colors.udbMainDarkBlue};
            color: ${colors.white};
          }
        }

        .custom-calendar-header {
          padding: 0.75rem;
          background-color: ${colors.grey1};
          border-bottom: 1px solid ${colors.grey3};
          color: ${colors.udbMainDarkGrey};
          font-weight: bold;
          text-align: center;
        }

        .custom-calendar-header ~ .react-datepicker__navigation {
          top: 3.2rem;
        }

        .react-datepicker__children-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
        }

        .react-datepicker__month-container {
          float: none;
        }
        `
          : ''}
      `}
    >
      <Box
        forwardedAs={ReactDatePicker as unknown as ComponentType<any>}
        ref={datePickerRef}
        className={className}
        id={id}
        selected={selected}
        onChange={onChange}
        onCalendarClose={onCalendarClose}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        minDate={minDate}
        maxDate={maxDate}
        customInput={
          <Input
            id={id}
            value={selected ? selected.toLocaleDateString() : ''}
            maxWidth="150px"
          />
        }
        disabled={disabled}
        locale={i18n.language}
        // Empty css prop is necessary here
        highlightDates={highlightDates}
        calendarContainer={
          calendarHeader
            ? ({ className, children }) => (
                <Stack
                  className={className}
                  css={`
                    border-radius: 0.5rem;
                    overflow: hidden;
                  `}
                >
                  <Box className="custom-calendar-header">{calendarHeader}</Box>
                  {children}
                </Stack>
              )
            : undefined
        }
        css=""
      >
        {calendarContent}
      </Box>
      <Button
        variant={ButtonVariants.SECONDARY}
        iconName={Icons.CALENDAR_ALT}
        onClick={() => datePickerRef.current?.setOpen(true)}
        disabled={disabled}
        css={`
          &.btn {
            box-shadow: none;
            border: 1px lightgray solid;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left: none;
            min-height: 0;

            z-index: ${getValue('zIndexButton')};

            &:focus {
              border-left: inherit;
            }
          }
        `}
      />
    </Inline>
  );
};

export { DatePicker };
