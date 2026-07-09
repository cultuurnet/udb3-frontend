import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
        <span>Content of the first item</span>
      </Accordion.Item>
      <Accordion.Item eventKey="1" title="Second item">
        <span>Content of the second item</span>
      </Accordion.Item>
      <Accordion.Item eventKey="2" title="Third item">
        <span>Content of the third item</span>
      </Accordion.Item>
    </Accordion>
  ),
};
