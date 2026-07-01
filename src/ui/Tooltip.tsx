import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Badge, BadgeVariants } from '@/ui/Badge';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/shadcn/tooltip';
import { TooltipLegacy } from '@/ui/TooltipLegacy';

type Placement = ComponentPropsWithoutRef<typeof TooltipContent>['side'];

type Props = {
  id?: string; // TODO: remove after migration — Radix handles accessibility automatically
  content: string;
  placement?: Placement;
  children?: ReactNode;
};

const TOOLTIP_DELAY_MS = 100;

const DefaultTrigger = () => (
  <Badge variant={BadgeVariants.SECONDARY} pill>
    ?
  </Badge>
);

const Tooltip = ({ id, content, placement, children }: Props) => {
  const [isShadcnMigration] = useFeatureFlag(FeatureFlags.SHADCN_MIGRATION);

  if (!isShadcnMigration) {
    return <TooltipLegacy id={id} content={content} placement={placement} />;
  }

  return (
    <TooltipProvider delayDuration={TOOLTIP_DELAY_MS}>
      <ShadcnTooltip>
        <TooltipTrigger asChild>
          <span>{children ?? <DefaultTrigger />}</span>
        </TooltipTrigger>
        <TooltipContent side={placement}>{content}</TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
};

export { Tooltip };
