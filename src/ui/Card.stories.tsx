import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './Card';
import { Text } from './Text';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    controls: {
      exclude: ['stackOn', 'spacing'],
    },
  },

  argTypes: {
    children: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a card',
  },
  render: (args) => (
    <Card {...args}>
      <Text>{args.children}</Text>
    </Card>
  ),
};
