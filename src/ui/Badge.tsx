import type { Values } from '@/types/Values';
import { Badge as ShadcnBadge } from '@/ui/shadcn/badge';
import { cn } from '@/ui/shadcn/utils';

const BadgeVariants = {
  DANGER: 'danger',
  SECONDARY: 'secondary',
  INFO: 'info',
} as const;

type Props = {
  children: React.ReactNode;
  variant?: Values<typeof BadgeVariants>;
  pill?: boolean;
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
}: Props) => (
  <ShadcnBadge
    variant={shadcnVariant[variant]}
    className={cn(
      'tw:self-center',
      pill ? 'tw:rounded-full' : undefined,
      className,
    )}
  >
    {children}
  </ShadcnBadge>
);

export { Badge, BadgeVariants };
