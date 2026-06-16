import { ReactElement } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { cn } from '@/ui/shadcn/utils';

import { NotificationLegacy } from './NotificationLegacy';

type Props = {
  icon?: ReactElement;
  header?: ReactElement;
  body: ReactElement;
  className?: string;
};

const NotificationShadcn = ({ icon, header, body, className }: Props) => (
  <div
    className={cn(
      'tw:fixed tw:right-4 tw:bottom-24 tw:w-85 tw:rounded tw:bg-white tw:z-5 tw:shadow-lg',
      className,
    )}
  >
    <div className="tw:flex tw:items-center tw:justify-center tw:gap-4 tw:pt-4 tw:pb-4 tw:pr-8 tw:pl-4 tw:text-foreground">
      {icon && <div className="tw:flex tw:items-center">{icon}</div>}
      <div className="tw:flex tw:flex-col">
        {header}
        {body}
      </div>
    </div>
  </div>
);

const Notification = (props: Props) => {
  const [isShadcnMigration] = useFeatureFlag(FeatureFlags.SHADCN_MIGRATION);

  return isShadcnMigration ? (
    <NotificationShadcn {...props} />
  ) : (
    <NotificationLegacy {...props} />
  );
};

export { Notification };
