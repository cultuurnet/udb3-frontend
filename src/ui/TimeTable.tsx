import copyToClipboard from 'clipboard-copy';
import { addDays, differenceInDays, format, isMatch, parse } from 'date-fns';
import cloneDeep from 'lodash/cloneDeep';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import setWith from 'lodash/setWith';
import unset from 'lodash/unset';
import type { ClipboardEvent, FormEvent } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';

import { Button, ButtonVariants } from './Button';
import { DatePeriodPicker } from './DatePeriodPicker';
import { Icon, Icons } from './Icon';
import { Input } from './Input';
import { Label } from './Label';
import { cn } from './shadcn/utils';
import { Text } from './Text';
import { TimeTableLegacy } from './TimeTableLegacy';
import { toast } from './Toast';

type Time = string;
type Data = { [index: string]: Time };
type TimeTableData = { [date: string]: Data };

type TimeTableValue = {
  dateStart: string;
  dateEnd: string;
  data: TimeTableData;
};

const isTimeTableEmpty = (timeTableValue: TimeTableValue) => {
  if (Object.keys(timeTableValue.data).length === 0) {
    return true;
  }

  if (
    Object.values(timeTableValue.data).every(
      (times) => Object.keys(times).length === 0,
    )
  ) {
    return true;
  }

  return false;
};

const areAllTimeSlotsValid = (timeTableValue: TimeTableValue) => {
  return Object.values(timeTableValue?.data ?? {}).every((times) => {
    return Object.values(times).every((time) => {
      return isMatch(time, "HH'h'mm'm'");
    });
  });
};

const isOneTimeSlotValid = (timeTableValue: TimeTableValue) =>
  Object.values(timeTableValue?.data ?? {}).some((times) => {
    return Object.values(times).some((time) => isMatch(time, "HH'h'mm'm'"));
  });

const formatTimeValue = (value: string) => {
  if (!value) {
    return null;
  }

  // is already in correct format
  if (isMatch(value, "HH'h'mm'm'")) {
    return value;
  }

  if (isNaN(value as any)) {
    return null;
  }

  let tranformedValue = value;

  // pad start with zero if 1 digit
  if (tranformedValue.length === 1) {
    tranformedValue = tranformedValue.padStart(2, '0');
  }

  // pad end with zeros if too short
  if (tranformedValue.length < 4) {
    tranformedValue = tranformedValue.padEnd(4, '0');
  }

  const firstChars = tranformedValue.substring(0, 2);
  const lastChars = tranformedValue.substring(2, 4);
  const firstDigits = parseInt(firstChars);
  const lastDigits = parseInt(lastChars);

  // check if first 2 numbers are above 0 and below or equal to 24
  if (firstDigits < 0 || firstDigits > 24) return null;

  // check if last 2 numbers are above 0 and below or equal to 59
  if (lastDigits < 0 || lastDigits > 59) return null;

  // transform into "h m" format
  return `${firstChars}h${lastChars}m`;
};

const amountOfColumns = 7;

type CopyPayload =
  | {
      method: 'row';
      data: Data;
    }
  | { method: 'all'; data: { [key: string]: Data } };

const updateCell = ({
  originalData,
  date,
  index,
  value,
}: {
  originalData: TimeTableData;
  date: string;
  index: number;
  value: string;
}) => {
  if (value === null) {
    // some weird in place editing mutation going on here, needed to clone the object before unsetting
    const clondedOriginalData = cloneDeep(originalData);
    unset(clondedOriginalData, `[${date}][${index}]`);
    return clondedOriginalData;
  }
  return setWith(originalData, `[${date}][${index}]`, value, Object);
};

const getDateRange = (
  dateStartString: string,
  dateEndString: string,
): string[] => {
  const dateStart = parseDate(dateStartString);
  const daysInBetween = differenceInDays(parseDate(dateEndString), dateStart);

  if (dateStartString === dateEndString) {
    return [dateStartString];
  }

  return [
    dateStartString,
    ...Array.from({ length: daysInBetween - 1 }, (_, i) =>
      formatDate(addDays(dateStart, i + 1)),
    ),
    dateEndString,
  ];
};

const parseDate = (dateString: string) =>
  parse(dateString, 'dd/MM/yyyy', new Date());
const formatDate = (date: Date) => format(date, 'dd/MM/yyyy');

const cleanData = (data: Data): Data => ({ ...omitBy(data, isNil) });

