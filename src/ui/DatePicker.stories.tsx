import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

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
    selected: new Date('2024-01-01'),
  },
  render: (args) => {
    const [selected, setSelected] = useState(args.selected);

    return <DatePicker {...args} selected={selected} onChange={setSelected} />;
  },
};
