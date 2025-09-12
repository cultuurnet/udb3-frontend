import type { Meta, StoryObj } from '@storybook/react';

import { Box } from './Box';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Primitives/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    stackOn: {
      control: { type: 'select' },
      options: ['xs', 's', 'm', 'l', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const boxProps = {
  children: 'A Box',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#004f94',
  width: 300,
  height: 100,
  color: 'white',
  padding: 4,
} as const;

export const Default: Story = {
  args: {
    spacing: 2,
  },
  render: (args) => (
    <Stack {...args}>
      <Box {...boxProps}>A Box</Box>
      <Box {...boxProps}>Another Box</Box>
      <Box {...boxProps}>And yet another Box</Box>
    </Stack>
  ),
};

export const Nested: Story = {
  args: {
    spacing: 2,
  },
  render: (args) => (
    <Stack {...args}>
      <Box {...boxProps}>A Box</Box>
      <Stack spacing={5}>
        <Box {...boxProps}>Another Box</Box>
        <Box {...boxProps}>And yet another Box</Box>
      </Stack>
    </Stack>
  ),
};
