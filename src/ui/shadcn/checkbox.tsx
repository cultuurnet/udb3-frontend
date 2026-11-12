import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

const checkboxVariants = cva(
  'tw:appearance-none tw:bg-transparent tw:p-0 tw:grid tw:place-content-center tw:peer tw:h-4 tw:w-4 tw:shrink-0 tw:rounded-sm tw:border tw:shadow tw:focus-visible:outline-none tw:focus-visible:ring-1 tw:focus-visible:ring-ring tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'tw:border-primary tw:data-[state=checked]:bg-primary tw:data-[state=checked]:text-primary-foreground',
        success:
          'tw:border-success tw:data-[state=checked]:bg-success tw:data-[state=checked]:text-success-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants>
>(({ className, variant, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('tw:grid tw:place-content-center tw:text-current')}
    >
      <Check className="tw:h-4 tw:w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
