import React from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import type { TextProps as LegacyTextProps } from './TextLegacy';
import { TextLegacy } from './TextLegacy';

const TextVariants = {
  REGULAR: 'regular',
  MUTED: 'muted',
  ERROR: 'error',
} as const;

// TODO: remove LegacyTextProps once legacy Box system is dropped; Text should only accept variant and className
type Props = LegacyTextProps & {
  variant?: Values<typeof TextVariants>;
};

// TODO: add size variants (sm, base, lg) once legacy is dropped
// TODO: consider making this a full Record with regular: '' to be explicit
const variantClasses: Partial<Record<Values<typeof TextVariants>, string>> = {
  muted: 'tw:text-muted-foreground',
  error: 'tw:text-destructive',
};

const Text = ({
  as = 'span',
  children,
  className,
  variant = TextVariants.REGULAR,
  ...props
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  const Tag = as as React.ElementType;

  return isShadcnMigrationEnabled ? (
    <Tag className={cn(variantClasses[variant], className)}>{children}</Tag>
  ) : (
    <TextLegacy as={as} variant={variant} className={className} {...props}>
      {children}
    </TextLegacy>
  );
};

export { Text, TextVariants };
export type { Props as TextProps };
