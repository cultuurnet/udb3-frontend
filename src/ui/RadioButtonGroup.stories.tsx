import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioButtonGroup } from './RadioButtonGroup';
import { Text } from './Text';
import { Stack } from './Stack';

const meta: Meta<typeof RadioButtonGroup> = {
  title: 'Components/RadioButtonGroup',
  component: RadioButtonGroup,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['groupLabel', 'items'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'city',
    groupLabel: 'Select a city:',
    selected: 'rome',
    items: [
      { label: 'Rome', value: 'rome', info: 'Info about Rome' },
      { label: 'Paris', value: 'paris', info: 'Info about Paris' },
      { label: 'Prague', value: 'prague', info: 'Info about Prague' },
    ],
  },
  render: (args) => {
    const [selected, setSelected] = useState(args.selected);
    const selectedItem = args.items?.find((item) => item.value === selected);

    return (
      <Stack spacing={3}>
        {args.groupLabel && <Text fontWeight="bold">{args.groupLabel}</Text>}
        <RadioButtonGroup
          {...args}
          selected={selected}
          onChange={(e) => setSelected(e.target.value)}
        />
        {selectedItem && <Text>Selected city: {selectedItem.label}</Text>}
      </Stack>
    );
  },
};
