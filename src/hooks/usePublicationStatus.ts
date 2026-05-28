import { format, isAfter, isFuture, isValid } from 'date-fns';
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

export const usePublicationStatus = (
  offer: Offer,
  showDate = true,
): OfferPublicationStatus => {
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

    const needsDate =
      publicationStatus === PublicationStatus.PLANNED ||
      publicationStatus === PublicationStatus.PUBLISHED;

    const availableFromDate = new Date(offer.availableFrom);
    const statusKey =
      !showDate && needsDate
        ? `${publicationStatus}_NO_DATE`
        : publicationStatus;

    const label =
      showDate && needsDate && isValid(availableFromDate)
        ? t(`dashboard.row_status.${publicationStatus}`, {
            date: format(availableFromDate, 'dd/MM/yyyy'),
          })
        : t(`dashboard.row_status.${statusKey}`);

    const userId = user?.sub;
    const userIdv1 = user?.['https://publiq.be/uitidv1id'];
    const isExternalCreator = ![userId, userIdv1].includes(offer.creator);

    return { color, label, isExternalCreator, isFinished };
  }, [offer, user, t]);
};
