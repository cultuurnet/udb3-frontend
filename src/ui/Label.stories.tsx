import type { Meta, StoryObj } from '@storybook/react';

import { Label, LabelVariants } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['children', 'variant'],
    },
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(LabelVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    children: 'A form label',
    variant: LabelVariants.NORMAL,
  },
};

export const Bold: Story = {
  args: {
    children: 'A form label',
    variant: LabelVariants.BOLD,
  },
};
