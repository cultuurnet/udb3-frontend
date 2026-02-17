import type { Values } from '@/types/Values';
import { colors } from '@/ui/theme';

const PublicationStatus = {
  APPROVED: 'APPROVED',
  DRAFT: 'DRAFT',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  PLANNED: 'PLANNED',
  DELETED: 'DELETED',
} as const;

type PublicationStatusType = Values<typeof PublicationStatus>;

const PublicationStatusToColor: Record<PublicationStatusType, string> = {
  DRAFT: colors.warning,
  REJECTED: colors.danger,
  APPROVED: colors.udbMainPositiveGreen,
  PUBLISHED: colors.udbMainPositiveGreen,
  PLANNED: colors.udbMainDarkBlue,
  DELETED: colors.udbMainGrey,
};

export { PublicationStatus, PublicationStatusToColor };
export type { PublicationStatusType };
