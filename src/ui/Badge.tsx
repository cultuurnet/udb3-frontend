import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Badge as ShadcnBadge } from '@/ui/shadcn/badge';
import { cn } from '@/ui/shadcn/utils';

import { BadgeLegacy } from './BadgeLegacy';

const BadgeVariants = {
  DANGER: 'danger',
  SECONDARY: 'secondary',
  INFO: 'info',
} as const;

type Props = {
  children: React.ReactNode;
  variant?: Values<typeof BadgeVariants>;
  pill?: boolean; // TODO legacy only — shadcn Badge is rounded-full by default, remove after migration
  className?: string;
};

const shadcnVariant: Record<
  Values<typeof BadgeVariants>,
  'destructive' | 'secondary' | 'default'
> = {
  danger: 'destructive',
  secondary: 'secondary',
  info: 'default',
};

const Badge = ({
  children,
  pill,
  className,
  variant = BadgeVariants.DANGER,
  ...props
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <ShadcnBadge
      variant={shadcnVariant[variant]}
      className={cn('tw:self-center', className)}
    >
      {children}
    </ShadcnBadge>
  ) : (
    <BadgeLegacy variant={variant} pill={pill} className={className} {...props}>
      {children}
    </BadgeLegacy>
  );
};

export { Badge, BadgeVariants };
