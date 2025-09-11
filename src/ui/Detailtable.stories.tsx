import type { Meta, StoryObj } from '@storybook/react';

import { DetailTable } from './DetailTable';

const meta: Meta<typeof DetailTable> = {
  title: 'Components/DetailTable',
  component: DetailTable,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['items'],
    },
  },

  argTypes: {
    items: { control: { type: 'object' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { header: 'header1', value: 'value1' },
      { header: 'header2', value: 'value2' },
      { header: 'header3', value: 'value3' },
    ],
  },
};
