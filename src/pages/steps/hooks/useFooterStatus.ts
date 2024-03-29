import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useQueryClient } from 'react-query';

import { isLocationSet } from '@/pages/steps/LocationStep';
import { isEvent } from '@/types/Event';
import { hasLegacyLocation } from '@/types/Offer';
import { isPlace } from '@/types/Place';

const FooterStatus = {
  DUPLICATE: 'DUPLICATE',
  CONTINUE: 'CONTINUE',
  HIDDEN: 'HIDDEN',
  PUBLISH: 'PUBLISH',
  MANUAL_SAVE: 'MANUAL_SAVE',
  AUTO_SAVE: 'AUTO_SAVE',
} as const;

const useFooterStatus = ({ offer, form }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isOnDuplicatePage = router.pathname.endsWith('/duplicate');

  const formValues = form.getValues();
  const {
    formState: { dirtyFields },
  } = form;

  const isMutating = queryClient.isMutating();
  const offerId = offer?.['@id'];
  const availableFrom = offer?.availableFrom;
  const hasLocation = isLocationSet(
    formValues.scope,
    formValues.location,
    form.formState,
  );

  const isPlaceDirty =
    (dirtyFields.place || dirtyFields.location) && hasLocation;
  const isEventType = isEvent(offer);
  const isPlaceType = isPlace(offer);
  const needsLocationMigration = hasLegacyLocation(offer);

  return useMemo(() => {
    if (needsLocationMigration) {
      return FooterStatus.CONTINUE;
    }

    if (offerId && isOnDuplicatePage) {
      return FooterStatus.DUPLICATE;
    }

    if (offerId && isEventType && !availableFrom) {
      return FooterStatus.PUBLISH;
    }

    if (offerId && isPlaceType) {
      return FooterStatus.PUBLISH;
    }

    if (offerId && router.route.includes('edit')) {
      return FooterStatus.AUTO_SAVE;
    }

    if (isMutating) return FooterStatus.HIDDEN;
    if (isPlaceDirty) return FooterStatus.MANUAL_SAVE;
    return FooterStatus.HIDDEN;
  }, [
    needsLocationMigration,
    offerId,
    isEventType,
    availableFrom,
    isPlaceType,
    router.route,
    isMutating,
    isPlaceDirty,
    isOnDuplicatePage,
  ]);
};

export { FooterStatus, useFooterStatus };
