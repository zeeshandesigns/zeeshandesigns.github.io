import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ArrowRightIcon, CheckIcon } from './Icon';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Get Started',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Learn More',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'View All',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const WithIconBefore: Story = {
  args: {
    children: 'Check Status',
    iconBefore: <CheckIcon />,
  },
};

export const WithIconAfter: Story = {
  args: {
    children: 'Continue',
    iconAfter: <ArrowRightIcon />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Processing',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};
