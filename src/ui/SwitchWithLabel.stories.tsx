import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';

import { SwitchVariants } from './Switch';
import { SwitchWithLabel } from './SwitchWithLabel';

const meta: Meta<typeof SwitchWithLabel> = {
  title: 'Components/SwitchWithLabel',
  component: SwitchWithLabel,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'disabled', 'variant', 'label'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(SwitchVariants),
    },
    label: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default',
    checked: false,
    disabled: false,
    label: 'Show holidays',
  },
  render: function RenderComponent(args) {
    const [checked, setChecked] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);

    return (
      <SwitchWithLabel
        {...args}
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const Checked: Story = {
  args: {
    id: 'checked',
    checked: true,
    disabled: false,
    label: 'Show holidays',
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled',
    checked: true,
    disabled: true,
    label: 'Show holidays',
  },
};

export const Success: Story = {
  args: {
    id: 'success',
    checked: true,
    disabled: false,
    variant: SwitchVariants.SUCCESS,
    label: 'Show holidays',
  },
};
