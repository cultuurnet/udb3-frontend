import { dehydrate } from '@tanstack/react-query';

import { prefetchGetOfferByIdQuery } from '@/hooks/api/offers';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { TranslateForm } from '../../../TranslateForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { eventId } = query;

    await prefetchGetOfferByIdQuery({
      id: eventId,
      scope: 'events',
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

export default TranslateForm;
