import { dehydrate } from 'react-query/hydration';

import { ScopeTypes } from '@/constants/OfferType';
import { prefetchGetEventByIdQuery } from '@/hooks/api/events';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OfferForm } from '../../../create/OfferForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { eventId } = query;

    await prefetchGetEventByIdQuery({
      req,
      queryClient,
      id: eventId,
      scope: ScopeTypes.EVENTS,
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
