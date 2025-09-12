import type { Meta, StoryObj } from '@storybook/react';

import { Alert, AlertVariants } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    controls: {
      exclude: ['stackOn', 'spacing', 'onClose'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(AlertVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const commonArgs = {
  visible: true,
};

export const Primary: Story = {
  args: {
    variant: AlertVariants.PRIMARY,
    children: 'A Primary Alert',
    ...commonArgs,
  },
};

export const Info: Story = {
  args: {
    variant: AlertVariants.INFO,
    children: 'An Info Alert',
    ...commonArgs,
  },
};

export const Success: Story = {
  args: {
    variant: AlertVariants.SUCCESS,
    children: 'A Success Alert',
    ...commonArgs,
  },
};

export const Warning: Story = {
  args: {
    variant: AlertVariants.WARNING,
    children: 'A Warning Alert',
    ...commonArgs,
  },
};

export const Danger: Story = {
  args: {
    variant: AlertVariants.DANGER,
    children: 'A Danger Alert',
    ...commonArgs,
  },
};

export const Closable: Story = {
  args: {
    variant: AlertVariants.WARNING,
    children: 'This alert can be closed',
    closable: true,
    onClose: () => {},
    ...commonArgs,
  },
};

export const FullWidth: Story = {
  args: {
    variant: AlertVariants.INFO,
    children: 'This alert spans the full width',
    fullWidth: true,
    ...commonArgs,
  },
};
