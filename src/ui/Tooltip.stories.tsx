import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button, ButtonVariants } from './Button';
import { Icon, Icons } from './Icon';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    children: {
      description: 'Custom trigger. Defaults to `?` badge. Shadcn only.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const shadcnOnly = {
  docs: {
    description: {
      story: 'Requires the `SHADCN_MIGRATION` feature flag to be enabled.',
    },
  },
};

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
  },
};

export const WithButton: Story = {
  parameters: shadcnOnly,
  args: {
    content: 'This is a tooltip on a button',
    placement: 'top',
  },
  render: ({ content, placement }) => (
    <Tooltip content={content} placement={placement}>
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

export const WithIconButton: Story = {
  parameters: shadcnOnly,
  args: {
    content: 'Search',
    placement: 'top',
  },
  render: ({ content, placement }) => (
    <Tooltip content={content} placement={placement}>
      <Button variant={ButtonVariants.UNSTYLED}>
        <Icon name={Icons.SEARCH} />
      </Button>
    </Tooltip>
  ),
};

export const WithText: Story = {
  parameters: shadcnOnly,
  args: {
    content: 'This is a tooltip on text',
    placement: 'top',
  },
  render: ({ content, placement }) => (
    <Tooltip content={content} placement={placement}>
      <span className="tw:underline tw:cursor-help">Hover over this text</span>
    </Tooltip>
  ),
};
