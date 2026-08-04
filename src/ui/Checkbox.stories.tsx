import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';

import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'disabled'],
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
    'aria-label': 'Default checkbox',
  },
  render: function RenderComponent(args) {
    const [checked, setChecked] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);

    return (
      <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
    );
  },
};

export const Checked: Story = {
  args: {
    id: 'checked',
    checked: true,
    disabled: false,
    'aria-label': 'Checked checkbox',
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled',
    checked: true,
    disabled: true,
    'aria-label': 'Disabled checkbox',
  },
};
