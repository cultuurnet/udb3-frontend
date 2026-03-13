import { dehydrate } from '@tanstack/react-query';

import { OfferContexts } from '@/constants/OfferType';
import { PermissionTypes } from '@/constants/PermissionTypes';
import {
  prefetchGetEventByIdQuery,
  prefetchGetOfferPermissionsQuery,
} from '@/hooks/api/events';
import { formatPermission } from '@/utils/formatPermission';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OfferForm } from '../../../create/OfferForm';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { eventId } = query;

    await prefetchGetOfferPermissionsQuery({
      req,
      queryClient,
      offerId: eventId,
      offerType: OfferContexts.EVENT,
    });

    const permissionsData = queryClient.getQueryData([
      'offer-permissions',
      { offerId: eventId, offerType: OfferContexts.EVENT },
    ]);

    const permissions = permissionsData?.permissions ?? [];

    if (
      permissions.length === 0 ||
      !permissions.includes(formatPermission(PermissionTypes.AANBOD_BEWERKEN))
    ) {
      return {
        redirect: {
          destination: '/unauthorized',
          permanent: false,
        },
      };
    }

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

export default OfferForm;
