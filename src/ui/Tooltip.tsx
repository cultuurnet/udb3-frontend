import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { badgeVariants } from '@/ui/shadcn/badge';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/shadcn/tooltip';
import { cn } from '@/ui/shadcn/utils';
import { TooltipLegacy } from '@/ui/TooltipLegacy';

type Side = ComponentPropsWithoutRef<typeof TooltipContent>['side'];

type Props = {
  id?: string; // TODO: remove after migration — Radix handles accessibility automatically
  content: string;
  side?: Side;
  children?: ReactNode;
};

const TOOLTIP_DELAY_MS = 100;

const DefaultTrigger = forwardRef<HTMLButtonElement, { content: string }>(
  ({ content, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={content}
      className={cn(badgeVariants({ variant: 'secondary' }), 'tw:self-center')}
      {...props}
    >
      ?
    </button>
  ),
);
DefaultTrigger.displayName = 'DefaultTrigger';

const Tooltip = ({ id, content, side, children }: Props) => {
  const [isShadcnMigration] = useFeatureFlag(FeatureFlags.SHADCN_MIGRATION);

  if (!isShadcnMigration) {
    return <TooltipLegacy id={id} content={content} placement={side} />;
  }

  return (
    <TooltipProvider delayDuration={TOOLTIP_DELAY_MS}>
      <ShadcnTooltip>
        <TooltipTrigger asChild>
          {children ? (
            <span>{children}</span>
          ) : (
            <DefaultTrigger content={content} />
          )}
        </TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
};

export { Tooltip };
