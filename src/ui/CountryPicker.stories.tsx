import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Countries, Country } from '@/types/Country';

import { CountryPicker } from './CountryPicker';

const meta: Meta<typeof CountryPicker> = {
  title: 'Components/CountryPicker',
  component: CountryPicker,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Country>(Countries.BE);

    return <CountryPicker value={value} onChange={setValue} />;
  },
};
