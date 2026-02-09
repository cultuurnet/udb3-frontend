import { format, isAfter, isFuture } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PublicationStatus,
  PublicationStatusToColor,
  PublicationStatusType,
} from '@/constants/PublicationStatus';
import type { Offer } from '@/types/Offer';
import { WorkflowStatus } from '@/types/WorkflowStatus';

import { useGetUserQuery } from './api/user';

export type PublicationStatusInfo = {
  color?: string;
  label?: string;
  isExternalCreator?: boolean;
};

export type OfferPublicationStatus = PublicationStatusInfo & {
  isFinished: boolean;
};

export const usePublicationStatus = (offer: Offer): OfferPublicationStatus => {
  const { t } = useTranslation();
  const getUserQuery = useGetUserQuery();
  const user = getUserQuery.data;

  return useMemo(() => {
    const isFinished = isAfter(new Date(), new Date(offer.availableTo));
    const isPublished = (
      [
        WorkflowStatus.APPROVED,
        WorkflowStatus.READY_FOR_VALIDATION,
      ] as WorkflowStatus[]
    ).includes(offer.workflowStatus);
    const isPlanned = isPublished && isFuture(new Date(offer.availableFrom));

    let publicationStatus: PublicationStatusType;
    if (isPlanned) {
      publicationStatus = PublicationStatus.PLANNED;
    } else if (isPublished) {
      publicationStatus = PublicationStatus.PUBLISHED;
    } else if (offer.workflowStatus === WorkflowStatus.READY_FOR_VALIDATION) {
      publicationStatus = PublicationStatus.DRAFT;
    } else {
      publicationStatus = offer.workflowStatus as PublicationStatusType;
    }

    const color = PublicationStatusToColor[publicationStatus];

    let label: string;
    if (publicationStatus === PublicationStatus.REJECTED) {
      label = t('dashboard.row_status.rejected');
    }

    if (publicationStatus === PublicationStatus.PUBLISHED) {
      label = t('dashboard.row_status.published');
    }

    if (publicationStatus === PublicationStatus.PLANNED) {
      label = t('dashboard.row_status.published_from', {
        date: format(new Date(offer.availableFrom), 'dd/MM/yyyy'),
      });
    }

    if (publicationStatus === PublicationStatus.DELETED) {
      label = t('dashboard.row_status.deleted');
    }

    if (!label) {
      label = t('dashboard.row_status.draft');
    }

    const userId = user?.sub;
    const userIdv1 = user?.['https://publiq.be/uitidv1id'];
    const isExternalCreator = ![userId, userIdv1].includes(offer.creator);

    return { color, label, isExternalCreator, isFinished };
  }, [offer, user, t]);
};
