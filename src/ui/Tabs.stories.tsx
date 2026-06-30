import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { Tabs, TabsVariants } from '@/ui/Tabs';
import { Text } from '@/ui/Text';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['activeBackgroundColor', 'variant', 'compact'],
    },
  },

  argTypes: {
    activeBackgroundColor: { control: { type: 'color' } },
    variant: {
      control: { type: 'select' },
      options: ['default', 'floating', 'outlined'],
    },
    compact: {
      control: { type: 'boolean' },
      description:
        'Reduces horizontal padding on tab triggers. Only has a visual effect on the floating variant, which uses wider padding by default.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    activeKey: 'places',
  },
  render: function RenderComponent(args) {
    const [activeKey, setActiveKey] = useState(args.activeKey || 'places');

    return (
      <Tabs
        {...args}
        activeKey={activeKey}
        onSelect={(key) => setActiveKey(key as string)}
      >
        <Tabs.Tab eventKey="events" title="Events">
          <Text>EVENTS</Text>
        </Tabs.Tab>
        <Tabs.Tab eventKey="places" title="Places">
          <Text>PLACES</Text>
        </Tabs.Tab>
        <Tabs.Tab eventKey="organizers" title="Organizers">
          <Text>ORGANIZERS</Text>
        </Tabs.Tab>
      </Tabs>
    );
  },
};

export const Floating: Story = {
  args: {
    activeKey: 'events',
    variant: TabsVariants.FLOATING,
  },
  parameters: {
    controls: { exclude: ['variant', 'activeBackgroundColor'] },
  },
  render: function RenderComponent(args) {
    const [activeKey, setActiveKey] = useState(args.activeKey || 'events');

    return (
      <Tabs
        {...args}
        activeKey={activeKey}
        onSelect={(key) => setActiveKey(key as string)}
      >
        <Tabs.Tab eventKey="events" title="Events">
          <Text>EVENTS</Text>
        </Tabs.Tab>
        <Tabs.Tab eventKey="places" title="Places">
          <Text>PLACES</Text>
        </Tabs.Tab>
        <Tabs.Tab eventKey="organizers" title="Organizers">
          <Text>ORGANIZERS</Text>
        </Tabs.Tab>
      </Tabs>
    );
  },
};

export const Outlined: Story = {
  args: {
    activeKey: 'events',
    variant: TabsVariants.OUTLINED,
  },
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: function RenderComponent(args) {
    const [activeKey, setActiveKey] = useState(args.activeKey || 'events');

    return (
      <Tabs
        {...args}
        activeKey={activeKey}
        onSelect={(key) => setActiveKey(key as string)}
      >
        <Tabs.Tab eventKey="events" title="Events">
          <Text>EVENTS</Text>
        </Tabs.Tab>
        <Tabs.Tab eventKey="places" title="Places">
          <Text>PLACES</Text>
        </Tabs.Tab>
      </Tabs>
    );
  },
};
