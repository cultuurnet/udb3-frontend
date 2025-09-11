import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePeriodPicker } from './DatePeriodPicker';

const meta: Meta<typeof DatePeriodPicker> = {
  title: 'Components/DatePeriodPicker',
  component: DatePeriodPicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['disabled'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dateStart: new Date('2024-01-01'),
    dateEnd: new Date('2024-01-31'),
  },
  render: (args) => {
    const [dateStart, setDateStart] = useState(args.dateStart);
    const [dateEnd, setDateEnd] = useState(args.dateEnd);

    return (
      <DatePeriodPicker
        {...args}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
      />
    );
  },
};
