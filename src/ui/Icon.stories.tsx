import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon, Icons, IconVariants } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    name: {
      control: { type: 'select' },
      options: Object.values(Icons),
    },
    variant: {
      control: { type: 'select' },
      options: Object.values(IconVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: Icons.USER,
    variant: IconVariants.DEFAULT,
  },
};
