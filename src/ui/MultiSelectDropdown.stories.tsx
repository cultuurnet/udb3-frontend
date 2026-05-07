import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { MultiSelectDropdown } from './MultiSelectDropdown';

const options = [
  { value: 'option-1', label: 'Option 1' },
  { value: 'option-2', label: 'Option 2' },
  { value: 'option-3', label: 'Option 3' },
  { value: 'option-4', label: 'Option 4' },
];

const meta: Meta<typeof MultiSelectDropdown> = {
  title: 'Components/MultiSelectDropdown',
  component: MultiSelectDropdown,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['placeholder'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'multi-select-dropdown',
    options,
    selectedValues: [],
    placeholder: 'Select option(s)',
  },
  render: function RenderComponent(args) {
    const [selectedValues, setSelectedValues] = useState(args.selectedValues);

    const handleChange = (value: string, checked: boolean) => {
      setSelectedValues((prev) =>
        checked ? [...prev, value] : prev.filter((v) => v !== value),
      );
    };

    return (
      <MultiSelectDropdown
        {...args}
        selectedValues={selectedValues}
        onChange={handleChange}
      />
    );
  },
};
