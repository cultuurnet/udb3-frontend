import type { Meta, StoryObj } from '@storybook/react';

import { Badge, BadgeVariants } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(BadgeVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  args: {
    variant: BadgeVariants.DANGER,
    children: '99',
  },
};

export const Secundary: Story = {
  args: {
    variant: BadgeVariants.SECONDARY,
    children: 'Published',
  },
};

export const Info: Story = {
  args: {
    variant: BadgeVariants.INFO,
    children: 'Published',
  },
};
