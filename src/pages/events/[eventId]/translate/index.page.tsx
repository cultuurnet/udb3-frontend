import { dehydrate } from '@tanstack/react-query';

import { prefetchGetEventByIdQuery } from '@/hooks/api/events';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { TranslateForm } from './TranslateForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { eventId } = query;

    await prefetchGetEventByIdQuery({
      id: eventId,
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
