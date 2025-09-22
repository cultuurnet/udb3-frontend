import type { Meta, StoryObj } from '@storybook/react';

import { RadioButton, RadioButtonTypes } from './RadioButton';

const meta: Meta<typeof RadioButton> = {
  title: 'Components/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['disabled', 'type', 'checked', 'color'],
    },
  },

  argTypes: {
    type: {
      control: { type: 'select' },
      options: Object.values(RadioButtonTypes),
    },
    color: { control: { type: 'color' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '123',
    name: 'my-radiobutton',
    disabled: false,
    type: RadioButtonTypes.RADIO,
    checked: true,
  },
};
