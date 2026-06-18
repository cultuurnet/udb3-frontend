import type { Meta, StoryObj } from '@storybook/nextjs';

import { Alert, AlertVariants } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    controls: {
      exclude: ['stackOn', 'spacing', 'onClose'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(AlertVariants),
    },
    action: {
      control: false,
      description:
        'Optional action element rendered below the description. Shadcn implementation only.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const commonArgs = {
  visible: true,
};

export const Primary: Story = {
  args: {
    variant: AlertVariants.PRIMARY,
    children: 'A Primary Alert',
    ...commonArgs,
  },
};

export const Info: Story = {
  args: {
    variant: AlertVariants.INFO,
    children: 'An Info Alert',
    ...commonArgs,
  },
};

export const Success: Story = {
  args: {
    variant: AlertVariants.SUCCESS,
    children: 'A Success Alert',
    ...commonArgs,
  },
};

export const Warning: Story = {
  args: {
    variant: AlertVariants.WARNING,
    children: 'A Warning Alert',
    ...commonArgs,
  },
};

export const Danger: Story = {
  args: {
    variant: AlertVariants.DANGER,
    children: 'A Danger Alert',
    ...commonArgs,
  },
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Only available in the shadcn implementation (requires `SHADCN_MIGRATION` feature flag).',
      },
    },
  },
  render: () => (
    <Alert
      variant={AlertVariants.DANGER}
      title="Something went wrong"
      action={<a href="#">Retry</a>}
      visible
    >
      Your changes could not be saved. Please try again.
    </Alert>
  ),
};

export const WithTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Only available in the shadcn implementation (requires `SHADCN_MIGRATION` feature flag).',
      },
    },
  },
  args: {
    variant: AlertVariants.PRIMARY,
    title: 'Something needs your attention',
    children: 'Check the details below and take the necessary action.',
    ...commonArgs,
  },
};

export const Closable: Story = {
  args: {
    variant: AlertVariants.WARNING,
    children: 'This alert can be closed',
    closable: true,
    onClose: () => {},
    ...commonArgs,
  },
};

export const FullWidth: Story = {
  args: {
    variant: AlertVariants.INFO,
    children: 'This alert spans the full width',
    fullWidth: true,
    ...commonArgs,
  },
};

export const WithList: Story = {
  render: () => (
    <Alert variant={AlertVariants.PRIMARY} visible>
      {`<strong>Tips voor de beschrijving van een cursus met open sessies</strong><br/><ul><li>Leg uit wat je precies leert of doet tijdens de sessies.</li><li>Vul daarna verder aan met extra informatie.</li><li>Gebruik daarvoor ook de veelgestelde vragen.</li></ul>`}
    </Alert>
  ),
};

export const WithInlineFormatting: Story = {
  render: () => (
    <Alert variant={AlertVariants.INFO} visible>
      {`This alert has <strong>strong text</strong>, <b>bold text</b>, and <code>inline code</code>.`}
    </Alert>
  ),
};
