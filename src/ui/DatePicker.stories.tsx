import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { DatePicker } from './DatePicker';
import { Label } from './Label';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: [],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'date-picker-story',
    selected: new Date('2024-01-01'),
  },
  render: function RenderComponent(args) {
    const [selected, setSelected] = useState(args.selected);

    return (
      <div>
        <Label htmlFor={args.id}>Date</Label>
        <DatePicker {...args} selected={selected} onChange={setSelected} />
      </div>
    );
  },
};
