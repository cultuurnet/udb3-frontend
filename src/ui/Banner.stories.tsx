import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Banner } from './Banner';

const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  parameters: {
    layout: 'padded',
    controls: {
      exclude: ['stackOn', 'spacing'],
    },
  },
  argTypes: {
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Banner title',
    description: 'Banner description',
  },
};
