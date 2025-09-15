import type { Meta, StoryObj } from '@storybook/react';

import { Small } from './Small';

const meta: Meta<typeof Small> = {
  title: 'Components/Small',
  component: Small,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['children'],
    },
  },

  argTypes: {
    children: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'small text',
  },
};
