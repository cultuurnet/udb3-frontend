import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

const buttonVariants = cva(
  'tw:appearance-none tw:border-0 tw:bg-transparent tw:p-0 tw:inline-flex tw:items-center tw:justify-center tw:whitespace-nowrap tw:rounded-md tw:text-base tw:font-normal tw:transition-colors tw:focus-visible:outline-none tw:focus-visible:ring-1 tw:focus-visible:ring-ring tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'tw:bg-primary tw:text-primary-foreground tw:shadow tw:hover:bg-primary/90',
        destructive:
          'tw:bg-destructive tw:text-destructive-foreground tw:shadow-sm tw:hover:bg-destructive/90',
        outline:
          'tw:border tw:border-input tw:bg-background tw:shadow-sm tw:hover:bg-accent tw:hover:text-accent-foreground',
        secondary:
          'tw:bg-secondary tw:text-secondary-foreground tw:shadow-sm tw:hover:bg-secondary/80',
        neutral:
          'tw:bg-background tw:text-foreground tw:shadow-md tw:hover:bg-udb-grey-1',
        ghost: 'tw:hover:bg-accent tw:hover:text-accent-foreground',
        link: 'tw:text-primary tw:underline-offset-4 tw:hover:underline',
        success:
          'tw:bg-success tw:text-success-foreground tw:shadow tw:hover:bg-success/90',
        'secondary-toggle':
          'tw:border tw:border-udb-grey-3 tw:bg-transparent tw:text-[#333333] tw:shadow-none tw:hover:border-udb-main-positive-green tw:hover:text-udb-main-positive-green',
        unstyled: 'tw:bg-transparent tw:text-inherit tw:shadow-none',
        'link-danger':
          'tw:text-udb-danger-dark tw:underline-offset-4 tw:hover:text-udb-danger-bright tw:hover:underline',
        outlined:
          'tw:border tw:border-primary tw:bg-transparent tw:text-primary tw:shadow-none tw:hover:bg-primary/10',
        icon: 'tw:relative tw:rounded-full tw:bg-transparent tw:shadow-none tw:hover:bg-udb-grey-4 tw:active:bg-udb-grey-3 tw:[&_svg]:absolute tw:[&_svg]:top-1/2 tw:[&_svg]:left-1/2 tw:[&_svg]:-translate-x-1/2 tw:[&_svg]:-translate-y-1/2',
      },
      size: {
        default: 'tw:h-10 tw:px-4 tw:py-2',
        sm: 'tw:h-8 tw:rounded-md tw:px-3 tw:text-xs',
        lg: 'tw:h-10 tw:rounded-md tw:px-8',
        icon: 'tw:h-9 tw:w-9',
      },
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'secondary-toggle',
        active: true,
        class:
          'tw:border-udb-main-positive-green tw:bg-udb-main-light-green tw:text-udb-main-positive-green',
      },
      {
        variant: 'neutral',
        active: true,
        class: 'tw:bg-udb-grey-1',
      },
      {
        variant: 'unstyled',
        class: 'tw:h-auto tw:w-auto tw:rounded-none tw:p-0',
      },
      {
        variant: ['link', 'link-danger'],
        class: 'tw:h-auto tw:w-auto tw:p-0',
      },
      {
        variant: 'icon',
        class: 'tw:h-auto tw:w-auto tw:p-3',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      active: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, active, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, active, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
