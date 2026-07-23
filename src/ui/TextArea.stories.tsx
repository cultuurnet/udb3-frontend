import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    controls: {
      include: ['value', 'placeholder', 'disabled', 'required', 'aria-label'],
    },
  },

  argTypes: {
    disabled: { control: { type: 'boolean' } },
    required: { control: { type: 'boolean' } },
    'aria-label': { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'This is a TextArea',
    'aria-label': 'TextArea example',
  },
};

export const Disabled: Story = {
  args: {
    value: 'This is a disabled TextArea',
    'aria-label': 'TextArea example',
    disabled: true,
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: 'This is a placeholder',
    'aria-label': 'TextArea example',
  },
};
