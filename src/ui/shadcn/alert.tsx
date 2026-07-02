import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

const alertVariants = cva(
  'tw:relative tw:w-full tw:rounded-lg tw:border tw:px-4 tw:py-3 tw:[&>svg+div]:translate-y-[-3px] tw:[&>svg]:absolute tw:[&>svg]:left-4 tw:[&>svg]:top-4 tw:[&>svg]:text-foreground tw:[&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'tw:bg-background tw:text-foreground',
        destructive:
          'tw:border-destructive/50 tw:text-destructive tw:dark:border-destructive tw:[&>svg]:text-destructive',
        primary:
          'tw:bg-background tw:border-l-[6px] tw:border-info tw:text-foreground tw:[&_h5]:text-info tw:[&_strong]:text-info tw:[&>svg]:text-info',
        info: 'tw:bg-background tw:border-1 tw:border-foreground',
        success:
          'tw:bg-background tw:border-l-[6px] tw:border-success tw:text-foreground tw:[&_h5]:text-success tw:[&_strong]:text-success tw:[&>svg]:text-success',
        warning:
          'tw:bg-background tw:border-l-[6px] tw:border-udb-warning tw:text-foreground tw:[&_h5]:text-udb-warning tw:[&_strong]:text-udb-warning tw:[&>svg]:text-udb-warning',
        danger:
          'tw:bg-background tw:border-l-[6px] tw:border-destructive tw:text-foreground tw:[&_h5]:text-destructive tw:[&_strong]:text-destructive tw:[&>svg]:text-destructive',
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
