import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar, ProgressBarVariants } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,

  argTypes: {
    progress: {
      control: { type: 'number' },
    },
    variant: {
      control: { type: 'select' },
      options: Object.values(ProgressBarVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: ProgressBarVariants.INFO,
    progress: 50,
  },
};

export const Danger: Story = {
  args: {
    variant: ProgressBarVariants.DANGER,
    progress: 50,
  },
};

export const Success: Story = {
  args: {
    variant: ProgressBarVariants.SUCCESS,
    progress: 50,
  },
};

export const Warning: Story = {
  args: {
    variant: ProgressBarVariants.WARNING,
    progress: 50,
  },
};
