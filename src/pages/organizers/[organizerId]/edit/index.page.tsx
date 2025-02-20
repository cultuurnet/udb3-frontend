import { dehydrate } from 'react-query/hydration';

import { prefetchGetOrganizerByIdQuery } from '@/hooks/api/organizers';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OrganizerForm } from '../../create/OrganizerForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { organizerId } = query;

    await prefetchGetOrganizerByIdQuery({
      id: organizerId,
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

export default OrganizerForm;