const CellEditMode = {
  BLUR: 'blur',
  CHANGE: 'change',
} as const;

type Props = {
  id: string;
  className?: string;
  value: TimeTableValue;
  onChange: (value: TimeTableValue) => void;
};

const useTimeTableState = ({
  value,
  onChange,
}: Pick<Props, 'value' | 'onChange'>) => {
  const dateRange = useMemo(() => {
    if (!value?.dateStart || !value?.dateEnd) return [];
    return getDateRange(value.dateStart, value.dateEnd);
  }, [value?.dateStart, value?.dateEnd]);

  const cleanValue = (dateStart: string, dateEnd: string, toCleanValue) => {
    const range = getDateRange(dateStart, dateEnd);
    const data = pick(toCleanValue.data, range);

    return {
      ...toCleanValue,
      // clean data that is not relevant for the range
      data,
    };
  };

  const handlePaste = (payload: CopyPayload, index: number, date: string) => {
    if (payload.method === 'row') {
      onChange({
        ...value,
        data: {
          ...value.data,
          [date]: payload.data,
        },
      });
    }
    if (payload.method === 'all') {
      onChange({
        ...value,
        data: Object.keys(payload.data).reduce<TimeTableData>((data, index) => {
          return {
            ...data,
            [dateRange[index]]: payload.data[index],
          };
        }, {}),
      });
    }
  };

  const handleCopyRow = (date: string) => {
    const copyAction: CopyPayload = {
      method: 'row',
      data: cleanData(value.data?.[date]),
    };
    copyToClipboard(JSON.stringify(copyAction));
  };

  const handleCopyAll = () => {
    const copyAction: CopyPayload = {
      method: 'all',
      data: dateRange.reduce<{ [key: string]: Data }>((data, date, index) => {
        const rowData = value?.data?.[date];
        if (!rowData || !Object.keys(cleanData(rowData)).length) {
          return data;
        }

        return {
          ...data,
          [index]: cleanData(rowData),
        };
      }, {}),
    };
    copyToClipboard(JSON.stringify(copyAction));
  };

  const handleDateStartChange = (date: Date) => {
    onChange(
      cleanValue(value.dateStart, value.dateEnd, {
        ...value,
        dateStart: formatDate(date),
      }),
    );
  };

  const handleDateEndChange = (date: Date) => {
    onChange(
      cleanValue(value.dateStart, value.dateEnd, {
        ...value,
        dateEnd: formatDate(date),
      }),
    );
  };

  const handleEditCell = (
    {
      index,
      date,
      value: cellValue,
    }: { index: number; date: string; value: string },
    mode: Values<typeof CellEditMode>,
  ) => {
    if (mode === CellEditMode.BLUR) {
      const previousRowData = value?.data[date] ?? [];
      const newRowData = {
        ...previousRowData,
        [index]: cellValue,
      };

      const sortedRowData = [
        ...new Set<string>(
          Object.values(newRowData)
            .map((formattedValue: string) => {
              if (formattedValue === null) {
                return formattedValue;
              }
              return formattedValue.split('').reduce((acc, char) => {
                if (['h', 'm'].includes(char)) return acc;
                return `${acc}${char}`;
              });
            })
            .filter((v) => v !== null)
            .sort((a, b) => Number(a) - Number(b)),
        ),
      ];

      const indexedValues = sortedRowData.reduce<Data>((acc, value, index) => {
        return {
          ...acc,
          [index]: formatTimeValue(value),
        };
      }, {});

      onChange({
        ...value,
        data: {
          ...value.data,
          [date]: indexedValues,
        },
      });
    } else {
      onChange({
        ...value,
        data: updateCell({
          originalData: value.data ?? {},
          date,
          value: cellValue,
          index,
        }),
      });
    }
  };

  return {
    dateRange,
    handlePaste,
    handleCopyRow,
    handleCopyAll,
    handleDateStartChange,
    handleDateEndChange,
    handleEditCell,
  };
};

type RowProps = {
  data: Record<string, unknown>;
  date: string;
  onCopy: (date: string) => void;
  onRowPaste: (payload: CopyPayload, index: number, date: string) => void;
  onEditCell: (
    {
      index,
      date,
      value,
    }: {
      index: number;
      date: string;
      value: string;
    },
    mode: 'blur' | 'change',
  ) => void;
};

