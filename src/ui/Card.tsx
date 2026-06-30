import { ReactNode } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  Card as ShadcnCard,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/ui/shadcn/card';

import { CardLegacy } from './CardLegacy';

type CardProps = {
  children?: ReactNode;
  className?: string;
};

const CardShadcn = ({ children, className }: CardProps) => (
  <ShadcnCard className={className}>{children}</ShadcnCard>
);

const Card = (props: CardProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <CardShadcn {...props} />
  ) : (
    <CardLegacy {...props} />
  );
};

export { Card, CardContent, CardFooter, CardHeader };
export type { CardProps };
