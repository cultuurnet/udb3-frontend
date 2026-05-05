import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { TimeSpanPicker, TimeSpanPickerLabelPositions } from './TimeSpanPicker';

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

const TimeSpanPickerWithState = (args) => {
  const [startTime, setStartTime] = useState(args.startTime || '00:00');
  const [endTime, setEndTime] = useState(args.endTime || '23:59');

  return (
    <TimeSpanPicker
      {...args}
      startTime={startTime}
      endTime={endTime}
      onChangeStartTime={setStartTime}
      onChangeEndTime={setEndTime}
    />
  );
};

export const Default: Story = {
  render: TimeSpanPickerWithState,
  args: {
    id: 'test',
    startTime: '00:00',
    endTime: '23:59',
  },
};

export const Inline: Story = {
  render: TimeSpanPickerWithState,
  args: {
    id: 'test-inline',
    startTime: '08:00',
    endTime: '18:00',
    labelPosition: TimeSpanPickerLabelPositions.INLINE,
    startTimeLabel: 'van',
    endTimeLabel: 'tot',
  },
};
