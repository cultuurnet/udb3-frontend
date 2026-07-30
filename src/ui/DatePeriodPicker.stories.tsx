import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { addDays, addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { useState } from 'react';

import type { ApiHoliday } from '@/hooks/api/holidays';

import { DatePeriodPicker } from './DatePeriodPicker';

const meta: Meta<typeof DatePeriodPicker> = {
  title: 'Components/DatePeriodPicker',
  component: DatePeriodPicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['showHolidaysToggle', 'disabled'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date();
const toDateString = (date: Date) => format(date, 'yyyy-MM-dd');

const mockHolidays: ApiHoliday[] = [
  {
    startDate: toDateString(addDays(today, 6)),
    endDate: toDateString(addDays(today, 6)),
    type: 'holidays',
    name: { nl: 'Paasmaandag', fr: 'Lundi de Pâques', de: 'Ostermontag' },
  },
  {
    startDate: toDateString(addDays(today, 7)),
    endDate: toDateString(addDays(today, 20)),
    type: 'schoolHolidays',
    region: 'NL',
    name: {
      nl: 'Paasvakantie',
      fr: 'Vacances de printemps',
      de: 'Frühjahrsferien',
    },
  },
  {
    startDate: toDateString(addDays(today, 11)),
    endDate: toDateString(addDays(today, 11)),
    type: 'holidays',
    name: {
      nl: 'Dag van de Arbeid',
      fr: 'Fête du Travail',
      de: 'Tag der Arbeit',
    },
  },
  {
    startDate: toDateString(addDays(today, 24)),
    endDate: toDateString(addDays(today, 24)),
    type: 'holidays',
    name: {
      nl: 'O.L.H. Hemelvaart',
      fr: 'Ascension',
      de: 'Christi Himmelfahrt',
    },
  },
  {
    startDate: toDateString(addDays(today, 35)),
    endDate: toDateString(addDays(today, 35)),
    type: 'holidays',
    name: {
      nl: 'Pinkstermaandag',
      fr: 'Lundi de Pentecôte',
      de: 'Pfingstmontag',
    },
  },
];

const commonArgs = {
  dateStart: addDays(today, 7),
  dateEnd: addDays(today, 20),
  minDate: startOfMonth(today),
  maxDate: endOfMonth(addMonths(today, 2)),
};

const render: Story['render'] = function RenderComponent(args) {
  const [dateStart, setDateStart] = useState(args.dateStart);
  const [dateEnd, setDateEnd] = useState(args.dateEnd);

  return (
    <DatePeriodPicker
      {...args}
      id="date-period-picker"
      dateStart={dateStart}
      dateEnd={dateEnd}
      onDateStartChange={setDateStart}
      onDateEndChange={setDateEnd}
      onShowHolidaysChange={() => {}}
    />
  );
};

export const Default: Story = {
  args: {
    ...commonArgs,
  },
  render,
};

export const WithHolidaysToggle: Story = {
  args: {
    ...commonArgs,
    showHolidaysToggle: true,
    apiHolidays: mockHolidays,
  },
  render,
};

export const QuickLinks: Story = {
  args: {
    ...commonArgs,
    showQuickLinks: true,
    apiHolidays: mockHolidays,
  },
  render,
};
