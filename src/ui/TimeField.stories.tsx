import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';

import { TimeField, TimeFieldLabelPositions } from './TimeField';

const meta: Meta<typeof TimeField> = {
  title: 'Components/TimeField',
  component: TimeField,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['label', 'labelPosition', 'disabled'],
    },
  },

  argTypes: {
    label: { control: { type: 'text' } },
    labelPosition: {
      control: { type: 'radio' },
      options: Object.values(TimeFieldLabelPositions),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const render: Story['render'] = function RenderComponent(args) {
  const [value, setValue] = useState(args.value);

  useEffect(() => {
    setValue(args.value);
  }, [args.value]);

  return <TimeField {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  args: {
    id: 'time-field-default',
    name: 'timeFieldDefault',
    label: 'Van',
    value: '14:30',
    labelPosition: TimeFieldLabelPositions.TOP,
    disabled: false,
  },
  render,
};

export const InlineLabel: Story = {
  args: {
    ...Default.args,
    id: 'time-field-inline',
    name: 'timeFieldInline',
    labelPosition: TimeFieldLabelPositions.INLINE,
  },
  render,
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    id: 'time-field-disabled',
    name: 'timeFieldDisabled',
    disabled: true,
  },
  render,
};
