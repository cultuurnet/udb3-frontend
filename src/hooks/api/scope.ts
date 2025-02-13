import { Scope, ScopeTypes } from '@/constants/OfferType';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import { useGetOrganizerByIdQuery } from '@/hooks/api/organizers';

const useGetEntityByIdAndScope = <TScope extends Scope>({
  scope,
  id,
}: {
  scope: TScope;
  id: string;
}) => {
  const getOrganizerById = useGetOrganizerByIdQuery(
    { id },
    { enabled: scope === ScopeTypes.ORGANIZERS },
  );
  const getOfferByIdQuery = useGetOfferByIdQuery(
    { id, scope: scope as Exclude<TScope, 'organizers'> },
    { enabled: scope !== ScopeTypes.ORGANIZERS },
  );

  if (scope === ScopeTypes.ORGANIZERS) {
    return getOrganizerById;
  }

  return getOfferByIdQuery;
};

export { useGetEntityByIdAndScope };
