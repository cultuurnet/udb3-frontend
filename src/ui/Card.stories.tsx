import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card, CardContent, CardFooter, CardHeader } from './Card';
import { Text } from './Text';
import { Title } from './Title';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="tw:w-96">
      <CardHeader>
        <Text>Subtitle</Text>
        <Title>Card title</Title>
      </CardHeader>
      <CardContent>
        <Text>Some content goes here.</Text>
      </CardContent>
      <CardFooter>
        <Text>Footer</Text>
      </CardFooter>
    </Card>
  ),
};
