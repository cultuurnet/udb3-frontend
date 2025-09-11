import type { Meta, StoryObj } from '@storybook/react';
import { Spinner, SpinnerVariants, SpinnerSizes } from './Spinner';

const SpinnerWrapper = ({ children, variant }) => {
  const isLight = variant === SpinnerVariants.LIGHT;

  return (
    <div
      style={{
        backgroundColor: isLight ? '#333333' : 'transparent',
        padding: isLight ? '20px' : '0',
      }}
    >
      {children}
    </div>
  );
};

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <SpinnerWrapper variant={args.variant}>
      <Spinner {...args} />
    </SpinnerWrapper>
  ),

  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(SpinnerVariants),
    },
    size: {
      control: { type: 'select' },
      options: Object.values(SpinnerSizes),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  args: {
    variant: SpinnerVariants.PRIMARY,
  },
};

export const Light: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  args: {
    variant: SpinnerVariants.LIGHT,
  },
};

export const Normal: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  args: {
    variant: SpinnerVariants.PRIMARY,
  },
};

export const Small: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  args: {
    variant: SpinnerVariants.PRIMARY,
    size: SpinnerSizes.SMALL,
  },
};
