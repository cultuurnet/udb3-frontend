import { type DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';

import { Dialog, DialogContent } from '@/ui/shadcn/dialog';
import { cn } from '@/ui/shadcn/utils';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'tw:flex tw:h-full tw:w-full tw:flex-col tw:overflow-hidden tw:rounded-md tw:bg-popover tw:text-popover-foreground',
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="tw:overflow-hidden tw:p-0">
        <Command className="tw:**:[[cmdk-group-heading]]:px-2 tw:**:[[cmdk-group-heading]]:font-medium tw:**:[[cmdk-group-heading]]:text-muted-foreground tw:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 tw:**:[[cmdk-group]]:px-2 tw:[&_[cmdk-input-wrapper]_svg]:h-5 tw:[&_[cmdk-input-wrapper]_svg]:w-5 tw:**:[[cmdk-input]]:h-12 tw:**:[[cmdk-item]]:px-2 tw:**:[[cmdk-item]]:py-3 tw:[&_[cmdk-item]_svg]:h-5 tw:[&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    icon?: React.ReactNode;
  }
>(({ className, icon = <Search />, ...props }, ref) => {
  const inputRef =
    React.useRef<React.ElementRef<typeof CommandPrimitive.Input>>(null);
  React.useImperativeHandle(ref, () => inputRef.current!);

  return (
    <div
      className="tw:flex tw:items-center tw:border-b tw:px-3"
      cmdk-input-wrapper=""
    >
      <span
        onClick={() => inputRef.current?.focus()}
        className="tw:mr-2 tw:inline-flex tw:h-4 tw:w-4 tw:shrink-0 tw:cursor-pointer tw:items-center tw:justify-center tw:opacity-50 tw:[&>svg]:h-full tw:[&>svg]:w-full"
      >
        {icon}
      </span>
      <CommandPrimitive.Input
        ref={inputRef}
        className={cn(
          'tw:flex tw:h-10 tw:w-full tw:rounded-md tw:bg-transparent tw:py-3 tw:text-sm tw:outline-none tw:placeholder:text-muted-foreground tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
});

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'tw:max-h-75 tw:overflow-y-auto tw:overflow-x-hidden',
      className,
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="tw:py-6 tw:text-center tw:text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'tw:overflow-hidden tw:p-1 tw:text-foreground tw:**:[[cmdk-group-heading]]:px-2 tw:**:[[cmdk-group-heading]]:py-1.5 tw:**:[[cmdk-group-heading]]:text-xs tw:**:[[cmdk-group-heading]]:font-medium tw:**:[[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('tw:-mx-1 tw:h-px tw:bg-border', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'tw:relative tw:flex tw:cursor-default tw:gap-2 tw:select-none tw:items-center tw:rounded-sm tw:px-2 tw:py-1.5 tw:text-sm tw:outline-none tw:data-[disabled=true]:pointer-events-none tw:data-[selected=true]:bg-accent tw:data-[selected=true]:text-accent-foreground tw:data-[disabled=true]:opacity-50 tw:[&_svg]:pointer-events-none tw:[&_svg]:size-4 tw:[&_svg]:shrink-0',
      className,
    )}
    onMouseDown={(event) => event.preventDefault()}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'tw:ml-auto tw:text-xs tw:tracking-widest tw:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
