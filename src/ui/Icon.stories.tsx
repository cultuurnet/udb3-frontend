import type { Meta, StoryObj } from '@storybook/react';

import { Icon, Icons } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    name: {
      control: { type: 'select' },
      options: Object.values(Icons),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: Icons.USER,
  },
};
