import type { Meta, StoryObj } from '@storybook/react';

import { Icon, Icons } from './Icon';
import { Notification } from './Notification';
import { Text } from './Text';

const meta: Meta<typeof Notification> = {
  title: 'Components/Notification',
  component: Notification,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    headerText: { control: { type: 'text' } },
    bodyText: { control: { type: 'text' } },
    iconName: { control: { type: 'text' } },
  } as Record<string, unknown>,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headerText: 'Header',
    bodyText: 'Body text content',
    iconName: Icons.BELL,
  } as Record<string, unknown>,
  parameters: {
    controls: {
      include: ['headerText', 'bodyText', 'iconName'],
    },
  },
  render: (args) => {
    const customArgs = args as typeof args & {
      headerText: string;
      bodyText: string;
      iconName: (typeof Icons)[keyof typeof Icons];
    };

    return (
      <Notification
        icon={<Icon name={customArgs.iconName} />}
        header={
          <Text fontSize="1.2rem" fontWeight="bold">
            {customArgs.headerText}
          </Text>
        }
        body={<Text>{customArgs.bodyText}</Text>}
      />
    );
  },
};
