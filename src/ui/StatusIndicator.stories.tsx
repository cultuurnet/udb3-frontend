import type { Meta, StoryObj } from '@storybook/react';

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
    isExternalCreator: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Published: Story = {
  args: {
    color: colors.udbMainPositiveGreen,
    label: 'Gepubliceerd',
    isExternalCreator: false,
  },
};

export const Planned: Story = {
  args: {
    color: colors.udbMainDarkBlue,
    label: 'Publicatie vanaf 01/01/2024',
    isExternalCreator: false,
  },
};

export const Draft: Story = {
  args: {
    color: colors.warning,
    label: 'Kladversie',
    isExternalCreator: false,
  },
};

export const Rejected: Story = {
  args: {
    color: colors.danger,
    label: 'Publicatie afgewezen',
    isExternalCreator: false,
  },
};

export const Deleted: Story = {
  args: {
    color: colors.udbMainGrey,
    label: 'Verwijderd',
    isExternalCreator: false,
  },
};

export const WithExternalCreator: Story = {
  args: {
    color: colors.udbMainPositiveGreen,
    label: 'Gepubliceerd',
    isExternalCreator: true,
  },
};

export const WithoutColorAndLabel: Story = {
  args: {
    isExternalCreator: false,
  },
};
