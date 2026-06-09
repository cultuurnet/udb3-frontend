import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import { Spinner as ShadcnSpinner } from './shadcn/spinner';
import { SpinnerLegacy } from './SpinnerLegacy';

const SpinnerVariants = {
  PRIMARY: 'primary',
  LIGHT: 'light',
} as const;

const SpinnerSizes = {
  SMALL: 'sm',
} as const;

type Props = {
  variant?: Values<typeof SpinnerVariants>;
  size?: Values<typeof SpinnerSizes>;
  className?: string;
};

const Spinner = ({
  variant = SpinnerVariants.PRIMARY,
  size,
  className,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );
  const iconSize = size === SpinnerSizes.SMALL ? 16 : 32;

  return isShadcnMigrationEnabled ? (
    <div
      className={cn(
        'tw:flex tw:w-full tw:items-center tw:justify-center',
        className,
      )}
    >
      <ShadcnSpinner
        width={iconSize}
        height={iconSize}
        className={
          variant === SpinnerVariants.LIGHT
            ? 'tw:text-white'
            : 'tw:text-primary'
        }
      />
    </div>
  ) : (
    <SpinnerLegacy variant={variant} size={size} className={className} />
  );
};

export { Spinner, SpinnerSizes, SpinnerVariants };
