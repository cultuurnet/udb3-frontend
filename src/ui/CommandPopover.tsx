import type { ReactNode } from 'react';
import { useRef } from 'react';

import { Command, CommandList } from './shadcn/command';
import { Popover, PopoverAnchor, PopoverContent } from './shadcn/popover';
import { cn } from './shadcn/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  input: ReactNode;
  children: ReactNode;
};

const CommandPopover = ({
  open,
  onOpenChange,
  className,
  input,
  children,
}: Props) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false} className={cn('tw:w-full', className)}>
        <PopoverAnchor asChild>
          <div ref={anchorRef} className="tw:relative tw:w-full">
            {input}
          </div>
        </PopoverAnchor>

        <PopoverContent
          forceMount
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (
              event.target instanceof Node &&
              anchorRef.current?.contains(event.target)
            ) {
              event.preventDefault();
            }
          }}
          className="tw:w-(--radix-popper-anchor-width) tw:overflow-hidden tw:border-border tw:p-0 tw:data-[state=closed]:pointer-events-none tw:data-[state=closed]:invisible"
        >
          <CommandList>{children}</CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
};

export { CommandPopover };
