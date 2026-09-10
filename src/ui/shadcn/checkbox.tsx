import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'tw:appearance-none tw:bg-transparent tw:p-0 tw:grid tw:place-content-center tw:peer tw:h-4 tw:w-4 tw:shrink-0 tw:rounded-sm tw:border tw:border-success tw:shadow tw:focus-visible:outline-none tw:focus-visible:ring-1 tw:focus-visible:ring-ring tw:disabled:cursor-not-allowed tw:disabled:opacity-50 tw:data-[state=checked]:bg-success tw:data-[state=checked]:text-success-foreground',
      className,
    )}
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

export { Checkbox };
