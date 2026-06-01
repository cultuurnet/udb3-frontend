import type { Meta, StoryObj } from '@storybook/nextjs';

import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion>
      <Accordion.Item eventKey="0" title="First item">
        Content of the first item
      </Accordion.Item>
      <Accordion.Item eventKey="1" title="Second item">
        Content of the second item
      </Accordion.Item>
      <Accordion.Item eventKey="2" title="Third item">
        Content of the third item
      </Accordion.Item>
    </Accordion>
  ),
};
