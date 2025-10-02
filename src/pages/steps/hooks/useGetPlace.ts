import { OfferTypes } from '@/constants/OfferType';
import { useGetPlaceByIdQuery } from '@/hooks/api/places';

const useGetPlace = ({ id, enabled }) => {
  const getPlaceByIdQuery = useGetPlaceByIdQuery(
    { id, scope: OfferTypes.PLACES },
    { enabled: !!id && !!enabled },
  );

  return getPlaceByIdQuery?.data;
};

export { useGetPlace };
