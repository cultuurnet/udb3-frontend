import type { Meta, StoryObj } from '@storybook/react';

import { Inline } from '@/ui/Inline';
import { Text } from '@/ui/Text';

import { Icon, Icons } from './Icon';
import { Link, LinkVariants } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'href', 'children'],
    },
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(LinkVariants),
    },
    href: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Internal: Story = {
  args: {
    children: 'internal',
    href: '/test',
  },
  render: (args) => (
    <Text>
      This is an <Link {...args} /> link
    </Text>
  ),
};

export const UnstyledInternal: Story = {
  args: {
    children: 'unstyled internal',
    href: '/test',
    variant: LinkVariants.UNSTYLED,
  },
};

export const ExternalLink: Story = {
  args: {
    children: 'external',
    href: 'https://www.google.com',
  },
};

export const UnstyledExternal: Story = {
  args: {
    children: 'unstyled external',
    href: 'https://www.google.com',
    variant: LinkVariants.UNSTYLED,
  },
};

export const CustomChildren: Story = {
  args: {
    customChildren: true,
    iconName: 'user',
    href: 'https://www.google.com',
    variant: LinkVariants.UNSTYLED,
  },
  parameters: {
    controls: {
      include: ['iconName'],
    },
  },
  argTypes: {
    iconName: {
      control: { type: 'text' },
    },
  },
  render: (args) => (
    <Link customChildren={true} href={args.href} variant={args.variant}>
      <Icon name={args.iconName} />
    </Link>
  ),
};

export const AsButton: Story = {
  args: {
    href: '/?path=/story/introduction-design-principles--page',
  },
  parameters: {
    controls: {
      exclude: ['children', 'iconName', 'variant'],
    },
  },
  render: (args) => (
    <Inline spacing={3}>
      <Link {...args} variant={LinkVariants.BUTTON_PRIMARY}>
        Primary
      </Link>
      <Link {...args} variant={LinkVariants.BUTTON_SECONDARY}>
        Secondary
      </Link>
      <Link {...args} variant={LinkVariants.BUTTON_SUCCESS}>
        Success
      </Link>
      <Link {...args} variant={LinkVariants.BUTTON_DANGER}>
        Danger
      </Link>
    </Inline>
  ),
};
