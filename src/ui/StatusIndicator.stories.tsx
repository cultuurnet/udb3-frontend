import type { Meta, StoryObj } from '@storybook/nextjs';

import { StatusIndicator } from './StatusIndicator';
import { colors } from './theme';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      control: { type: 'color' },
    },
    label: {
      control: { type: 'text' },
    },
    description: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Published: Story = {
  args: {
    color: colors.udbMainPositiveGreen,
    label: 'Gepubliceerd',
  },
};

export const Planned: Story = {
  args: {
    color: colors.udbMainDarkBlue,
    label: 'Publicatie vanaf 01/01/2024',
  },
};

export const Draft: Story = {
  args: {
    color: colors.warning,
    label: 'Kladversie',
  },
};

export const Rejected: Story = {
  args: {
    color: colors.danger,
    label: 'Publicatie afgewezen',
  },
};

export const Deleted: Story = {
  args: {
    color: colors.udbMainGrey,
    label: 'Verwijderd',
  },
};

export const WithDescription: Story = {
  args: {
    color: colors.udbMainPositiveGreen,
    label: 'Gepubliceerd',
    description: 'Aangemaakt door een andere gebruiker',
  },
};

export const WithoutColorAndLabel: Story = {
  args: {},
};
