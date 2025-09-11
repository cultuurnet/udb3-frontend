import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';
import { Box } from './Box';

const meta: Meta<typeof Panel> = {
  title: 'Components/Panel',
  component: Panel,
  parameters: {
    controls: {
      exclude: ['stackOn', 'spacing'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Panel content',
  },
};

export const WithFooter: Story = {
  parameters: {
    controls: {
      include: ['children'],
    },
  },
  args: {
    children: 'Panel content',
  },
  render: (args) => (
    <Panel {...args}>
      <Box>{args.children || 'Panel content'}</Box>
      <Panel.Footer>Panel footer content</Panel.Footer>
    </Panel>
  ),
};