const Row = ({ data, date, onEditCell, onCopy, onRowPaste }: RowProps): any => {
  const { t } = useTranslation();

  const handlePaste = (
    event: ClipboardEvent<HTMLInputElement>,
    index: number,
    date: string,
  ) => {
    const clipboardData = (event.clipboardData || window.clipboardData).getData(
      'text',
    );
    try {
      const clipboardValue = JSON.parse(clipboardData);
      event.preventDefault();
      onRowPaste(clipboardValue, index, date);
    } catch (e) {
      // fallback to normal copy / paste when the data is not JSON
    }
  };

  return [
    <Text key="dateLabel">{date}</Text>,
    ...Array.from({ length: amountOfColumns }, (_, index) => {
      return (
        <Input
          id={`${date}-${index}`}
          key={`${date}-${index}`}
          aria-label={t('movies.create.actions.time_slot', {
            date,
            column: index + 1,
          })}
          value={(data?.[index] as string) ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            onEditCell(
              { index, date, value: value !== '' ? value : null },
              'change',
            );
          }}
          onBlur={(event: FormEvent<HTMLInputElement>) => {
            onEditCell(
              {
                index,
                date,
                value: formatTimeValue(
                  (event.target as HTMLInputElement).value,
                ),
              },
              'blur',
            );
          }}
          onPaste={(event) => handlePaste(event, index, date)}
        />
      );
    }),
    <Button
      key="copyButton"
      variant={ButtonVariants.UNSTYLED}
      onClick={() => onCopy(date)}
      customChildren
      aria-label={t('movies.create.actions.copy_row', { date })}
    >
      <Icon name={Icons.COPY} />
    </Button>,
  ];
};

const Header = ({ header }: { header: string }) => {
  return (
    <div className="tw:flex tw:items-center tw:justify-between tw:px-[0.1333rem]">
      <Label htmlFor={header}>{header}</Label>
    </div>
  );
};

const TimeTableShadcn = ({ id, className, value, onChange }: Props) => {
  const { t } = useTranslation();

  const {
    dateRange,
    handlePaste,
    handleCopyRow: copyRow,
    handleCopyAll: copyAll,
    handleDateStartChange,
    handleDateEndChange,
    handleEditCell,
  } = useTimeTableState({ value, onChange });

  const handleCopyRow = (date: string) => {
    copyRow(date);
    toast.success(t('movies.create.actions.row_copied', { date }));
  };

  const handleCopyAll = () => {
    copyAll();
    toast.success(t('movies.create.actions.table_copied'));
  };

  if (!value?.dateStart || !value?.dateEnd) return null;

  return (
    <div
      className={cn('tw:flex tw:flex-col tw:gap-4 tw:items-start', className)}
    >
      <DatePeriodPicker
        id={id}
        dateStart={parseDate(value.dateStart)}
        dateEnd={parseDate(value.dateEnd)}
        onDateStartChange={handleDateStartChange}
        onDateEndChange={handleDateEndChange}
      />
      <div
        id="timetable"
        className="tw:grid tw:grid-cols-[min-content_repeat(7,1fr)_min-content] tw:gap-x-[0.5333rem] tw:gap-y-[0.5333rem] tw:items-center"
        style={{
          gridTemplateRows: `repeat(${(dateRange?.length ?? 0) + 1}, 1fr)`,
        }}
      >
        {[
          <Text key="pre" />,
          ...Array.from({ length: amountOfColumns }, (_, index) => {
            const header = `t${index + 1}`;
            return <Header key={header} header={header} />;
          }),
          <Text key="post" />,
        ]}
        {dateRange.map((date) => (
          <Row
            key={date}
            date={date}
            data={value?.data?.[date]}
            onCopy={handleCopyRow}
            onRowPaste={handlePaste}
            onEditCell={handleEditCell}
          />
        ))}
      </div>
      <Button
        className="tw:flex-none tw:gap-3"
        iconName={Icons.COPY}
        onClick={handleCopyAll}
      >
        {t('movies.create.actions.copy_table')}
      </Button>
    </div>
  );
};

const TimeTable = ({ id, className, value, onChange }: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <TimeTableShadcn
        id={id}
        className={className}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TimeTableLegacy
      id={id}
      className={className}
      value={value}
      onChange={onChange}
    />
  );
};

export {
  amountOfColumns,
  areAllTimeSlotsValid,
  formatTimeValue,
  isOneTimeSlotValid,
  isTimeTableEmpty,
  parseDate,
  Row,
  TimeTable,
  useTimeTableState,
};
export type { CopyPayload, TimeTableValue };
