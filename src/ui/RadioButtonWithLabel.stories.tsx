import type { Meta, StoryObj } from '@storybook/react';

import { RadioButtonTypes } from './RadioButton';
import { RadioButtonWithLabel } from './RadioButtonWithLabel';

const meta: Meta<typeof RadioButtonWithLabel> = {
  title: 'Components/RadioButtonWithLabel',
  component: RadioButtonWithLabel,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['disabled', 'type', 'checked', 'color', 'label'],
    },
  },

  argTypes: {
    type: {
      control: { type: 'select' },
      options: Object.values(RadioButtonTypes),
    },
    color: { control: { type: 'color' } },
    label: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '123',
    name: 'my-checkbox',
    disabled: false,
    label: 'Online',
    type: RadioButtonTypes.RADIO,
    checked: false,
  },
};
