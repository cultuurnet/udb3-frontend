import { useTranslation } from 'react-i18next';

import { parseSpacing } from './Box';
import { Button } from './Button';
import { DatePeriodPicker } from './DatePeriodPicker';
import { Icons } from './Icon';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Label } from './Label';
import { cn } from './shadcn/utils';
import type { StackProps } from './Stack';
import { getStackProps, Stack } from './Stack';
import { Text } from './Text';
import type { TimeTableValue } from './TimeTable';
import {
  amountOfColumns,
  parseDate,
  Row,
  useTimeTableState,
} from './TimeTable';

type HeaderProps = InlineProps & {
  header: string;
  index: number;
};

const Header = ({ header, ...props }: HeaderProps) => {
  return (
    <Inline
      as="div"
      justifyContent="space-between"
      paddingLeft={1}
      paddingRight={1}
      spacing={3}
      {...getInlineProps(props)}
    >
      <Label htmlFor={header}>{header}</Label>
    </Inline>
  );
};

type Props = {
  id: string;
  value: TimeTableValue;
  onChange: (value: TimeTableValue) => void;
} & StackProps;

const TimeTableLegacy = ({ id, className, onChange, value, ...props }: Props) => {
  const { t } = useTranslation();

  const {
    dateRange,
    handlePaste,
    handleCopyRow,
    handleCopyAll,
    handleDateStartChange,
    handleDateEndChange,
    handleEditCell,
  } = useTimeTableState({ value, onChange });

  if (!value?.dateStart || !value?.dateEnd) return null;

  return (
    <Stack
      as="div"
      className={cn('tw:gap-4', className)}
      alignItems="flex-start"
      {...getStackProps(props)}
      spacing={0}
    >
      <DatePeriodPicker
        id={id}
        dateStart={parseDate(value.dateStart)}
        dateEnd={parseDate(value.dateEnd)}
        onDateStartChange={handleDateStartChange}
        onDateEndChange={handleDateEndChange}
      />
      <Stack
        id="timetable"
        forwardedAs="div"
        css={`
          display: grid;
          grid-template-rows: repeat(${(dateRange?.length ?? 0) + 1}, 1fr);
          grid-template-columns:
            min-content repeat(7, 1fr)
            min-content;
          column-gap: ${parseSpacing(3)};
          row-gap: ${parseSpacing(3)};
          align-items: center;
        `}
      >
        {[
          <Text key="pre" />,
          ...Array.from({ length: amountOfColumns }, (_, index) => {
            const header = `t${index + 1}`;
            return <Header key={header} header={header} index={index} />;
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
      </Stack>
      <Button
        className="tw:flex-none tw:gap-3"
        iconName={Icons.COPY}
        onClick={handleCopyAll}
      >
        {t('movies.create.actions.copy_table')}
      </Button>
    </Stack>
  );
};

export { TimeTableLegacy };
