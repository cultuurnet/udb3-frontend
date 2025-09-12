import type { Meta, StoryObj } from '@storybook/react';

import { FormElement } from './FormElement';
import { Input } from './Input';
import { LabelPositions } from './Label';

const meta: Meta<typeof FormElement> = {
  title: 'Components/FormElement',
  component: FormElement,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['loading', 'labelPosition', 'label', 'info', 'error'],
    },
  },

  argTypes: {
    label: { control: { type: 'text' } },
    error: { control: { type: 'text' } },
    info: { control: { type: 'text' } },
    labelPosition: {
      control: { type: 'select' },
      options: Object.values(LabelPositions),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LabelTop: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    labelPosition: LabelPositions.TOP,
    Component: <Input />,
  },
};

export const LabelLeft: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    labelPosition: LabelPositions.LEFT,
    Component: <Input />,
  },
};

export const WithErrorAndLabelTop: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    error: 'this is an error',
    Component: <Input />,
  },
};

export const WithErrorAndLabelLeft: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    labelPosition: LabelPositions.LEFT,
    error: 'this is an error',
    Component: <Input />,
  },
};

export const WithLabelAndLoading: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    Component: <Input />,
    loading: true,
  },
};

export const WithMaxLength: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    Component: <Input />,
    maxLength: 90,
  },
};

export const WithMaxLengthAndInfo: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    Component: <Input />,
    maxLength: 90,
    info: 'lorem ipsum dolor sit amest',
  },
};

export const WithMaxLengthAndInfoAndLeftLabel: Story = {
  args: {
    id: 'my-form-element',
    label: 'test',
    Component: <Input />,
    maxLength: 90,
    info: 'lorem ipsum dolor sit amest',
    labelPosition: LabelPositions.LEFT,
  },
};
