import { dehydrate } from '@tanstack/react-query';

import { OfferTypes } from '@/constants/OfferType';
import { prefetchGetCalendarSummaryQuery } from '@/hooks/api/events';
import { prefetchGetOfferByIdQuery } from '@/hooks/api/offers';
import i18n from '@/i18n/index';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Preview } from './preview/Preview';

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
      locale: i18n.language,
      format: 'lg',
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
