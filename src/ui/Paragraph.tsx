import React from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import { ParagraphLegacy } from './ParagraphLegacy';
import type { TextProps as LegacyProps } from './Text';

const ParagraphVariants = {
  REGULAR: 'regular',
  MUTED: 'muted',
  ERROR: 'error',
} as const;

// TODO: remove LegacyProps once legacy Box system is dropped; Paragraph should only accept variant, as, and className
type Props = LegacyProps & {
  variant?: Values<typeof ParagraphVariants>;
};

const variantClasses: Partial<
  Record<Values<typeof ParagraphVariants>, string>
> = {
  muted: 'tw:text-muted-foreground',
  error: 'tw:text-destructive',
};

const Paragraph = ({
  as,
  children,
  className,
  variant = ParagraphVariants.REGULAR,
  ...props
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  const Tag = (as ?? 'p') as React.ElementType;

  return isShadcnMigrationEnabled ? (
    <Tag
      className={cn(
        'tw:max-w-180 tw:leading-[140%]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Tag>
  ) : (
    <ParagraphLegacy as={as} variant={variant} className={className} {...props}>
      {children}
    </ParagraphLegacy>
  );
};

export { Paragraph, ParagraphVariants };
