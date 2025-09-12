import type { Meta, StoryObj } from '@storybook/react';

import { Button, ButtonVariants } from './Button';
import { Icon, Icons } from './Icon';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    controls: {
      include: [
        'active',
        'children',
        'disabled',
        'loading',
        'shouldHideText',
        'variant',
      ],
    },
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(ButtonVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const commonArgs = {
  disabled: false,
};

export const Primary: Story = {
  args: {
    variant: ButtonVariants.PRIMARY,
    children: 'Primary',
    ...commonArgs,
  },
};

export const Secondary: Story = {
  args: {
    variant: ButtonVariants.SECONDARY,
    children: 'Secondary',
    ...commonArgs,
  },
};

export const Success: Story = {
  args: {
    variant: ButtonVariants.SUCCESS,
    children: 'Success',
    ...commonArgs,
  },
};

export const Danger: Story = {
  args: {
    variant: ButtonVariants.DANGER,
    children: 'Danger',
    ...commonArgs,
  },
};

export const Unstyled: Story = {
  args: {
    variant: ButtonVariants.UNSTYLED,
    children: 'Unstyled',
    ...commonArgs,
  },
};

export const Loading: Story = {
  args: {
    variant: ButtonVariants.PRIMARY,
    children: 'Sould not appear when loading',
    loading: true,
    ...commonArgs,
  },
};

export const CustomChildren: Story = {
  args: {
    ...commonArgs,
    variant: ButtonVariants.UNSTYLED,
    children: <Icon name={Icons.TIMES} />,
  },
};
