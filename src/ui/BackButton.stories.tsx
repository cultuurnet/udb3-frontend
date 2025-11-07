import type { Meta, StoryObj } from '@storybook/react';

import { BackButton } from './BackButton';

const meta: Meta<typeof BackButton> = {
  title: 'Components/BackButton',
  component: BackButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: [
        'translationKey',
        'width',
        'marginTop',
        'className',
        'disabled',
        'iconWidth',
        'iconHeight',
      ],
    },
  },
  argTypes: {
    width: {
      control: { type: 'text' },
    },
    marginTop: {
      control: { type: 'number' },
    },
    iconWidth: {
      control: { type: 'number' },
    },
    iconHeight: {
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const commonArgs = {
  disabled: false,
  width: 'fit-content',
  marginTop: 4,
  iconWidth: 18,
  iconHeight: 15,
};

export const Default: Story = {
  args: {
    ...commonArgs,
  },
};

export const CustomText: Story = {
  args: {
    ...commonArgs,
    children: 'Go Back',
  },
};
