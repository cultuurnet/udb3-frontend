import type { Meta, StoryObj } from '@storybook/react';
import { SelectWithLabel } from './SelectWithLabel';
import { LabelPositions } from './Label';

const meta: Meta<typeof SelectWithLabel> = {
  title: 'Components/SelectWithLabel',
  component: SelectWithLabel,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'label', 'labelPosition', 'disabled'],
    },
  },

  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'lg'],
    },
    labelPosition: {
      control: { type: 'select' },
      options: Object.values(LabelPositions),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'basic-select',
    ariaLabel: 'aria-label',
    label: 'Select option:',
    labelPosition: LabelPositions.TOP,
  },
  render: (args) => (
    <SelectWithLabel {...args}>
      <option value="option1">option 1</option>
      <option value="option2">option 2</option>
      <option value="option3">option 3</option>
    </SelectWithLabel>
  ),
};
