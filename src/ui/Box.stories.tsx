import type { Meta, StoryObj } from '@storybook/react';

import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Primitives/Box',
  component: Box,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    flex: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'A Box',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#004f94',
    width: 300,
    height: 100,
    color: 'white',
    padding: 4,
  },
};
