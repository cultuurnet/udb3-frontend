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
    const { eventId } = query;

    await prefetchGetOfferByIdQuery({
      req,
      queryClient,
      id: eventId as string,
      scope: OfferTypes.EVENTS,
    });

    await prefetchGetCalendarSummaryQuery({
      req,
      queryClient,
      id: eventId as string,
      scope: OfferTypes.EVENTS,
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
      offerId: eventId,
      scope: OfferTypes.EVENTS,
    });

    const isGodUser = permissions?.includes(PermissionTypes.GEBRUIKERS_BEHEREN);

    if (query.tab === 'history' && isGodUser) {
      await prefetchOfferHistoryQuery({
        req,
        queryClient,
        id: eventId as string,
        scope: OfferTypes.EVENTS,
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
