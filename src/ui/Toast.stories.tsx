import type { Meta, StoryObj } from '@storybook/react';

import { Toast, ToastVariants } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(ToastVariants),
    },
    body: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: ToastVariants.PRIMARY,
    body: 'My Super Mega Long Toast Message',
  },
  parameters: { controls: { include: ['body', 'variant'] } },
};

export const Success: Story = {
  args: {
    variant: ToastVariants.SUCCESS,
    body: 'My Super Mega Long Toast Message',
  },
  parameters: { controls: { include: ['body'] } },
};

export const Danger: Story = {
  args: {
    variant: ToastVariants.DANGER,
    body: 'My Super Mega Long Toast Message',
  },
  parameters: { controls: { include: ['body'] } },
};

export const Warning: Story = {
  args: {
    variant: ToastVariants.WARNING,
    body: 'My Super Mega Long Toast Message',
  },
  parameters: { controls: { include: ['body'] } },
};
