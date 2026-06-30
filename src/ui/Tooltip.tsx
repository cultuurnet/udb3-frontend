import { ReactNode } from 'react';
import { OverlayTriggerProps } from 'react-bootstrap'; // TODO: remove after migration — only used for placement type

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Badge, BadgeVariants } from '@/ui/Badge';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/shadcn/tooltip';
import { TooltipLegacy } from '@/ui/TooltipLegacy';

type Props = {
  id?: string; // TODO: remove after migration — Radix handles accessibility automatically
  content: string;
  children?: ReactNode;
} & Pick<OverlayTriggerProps, 'placement'>;

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

  const side = placement?.toString().split('-')[0] as
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | undefined;

  return (
    <TooltipProvider delayDuration={TOOLTIP_DELAY_MS}>
      <ShadcnTooltip>
        <TooltipTrigger asChild>
          <span>{children ?? <DefaultTrigger />}</span>
        </TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
};

export { Tooltip };
