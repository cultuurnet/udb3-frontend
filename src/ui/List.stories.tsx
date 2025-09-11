import type { Meta, StoryObj } from '@storybook/react';
import { List, ListVariants } from './List';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  parameters: {
    layout: 'centered',
    controls: {
      exclude: ['stackOn', 'spacing'],
    },
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(ListVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

export const Default: Story = {
  args: {
    variant: ListVariants.UNORDERED,
  },
  render: (args) => (
    <List {...args}>
      {items.map((item) => (
        <List.Item key={item.id}>{item.name}</List.Item>
      ))}
    </List>
  ),
};
