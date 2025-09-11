import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TimeTable } from './TimeTable';

const meta: Meta<typeof TimeTable> = {
  title: 'Components/TimeTable',
  component: TimeTable,
  parameters: {
    layout: 'padded',
    controls: { include: [] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'timetable-story',
    value: {
      dateStart: '01/01/2024',
      dateEnd: '03/01/2024',
      data: {
        '01/01/2024': {
          0: '09h00m',
          1: '14h00m',
          2: '20h00m',
        },
        '02/01/2024': {
          0: '10h00m',
          1: '15h30m',
        },
        '03/01/2024': {
          0: '11h00m',
          1: '16h00m',
          2: '21h00m',
        },
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <TimeTable {...args} value={value} onChange={setValue} />;
  },
};
