import type { Meta, StoryObj } from '@storybook/nextjs';

import { Image } from './Image';

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    loading: {
      control: { type: 'select' },
      options: ['lazy', 'eager'],
    },
    decoding: {
      control: { type: 'select' },
      options: ['async', 'sync', 'auto'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1605460504109-f347ec557483?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80',
    alt: 'Sample image',
    width: 600,
  },
};
