import type { Meta, StoryObj } from '@storybook/nextjs';

import { Toast, ToastVariants } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    controls: { include: ['body', 'variant'] },
  },
  decorators: [
    (Story) => (
      <>
        <style>{`[data-sonner-toaster] { position: absolute !important; }`}</style>
        <div style={{ position: 'relative', width: '100%', minHeight: '80px' }}>
          <Story />
        </div>
      </>
    ),
  ],
  args: {
    visible: true,
    duration: Infinity,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(ToastVariants),
    },
    body: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: ToastVariants.SUCCESS,
    body: 'Success toast',
    visible: true,
  },
};

export const Danger: Story = {
  args: {
    variant: ToastVariants.DANGER,
    body: 'Danger toast',
    visible: true,
  },
};

export const Warning: Story = {
  args: {
    variant: ToastVariants.WARNING,
    body: 'Warning toast',
    visible: true,
  },
};

export const Info: Story = {
  args: {
    variant: ToastVariants.INFO,
    body: 'Info toast',
    visible: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Only available in the shadcn implementation (requires SHADCN_MIGRATION feature flag).',
      },
    },
  },
};

export const WithCloseButton: Story = {
  args: {
    variant: ToastVariants.SUCCESS,
    body: 'Success toast with close button',
    visible: true,
    onClose: () => {},
  },
};
