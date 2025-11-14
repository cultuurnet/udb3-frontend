import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from './Button';
import { Modal, ModalVariants } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    visible: { control: { type: 'boolean' } },
    title: { control: { type: 'text' } },
    variant: {
      control: { type: 'select' },
      options: Object.values(ModalVariants),
    },
    confirmTitle: { control: { type: 'text' } },
    cancelTitle: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Content: Story = {
  args: {
    title: 'Content modal',
    variant: ModalVariants.CONTENT,
    children: 'Modal content',
  },
  parameters: {
    controls: {
      include: ['size', 'title', 'children'],
    },
  },
  render: function RenderComponent(args) {
    const [visible, setVisible] = useState(false);
    return (
      <>
        <Button onClick={() => setVisible(true)}>Open Content Modal</Button>
        <Modal {...args} visible={visible} onClose={() => setVisible(false)} />
      </>
    );
  },
};

export const Question: Story = {
  args: {
    title: 'Question modal',
    confirmTitle: 'Ok',
    cancelTitle: 'Cancel',
    variant: ModalVariants.QUESTION,
    children: 'Are you sure you want to continue?',
  },
  parameters: {
    controls: {
      include: [
        'cancelTitle',
        'confirmTitle',
        'size',
        'title',
        'children',
        'confirmButtonVariant',
      ],
    },
  },
  render: function RenderComponent(args) {
    const [visible, setVisible] = useState(false);
    return (
      <>
        <Button onClick={() => setVisible(true)}>Open Question Modal</Button>
        <Modal
          {...args}
          visible={visible}
          onConfirm={() => {
            setVisible(false);
          }}
          onCancel={() => {
            setVisible(false);
          }}
          onClose={() => setVisible(false)}
        />
      </>
    );
  },
};
