import type { Meta, StoryObj } from '@storybook/react';

import { Typeahead } from './Typeahead';

const meta: Meta<typeof Typeahead> = {
  title: 'Components/Typeahead',
  component: Typeahead,
  parameters: {
    layout: 'centered',
    controls: { include: ['isInvalid', 'isLoading', 'disabled'] },
  },

  argTypes: {
    disabled: { control: { type: 'boolean' } },
    isLoading: { control: { type: 'boolean' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const cities = [
  { id: 1, name: 'Rome' },
  { id: 2, name: 'Romania' },
  { id: 3, name: 'Paris' },
  { id: 4, name: 'Prague' },
];

export const Default: Story = {
  args: {
    id: 'test',
    options: cities,
    labelKey: (city: any) => city.name,
  },
};
