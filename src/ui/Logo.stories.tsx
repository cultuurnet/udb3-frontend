import type { Meta, StoryObj } from '@storybook/react';

import { Logo, LogoVariants } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    width: { control: { type: 'number' } },
    color: { control: { type: 'color' } },
    variant: {
      control: { type: 'select' },
      options: Object.values(LogoVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const commonArgs = {
  color: 'black',
};

export const Default: Story = {
  args: commonArgs,
};

export const Mobile: Story = {
  args: {
    ...commonArgs,
    variant: LogoVariants.MOBILE,
  },
};
