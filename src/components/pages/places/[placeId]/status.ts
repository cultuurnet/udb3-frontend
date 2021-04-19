import { useRouter } from 'next/router';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/getApplicationServerSi... Remove this comment to see the full error message
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/places' or its cor... Remove this comment to see the full error message
import { useChangeStatus, useGetPlaceById } from '@/hooks/api/places';
import { dehydrate } from 'react-query/hydration';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/components/StatusPageSingle'... Remove this comment to see the full error message
import { StatusPageSingle } from '@/components/StatusPageSingle';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/authenticated-quer... Remove this comment to see the full error message
import { QueryStatus } from '@/hooks/api/authenticated-query';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Spinner' or its correspon... Remove this comment to see the full error message
import { Spinner } from '@/ui/Spinner';

const Status = () => {
  const router = useRouter();
  const { placeId } = router.query;

  const getPlaceByIdQuery = useGetPlaceById({ id: placeId });

  if (getPlaceByIdQuery.status === QueryStatus.LOADING) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'marginTop'.
    return <Spinner marginTop={4} />;
  }
  return (
    <StatusPageSingle
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'offer'.
      offer={getPlaceByIdQuery.data}
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'error'. Did you mean 'Error'?
      error={getPlaceByIdQuery.error}
      // @ts-expect-error ts-migrate(2539) FIXME: Cannot assign to 'useChangeStatus' because it is n... Remove this comment to see the full error message
      useChangeStatus={useChangeStatus}
    />
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    const { placeId } = query;
    await useGetPlaceById({ req, queryClient, id: placeId });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Status;
