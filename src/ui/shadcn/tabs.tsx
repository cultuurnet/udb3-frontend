import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/ui/shadcn/utils';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva('tw:inline-flex tw:items-center', {
  variants: {
    variant: {
      default:
        'tw:h-auto tw:w-full tw:rounded-none tw:bg-transparent tw:p-0 tw:border-b tw:border-border tw:justify-start tw:gap-0',
      line: 'tw:h-auto tw:w-full tw:rounded-none tw:bg-transparent tw:p-0 tw:border-b tw:border-border tw:justify-start tw:gap-0',
      outlined:
        'tw:h-auto tw:w-full tw:rounded-none tw:bg-transparent tw:p-0 tw:justify-start tw:gap-0',
    },
  },
  defaultVariants: { variant: 'default' },
});

const tabsTriggerVariants = cva(
  'tw:inline-flex tw:items-center tw:justify-center tw:whitespace-nowrap tw:font-medium tw:transition-all tw:focus-visible:outline-none tw:disabled:pointer-events-none tw:disabled:opacity-50',
  {
    variants: {
      variant: {
        default: cn(
          'tw:rounded-none tw:rounded-t-lg tw:bg-background tw:text-udb-blue tw:px-4 tw:py-2',
          'tw:border tw:border-border tw:-mb-px tw:[&:not(:first-child)]:-ml-px',
          'tw:hover:bg-muted tw:hover:text-foreground',
          'tw:data-[state=active]:bg-background tw:data-[state=active]:text-foreground',
          'tw:data-[state=active]:border-b-background tw:data-[state=active]:relative tw:data-[state=active]:z-[2] tw:data-[state=active]:shadow-none',
        ),
        line: cn(
          'tw:rounded-none tw:rounded-t-lg tw:bg-transparent tw:text-primary tw:px-8 tw:py-[0.6rem]',
          'tw:border-0 tw:border-b-[3px] tw:border-b-transparent tw:-mb-px',
          'tw:hover:bg-primary/10',
          'tw:data-[state=active]:font-bold tw:data-[state=active]:border-b-primary',
          'tw:data-[state=active]:bg-transparent tw:data-[state=active]:shadow-none tw:data-[state=active]:text-primary',
        ),
        outlined: cn(
          'tw:rounded-none tw:border tw:border-black tw:bg-background tw:text-udb-blue tw:px-4 tw:py-[0.4rem]',
          'tw:first:rounded-l-lg tw:last:rounded-r-lg tw:[&:not(:first-child)]:-ml-px',
          'tw:data-[state=active]:bg-udb-main-dark-blue tw:data-[state=active]:text-primary-foreground tw:data-[state=active]:shadow-none',
        ),
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'tw:focus-visible:outline-none tw:data-[state=inactive]:hidden',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  Tabs,
  TabsContent,
  TabsList,
  tabsListVariants,
  TabsTrigger,
  tabsTriggerVariants,
};
