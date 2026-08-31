import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Accordion } from './Accordion';

type AccordionArgs = {
  defaultActiveKey?: string | string[];
  multiple?: boolean;
};

const meta: Meta<AccordionArgs> = {
  title: 'Components/Accordion',
  parameters: {
    layout: 'padded',
    controls: {
      include: ['defaultActiveKey', 'multiple'],
    },
  },
  argTypes: {
    defaultActiveKey: { control: 'text' },
    multiple: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<AccordionArgs>;

export const Default: Story = {
  args: {
    defaultActiveKey: '0',
  },
  render: (args) =>
    args.multiple ? (
      <Accordion multiple defaultActiveKey={args.defaultActiveKey as string[]}>
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
    ) : (
      <Accordion defaultActiveKey={args.defaultActiveKey as string}>
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

export const MultipleOpen: Story = {
  args: {
    multiple: true,
    defaultActiveKey: ['0', '2'],
  },
  parameters: {
    controls: { exclude: ['defaultActiveKey', 'multiple'] },
  },
  render: (args) => (
    <Accordion multiple defaultActiveKey={args.defaultActiveKey as string[]}>
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
