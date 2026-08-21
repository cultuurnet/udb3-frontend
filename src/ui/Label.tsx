import type { ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import { LabelLegacy } from './LabelLegacy';

const LabelVariants = {
  BOLD: 'bold',
  NORMAL: 'normal',
} as const;

const LabelPositions = {
  LEFT: 'left',
  TOP: 'top',
  RIGHT: 'right',
} as const;

type Props = {
  htmlFor: string;
  children: ReactNode;
  className?: string;
  variant?: Values<typeof LabelVariants>;
};

const Label = ({
  htmlFor,
  children,
  className,
  variant = LabelVariants.NORMAL,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <label
      htmlFor={htmlFor}
      className={cn(
        variant === LabelVariants.BOLD && 'tw:font-bold',
        variant === LabelVariants.NORMAL && 'tw:font-normal',
        className,
      )}
    >
      {children}
    </label>
  ) : (
    <LabelLegacy htmlFor={htmlFor} variant={variant} className={className}>
      {children}
    </LabelLegacy>
  );
};

export { Label, LabelPositions, LabelVariants };
