import { useRouter } from 'next/router';
import { dehydrate } from 'react-query/hydration';

import { OfferTypes } from '@/constants/OfferType';
import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  getPlaceById,
  useChangeStatusMutation,
  useGetPlaceByIdQuery,
} from '@/hooks/api/places';
import { AvailabilityPageSingle } from '@/pages/AvailabilityPageSingle';
import { Spinner } from '@/ui/Spinner';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { prefetchAuthenticatedQuery } from '@/hooks/api/authenticated-query-v2';

const Availability = () => {
  const router = useRouter();
  const { placeId } = router.query;

  const getPlaceByIdQuery = useGetPlaceByIdQuery({
    queryArguments: {
      id: placeId as string,
      scope: OfferTypes.PLACES,
    },
  });

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
    const place = await useGetPlaceByIdQuery({
      queryArguments: { id: query.placeId },
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Availability;
