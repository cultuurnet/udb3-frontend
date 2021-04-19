import { useRouter } from 'next/router';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { useChangeStatus, useGetPlaceById } from '@/hooks/api/places';
import { dehydrate } from 'react-query/hydration';
import { StatusPageSingle } from '@/components/StatusPageSingle';
import { QueryStatus } from '@/hooks/api/authenticated-query';
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
