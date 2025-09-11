import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size'],
    },
  },

  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'basic-select',
    ariaLabel: 'aria-label',
  },
  render: (args) => (
    <Select {...args}>
      <option value="option1">option 1</option>
      <option value="option2">option 2</option>
      <option value="option3">option 3</option>
    </Select>
  ),
};
