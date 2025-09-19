import { UseQueryResult } from '@tanstack/react-query';

import { Scope, ScopeTypes } from '@/constants/OfferType';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import { useGetOrganizerByIdQuery } from '@/hooks/api/organizers';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';

const getEntityQueryForScope = (scope: Scope) =>
  scope === ScopeTypes.ORGANIZERS
    ? useGetOrganizerByIdQuery
    : useGetOfferByIdQuery;

const useGetEntityByIdAndScope = ({
  scope,
  id,
  ...rest
}: {
  scope: Scope;
  id: string;
}): UseQueryResult<Offer | Organizer> => {
  const query = getEntityQueryForScope(scope);

  return query({ scope, id, ...rest });
};

export { getEntityQueryForScope, useGetEntityByIdAndScope };
