import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CustomIcon, CustomIconVariants } from './CustomIcon';
import { ToggleBox } from './ToggleBox';

const meta: Meta<typeof ToggleBox> = {
  title: 'Components/ToggleBox',
  component: ToggleBox,
  parameters: {
    layout: 'centered',
    controls: { include: ['title', 'description', 'active', 'disabled'] },
  },

  argTypes: {
    title: { control: { type: 'text' } },
    description: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'This is a ToggleBox',
    active: false,
    icon: <CustomIcon name={CustomIconVariants.MAP} width="80" />,
  },
};

export const WithDescription: Story = {
  args: {
    title: 'This is a ToggleBox',
    active: false,
    icon: <CustomIcon name={CustomIconVariants.CALENDAR} width="80" />,
    description: 'This is a subtitle, like CalendarOptionToggle uses',
  },
};

export const Active: Story = {
  args: {
    title: 'This is a ToggleBox',
    active: true,
    icon: <CustomIcon name={CustomIconVariants.PHYSICAL} width="80" />,
  },
};

export const ActiveDisabled: Story = {
  args: {
    title: 'This is a ToggleBox',
    active: true,
    disabled: true,
    icon: <CustomIcon name={CustomIconVariants.PHYSICAL} width="80" />,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
