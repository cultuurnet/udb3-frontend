import React from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import type { LabelProps as LegacyProps } from './LabelLegacy';
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

// TODO: remove LegacyProps once legacy Box system is dropped; Label should only accept variant, htmlFor, and className
type Props = LegacyProps & {
  variant?: Values<typeof LabelVariants>;
};

const Label = ({
  htmlFor,
  children,
  className,
  variant = LabelVariants.NORMAL,
  ...props
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <label
      htmlFor={htmlFor}
      className={cn(
        variant === LabelVariants.BOLD && 'tw:font-bold',
        className,
      )}
    >
      {children}
    </label>
  ) : (
    <LabelLegacy
      htmlFor={htmlFor}
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </LabelLegacy>
  );
};

export { Label, LabelPositions, LabelVariants };
