import { dehydrate } from 'react-query/hydration';

import {
  prefetchGetOrganizerByIdQuery,
  useGetOrganizerByIdQuery,
} from '@/hooks/api/organizers';
import { Organizer } from '@/types/Organizer';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OrganizerForm } from '../../create/OrganizerForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { organizerId } = query;

    await prefetchGetOrganizerByIdQuery({
      req,
      queryClient,
      id: organizerId,
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
