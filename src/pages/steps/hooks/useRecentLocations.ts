import { uniqBy } from 'lodash';

import { useGetOffersByCreatorQuery } from '@/hooks/api/offers';
import { useGetUserQuery } from '@/hooks/api/user';
import { Offer } from '@/types/Offer';
import { WorkflowStatus } from '@/types/WorkflowStatus';

const useRecentLocations = () => {
  const getUserQuery = useGetUserQuery();
  const getOffersQuery = useGetOffersByCreatorQuery({
    advancedQuery: '_exists_:location.id AND NOT (audienceType:"education")',
    creator: getUserQuery?.data,
    workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED',
    addressCountry: '*',
    sortOptions: {
      field: 'modified',
      order: 'desc',
    },
    paginationOptions: { start: 0, limit: 20 },
  });

  const offers: (Offer & { location: any })[] =
    // @ts-expect-error
    getOffersQuery?.data?.member ?? [];

  const hasRecentLocations = offers?.length > 0;

  const recentLocations = uniqBy(
    offers?.map((offer) => offer.location),
    '@id',
  )
    .filter(
      (location) =>
        location &&
        location.workflowStatus !== WorkflowStatus.REJECTED &&
        location.workflowStatus !== WorkflowStatus.DELETED &&
        location.name?.nl !== 'Online' &&
        !('duplicateOf' in location),
    )
    .slice(0, 4);

  return { recentLocations, hasRecentLocations };
};

export { useRecentLocations };
