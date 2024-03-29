import { format, isMatch, nextWednesday, parse, set } from 'date-fns';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import type { StepProps, StepsConfiguration } from '@/pages/steps/Steps';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import type { StackProps } from '@/ui/Stack';
import { getStackProps, Stack } from '@/ui/Stack';
import {
  areAllTimeSlotsValid,
  isTimeTableEmpty,
  TimeTable,
  TimeTableValue,
} from '@/ui/TimeTable';
import { formatDateToISO } from '@/utils/formatDateToISO';

type EncodedTimeTable = Array<{ startDate: string; endDate: string }>;

const convertTimeTableToSubEvents = (timeTable: TimeTableValue) => {
  const { data = {} } = timeTable;
  return Object.keys(data).reduce<EncodedTimeTable>(
    (acc, date) => [
      ...acc,
      ...Object.keys(data[date]).reduce<EncodedTimeTable>((acc, index) => {
        const time = data[date][index];

        if (!time || !isMatch(time, "HH'h'mm'm'")) {
          return acc;
        }

        const isoDate = formatDateToISO(
          set(parse(date, 'dd/MM/yyyy', new Date()), {
            hours: parseInt(time.substring(0, 2)),
            minutes: parseInt(time.substring(3, 5)),
            seconds: 0,
          }),
        );

        return [
          ...acc,
          {
            startDate: isoDate,
            endDate: isoDate,
          },
        ];
      }, []),
    ],
    [],
  );
};

type TimeTableStepProps = StackProps & StepProps;

const TimeTableStep = ({
  formState: { errors },
  control,
  className,
  name,
  onChange,
  ...props
}: TimeTableStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3} {...getStackProps(props)}>
      <Box>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            return (
              <TimeTable
                id="timetable-movies"
                className={className}
                value={field.value as TimeTableValue}
                onChange={(value) => {
                  field.onChange(value);

                  if (isTimeTableEmpty(value) || areAllTimeSlotsValid(value)) {
                    onChange(value);
                  }
                }}
              />
            );
          }}
        />
      </Box>
      {errors?.timeTable && (
        <Alert visible variant={AlertVariants.DANGER} maxWidth="53rem">
          {t(
            `movies.create.validation_messages.timeTable.${errors.timeTable.type}`,
          )}
        </Alert>
      )}
    </Stack>
  );
};

const formatDate = (date: Date) => format(date, 'dd/MM/yyyy');
const nextWeekWednesday = nextWednesday(new Date());

const timeTableStepConfiguration: StepsConfiguration<'timeTable'> = {
  Component: TimeTableStep,
  defaultValue: {
    data: {},
    dateStart: formatDate(nextWeekWednesday),
    dateEnd: formatDate(nextWeekWednesday),
  },
  validation: yup
    .mixed()
    .test({
      name: 'all-timeslots-valid',
      test: (timeTableData) => areAllTimeSlotsValid(timeTableData),
    })
    .test({
      name: 'has-timeslot',
      test: (timeTableData) => !isTimeTableEmpty(timeTableData),
    })
    .required(),
  name: 'timeTable',
  shouldShowStep: ({ watch }) => !!watch('typeAndTheme')?.type,
  title: ({ t }) => t(`movies.create.step2.title`),
};

export { convertTimeTableToSubEvents, timeTableStepConfiguration };
