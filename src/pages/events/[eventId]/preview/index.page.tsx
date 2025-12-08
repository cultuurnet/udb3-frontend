import { dehydrate } from '@tanstack/react-query';

import { OfferTypes } from '@/constants/OfferType';
import { prefetchGetOfferByIdQuery } from '@/hooks/api/offers';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Preview } from './Preview';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ cookies, query, req, queryClient }) => {
    const { eventId } = query;

    await prefetchGetOfferByIdQuery({
      req,
      queryClient,
      id: eventId as string,
      scope: OfferTypes.EVENTS,
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Preview;
