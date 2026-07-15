import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';

import { CheckboxWithLabel } from './CheckboxWithLabel';

const meta: Meta<typeof CheckboxWithLabel> = {
  title: 'Components/CheckboxWithLabel',
  component: CheckboxWithLabel,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'disabled', 'children'],
    },
  },

  argTypes: {
    children: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxWithLabel>;

export const Default: Story = {
  args: {
    id: 'checkbox-with-label-default',
    checked: false,
    disabled: false,
    children: 'Click me',
  },
  render: function RenderComponent(args) {
    const [checked, setChecked] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);

    return (
      <CheckboxWithLabel
        {...args}
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};
