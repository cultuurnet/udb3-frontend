import type { Meta, StoryObj } from '@storybook/react';

import { TimeSpanPicker } from './TimeSpanPicker';

const meta: Meta<typeof TimeSpanPicker> = {
  title: 'Components/TimeSpanPicker',
  component: TimeSpanPicker,
  parameters: {
    layout: 'centered',
    controls: { include: ['startTimeLabel', 'endTimeLabel', 'disabled'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'test',
    startTime: '00:00',
    endTime: '23:59',
  },
};
