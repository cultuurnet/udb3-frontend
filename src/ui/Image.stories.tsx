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
    src: '/assets/storybook-image-placeholder.png',
    alt: 'Sample image',
    width: 600,
  },
};
