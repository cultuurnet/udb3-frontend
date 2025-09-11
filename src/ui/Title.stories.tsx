import type { Meta, StoryObj } from '@storybook/react';
import { Title, TitleVariants } from './Title';
import { parameterize } from '@sentry/nextjs';

const meta: Meta<typeof Title> = {
  title: 'Components/Title',
  component: Title,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    size: {
      control: { type: 'select' },
      options: [1, 2],
    },
    variant: {
      control: { type: 'select' },
      options: Object.values(TitleVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Size1: Story = {
  args: {
    size: 1,
    spacing: 6,
    children: 'Size 1',
  },
  parameters: { controls: { include: ['children'] } },
};

export const Size2: Story = {
  args: {
    size: 2,
    children: 'Size 2',
  },
  parameters: { controls: { include: ['children'] } },
};

export const Underlined: Story = {
  args: {
    size: 2,
    variant: TitleVariants.UNDERLINED,
    children: 'Underlined',
  },
  parameters: { controls: { include: ['children', 'size'] } },
};
