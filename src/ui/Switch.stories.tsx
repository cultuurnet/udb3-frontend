import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';

import { Switch, SwitchVariants } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'disabled', 'variant'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(SwitchVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default',
    checked: false,
    disabled: false,
    'aria-label': 'Toggle setting',
  },
  render: function RenderComponent(args) {
    const [checked, setChecked] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);

    return <Switch {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Checked: Story = {
  args: {
    id: 'checked',
    checked: true,
    disabled: false,
    'aria-label': 'Toggle setting',
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled',
    checked: true,
    disabled: true,
    'aria-label': 'Toggle setting',
  },
};

export const Success: Story = {
  args: {
    id: 'success',
    checked: true,
    disabled: false,
    variant: SwitchVariants.SUCCESS,
    'aria-label': 'Toggle setting',
  },
};
