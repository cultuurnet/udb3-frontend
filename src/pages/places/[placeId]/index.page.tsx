import { dehydrate } from '@tanstack/react-query';

import { OfferTypes } from '@/constants/OfferType';
import { prefetchGetOfferPermissionsQuery } from '@/hooks/api/events';
import {
  prefetchGetOfferByIdQuery,
  prefetchOfferHistoryQuery,
} from '@/hooks/api/offers';
import { prefetchGetPermissionsQuery } from '@/hooks/api/user';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Preview } from './Preview';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ cookies, query, req, queryClient }) => {
    const { placeId } = query;

    await prefetchGetOfferByIdQuery({
      req,
      queryClient,
      id: placeId as string,
      scope: OfferTypes.PLACES,
    });

    await prefetchGetPermissionsQuery({
      req,
      queryClient,
    });

    await prefetchGetOfferPermissionsQuery({
      req,
      queryClient,
      offerId: placeId,
      scope: OfferTypes.PLACES,
    });

    if (query.tab === 'history') {
      await prefetchOfferHistoryQuery({
        req,
        queryClient,
        id: placeId as string,
        scope: OfferTypes.PLACES,
      });
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Preview;
