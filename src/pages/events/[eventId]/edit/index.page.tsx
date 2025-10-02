import { dehydrate } from 'react-query/hydration';

import { EventPermissionTypes } from '@/constants/PermissionTypes';
import {
  prefetchGetEventByIdQuery,
  prefetchGetEventPermissionsQuery,
} from '@/hooks/api/events';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OfferForm } from '../../../create/OfferForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { eventId } = query;

    await Promise.all([
      prefetchGetEventByIdQuery({
        id: eventId,
        req,
        queryClient,
      }),
      prefetchGetEventPermissionsQuery({
        req,
        queryClient,
        eventId: eventId,
      }),
    ]);

    const { permissions } = queryClient.getQueryData([
      'event-permissions',
      { eventId },
    ]);

    if (
      permissions?.length === 0 ||
      !permissions.includes(EventPermissionTypes.AANBOD_BEWERKEN)
    ) {
      return {
        redirect: {
          destination: '/unauthorized',
          permanent: false,
        },
      };
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default OfferForm;
