import type { Meta, StoryObj } from '@storybook/react';
import { ToggleBox } from './ToggleBox';
import { Icon, Icons } from './Icon';

const meta: Meta<typeof ToggleBox> = {
  title: 'Components/ToggleBox',
  component: ToggleBox,
  parameters: {
    layout: 'centered',
    controls: { include: ['text', 'active'] },
  },

  argTypes: {
    text: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'This is a ToggleBox',
    active: false,
    icon: <Icon name={Icons.CALENDAR_ALT} />,
  },
};
