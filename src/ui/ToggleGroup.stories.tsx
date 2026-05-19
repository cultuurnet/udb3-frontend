import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { ToggleGroup } from './ToggleGroup';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('age');
    return (
      <ToggleGroup
        name="age-input-mode"
        value={value}
        onChange={setValue}
        options={[
          { value: 'age', label: 'Ingeven als leeftijd' },
          { value: 'date_of_birth', label: 'Ingeven als geboortedatum' },
        ]}
        maxWidth="40rem"
      />
    );
  },
};
