import { dehydrate } from '@tanstack/react-query';

import { CalsumFormats } from '@/constants/CalsumFormat';
import { OfferTypes } from '@/constants/OfferType';
import { PermissionTypes } from '@/constants/PermissionTypes';
import { prefetchGetOfferPermissionsQuery } from '@/hooks/api/events';
import {
  prefetchGetCalendarSummaryQuery,
  prefetchGetOfferByIdQuery,
  prefetchOfferHistoryQuery,
} from '@/hooks/api/offers';
import { prefetchGetPermissionsQuery } from '@/hooks/api/user';
import i18n from '@/i18n/index';
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

    await prefetchGetCalendarSummaryQuery({
      req,
      queryClient,
      id: placeId as string,
      scope: OfferTypes.PLACES,
      locale: i18n.language,
      format: CalsumFormats.XL,
    });

    const permissions = await prefetchGetPermissionsQuery({
      req,
      queryClient,
    });

    await prefetchGetOfferPermissionsQuery({
      req,
      queryClient,
      offerId: placeId,
      scope: OfferTypes.PLACES,
    });

    const isGodUser = permissions?.includes(PermissionTypes.GEBRUIKERS_BEHEREN);

    if (query.tab === 'history' && isGodUser) {
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
