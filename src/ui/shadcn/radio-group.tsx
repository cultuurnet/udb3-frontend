import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

// Literal px: root font-size is 15px here, so a rem-based size rounds to a
// fractional pixel and renders the dot visibly off-center.
const RADIO_DOT_SIZE_CLASS = 'tw:after:size-[9px]';

const radioGroupItemVariants = cva(
  `tw:box-border tw:appearance-none tw:bg-transparent tw:p-0 tw:aspect-square tw:h-4 tw:w-4 tw:rounded-full tw:border tw:shadow tw:flex tw:items-center tw:justify-center tw:after:hidden tw:data-[state=checked]:after:block tw:after:rounded-full tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-ring tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-background tw:disabled:cursor-not-allowed tw:disabled:opacity-50 ${RADIO_DOT_SIZE_CLASS}`,
  {
    variants: {
      variant: {
        default: 'tw:border-primary tw:after:bg-primary',
        success: 'tw:border-success tw:after:bg-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('tw:grid tw:gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
    VariantProps<typeof radioGroupItemVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants({ variant }), className)}
      {...props}
    />
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
