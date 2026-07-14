import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { ToggleGroup } from './ToggleGroup';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ToggleGroupExample = () => {
  const [value, setValue] = useState('toggle_1');
  return (
    <ToggleGroup
      name="age-input-mode"
      value={value}
      onChange={setValue}
      options={[
        { value: 'toggle_1', label: 'Toggle 1' },
        { value: 'toggle_2', label: 'Toggle 2' },
      ]}
      maxWidth="40rem"
    />
  );
};

export const Default: Story = {
  render: () => <ToggleGroupExample />,
};
