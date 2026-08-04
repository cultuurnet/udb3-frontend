import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { RadioButtonGroup } from './RadioButtonGroup';
import { Text } from './Text';

const meta: Meta<typeof RadioButtonGroup> = {
  title: 'Components/RadioButtonGroup',
  component: RadioButtonGroup,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['name', 'disabled', 'items'],
    },
  },
  argTypes: {
    items: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const render: Story['render'] = function RenderComponent(args) {
  const [selected, setSelected] = useState(args.selected);
  const selectedItem = args.items?.find((item) => item.value === selected);

  return (
    <div className="tw:flex tw:flex-col tw:gap-2">
      <Text fontWeight="bold">Select a city:</Text>
      <RadioButtonGroup
        {...args}
        selected={selected}
        onValueChange={setSelected}
      />
      {selectedItem && <Text>Selected city: {selectedItem.label}</Text>}
    </div>
  );
};

export const Default: Story = {
  args: {
    name: 'city',
    selected: 'rome',
    items: [
      { label: 'Rome', value: 'rome', info: 'Info about Rome' },
      { label: 'Paris', value: 'paris', info: 'Info about Paris' },
      { label: 'Prague', value: 'prague', info: 'Info about Prague' },
    ],
  },
  render,
};

export const WithDisabledItem: Story = {
  args: {
    name: 'city-with-disabled',
    selected: 'rome',
    items: [
      { label: 'Rome', value: 'rome' },
      { label: 'Paris', value: 'paris', disabled: true },
      { label: 'Prague', value: 'prague' },
    ],
  },
  render,
};
