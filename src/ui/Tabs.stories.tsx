import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabsVariants } from '@/ui/Tabs';
import { Text } from '@/ui/Text';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['activeBackgroundColor', 'variant'],
    },
  },

  argTypes: {
    activeBackgroundColor: { control: { type: 'color' } },
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    activeKey: 'places',
    activeBackgroundColor: '#fff',
  },
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: (args) => {
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

export const Outlined: Story = {
  args: {
    activeKey: 'events',
    variant: TabsVariants.OUTLINED,
    activeBackgroundColor: '#0083B8',
  },
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: (args) => {
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
