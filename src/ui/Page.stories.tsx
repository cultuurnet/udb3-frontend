import type { Meta, StoryObj } from '@storybook/react';
import { Page } from './Page';
import { Text } from './Text';
import { Link } from './Link';

const meta: Meta<typeof Page> = {
  title: 'Components/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['backgroundColor'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Page {...args}>
      <Page.Title>Page Title</Page.Title>
      <Page.Content>
        <Text>Page content</Text>
      </Page.Content>
      <Page.Actions>
        <Link href="#">action</Link>
      </Page.Actions>
    </Page>
  ),
};
