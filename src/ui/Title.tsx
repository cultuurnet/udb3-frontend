import React from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import type { InlineProps } from './Inline';
import { TitleLegacy } from './TitleLegacy';

const TitleVariants = {
  DEFAULT: 'default',
  UNDERLINED: 'underlined',
} as const;

const sizeClasses: Record<number, string> = {
  1: 'tw:text-2xl tw:font-light',
  2: 'tw:text-xl tw:font-bold',
  3: 'tw:text-base tw:font-bold',
};

type TitleProps = InlineProps & {
  variant?: Values<typeof TitleVariants>;
};

const Title = ({
  size = 2,
  variant = TitleVariants.DEFAULT,
  children,
  className,
  ...props
}: TitleProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  const Tag = `h${size}` as React.ElementType;

  return isShadcnMigrationEnabled ? (
    <Tag
      className={cn(
        sizeClasses[size] ?? sizeClasses[3],
        variant === TitleVariants.UNDERLINED && 'tw:border-b tw:border-border',
        className,
      )}
    >
      {children}
    </Tag>
  ) : (
    <TitleLegacy size={size} variant={variant} className={className} {...props}>
      {children}
    </TitleLegacy>
  );
};

export { Title, TitleVariants };
export type { TitleProps };
