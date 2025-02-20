import { dehydrate } from 'react-query/hydration';

import {
  prefetchGetEventByIdQuery,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OfferForm } from '../../../create/OfferForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    await prefetchGetEventByIdQuery({
      id: query?.eventId,
      req,
      queryClient,
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default OfferForm;
