import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { MultiSelectDropdown } from './MultiSelectDropdown';

const options = [
  { value: 'monday', label: 'Maandag' },
  { value: 'tuesday', label: 'Dinsdag' },
  { value: 'wednesday', label: 'Woensdag' },
  { value: 'thursday', label: 'Donderdag' },
  { value: 'friday', label: 'Vrijdag' },
  { value: 'saturday', label: 'Zaterdag' },
  { value: 'sunday', label: 'Zondag' },
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
    placeholder: 'Selecteer dag(en)',
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
