import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Progress } from '@/ui/shadcn/progress';
import { cn } from '@/ui/shadcn/utils';

import { ProgressBarLegacy } from './ProgressBarLegacy';

const ProgressBarVariants = {
  INFO: 'info',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
} as const;

type Props = {
  progress: number;
  variant: Values<typeof ProgressBarVariants>;
  label?: string;
  showPercentage?: boolean;
  className?: string;
};

const trackClasses: Record<Values<typeof ProgressBarVariants>, string> = {
  info: 'tw:bg-primary/20',
  success: 'tw:bg-success/20',
  danger: 'tw:bg-destructive/20',
  warning: 'tw:bg-udb-warning/20',
};

const indicatorClasses: Record<Values<typeof ProgressBarVariants>, string> = {
  info: 'tw:bg-primary',
  success: 'tw:bg-success',
  danger: 'tw:bg-destructive',
  warning: 'tw:bg-udb-warning',
};

const ProgressBar = ({
  progress,
  variant,
  label,
  showPercentage = false,
  className,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <div className={cn('tw:flex tw:flex-col tw:gap-1', className)}>
      {(label || showPercentage) && (
        <div className="tw:flex tw:text-sm">
          {label && <span>{label}</span>}
          {showPercentage && <span className="tw:ml-auto">{progress}%</span>}
        </div>
      )}
      <Progress
        value={progress}
        className={trackClasses[variant]}
        indicatorClassName={indicatorClasses[variant]}
      />
    </div>
  ) : (
    <ProgressBarLegacy
      progress={progress}
      variant={variant}
      className={className}
    />
  );
};

export { ProgressBar, ProgressBarVariants };
