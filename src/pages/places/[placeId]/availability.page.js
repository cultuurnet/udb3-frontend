import { dehydrate } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { OfferTypes } from '@/constants/OfferType';
import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  prefetchGetPlaceByIdQuery,
  useChangeStatusMutation,
  useGetPlaceByIdQuery,
} from '@/hooks/api/places';
import { AvailabilityPageSingle } from '@/pages/AvailabilityPageSingle';
import { Spinner } from '@/ui/Spinner';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const Availability = () => {
  const router = useRouter();
  const { placeId } = router.query;

  const getPlaceByIdQuery = useGetPlaceByIdQuery({
    id: placeId,
    scope: OfferTypes.PLACES,
  });

  if (!getPlaceByIdQuery.data) {
    return null;
  }

  if (getPlaceByIdQuery.status === QueryStatus.LOADING) {
    return <Spinner marginTop={4} />;
  }
  return (
    <AvailabilityPageSingle
      offer={getPlaceByIdQuery.data}
      error={getPlaceByIdQuery.error}
      useChangeStatusMutation={useChangeStatusMutation}
    />
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    const { placeId } = query;
    await prefetchGetPlaceByIdQuery({ req, queryClient, id: placeId });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Availability;
