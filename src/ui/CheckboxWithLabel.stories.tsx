import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxWithLabel } from './CheckboxWithLabel';

const meta: Meta<typeof CheckboxWithLabel> = {
  title: 'Components/CheckboxWithLabel',
  component: CheckboxWithLabel,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'disabled', 'children'],
    },
  },

  argTypes: {
    children: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxWithLabel>;

export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    children: 'Click me',
  },
};
