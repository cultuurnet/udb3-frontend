import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

const alertVariants = cva(
  'tw:relative tw:w-full tw:rounded-lg tw:border tw:bg-background tw:px-4 tw:py-3 tw:text-foreground tw:[&>svg+div]:translate-y-[-3px] tw:[&>svg]:absolute tw:[&>svg]:left-4 tw:[&>svg]:top-4 tw:[&>svg]:text-foreground tw:[&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: '',
        primary: 'tw:border-l-[6px] tw:border-info tw:[&>svg]:text-info',
        info: 'tw:border-1 tw:border-foreground',
        success: 'tw:border-l-[6px] tw:border-success tw:[&>svg]:text-success',
        warning: 'tw:border-l-[6px] tw:border-warning tw:[&>svg]:text-warning',
        danger:
          'tw:border-l-[6px] tw:border-destructive tw:[&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'tw:mb-1.5 tw:font-bold tw:leading-none tw:tracking-tight',
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('tw:[&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle, alertVariants };
