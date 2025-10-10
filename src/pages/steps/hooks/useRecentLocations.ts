import { uniqBy } from 'lodash';

import { useGetOffersByCreatorQuery } from '@/hooks/api/offers';
import { useGetUserQuery } from '@/hooks/api/user';
import { WorkflowStatus } from '@/types/WorkflowStatus';

const useRecentLocations = () => {
  const getUserQuery = useGetUserQuery();
  const getOffersQuery = useGetOffersByCreatorQuery({
    advancedQuery: '_exists_:location.id AND NOT (audienceType:"education")',
    creator: getUserQuery?.data,
    sortOptions: {
      field: 'modified',
      order: 'desc',
    },
    paginationOptions: { start: 0, limit: 20 },
    workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED',
    addressCountry: '*',
  });

  const offers = getOffersQuery?.data?.member ?? [];

  const hasRecentLocations = offers?.length > 0;

  const recentLocations = uniqBy(
    offers?.map((offer) => ('location' in offer ? offer.location : undefined)),
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
