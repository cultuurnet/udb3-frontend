import type { Meta, StoryObj } from '@storybook/react';
import type { Values } from '@/types/Values';
import { Dropdown, DropDownVariants } from './Dropdown';
import { Button, ButtonVariants } from '@/ui/Button';
import { Link, LinkVariants } from '@/ui/Link';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(DropDownVariants),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithButton: Story = {
  args: {
    variant: DropDownVariants.PRIMARY,
    isSplit: true,
  },
  render: (args) => {
    const buttonVariant =
      args.variant === DropDownVariants.SECONDARY
        ? ButtonVariants.SECONDARY
        : args.variant;

    return (
      <Dropdown {...args}>
        <Button variant={buttonVariant}>Primary action</Button>
        <Dropdown.Item href="#example-href-1">Example href 1</Dropdown.Item>
        <Dropdown.Item onClick={() => console.log('Example onClick 1')}>
          Example onClick 1
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item href="#example-href-2">Example href 2</Dropdown.Item>
        <Dropdown.Item onClick={() => console.log('Example onClick 2')}>
          Example onClick 2
        </Dropdown.Item>
      </Dropdown>
    );
  },
};

export const WithLink: Story = {
  args: {
    variant: DropDownVariants.PRIMARY,
    isSplit: true,
  },
  render: (args) => {
    const linkVariant = (Object.values(LinkVariants) as string[]).includes(
      args.variant,
    )
      ? args.variant
      : LinkVariants.UNSTYLED;

    return (
      <Dropdown {...args}>
        <Link
          href="#example"
          variant={linkVariant as Values<typeof LinkVariants>}
        >
          Primary action
        </Link>
        <Dropdown.Item href="#example-href-1">Example href 1</Dropdown.Item>
        <Dropdown.Item onClick={() => console.log('Example onClick 1')}>
          Example onClick 1
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item href="#example-href-2">Example href 2</Dropdown.Item>
        <Dropdown.Item onClick={() => console.log('Example onClick 2')}>
          Example onClick 2
        </Dropdown.Item>
      </Dropdown>
    );
  },
};
