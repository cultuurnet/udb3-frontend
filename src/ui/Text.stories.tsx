import type { Meta, StoryObj } from '@storybook/react';
import { Text, TextVariants } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(TextVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    as: 'span',
    children: 'text',
  },
};
