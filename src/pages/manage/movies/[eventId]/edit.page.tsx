import { dehydrate } from 'react-query/hydration';

import { useGetEventByIdQuery } from '@/hooks/api/events';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

export { MovieForm as default } from '../MovieForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    const { eventId } = query;

    await useGetEventByIdQuery({
      id: eventId,
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);
