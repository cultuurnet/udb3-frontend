import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import type { ApiHoliday } from '@/hooks/api/holidays';

import { DatePeriodPicker, DatePeriodPickerVariants } from './DatePeriodPicker';

const meta: Meta<typeof DatePeriodPicker> = {
  title: 'Components/DatePeriodPicker',
  component: DatePeriodPicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'disabled'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(DatePeriodPickerVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockHolidays: ApiHoliday[] = [
  {
    startDate: '2026-04-06',
    endDate: '2026-04-06',
    type: 'holidays',
    name: [
      { language: 'NL', text: 'Paasmaandag' },
      { language: 'FR', text: 'Lundi de Pâques' },
      { language: 'DE', text: 'Ostermontag' },
    ],
  },
  {
    startDate: '2026-04-27',
    endDate: '2026-05-10',
    type: 'schoolHolidays',
    region: 'NL',
    name: [
      { language: 'NL', text: 'Paasvakantie' },
      { language: 'FR', text: 'Vacances de printemps' },
      { language: 'DE', text: 'Frühjahrsferien' },
    ],
  },
  {
    startDate: '2026-05-01',
    endDate: '2026-05-01',
    type: 'holidays',
    name: [
      { language: 'NL', text: 'Dag van de Arbeid' },
      { language: 'FR', text: 'Fête du Travail' },
      { language: 'DE', text: 'Tag der Arbeit' },
    ],
  },
  {
    startDate: '2026-05-14',
    endDate: '2026-05-14',
    type: 'holidays',
    name: [
      { language: 'NL', text: 'O.L.H. Hemelvaart' },
      { language: 'FR', text: 'Ascension' },
      { language: 'DE', text: 'Christi Himmelfahrt' },
    ],
  },
  {
    startDate: '2026-05-25',
    endDate: '2026-05-25',
    type: 'holidays',
    name: [
      { language: 'NL', text: 'Pinkstermaandag' },
      { language: 'FR', text: 'Lundi de Pentecôte' },
      { language: 'DE', text: 'Pfingstmontag' },
    ],
  },
];

const commonArgs = {
  dateStart: new Date('2026-04-27'),
  dateEnd: new Date('2026-05-10'),
  minDate: new Date('2026-04-01'),
  maxDate: new Date('2026-06-30'),
};

export const Default: Story = {
  args: {
    ...commonArgs,
    variant: DatePeriodPickerVariants.DEFAULT,
  },
  render: function RenderComponent(args) {
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
      />
    );
  },
};

export const Holidays: Story = {
  args: {
    ...commonArgs,
    variant: DatePeriodPickerVariants.HOLIDAYS,
    apiHolidays: mockHolidays,
  },
  render: function RenderComponent(args) {
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
  },
};
