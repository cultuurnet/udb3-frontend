import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';
import { Inline } from './Inline';
import { Breakpoints } from '@/ui/theme';

const meta: Meta<typeof Inline> = {
  title: 'Primitives/Inline',
  component: Inline,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    spacing: { control: { type: 'number' } },
    stackOn: {
      control: { type: 'select' },
      options: Object.values(Breakpoints),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const boxProps = {
  children: 'A Box',
  display: 'flex' as const,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: '#004f94',
  width: 300,
  height: 100,
  color: 'white',
  padding: 4,
};

export const Default: Story = {
  args: {
    spacing: 2,
  },
  render: (args) => (
    <Inline {...args}>
      <Box {...boxProps}>A Box</Box>
      <Box {...boxProps}>Another Box</Box>
      <Box {...boxProps}>And yet another Box</Box>
    </Inline>
  ),
};

export const Nested: Story = {
  args: {
    spacing: 2,
  },
  render: (args) => (
    <Inline {...args}>
      <Box {...boxProps}>A Box</Box>
      <Inline spacing={5}>
        <Box {...boxProps}>Another Box</Box>
        <Box {...boxProps}>And yet another Box</Box>
      </Inline>
    </Inline>
  ),
};

export const ToStackWithQuery: Story = {
  args: {
    spacing: 2,
    stackOn: Breakpoints.S,
  },
  render: (args) => (
    <Inline {...args}>
      <Box {...boxProps}>A Box</Box>
      <Box {...boxProps}>Another Box</Box>
    </Inline>
  ),
};
