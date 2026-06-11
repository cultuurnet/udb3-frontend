import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Text, TextVariants } from '@/ui/Text';

import { StatusIndicatorLegacy } from './StatusIndicatorLegacy';

type PublicationStatusIndicatorProps = {
  color?: string;
  label?: string;
  isExternalCreator?: boolean;
};

const StatusIndicatorShadcn = ({
  color,
  label,
  isExternalCreator,
}: PublicationStatusIndicatorProps) => {
  const { t } = useTranslation();

  return (
    <div className="tw:flex tw:flex-col">
      <div className="tw:flex tw:flex-row tw:items-center tw:gap-x-2 tw:mb-1">
        {color && label && (
          <>
            <span
              className="tw:w-3.5 tw:h-3.5 tw:rounded-full tw:shrink-0"
              style={{ backgroundColor: color }}
            />
            <Text variant={TextVariants.MUTED}>{label}</Text>
          </>
        )}
      </div>
      {isExternalCreator && (
        <Text variant={TextVariants.MUTED}>
          {t('dashboard.external_creator')}
        </Text>
      )}
    </div>
  );
};

const StatusIndicator = (props: PublicationStatusIndicatorProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <StatusIndicatorShadcn {...props} />
  ) : (
    <StatusIndicatorLegacy {...props} />
  );
};

export type { PublicationStatusIndicatorProps };
export { StatusIndicator };
